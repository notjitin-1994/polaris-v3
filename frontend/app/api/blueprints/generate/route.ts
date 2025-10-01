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
import { markdownGeneratorService } from '@/lib/services/markdownGenerator';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('api');

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

    // Update status to generating
    await supabase
      .from('blueprint_generator')
      .update({ status: 'generating' })
      .eq('id', blueprintId)
      .eq('user_id', userId);

    // Build context for generation
    const context = {
      blueprintId,
      userId,
      staticAnswers: blueprint.static_answers as Record<string, any>,
      dynamicAnswers: blueprint.dynamic_answers as Record<string, any>,
      organization:
        (blueprint.static_answers as any)?.organization?.name ||
        (blueprint.static_answers as any)?.organization ||
        'Organization',
      role: (blueprint.static_answers as any)?.role || 'Manager',
      industry:
        (blueprint.static_answers as any)?.organization?.industry ||
        (blueprint.static_answers as any)?.industry ||
        'General',
      learningObjectives: extractLearningObjectives(
        blueprint.dynamic_answers as Record<string, any>
      ),
    };

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

    // Convert blueprint to markdown for legacy compatibility
    const markdown = markdownGeneratorService.generateMarkdown(result.blueprint);

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
