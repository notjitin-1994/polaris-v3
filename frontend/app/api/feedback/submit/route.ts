/**
 * API Route: Submit New Feedback
 * Endpoint: POST /api/feedback/submit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createFeedbackRequestSchema } from '@/lib/schemas/feedback';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('feedback');

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createFeedbackRequestSchema.safeParse(body);

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

    const feedbackData = validationResult.data;

    // Get user agent and browser info from request headers
    const userAgent = request.headers.get('user-agent') || null;
    const browserInfo = {
      userAgent: userAgent,
      language: request.headers.get('accept-language'),
      platform: request.headers.get('sec-ch-ua-platform'),
      mobile: request.headers.get('sec-ch-ua-mobile'),
    };

    // Check user's feedback submission rate limit (5 per minute)
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { count: recentSubmissions, error: countError } = await supabase
      .from('feedback_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo);

    if (countError) {
      logger.error('feedback.rate_limit_check_failed', 'Rate limit check failed', {
        userId: user.id,
        error: countError.message,
        errorCode: countError.code,
        errorDetails: countError.details,
      });
    } else if ((recentSubmissions ?? 0) >= 5) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please wait a minute before submitting more feedback.',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // Insert feedback submission
    const { data: feedback, error: insertError } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        feedback_type_id: feedbackData.feedback_type_id,
        title: feedbackData.title,
        description: feedbackData.description || null,
        priority: feedbackData.priority || 3,
        metadata: feedbackData.metadata || {},
        user_agent: userAgent,
        browser_info: browserInfo,
        page_url: feedbackData.page_url || null,
        error_details: feedbackData.error_details || null,
        status: 'open',
      })
      .select(
        `
        *,
        feedback_type:feedback_types(*)
      `
      )
      .single();

    if (insertError) {
      logger.error('feedback.submission_failed', 'Failed to submit feedback', {
        userId: user.id,
        feedbackTypeId: feedbackData.feedback_type_id,
        error: insertError.message,
        errorCode: insertError.code,
        errorDetails: insertError.details,
      });

      return NextResponse.json(
        {
          error: 'Failed to submit feedback',
          code: 'SUBMISSION_FAILED',
        },
        { status: 500 }
      );
    }

    // Send confirmation email (non-blocking)
    if (user.email) {
      // Queue email notification
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/notifications/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
        },
        body: JSON.stringify({
          to: user.email,
          template: 'feedback-received',
          data: {
            feedback_id: feedback.id,
            feedback_title: feedback.title,
            feedback_type: feedback.feedback_type?.name,
          },
        }),
      }).catch((error) => {
        logger.error('feedback.email_notification_failed', 'Failed to send email notification', {
          feedbackId: feedback.id,
          userId: user.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: feedback,
        message: 'Thank you for your feedback! We will review it shortly.',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(
      'feedback.submit_unexpected_error',
      'Unexpected error during feedback submission',
      {
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      }
    );

    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch feedback types
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get active feedback types
    const { data: feedbackTypes, error } = await supabase
      .from('feedback_types')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error('feedback.types_fetch_failed', 'Failed to fetch feedback types', {
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
      });

      return NextResponse.json(
        {
          error: 'Failed to fetch feedback types',
          code: 'FETCH_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedbackTypes,
    });
  } catch (error) {
    logger.error('feedback.types_unexpected_error', 'Unexpected error fetching feedback types', {
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
