/**
 * API Route: User Satisfaction Surveys
 * Endpoint: POST /api/surveys/satisfaction - Submit survey
 *           GET /api/surveys/satisfaction - Get user's survey history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createSurveyRequestSchema } from '@/lib/schemas/feedback';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('feedback');

// Submit a satisfaction survey
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createSurveyRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const surveyData = validationResult.data;

    // Check for recent survey submission (prevent spam - one per day per type)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentSurveys, error: countError } = await supabase
      .from('user_satisfaction_surveys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('survey_type', surveyData.survey_type)
      .gte('created_at', oneDayAgo);

    if (countError) {
      logger.error('survey.rate_limit_check_failed', 'Rate limit check failed', {
        userId: user.id,
        error: countError.message,
      });
    } else if ((recentSurveys ?? 0) >= 1) {
      return NextResponse.json(
        {
          error: `You've already submitted a ${surveyData.survey_type} survey today. Please try again tomorrow.`,
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Insert survey
    const { data: survey, error: insertError } = await supabase
      .from('user_satisfaction_surveys')
      .insert({
        user_id: user.id,
        rating: surveyData.rating,
        feedback: surveyData.feedback || null,
        survey_type: surveyData.survey_type,
        context: surveyData.context || {},
        blueprint_id: surveyData.blueprint_id || null,
      })
      .select('*')
      .single();

    if (insertError) {
      logger.error('survey.submission_failed', 'Failed to submit survey', {
        userId: user.id,
        surveyType: surveyData.survey_type,
        error: insertError.message,
      });

      return NextResponse.json(
        {
          error: 'Failed to submit survey',
          code: 'SUBMISSION_FAILED',
        },
        { status: 500 }
      );
    }

    // Calculate NPS score if this is an NPS survey
    let npsCategory: string | null = null;
    if (surveyData.survey_type === 'nps') {
      if (surveyData.rating >= 9) {
        npsCategory = 'promoter';
      } else if (surveyData.rating >= 7) {
        npsCategory = 'passive';
      } else {
        npsCategory = 'detractor';
      }
    }

    // Log for analytics
    logger.info('survey.submission_success', 'Survey submitted successfully', {
      surveyId: survey.id,
      userId: user.id,
      surveyType: survey.survey_type,
      rating: survey.rating,
      npsCategory,
      blueprintId: survey.blueprint_id,
    });

    // Check if user needs a follow-up based on low score
    const needsFollowUp = surveyData.rating <= 2;

    if (needsFollowUp) {
      // Queue notification for support team
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/notifications/slack`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
        },
        body: JSON.stringify({
          channel: 'feedback-alerts',
          message: `Low satisfaction score (${surveyData.rating}/5) received`,
          userId: user.id,
          surveyId: survey.id,
          feedback: surveyData.feedback,
        }),
      }).catch((error) => {
        logger.error('survey.alert_notification_failed', 'Failed to send low score alert', {
          surveyId: survey.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...survey,
          nps_category: npsCategory,
        },
        message: 'Thank you for your feedback! Your response helps us improve SmartSlate.',
        needs_follow_up: needsFollowUp,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('survey.submit_unexpected_error', 'Unexpected error during survey submission', {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Get user's survey history
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const surveyType = searchParams.get('type');
    const blueprintId = searchParams.get('blueprint_id');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('user_satisfaction_surveys')
      .select(
        `
        *,
        blueprint:blueprint_generator!blueprint_id(
          id,
          title,
          created_at
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (surveyType) {
      query = query.eq('survey_type', surveyType);
    }
    if (blueprintId) {
      query = query.eq('blueprint_id', blueprintId);
    }

    const { data: surveys, count, error } = await query;

    if (error) {
      logger.error('survey.fetch_failed', 'Failed to fetch survey history', {
        userId: user.id,
        error: error.message,
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch survey history',
          code: 'FETCH_FAILED',
        },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const allUserSurveys = await supabase
      .from('user_satisfaction_surveys')
      .select('rating, survey_type')
      .eq('user_id', user.id);

    const summaryStats = {
      total_surveys: 0,
      average_rating: 0,
      nps_score: null as number | null,
    };

    if (allUserSurveys.data && allUserSurveys.data.length > 0) {
      summaryStats.total_surveys = allUserSurveys.data.length;
      summaryStats.average_rating =
        allUserSurveys.data.reduce((sum, s) => sum + s.rating, 0) / allUserSurveys.data.length;

      // Calculate NPS if user has NPS surveys
      const npsSurveys = allUserSurveys.data.filter((s) => s.survey_type === 'nps');
      if (npsSurveys.length > 0) {
        const promoters = npsSurveys.filter((s) => s.rating >= 9).length;
        const detractors = npsSurveys.filter((s) => s.rating <= 6).length;
        summaryStats.nps_score = ((promoters - detractors) / npsSurveys.length) * 100;
      }
    }

    return NextResponse.json({
      success: true,
      data: surveys || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        has_more: (count || 0) > offset + limit,
      },
      summary: summaryStats,
    });
  } catch (error) {
    logger.error('survey.fetch_unexpected_error', 'Unexpected error fetching surveys', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// Delete a survey (user can only delete their own)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const surveyId = searchParams.get('id');

    if (!surveyId) {
      return NextResponse.json(
        { error: 'Survey ID is required', code: 'INVALID_PARAMETER' },
        { status: 400 }
      );
    }

    // Delete survey (RLS will ensure user can only delete their own)
    const { error } = await supabase
      .from('user_satisfaction_surveys')
      .delete()
      .eq('id', surveyId)
      .eq('user_id', user.id);

    if (error) {
      logger.error('survey.delete_failed', 'Failed to delete survey', {
        surveyId,
        userId: user.id,
        error: error.message,
      });

      return NextResponse.json(
        {
          error: 'Failed to delete survey or survey not found',
          code: 'DELETE_FAILED',
        },
        { status: 400 }
      );
    }

    logger.info('survey.delete_success', 'Survey deleted successfully', {
      surveyId,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Survey deleted successfully',
    });
  } catch (error) {
    logger.error('survey.delete_unexpected_error', 'Unexpected error deleting survey', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
