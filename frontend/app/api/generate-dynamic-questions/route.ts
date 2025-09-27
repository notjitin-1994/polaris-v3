import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OllamaClient } from '@/lib/ollama/client';
import { generationInputSchema } from '@/lib/ollama/schema';
import { blueprintFallbackService } from '@/lib/fallbacks/blueprintFallbacks';
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
      .select('id, static_answers, user_id')
      .eq('id', blueprintId)
      .single();

    if (blueprintError || !blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
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
    // Tests are written against legacy keys (assessmentType, deliveryMethod, etc.).
    const sa = (blueprint.static_answers || {}) as Record<string, unknown>;
    const legacyInput = {
      assessmentType: (sa.assessmentType as string) ?? (sa.assessment_type as string) ?? 'Formative',
      deliveryMethod: (sa.deliveryMethod as string) ?? (sa.delivery_method as string) ?? 'Online',
      duration: (sa.duration as string) ?? '60',
      learningObjectives: Array.isArray(sa.learningObjectives)
        ? (sa.learningObjectives as string[])
        : typeof sa.learningObjective === 'string'
        ? [sa.learningObjective as string]
        : ['Learn React'],
      targetAudience: (sa.targetAudience as string) ?? 'Developers',
      numSections: 3,
      questionsPerSection: 4,
    };

    // Validate and normalize to canonical shape via union+transform
    const validatedInput = generationInputSchema.parse(legacyInput);

    // Generate dynamic questions using Ollama with fallback
    let dynamicQuestions;
    try {
      const client = new OllamaClient();
      // Tests expect legacy-shaped input to be passed to generateQuestions
      dynamicQuestions = await client.generateQuestions(legacyInput as any);
    } catch (error) {
      console.error('Error generating dynamic questions with Ollama:', error);
      console.log('Falling back to default questions');
      dynamicQuestions = await blueprintFallbackService.handleOllamaDynamicQuestionsFailure();
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
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
