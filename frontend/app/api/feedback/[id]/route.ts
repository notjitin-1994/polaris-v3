/**
 * API Route: Individual Feedback Operations
 * Endpoints:
 * - GET /api/feedback/[id] - Get specific feedback
 * - PUT /api/feedback/[id] - Update feedback
 * - DELETE /api/feedback/[id] - Delete feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { updateFeedbackRequestSchema } from '@/lib/schemas/feedback';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('feedback');

// GET specific feedback by ID
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

    const isAdmin =
      profile?.user_role && ['admin', 'developer', 'support'].includes(profile.user_role);

    // Build query based on user role
    let query = supabase
      .from('feedback_submissions')
      .select(
        `
        *,
        feedback_type:feedback_types(*),
        responses:feedback_responses(
          *,
          responder:user_profiles!responder_id(
            id,
            email,
            full_name,
            avatar_url
          )
        ),
        attachments:feedback_attachments(*),
        status_history:feedback_status_history(
          *,
          changer:user_profiles!changed_by(
            id,
            email,
            full_name
          )
        ),
        user:user_profiles!user_id(
          id,
          email,
          full_name,
          avatar_url
        ),
        assignee:user_profiles!assigned_to(
          id,
          email,
          full_name,
          avatar_url
        )
      `
      )
      .eq('id', params.id);

    // Non-admin users can only see their own feedback
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }

    const { data: feedback, error } = await query.single();

    if (error || !feedback) {
      logger.warn('feedback.get.not_found', 'Feedback not found or access denied', {
        feedbackId: params.id,
        userId: user.id,
        error: error?.message,
      });

      return NextResponse.json(
        { error: 'Feedback not found or access denied', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Filter internal notes from responses if not admin
    if (!isAdmin && feedback.responses) {
      feedback.responses = feedback.responses.filter((r: any) => !r.is_internal);
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    logger.error('feedback.get.unexpected_error', 'Unexpected error fetching feedback', {
      feedbackId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// UPDATE feedback
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validationResult = updateFeedbackRequestSchema.safeParse(body);

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

    const updateData = validationResult.data;

    // Check if user is admin/support
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    const isAdmin =
      profile?.user_role && ['admin', 'developer', 'support'].includes(profile.user_role);

    // Build update query based on user role
    let query = supabase
      .from('feedback_submissions')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    // Non-admin users can only update their own feedback (limited fields)
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
      // Remove fields that regular users can't update
      delete updateData.status;
      delete updateData.priority;
      delete updateData.assigned_to;
      delete updateData.ai_tags;
    }

    const { data: updatedFeedback, error } = await query
      .select(
        `
        *,
        feedback_type:feedback_types(*)
      `
      )
      .single();

    if (error || !updatedFeedback) {
      logger.warn('feedback.update.failed', 'Failed to update feedback', {
        feedbackId: params.id,
        userId: user.id,
        error: error?.message,
      });

      return NextResponse.json(
        { error: 'Failed to update feedback', code: 'UPDATE_FAILED' },
        { status: 400 }
      );
    }

    logger.info('feedback.update.success', 'Feedback updated successfully', {
      feedbackId: params.id,
      userId: user.id,
      changes: Object.keys(updateData),
    });

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
    });
  } catch (error) {
    logger.error('feedback.update.unexpected_error', 'Unexpected error updating feedback', {
      feedbackId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// DELETE feedback (admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (!profile?.user_role || !['admin', 'developer'].includes(profile.user_role)) {
      logger.warn('feedback.delete.unauthorized', 'Non-admin attempted to delete feedback', {
        feedbackId: params.id,
        userId: user.id,
        userRole: profile?.user_role,
      });

      return NextResponse.json(
        { error: 'Only administrators can delete feedback', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Delete feedback (cascade will handle related records)
    const { error } = await supabase.from('feedback_submissions').delete().eq('id', params.id);

    if (error) {
      logger.error('feedback.delete.failed', 'Failed to delete feedback', {
        feedbackId: params.id,
        userId: user.id,
        error: error.message,
      });

      return NextResponse.json(
        { error: 'Failed to delete feedback', code: 'DELETE_FAILED' },
        { status: 400 }
      );
    }

    logger.info('feedback.delete.success', 'Feedback deleted successfully', {
      feedbackId: params.id,
      deletedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    logger.error('feedback.delete.unexpected_error', 'Unexpected error deleting feedback', {
      feedbackId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
