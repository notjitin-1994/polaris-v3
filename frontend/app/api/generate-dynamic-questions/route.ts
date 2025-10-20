import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OllamaClient } from '@/lib/ollama/client';
import { generationInputSchema } from '@/lib/ollama/schema';
import { mapOllamaToFormSchema } from '@/lib/ollama/schemaMapper';
import { generateDynamicQuestionsV2 } from '@/src/lib/services/dynamicQuestionGenerationV2';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Schema for the request body
const generateDynamicQuestionsSchema = z.object({
  blueprintId: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { blueprintId } = generateDynamicQuestionsSchema.parse(body);

    // Get Supabase client
    const supabase = await getSupabaseServerClient();

    // Get the blueprint with static answers
    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprint_generator')
      .select('id, static_answers, dynamic_questions, user_id, status')
      .eq('id', blueprintId)
      .single();

    if (blueprintError || !blueprint) {
      console.error('[GenerateDynamicQuestions] Blueprint not found:', blueprintError);
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    // Check if static_answers exists and has data
    if (!blueprint.static_answers || typeof blueprint.static_answers !== 'object') {
      console.error('[GenerateDynamicQuestions] No static answers found in blueprint:', {
        blueprintId,
        static_answers: blueprint.static_answers,
      });
      return NextResponse.json(
        {
          error: 'No static answers found. Please complete the static questionnaire first.',
          details: 'The blueprint exists but has no static answers data.',
        },
        { status: 400 }
      );
    }

    // Check if static_answers is empty object
    const staticAnswersKeys = Object.keys(blueprint.static_answers);
    if (staticAnswersKeys.length === 0) {
      console.error('[GenerateDynamicQuestions] Static answers is empty object');
      return NextResponse.json(
        {
          error: 'Static answers are empty. Please fill out the questionnaire first.',
          details: 'The static_answers object exists but has no fields.',
        },
        { status: 400 }
      );
    }

    console.log('[GenerateDynamicQuestions] Blueprint loaded:', {
      id: blueprint.id,
      status: blueprint.status,
      static_answers_keys: staticAnswersKeys,
    });

    // If already generating or questions exist, short-circuit
    if (blueprint.status === 'generating') {
      return NextResponse.json({ success: true, message: 'Already generating' });
    }

    // Check if dynamic questions already exist
    if (
      blueprint.dynamic_questions &&
      Array.isArray(blueprint.dynamic_questions) &&
      blueprint.dynamic_questions.length > 0
    ) {
      return NextResponse.json({
        success: true,
        dynamicQuestions: blueprint.dynamic_questions,
        message: 'Dynamic questions already exist',
      });
    }

    // Extract static answers and convert to GenerationInput format.
    // Support both V2 (nested objects) and V1 (flat strings) formats
    const sa = (blueprint.static_answers || {}) as Record<string, unknown>;

    console.log('[GenerateDynamicQuestions] Static answers:', JSON.stringify(sa, null, 2));

    // Check if V2.0 schema (new 3-section format from PRD)
    const isV20 =
      sa.section_1_role_experience &&
      sa.section_2_organization &&
      sa.section_3_learning_gap &&
      typeof sa.section_1_role_experience === 'object' &&
      typeof sa.section_2_organization === 'object' &&
      typeof sa.section_3_learning_gap === 'object';

    if (isV20) {
      // Use new V2.0 generation service with enhanced prompts
      console.log('[GenerateDynamicQuestions] Using V2.0 schema with enhanced prompts');

      try {
        const result = await generateDynamicQuestionsV2(blueprintId, sa);

        // CRITICAL: Normalize all option values to ensure consistency
        const { normalizeSectionQuestions } = await import(
          '@/lib/validation/dynamicQuestionSchemas'
        );
        const normalizedSections = normalizeSectionQuestions(result.sections || []);

        console.log('[GenerateDynamicQuestions V2.0] Normalized questions:', {
          sectionsCount: normalizedSections.length,
          sampleOptions: normalizedSections[0]?.questions?.[0]?.options?.slice(0, 3).map((opt) => ({
            value: opt.value,
            label: opt.label,
          })),
        });

        // Update the blueprint with generated dynamic questions
        const { error: updateError } = await supabase
          .from('blueprint_generator')
          .update({
            dynamic_questions: normalizedSections,
            dynamic_questions_raw: result.sections,
            status: 'draft',
          })
          .eq('id', blueprintId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating blueprint with dynamic questions:', updateError);
          return NextResponse.json({ error: 'Failed to save dynamic questions' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          dynamicQuestions: normalizedSections,
          message: 'Dynamic questions generated successfully (V2.0)',
          metadata: result.metadata,
        });
      } catch (error) {
        console.error('Error generating dynamic questions with V2.0 service:', error);
        // Reset status so the user can retry generation
        await supabase
          .from('blueprint_generator')
          .update({ status: 'draft' })
          .eq('id', blueprintId);
        return NextResponse.json(
          {
            error: 'Failed to generate dynamic questions. Please try again.',
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 502 }
        );
      }
    }

    const asString = (v: unknown): string => {
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) return v.filter((item) => typeof item === 'string').join(', ');
      return '';
    };
    const firstNonEmpty = (...vals: unknown[]): string => {
      for (const v of vals) {
        const s = asString(v).trim();
        if (s.length > 0) return s;
      }
      return '';
    };

    // Check if V2 schema (legacy - has version field and nested objects)
    const isV2 = sa.version === 2 && typeof sa.organization === 'object';

    let canonicalInput;

    if (isV2) {
      // V2 Schema - extract from nested objects
      console.log('[GenerateDynamicQuestions] Using V2 schema');

      const org = sa.organization as Record<string, unknown> | undefined;
      const learningGap = sa.learningGap as Record<string, unknown> | undefined;
      const resources = sa.resources as Record<string, unknown> | undefined;
      const deliveryStrategy = sa.deliveryStrategy as Record<string, unknown> | undefined;

      canonicalInput = {
        role: asString(sa.role) || 'Learning Professional',
        organization: asString(org?.name) || 'Organization',
        learningGap:
          asString(learningGap?.description) ||
          asString(learningGap?.objectives) ||
          'Learning gap not specified',
        resources:
          [
            asString((resources?.timeline as Record<string, unknown>)?.duration),
            asString((resources?.budget as Record<string, unknown>)?.amount),
            asString(deliveryStrategy?.modality),
          ]
            .filter(Boolean)
            .join(', ') || 'Resources not specified',
        constraints: Array.isArray(sa.constraints)
          ? sa.constraints.filter((item) => typeof item === 'string').join(', ')
          : 'No specific constraints',
        numSections: 5,
        questionsPerSection: 7,
      };
    } else {
      // V1 Schema - flat string extraction (legacy fallback)
      console.log('[GenerateDynamicQuestions] Using V1 schema (legacy)');

      canonicalInput = {
        role: firstNonEmpty(sa.role, 'Learning Professional'),
        organization: firstNonEmpty(
          sa.organization,
          sa.targetAudience,
          sa.target_audience,
          'Organization'
        ),
        learningGap: firstNonEmpty(
          sa.learningGap,
          Array.isArray(sa.learningObjectives)
            ? (sa.learningObjectives as string[]).join(', ')
            : asString(sa.learningObjective),
          'Learning gap not specified'
        ),
        resources: firstNonEmpty(
          sa.resources,
          sa.deliveryMethod,
          sa.delivery_method,
          'Resources not specified'
        ),
        constraints: firstNonEmpty(
          sa.constraints,
          `${asString(sa.assessmentType) || asString(sa.assessment_type)} ${asString(sa.duration)}`,
          'Constraints not specified'
        ),
        numSections: 5,
        questionsPerSection: 7,
      };
    }

    const input = canonicalInput;
    console.log('[GenerateDynamicQuestions] Canonical input:', JSON.stringify(input, null, 2));

    // Validate and normalize to canonical shape via union+transform
    let validatedInput;
    try {
      validatedInput = generationInputSchema.parse(input);
      console.log('[GenerateDynamicQuestions] Validation successful');
    } catch (validationError) {
      console.error('[GenerateDynamicQuestions] Validation failed:', validationError);

      if (validationError instanceof Error) {
        return NextResponse.json(
          {
            error: 'Invalid static answers format',
            details: validationError.message,
            receivedData: input,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }

    // Mark as generating immediately for dashboard routing
    await supabase
      .from('blueprint_generator')
      .update({ status: 'generating' })
      .eq('id', blueprintId);

    // Generate dynamic questions using Ollama; no fallbacks allowed
    let dynamicQuestions;
    try {
      const client = new OllamaClient();
      dynamicQuestions = await client.generateQuestions(validatedInput);
    } catch (error) {
      console.error('Error generating dynamic questions with Ollama:', error);
      // Reset status so the user can retry generation
      await supabase.from('blueprint_generator').update({ status: 'draft' }).eq('id', blueprintId);
      return NextResponse.json(
        { error: 'Failed to generate dynamic questions. Please try again.' },
        { status: 502 }
      );
    }

    // Validate result has sections/questions
    const maybeSections =
      (dynamicQuestions as { sections?: unknown[] }).sections ?? dynamicQuestions;
    if (!Array.isArray(maybeSections) || maybeSections.length === 0) {
      await supabase.from('blueprint_generator').update({ status: 'draft' }).eq('id', blueprintId);
      return NextResponse.json(
        { error: 'No dynamic questions generated. Please try again.' },
        { status: 422 }
      );
    }

    // Map Ollama questions to form schema
    const formSchema = mapOllamaToFormSchema(dynamicQuestions);

    // CRITICAL: Normalize all option values to ensure consistency
    // This prevents validation failures due to mismatched option formats
    const { normalizeSectionQuestions } = await import('@/lib/validation/dynamicQuestionSchemas');
    const normalizedSections = normalizeSectionQuestions(formSchema.sections || []);

    // Debug logging
    console.log('[GenerateDynamicQuestions] Generated questions:', {
      sectionsCount: normalizedSections.length,
      sampleSection: normalizedSections[0]
        ? {
            id: normalizedSections[0].id,
            title: normalizedSections[0].title,
            questionsCount: normalizedSections[0].questions?.length,
            sampleQuestion: normalizedSections[0].questions?.[0]
              ? {
                  id: normalizedSections[0].questions[0].id,
                  type: normalizedSections[0].questions[0].type,
                  optionsCount: normalizedSections[0].questions[0].options?.length,
                  sampleOptions: normalizedSections[0].questions[0].options
                    ?.slice(0, 3)
                    .map((opt) => ({
                      value: opt.value,
                      label: opt.label,
                    })),
                }
              : null,
          }
        : null,
    });

    // Update the blueprint with generated dynamic questions (store both formats)
    const { error: updateError } = await supabase
      .from('blueprint_generator')
      .update({
        dynamic_questions: normalizedSections, // Store normalized sections for UI
        dynamic_questions_raw:
          (dynamicQuestions as { sections?: unknown[] }).sections ?? dynamicQuestions, // tolerate legacy
        status: 'draft',
      })
      .eq('id', blueprintId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating blueprint with dynamic questions:', updateError);
      return NextResponse.json({ error: 'Failed to save dynamic questions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      dynamicQuestions: (dynamicQuestions as { sections?: unknown[] }).sections ?? dynamicQuestions,
      message: 'Dynamic questions generated successfully',
    });
  } catch (error) {
    console.error('Error generating dynamic questions:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
