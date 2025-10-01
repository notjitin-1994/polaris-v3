/**
 * Dynamic Questions API Endpoint
 * Generates dynamic questions using Perplexity (primary) or Ollama (fallback)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { generateDynamicQuestions } from '@/lib/services';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('api');

export const dynamic = 'force-dynamic';

// Request schema
const requestSchema = z.object({
  blueprintId: z.string().uuid('Invalid blueprint ID'),
  staticAnswers: z.record(z.string(), z.unknown()).optional(),
  userPrompts: z.array(z.string()).optional(),
});

/**
 * POST /api/dynamic-questions
 * Generate dynamic questions for a blueprint
 */
export async function POST(request: NextRequest): Promise<Response> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  logger.info('api.request', 'Received dynamic questions generation request', {
    requestId,
    method: 'POST',
    path: '/api/dynamic-questions',
  });

  try {
    // Authenticate user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('api.auth.failure', 'Unauthorized access attempt', {
        requestId,
        error: authError?.message,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      logger.warn('api.error', 'Invalid request body', {
        requestId,
        userId: user.id,
        errors: parseResult.error.flatten(),
      });
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { blueprintId, staticAnswers, userPrompts } = parseResult.data;

    // Verify blueprint ownership
    const dbLogger = createServiceLogger('database');

    dbLogger.info('database.query.start', 'Fetching blueprint for validation', {
      blueprintId,
      userId: user.id,
      requestId,
    });

    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprint_generator')
      .select('id, user_id, static_answers, status')
      .eq('id', blueprintId)
      .eq('user_id', user.id)
      .single();

    if (blueprintError || !blueprint) {
      dbLogger.error('database.query.failure', 'Blueprint not found or access denied', {
        blueprintId,
        userId: user.id,
        error: blueprintError?.message,
        requestId,
      });
      return NextResponse.json({ error: 'Blueprint not found or access denied' }, { status: 404 });
    }

    dbLogger.info('database.query.success', 'Blueprint validated successfully', {
      blueprintId,
      userId: user.id,
      requestId,
    });

    // Use provided static answers or fetch from database
    const finalStaticAnswers = staticAnswers || blueprint.static_answers || {};

    // Validate that we have static answers
    if (Object.keys(finalStaticAnswers).length === 0) {
      logger.warn('api.error', 'No static answers available', {
        blueprintId,
        userId: user.id,
        requestId,
      });
      return NextResponse.json(
        { error: 'No static answers found. Please complete the static questionnaire first.' },
        { status: 400 }
      );
    }

    // Generate dynamic questions
    const generationContext = {
      blueprintId,
      userId: user.id,
      staticAnswers: finalStaticAnswers,
      userPrompts,
      role: finalStaticAnswers.role,
      industry: finalStaticAnswers.organization?.industry,
      organization: finalStaticAnswers.organization?.name,
    };

    const result = await generateDynamicQuestions(generationContext);

    if (!result.success) {
      logger.error('api.error', 'Question generation failed', {
        blueprintId,
        userId: user.id,
        error: result.error,
        requestId,
        duration: Date.now() - startTime,
      });
      return NextResponse.json(
        { error: result.error || 'Failed to generate questions' },
        { status: 500 }
      );
    }

    // Save questions to database
    dbLogger.info('database.save.start', 'Saving dynamic questions to database', {
      blueprintId,
      userId: user.id,
      sectionCount: result.sections.length,
      questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
      requestId,
    });

    const { error: saveError } = await supabase
      .from('blueprint_generator')
      .update({
        dynamic_questions: result.sections,
        dynamic_questions_raw: result,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blueprintId)
      .eq('user_id', user.id);

    if (saveError) {
      dbLogger.error('database.save.failure', 'Failed to save dynamic questions', {
        blueprintId,
        userId: user.id,
        error: saveError.message,
        requestId,
      });
      return NextResponse.json({ error: 'Failed to save questions to database' }, { status: 500 });
    }

    dbLogger.info('database.save.success', 'Dynamic questions saved successfully', {
      blueprintId,
      userId: user.id,
      sectionCount: result.sections.length,
      requestId,
    });

    const duration = Date.now() - startTime;

    logger.info('api.response', 'Successfully generated and saved dynamic questions', {
      blueprintId,
      userId: user.id,
      source: result.metadata.source,
      fallbackUsed: result.metadata.fallbackUsed,
      sectionCount: result.sections.length,
      questionCount: result.sections.reduce((sum, s) => sum + s.questions.length, 0),
      duration,
      requestId,
      statusCode: 200,
    });

    return NextResponse.json({
      success: true,
      sections: result.sections,
      metadata: {
        ...result.metadata,
        duration,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('api.error', 'Unexpected error in dynamic questions API', {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      requestId,
      duration,
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/dynamic-questions/:blueprintId
 * Retrieve generated dynamic questions
 */
export async function GET(request: NextRequest): Promise<Response> {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Authenticate user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get blueprint ID from URL
    const { searchParams } = new URL(request.url);
    const blueprintId = searchParams.get('blueprintId');

    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID required' }, { status: 400 });
    }

    // Fetch dynamic questions
    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprint_generator')
      .select('dynamic_questions, dynamic_answers, status')
      .eq('id', blueprintId)
      .eq('user_id', user.id)
      .single();

    if (blueprintError || !blueprint) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }

    return NextResponse.json({
      questions: blueprint.dynamic_questions || [],
      answers: blueprint.dynamic_answers || {},
      status: blueprint.status,
    });
  } catch (error) {
    logger.error('api.error', 'Error retrieving dynamic questions', {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
