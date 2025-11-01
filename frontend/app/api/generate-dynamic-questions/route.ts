import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { generateDynamicQuestionsV2 } from '@/src/lib/services/dynamicQuestionGenerationV2';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
// Allow up to ~13.3 minutes (800 seconds) for complex question generation
// Note: On Vercel, this requires Pro or Enterprise plan (max 800s for Pro plan)
export const maxDuration = 800;

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
      .select('id, static_answers, dynamic_questions, dynamic_questions_metadata, user_id, status')
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

    // Extract static answers - only support V2.0 format (3-section structure)
    const sa = (blueprint.static_answers || {}) as Record<string, unknown>;

    console.log('[GenerateDynamicQuestions] Static answers:', JSON.stringify(sa, null, 2));

    // Validate V2.0 schema (new 3-section format from PRD)
    const isV20 =
      sa.section_1_role_experience &&
      sa.section_2_organization &&
      sa.section_3_learning_gap &&
      typeof sa.section_1_role_experience === 'object' &&
      typeof sa.section_2_organization === 'object' &&
      typeof sa.section_3_learning_gap === 'object';

    if (!isV20) {
      console.error('[GenerateDynamicQuestions] Invalid static answers format - V2.0 required');
      return NextResponse.json(
        {
          error:
            'Invalid static answers format. Please complete the static questionnaire using the V2.0 format.',
          details:
            'Expected 3-section structure: section_1_role_experience, section_2_organization, section_3_learning_gap',
          receivedFormat: Object.keys(sa),
        },
        { status: 400 }
      );
    }

    // Use V2.0 generation service with enhanced prompts
    console.log('[GenerateDynamicQuestions] Using V2.0 schema with enhanced prompts');

    // Track retry attempts in metadata
    const retryAttempt = (blueprint.dynamic_questions_metadata?.retryAttempt as number) || 0;
    const maxRetries = 3;

    if (retryAttempt >= maxRetries) {
      console.error('[GenerateDynamicQuestions] Max retry attempts reached:', {
        blueprintId,
        attempts: retryAttempt,
      });
      return NextResponse.json(
        {
          error: `Maximum retry attempts (${maxRetries}) reached. Please contact support if the issue persists.`,
          details: 'The system has attempted to generate questions multiple times without success.',
          canRetry: false,
        },
        { status: 429 } // Too Many Requests
      );
    }

    console.log('[GenerateDynamicQuestions] Attempt:', retryAttempt + 1, 'of', maxRetries);

    try {
      const result = await generateDynamicQuestionsV2(blueprintId, sa);

      // CRITICAL: Normalize all option values to ensure consistency
      const { normalizeSectionQuestions } = await import('@/lib/validation/dynamicQuestionSchemas');
      const resultTyped = result as { sections: unknown[]; metadata: unknown };
      const normalizedSections = normalizeSectionQuestions((resultTyped.sections as any) || []);

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
          dynamic_questions_raw: resultTyped.sections,
          status: 'draft',
          dynamic_questions_metadata: {
            retryAttempt: 0, // Reset on success
            lastGeneratedAt: new Date().toISOString(),
            sectionsGenerated: normalizedSections.length,
            truncationRepaired: (resultTyped.metadata as any)?.truncationRepaired || false,
          },
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
        metadata: resultTyped.metadata,
      });
    } catch (error) {
      console.error('Error generating dynamic questions with V2.0 service:', error);

      // Increment retry counter and reset status so the user can retry generation
      const { error: resetError } = await supabase
        .from('blueprint_generator')
        .update({
          status: 'draft',
          dynamic_questions: null, // Clear incomplete questions
          dynamic_questions_raw: null, // Clear raw incomplete data
          dynamic_questions_metadata: {
            retryAttempt: retryAttempt + 1,
            lastAttemptAt: new Date().toISOString(),
            lastError: error instanceof Error ? error.message : String(error),
          },
        })
        .eq('id', blueprintId);

      if (resetError) {
        console.error('Error resetting blueprint status:', resetError);
      }

      return NextResponse.json(
        {
          error: 'Failed to generate dynamic questions. Please try again.',
          details: error instanceof Error ? error.message : String(error),
          canRetry: retryAttempt + 1 < maxRetries,
          attemptsRemaining: maxRetries - (retryAttempt + 1),
        },
        { status: 502 }
      );
    }
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
