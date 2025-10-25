/**
 * Feedback Service Layer
 * Handles business logic for feedback operations
 */

import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createServiceLogger } from '@/lib/logging';
import type {
  FeedbackSubmission,
  FeedbackType,
  FeedbackResponse,
  FeedbackStatusHistory,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  FeedbackListParams,
  FeedbackListResponse,
  FeedbackWithRelations,
  FeedbackStatus,
  FeedbackPriority,
} from '@/lib/types/feedback';

const logger = createServiceLogger('feedback');

export class FeedbackService {
  /**
   * Get all active feedback types
   */
  async getFeedbackTypes(): Promise<FeedbackType[]> {
    try {
      const supabase = await getSupabaseServerClient();

      const { data, error } = await supabase
        .from('feedback_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        logger.error('feedback.types.fetch_error', 'Failed to fetch feedback types', {
          error: error.message,
        });
        throw new Error('Failed to fetch feedback types');
      }

      return data || [];
    } catch (error) {
      logger.error('feedback.types.error', 'Error in getFeedbackTypes', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create a new feedback submission
   */
  async createFeedback(
    userId: string,
    request: CreateFeedbackRequest,
    userAgent?: string | null,
    browserInfo?: any
  ): Promise<FeedbackSubmission> {
    try {
      const supabase = await getSupabaseServerClient();

      // Check rate limiting
      const isRateLimited = await this.checkRateLimit(userId);
      if (isRateLimited) {
        throw new Error('Rate limit exceeded. Please wait before submitting more feedback.');
      }

      // Prepare feedback data
      const feedbackData = {
        user_id: userId,
        feedback_type_id: request.feedback_type_id,
        title: request.title,
        description: request.description || null,
        priority: request.priority || 3,
        metadata: request.metadata || {},
        user_agent: userAgent,
        browser_info: browserInfo,
        page_url: request.page_url || null,
        error_details: request.error_details || null,
        status: 'open' as FeedbackStatus,
      };

      // Insert feedback
      const { data, error } = await supabase
        .from('feedback_submissions')
        .insert(feedbackData)
        .select(
          `
          *,
          feedback_type:feedback_types(*)
        `
        )
        .single();

      if (error) {
        logger.error('feedback.create.error', 'Failed to create feedback', {
          userId,
          error: error.message,
        });
        throw new Error('Failed to submit feedback');
      }

      logger.info('feedback.created', 'Feedback created successfully', {
        feedbackId: data.id,
        userId,
        type: data.feedback_type?.name,
      });

      // Queue notification
      this.queueNotification('feedback-received', {
        feedbackId: data.id,
        userId,
        title: data.title,
        type: data.feedback_type?.name,
      }).catch((err) => {
        logger.error('feedback.notification.error', 'Failed to queue notification', {
          feedbackId: data.id,
          error: err,
        });
      });

      return data;
    } catch (error) {
      logger.error('feedback.create.error', 'Error in createFeedback', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get feedback by ID
   */
  async getFeedbackById(
    feedbackId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<FeedbackWithRelations | null> {
    try {
      const supabase = await getSupabaseServerClient();

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
        .eq('id', feedbackId);

      // Non-admins can only see their own feedback
      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error || !data) {
        logger.warn('feedback.get.not_found', 'Feedback not found', {
          feedbackId,
          userId,
          isAdmin,
        });
        return null;
      }

      // Filter internal notes for non-admins
      if (!isAdmin && data.responses) {
        data.responses = data.responses.filter((r: any) => !r.is_internal);
      }

      return data as FeedbackWithRelations;
    } catch (error) {
      logger.error('feedback.get.error', 'Error in getFeedbackById', {
        feedbackId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update feedback
   */
  async updateFeedback(
    feedbackId: string,
    userId: string,
    updates: UpdateFeedbackRequest,
    isAdmin: boolean = false
  ): Promise<FeedbackSubmission> {
    try {
      const supabase = await getSupabaseServerClient();

      // Build update data
      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Non-admins can only update limited fields
      if (!isAdmin) {
        delete updateData.status;
        delete updateData.priority;
        delete updateData.assigned_to;
        delete updateData.ai_tags;
      }

      let query = supabase.from('feedback_submissions').update(updateData).eq('id', feedbackId);

      // Non-admins can only update their own feedback
      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query
        .select(
          `
          *,
          feedback_type:feedback_types(*)
        `
        )
        .single();

      if (error || !data) {
        logger.error('feedback.update.error', 'Failed to update feedback', {
          feedbackId,
          userId,
          error: error?.message,
        });
        throw new Error('Failed to update feedback');
      }

      logger.info('feedback.updated', 'Feedback updated successfully', {
        feedbackId,
        userId,
        changes: Object.keys(updates),
      });

      return data;
    } catch (error) {
      logger.error('feedback.update.error', 'Error in updateFeedback', {
        feedbackId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * List feedback with filters and pagination
   */
  async listFeedback(params: FeedbackListParams): Promise<FeedbackListResponse> {
    try {
      const supabase = await getSupabaseServerClient();

      const {
        status,
        priority,
        category,
        user_id,
        assigned_to,
        search,
        from_date,
        to_date,
        sort_by = 'created_at',
        sort_order = 'desc',
        page = 1,
        limit = 20,
        include_responses = false,
        include_attachments = false,
        include_history = false,
      } = params;

      // Build select query
      let selectQuery = `
        *,
        feedback_type:feedback_types(*),
        user:user_profiles!user_id(
          id,
          email,
          full_name,
          avatar_url
        )
      `;

      if (include_responses) {
        selectQuery += `,
          responses:feedback_responses(
            *,
            responder:user_profiles!responder_id(
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `;
      }

      if (include_attachments) {
        selectQuery += `,
          attachments:feedback_attachments(*)
        `;
      }

      if (include_history) {
        selectQuery += `,
          status_history:feedback_status_history(
            *,
            changer:user_profiles!changed_by(
              id,
              email,
              full_name
            )
          )
        `;
      }

      // Build query
      let query = supabase.from('feedback_submissions').select(selectQuery, { count: 'exact' });

      // Apply filters
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }

      if (priority) {
        if (Array.isArray(priority)) {
          query = query.in('priority', priority);
        } else {
          query = query.eq('priority', priority);
        }
      }

      if (category) {
        // Need to join with feedback_types table
        query = query.filter('feedback_type.category', 'eq', category);
      }

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      if (assigned_to) {
        query = query.eq('assigned_to', assigned_to);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (from_date) {
        query = query.gte('created_at', from_date);
      }

      if (to_date) {
        query = query.lte('created_at', to_date);
      }

      // Apply sorting
      const ascending = sort_order === 'asc';
      query = query.order(sort_by, { ascending });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        logger.error('feedback.list.error', 'Failed to list feedback', {
          error: error.message,
          params,
        });
        throw new Error('Failed to fetch feedback');
      }

      return {
        data: (data as unknown as FeedbackSubmission[]) || [],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > page * limit,
      };
    } catch (error) {
      logger.error('feedback.list.error', 'Error in listFeedback', {
        error: error instanceof Error ? error.message : String(error),
        params,
      });
      throw error;
    }
  }

  /**
   * Add response to feedback
   */
  async addResponse(
    feedbackId: string,
    userId: string,
    response: string,
    responseType: string = 'comment',
    isInternal: boolean = false
  ): Promise<FeedbackResponse> {
    try {
      const supabase = await getSupabaseServerClient();

      const { data, error } = await supabase
        .from('feedback_responses')
        .insert({
          feedback_id: feedbackId,
          responder_id: userId,
          response,
          response_type: responseType,
          is_internal: isInternal,
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

      if (error) {
        logger.error('feedback.response.error', 'Failed to add response', {
          feedbackId,
          userId,
          error: error.message,
        });
        throw new Error('Failed to add response');
      }

      logger.info('feedback.response.added', 'Response added successfully', {
        feedbackId,
        responseId: data.id,
        userId,
        isInternal,
      });

      // Update feedback status if needed
      if (responseType === 'comment' && !isInternal) {
        await this.updateFeedbackStatus(feedbackId, 'in_progress');
      }

      return data;
    } catch (error) {
      logger.error('feedback.response.error', 'Error in addResponse', {
        feedbackId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update feedback status
   */
  private async updateFeedbackStatus(feedbackId: string, newStatus: FeedbackStatus): Promise<void> {
    try {
      const supabase = await getSupabaseServerClient();

      const { error } = await supabase
        .from('feedback_submissions')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId)
        .eq('status', 'open'); // Only update if current status is 'open'

      if (error) {
        logger.warn('feedback.status.update_failed', 'Failed to update status', {
          feedbackId,
          newStatus,
          error: error.message,
        });
      }
    } catch (error) {
      logger.error('feedback.status.error', 'Error updating status', {
        feedbackId,
        newStatus,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check rate limiting for user
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    try {
      const supabase = await getSupabaseServerClient();

      const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
      const { count } = await supabase
        .from('feedback_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneMinuteAgo);

      return (count ?? 0) >= 5;
    } catch (error) {
      logger.error('feedback.rate_limit.error', 'Error checking rate limit', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Queue notification (placeholder for notification service)
   */
  private async queueNotification(type: string, data: Record<string, any>): Promise<void> {
    // This would integrate with your notification service
    // For now, just log
    logger.info('feedback.notification.queued', 'Notification queued', {
      type,
      data,
    });
  }

  /**
   * Assign feedback to a user
   */
  async assignFeedback(feedbackId: string, assigneeId: string | null): Promise<void> {
    try {
      const supabase = await getSupabaseServerClient();

      const { error } = await supabase
        .from('feedback_submissions')
        .update({
          assigned_to: assigneeId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', feedbackId);

      if (error) {
        logger.error('feedback.assign.error', 'Failed to assign feedback', {
          feedbackId,
          assigneeId,
          error: error.message,
        });
        throw new Error('Failed to assign feedback');
      }

      logger.info('feedback.assigned', 'Feedback assigned successfully', {
        feedbackId,
        assigneeId,
      });
    } catch (error) {
      logger.error('feedback.assign.error', 'Error in assignFeedback', {
        feedbackId,
        assigneeId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get feedback statistics for a user
   */
  async getUserFeedbackStats(userId: string): Promise<any> {
    try {
      const supabase = await getSupabaseServerClient();

      const { data, error } = await supabase
        .from('feedback_submissions')
        .select('status, priority')
        .eq('user_id', userId);

      if (error) {
        logger.error('feedback.stats.error', 'Failed to get user stats', {
          userId,
          error: error.message,
        });
        throw new Error('Failed to get feedback statistics');
      }

      const stats = {
        total: data?.length || 0,
        open: data?.filter((f) => f.status === 'open').length || 0,
        in_progress: data?.filter((f) => f.status === 'in_progress').length || 0,
        resolved: data?.filter((f) => f.status === 'resolved').length || 0,
        closed: data?.filter((f) => f.status === 'closed').length || 0,
        by_priority: {
          1: data?.filter((f) => f.priority === 1).length || 0,
          2: data?.filter((f) => f.priority === 2).length || 0,
          3: data?.filter((f) => f.priority === 3).length || 0,
          4: data?.filter((f) => f.priority === 4).length || 0,
          5: data?.filter((f) => f.priority === 5).length || 0,
        },
      };

      return stats;
    } catch (error) {
      logger.error('feedback.stats.error', 'Error in getUserFeedbackStats', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Export singleton instance
export const feedbackService = new FeedbackService();
