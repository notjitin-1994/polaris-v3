import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OllamaClient } from '@/lib/ollama/client';
import { generationInputSchema } from '@/lib/ollama/schema';
import { mapOllamaToFormSchema } from '@/lib/ollama/schemaMapper';
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
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

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
    // Prefer new canonical fields (role, organization, learningGap, resources, constraints),
    // fallback to legacy keys used in earlier versions and tests.
    const sa = (blueprint.static_answers || {}) as Record<string, unknown>;

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

    // Build canonical input, deriving from legacy fields and providing safe fallbacks
    const canonicalInput = {
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
    } as const;

    const input = canonicalInput;

    // Validate and normalize to canonical shape via union+transform
    const validatedInput = generationInputSchema.parse(input);

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
    const maybeSections = (dynamicQuestions as any).sections ?? dynamicQuestions;
    if (!Array.isArray(maybeSections) || maybeSections.length === 0) {
      await supabase.from('blueprint_generator').update({ status: 'draft' }).eq('id', blueprintId);
      return NextResponse.json(
        { error: 'No dynamic questions generated. Please try again.' },
        { status: 422 }
      );
    }

    // Map Ollama questions to form schema
    const formSchema = mapOllamaToFormSchema(dynamicQuestions);

    // Debug logging
    console.log('Generated dynamic questions:', dynamicQuestions);
    console.log('Mapped form schema:', formSchema);
    console.log('Sections length:', formSchema.sections?.length);

    // Update the blueprint with generated dynamic questions (store both formats)
    const { error: updateError } = await supabase
      .from('blueprint_generator')
      .update({
        dynamic_questions: formSchema.sections, // Store in form schema format for UI
        dynamic_questions_raw: (dynamicQuestions as any).sections ?? dynamicQuestions, // tolerate legacy
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
      dynamicQuestions: (dynamicQuestions as any).sections ?? dynamicQuestions,
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
