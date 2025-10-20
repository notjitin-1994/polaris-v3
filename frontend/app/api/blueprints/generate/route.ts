/**
 * Blueprint Generation API Endpoint
 * Main endpoint for generating learning blueprints using Claude Sonnet 4 → Opus 4 → Ollama cascade
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/supabase/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { blueprintGenerationService } from '@/lib/services/blueprintGenerationService';
import { extractLearningObjectives } from '@/lib/claude/prompts';
import { convertBlueprintToMarkdown } from '@/lib/services/blueprintMarkdownConverter';
import { createServiceLogger } from '@/lib/logging';
import { BlueprintUsageService } from '@/lib/services/blueprintUsageService';

const logger = createServiceLogger('api');

// Allow up to ~13.3 minutes (800 seconds) for complex blueprint generation
// Note: On Vercel, this requires Pro or Enterprise plan (max 800s for Pro plan)
export const maxDuration = 800;

const GenerateRequestSchema = z.object({
  blueprintId: z.string().uuid(),
});

export interface GenerateBlueprintAPIResponse {
  success: boolean;
  blueprintId?: string;
  metadata?: {
    model: string;
    duration: number;
    timestamp: string;
    fallbackUsed: boolean;
    attempts: number;
  };
  error?: string;
}

/**
 * POST /api/blueprints/generate
 * Generate a learning blueprint from completed questionnaires
 */
export async function POST(req: NextRequest): Promise<NextResponse<GenerateBlueprintAPIResponse>> {
  const startTime = Date.now();

  try {
    // Authenticate user
    const { session } = await getServerSession();
    if (!session?.user?.id) {
      logger.warn('blueprints.generate.unauthorized', 'Unauthorized', {
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse and validate request
    const body = await req.json();
    const parseResult = GenerateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      logger.warn('blueprints.generate.invalid_request', 'Invalid request body', {
        userId,
        errors: parseResult.error.flatten(),
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request: blueprintId is required and must be a valid UUID',
        },
        { status: 400 }
      );
    }

    const { blueprintId } = parseResult.data;

    logger.info('blueprints.generate.request_received', 'Request received', {
      blueprintId,
      userId,
    });

    // Fetch blueprint with answers
    const supabase = await getSupabaseServerClient();
    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprint_generator')
      .select('id, user_id, static_answers, dynamic_answers, status')
      .eq('id', blueprintId)
      .eq('user_id', userId)
      .single();

    if (blueprintError || !blueprint) {
      logger.error(
        'blueprints.generate.blueprint_not_found',
        'Blueprint not found or access denied',
        {
          blueprintId,
          userId,
          error: blueprintError?.message,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: 'Blueprint not found or access denied',
        },
        { status: 404 }
      );
    }

    // Validate that questionnaires are complete
    if (!blueprint.static_answers || Object.keys(blueprint.static_answers).length === 0) {
      logger.warn('blueprints.generate.incomplete_static', 'Static questionnaire incomplete', {
        blueprintId,
        userId,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Static questionnaire incomplete. Please complete it first.',
        },
        { status: 400 }
      );
    }

    if (!blueprint.dynamic_answers || Object.keys(blueprint.dynamic_answers).length === 0) {
      logger.warn('blueprints.generate.incomplete_dynamic', 'Dynamic questionnaire incomplete', {
        blueprintId,
        userId,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Dynamic questionnaire incomplete. Please complete it first.',
        },
        { status: 400 }
      );
    }

    // Check if already generated
    if (blueprint.status === 'completed') {
      logger.info('blueprints.generate.already_completed', 'Blueprint already completed', {
        blueprintId,
        userId,
      });

      return NextResponse.json({
        success: true,
        blueprintId,
        metadata: {
          model: 'cached',
          duration: 0,
          timestamp: new Date().toISOString(),
          fallbackUsed: false,
          attempts: 0,
        },
      });
    }

    // Check blueprint saving limits before starting generation
    try {
      const canSave = await BlueprintUsageService.canSaveBlueprint(supabase, userId);

      if (!canSave.canSave) {
        logger.warn('blueprints.generate.limit_exceeded', 'Blueprint saving limit exceeded', {
          blueprintId,
          userId,
        });

        return NextResponse.json(
          {
            success: false,
            error: canSave.reason || 'You cannot save more blueprints at this time.',
          },
          { status: 429 }
        );
      }
    } catch (error) {
      logger.error(
        'blueprints.generate.limit_check_error',
        'Error checking blueprint saving limits',
        {
          blueprintId,
          userId,
          error: (error as Error).message,
        }
      );
      // Continue with generation if we can't check limits (fallback behavior)
    }

    // Update status to generating
    await supabase
      .from('blueprint_generator')
      .update({ status: 'generating' })
      .eq('id', blueprintId)
      .eq('user_id', userId);

    // Build context for generation
    const staticAnswers = blueprint.static_answers as Record<string, unknown>;
    const dynamicAnswers = blueprint.dynamic_answers as Record<string, unknown>;

    const getNestedValue = (obj: Record<string, unknown>, path: string[]): string => {
      let current: unknown = obj;
      for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
          current = (current as Record<string, unknown>)[key];
        } else {
          return '';
        }
      }
      return typeof current === 'string' ? current : '';
    };

    // Check if V2.0 format (3-section)
    const isV20 =
      staticAnswers.section_1_role_experience &&
      staticAnswers.section_2_organization &&
      staticAnswers.section_3_learning_gap;

    let organization: string;
    let role: string;
    let industry: string;

    if (isV20) {
      // V2.0 (3-section) format
      const roleData = staticAnswers.section_1_role_experience as Record<string, unknown>;
      const orgData = staticAnswers.section_2_organization as Record<string, unknown>;

      role = (roleData?.current_role as string) || (roleData?.custom_role as string) || 'Manager';
      organization = (orgData?.organization_name as string) || 'Organization';
      industry = (orgData?.industry_sector as string) || 'General';
    } else {
      // Legacy V2 (8-section) format
      organization =
        getNestedValue(staticAnswers, ['organization', 'name']) ||
        (typeof staticAnswers?.organization === 'string' ? staticAnswers.organization : '') ||
        'Organization';
      role = (typeof staticAnswers?.role === 'string' ? staticAnswers.role : '') || 'Manager';
      industry =
        getNestedValue(staticAnswers, ['organization', 'industry']) ||
        (typeof staticAnswers?.industry === 'string' ? staticAnswers.industry : '') ||
        'General';
    }

    // Log the answer counts for debugging
    logger.info('blueprints.generate.context_building', 'Building generation context', {
      blueprintId,
      staticAnswerKeys: Object.keys(staticAnswers).length,
      dynamicAnswerKeys: Object.keys(dynamicAnswers).length,
      staticAnswerSample: Object.keys(staticAnswers).slice(0, 5),
      dynamicAnswerSample: Object.keys(dynamicAnswers).slice(0, 5),
      isV20Format: isV20,
    });

    const learningObjectives = extractLearningObjectives(dynamicAnswers);

    const context = {
      blueprintId,
      userId,
      staticAnswers,
      dynamicAnswers,
      organization,
      role,
      industry,
      learningObjectives,
    };

    // Log extracted context
    logger.info('blueprints.generate.context_ready', 'Context built successfully', {
      blueprintId,
      organization,
      role,
      industry,
      learningObjectivesCount: learningObjectives.length,
      learningObjectivesSample: learningObjectives.slice(0, 2),
    });

    // Generate blueprint using orchestrator service
    const result = await blueprintGenerationService.generate(context);

    if (!result.success) {
      logger.error('blueprints.generate.generation_failed', 'Generation failed', {
        blueprintId,
        userId,
        error: result.error,
      });

      // Update status to error
      await supabase
        .from('blueprint_generator')
        .update({ status: 'error' })
        .eq('id', blueprintId)
        .eq('user_id', userId);

      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Blueprint generation failed',
        },
        { status: 500 }
      );
    }

    // Convert blueprint to comprehensive markdown
    const markdown = convertBlueprintToMarkdown(result.blueprint);

    // Extract title from generated blueprint metadata
    const generatedTitle =
      result.blueprint.metadata?.title || `Blueprint ${blueprintId.slice(0, 8)}`;

    // Save to database
    const { error: saveError } = await supabase
      .from('blueprint_generator')
      .update({
        blueprint_json: {
          ...result.blueprint,
          _generation_metadata: result.metadata,
        },
        blueprint_markdown: markdown,
        status: 'completed',
        title: generatedTitle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blueprintId)
      .eq('user_id', userId);

    if (saveError) {
      logger.error('blueprints.generate.save_failed', 'Failed to save generated blueprint', {
        blueprintId,
        userId,
        error: saveError.message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Generated blueprint but failed to save to database',
        },
        { status: 500 }
      );
    }

    // Increment blueprint saving count after successful save
    try {
      const savingIncrementResult = await BlueprintUsageService.incrementSavingCount(
        supabase,
        userId
      );
      logger.info(
        'blueprints.generate.saving_count_incremented',
        'Blueprint saving count incremented',
        {
          blueprintId,
          userId,
          incrementResult: savingIncrementResult,
        }
      );
      console.log('Saving count increment result:', savingIncrementResult, 'for user:', userId);
    } catch (error) {
      logger.error(
        'blueprints.generate.saving_count_error',
        'Error incrementing blueprint saving count',
        {
          blueprintId,
          userId,
          error: (error as Error).message,
        }
      );
      // Don't fail the generation if counting fails
    }

    const duration = Date.now() - startTime;

    logger.info('blueprints.generate.success', 'Blueprint generated successfully', {
      blueprintId,
      userId,
      model: result.metadata.model,
      duration,
      fallbackUsed: result.metadata.fallbackUsed,
    });

    return NextResponse.json({
      success: true,
      blueprintId,
      metadata: {
        ...result.metadata,
        duration, // Total duration including DB save
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error(
      'blueprints.generate.unexpected_error',
      'Unexpected error during blueprint generation',
      {
        duration,
        error: (error as Error).message,
      }
    );

    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
