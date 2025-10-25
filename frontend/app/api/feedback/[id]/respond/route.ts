/**
 * API Route: Add Response to Feedback
 * Endpoint: POST /api/feedback/[id]/respond
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createResponseRequestSchema } from '@/lib/schemas/feedback';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('feedback');

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validationResult = createResponseRequestSchema.safeParse(body);

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

    const responseData = validationResult.data;

    // Check if user is admin/support for internal notes
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_role, email, full_name')
      .eq('id', user.id)
      .single();

    const isStaff =
      profile?.user_role && ['admin', 'developer', 'support'].includes(profile.user_role);

    // Verify feedback exists
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_submissions')
      .select('id, user_id, title, status')
      .eq('id', params.id)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json({ error: 'Feedback not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Check permissions: users can respond to their own feedback, staff can respond to any
    if (!isStaff && feedback.user_id !== user.id) {
      logger.warn(
        'feedback.response.unauthorized',
        "User attempted to respond to feedback they don't own",
        {
          feedbackId: params.id,
          userId: user.id,
          feedbackOwnerId: feedback.user_id,
        }
      );

      return NextResponse.json(
        { error: 'You can only respond to your own feedback', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Only staff can create internal notes
    if (responseData.is_internal && !isStaff) {
      return NextResponse.json(
        { error: 'Only staff members can create internal notes', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Insert response
    const { data: newResponse, error: insertError } = await supabase
      .from('feedback_responses')
      .insert({
        feedback_id: params.id,
        responder_id: user.id,
        response: responseData.response,
        response_type: responseData.response_type || 'comment',
        is_internal: responseData.is_internal || false,
      })
      .select(
        `
        *,
        responder:user_profiles!responder_id(
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (insertError) {
      logger.error('feedback.response.insert_failed', 'Failed to add response', {
        feedbackId: params.id,
        userId: user.id,
        error: insertError.message,
      });

      return NextResponse.json(
        { error: 'Failed to add response', code: 'INSERT_FAILED' },
        { status: 500 }
      );
    }

    // Update feedback status if this is a staff response and status is 'open'
    if (isStaff && feedback.status === 'open' && !responseData.is_internal) {
      await supabase
        .from('feedback_submissions')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id);

      logger.info('feedback.response.status_updated', 'Feedback status updated to in_progress', {
        feedbackId: params.id,
        responderId: user.id,
      });
    }

    // Send notification to feedback owner if this is a staff response (non-internal)
    if (isStaff && !responseData.is_internal && feedback.user_id !== user.id) {
      // Get feedback owner's email
      const { data: feedbackOwner } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('id', feedback.user_id)
        .single();

      if (feedbackOwner?.email) {
        // Queue email notification (non-blocking)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/internal/notifications/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
          },
          body: JSON.stringify({
            to: feedbackOwner.email,
            template: 'feedback-response',
            data: {
              feedback_id: params.id,
              feedback_title: feedback.title,
              responder_name: profile?.full_name || profile?.email,
              response_preview: responseData.response.substring(0, 200),
            },
          }),
        }).catch((error) => {
          logger.error(
            'feedback.response.email_notification_failed',
            'Failed to send response notification',
            {
              feedbackId: params.id,
              error: error instanceof Error ? error.message : String(error),
            }
          );
        });
      }
    }

    logger.info('feedback.response.success', 'Response added successfully', {
      feedbackId: params.id,
      responseId: newResponse.id,
      responderId: user.id,
      isInternal: newResponse.is_internal,
    });

    return NextResponse.json(
      {
        success: true,
        data: newResponse,
        message: responseData.is_internal
          ? 'Internal note added successfully'
          : 'Response added successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('feedback.response.unexpected_error', 'Unexpected error adding response', {
      feedbackId: params.id,
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET responses for a feedback item
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if user is admin/support
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    const isStaff =
      profile?.user_role && ['admin', 'developer', 'support'].includes(profile.user_role);

    // Verify feedback exists and user has access
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback_submissions')
      .select('id, user_id')
      .eq('id', params.id)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json({ error: 'Feedback not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    // Check permissions
    if (!isStaff && feedback.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied', code: 'FORBIDDEN' }, { status: 403 });
    }

    // Get responses
    let query = supabase
      .from('feedback_responses')
      .select(
        `
        *,
        responder:user_profiles!responder_id(
          id,
          email,
          full_name,
          avatar_url,
          user_role
        )
      `
      )
      .eq('feedback_id', params.id)
      .order('created_at', { ascending: true });

    // Non-staff users don't see internal notes
    if (!isStaff) {
      query = query.eq('is_internal', false);
    }

    const { data: responses, error } = await query;

    if (error) {
      logger.error('feedback.responses.fetch_failed', 'Failed to fetch responses', {
        feedbackId: params.id,
        userId: user.id,
        error: error.message,
      });

      return NextResponse.json(
        { error: 'Failed to fetch responses', code: 'FETCH_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: responses || [],
    });
  } catch (error) {
    logger.error('feedback.responses.unexpected_error', 'Unexpected error fetching responses', {
      feedbackId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
