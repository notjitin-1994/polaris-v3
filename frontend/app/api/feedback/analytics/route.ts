/**
 * API Route: Feedback Analytics & Dashboard Stats
 * Endpoint: GET /api/feedback/analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createServiceLogger } from '@/lib/logging';
import {
  FeedbackAnalytics,
  FeedbackTrendData,
  SatisfactionMetrics,
  ResponseTimeMetrics,
} from '@/lib/types/feedback';

const logger = createServiceLogger('feedback');

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

    // Check if user is admin/support
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (!profile?.user_role || !['admin', 'developer', 'support'].includes(profile.user_role)) {
      logger.warn('feedback.analytics.unauthorized', 'Non-admin attempted to access analytics', {
        userId: user.id,
        userRole: profile?.user_role,
      });

      return NextResponse.json(
        { error: 'Only staff members can access analytics', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'overview'; // overview | trends | satisfaction | response-time
    const from = searchParams.get('from'); // ISO date
    const to = searchParams.get('to'); // ISO date

    switch (view) {
      case 'overview':
        return await getOverviewAnalytics(supabase, from, to);
      case 'trends':
        return await getTrendAnalytics(supabase, from, to);
      case 'satisfaction':
        return await getSatisfactionAnalytics(supabase, from, to);
      case 'response-time':
        return await getResponseTimeAnalytics(supabase, from, to);
      default:
        return NextResponse.json(
          { error: 'Invalid view parameter', code: 'INVALID_PARAMETER' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('feedback.analytics.unexpected_error', 'Unexpected error fetching analytics', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

async function getOverviewAnalytics(
  supabase: any,
  from?: string | null,
  to?: string | null
): Promise<NextResponse> {
  try {
    // Build date filter
    const dateFilter: any = {};
    if (from) {
      dateFilter.created_at = { gte: from };
    }
    if (to) {
      dateFilter.created_at = { ...dateFilter.created_at, lte: to };
    }

    // Get feedback counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('feedback_submissions')
      .select('status')
      .match(dateFilter);

    if (statusError) throw statusError;

    const statusBreakdown =
      statusCounts?.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get feedback counts by priority
    const { data: priorityCounts, error: priorityError } = await supabase
      .from('feedback_submissions')
      .select('priority')
      .match(dateFilter);

    if (priorityError) throw priorityError;

    const priorityBreakdown =
      priorityCounts?.reduce((acc: Record<string, number>, item: any) => {
        acc[item.priority] = (acc[item.priority] || 0) + 1;
        return acc;
      }, {}) || {};

    // Get feedback counts by category
    const { data: categoryCounts, error: categoryError } = await supabase
      .from('feedback_submissions')
      .select(
        `
        feedback_type:feedback_types!inner(category)
      `
      )
      .match(dateFilter);

    if (categoryError) throw categoryError;

    const categoryBreakdown =
      categoryCounts?.reduce((acc: Record<string, number>, item: any) => {
        const category = item.feedback_type?.category;
        if (category) {
          acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
      }, {}) || {};

    // Get sentiment counts
    const { data: sentimentCounts, error: sentimentError } = await supabase
      .from('feedback_submissions')
      .select('sentiment_score')
      .not('sentiment_score', 'is', null)
      .match(dateFilter);

    if (sentimentError) throw sentimentError;

    const sentimentBreakdown = sentimentCounts?.reduce(
      (acc: any, item: any) => {
        if (item.sentiment_score === 1) acc.positive++;
        else if (item.sentiment_score === 0) acc.neutral++;
        else if (item.sentiment_score === -1) acc.negative++;
        return acc;
      },
      { positive: 0, neutral: 0, negative: 0 }
    ) || { positive: 0, neutral: 0, negative: 0 };

    // Get average response time
    const { data: responseTimes, error: responseTimeError } = await supabase
      .from('response_time_metrics')
      .select('response_time_hours')
      .match(dateFilter);

    const avgResponseTime = responseTimes?.length
      ? responseTimes.reduce((sum: number, item: any) => sum + (item.response_time_hours || 0), 0) /
        responseTimes.length
      : null;

    // Get satisfaction score
    const { data: satisfactionData } = await supabase
      .from('satisfaction_metrics')
      .select('*')
      .single();

    const totalSubmissions = Object.values(statusBreakdown).reduce(
      (sum: number, count: any) => sum + count,
      0
    );

    const analytics: FeedbackAnalytics = {
      total_submissions: totalSubmissions,
      open_feedback: statusBreakdown.open || 0,
      in_progress_feedback: statusBreakdown.in_progress || 0,
      resolved_feedback: statusBreakdown.resolved || 0,
      closed_feedback: statusBreakdown.closed || 0,
      average_priority: priorityCounts?.length
        ? priorityCounts.reduce((sum: number, item: any) => sum + item.priority, 0) /
          priorityCounts.length
        : 0,
      positive_sentiment: sentimentBreakdown.positive,
      neutral_sentiment: sentimentBreakdown.neutral,
      negative_sentiment: sentimentBreakdown.negative,
      average_response_time_hours: avgResponseTime,
      satisfaction_score: satisfactionData?.avg_rating || null,
      category_breakdown: categoryBreakdown as any,
      status_breakdown: statusBreakdown as any,
      priority_breakdown: priorityBreakdown,
      trend_data: [], // Empty for overview
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    throw error;
  }
}

async function getTrendAnalytics(
  supabase: any,
  from?: string | null,
  to?: string | null
): Promise<NextResponse> {
  try {
    // Default to last 30 days if no date range provided
    const endDate = to || new Date().toISOString();
    const startDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get daily submission counts
    const { data: submissions, error: submissionsError } = await supabase
      .from('feedback_submissions')
      .select('created_at, status')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at');

    if (submissionsError) throw submissionsError;

    // Get daily satisfaction scores
    const { data: surveys, error: surveysError } = await supabase
      .from('user_satisfaction_surveys')
      .select('created_at, rating')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at');

    if (surveysError) throw surveysError;

    // Group data by day
    const dailyData: Record<string, FeedbackTrendData> = {};

    // Process submissions
    submissions?.forEach((item: any) => {
      const date = item.created_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          submissions: 0,
          resolved: 0,
          satisfaction: null,
          response_time_hours: null,
        };
      }
      dailyData[date].submissions++;
      if (item.status === 'resolved' || item.status === 'closed') {
        dailyData[date].resolved++;
      }
    });

    // Process satisfaction surveys
    surveys?.forEach((item: any) => {
      const date = item.created_at.split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          submissions: 0,
          resolved: 0,
          satisfaction: 0,
          response_time_hours: null,
        };
      }
      // Calculate average satisfaction for the day
      const existingSatisfaction = dailyData[date].satisfaction || 0;
      const count = surveys.filter((s: any) => s.created_at.startsWith(date)).length;
      dailyData[date].satisfaction = (existingSatisfaction * (count - 1) + item.rating) / count;
    });

    // Convert to array and sort by date
    const trendData = Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: {
        trend_data: trendData,
        period: { from: startDate, to: endDate },
      },
    });
  } catch (error) {
    throw error;
  }
}

async function getSatisfactionAnalytics(
  supabase: any,
  from?: string | null,
  to?: string | null
): Promise<NextResponse> {
  try {
    let query = supabase.from('user_satisfaction_surveys').select('*');

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: surveys, error } = await query;

    if (error) throw error;

    if (!surveys || surveys.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          total_surveys: 0,
          average_rating: 0,
          satisfied_count: 0,
          dissatisfied_count: 0,
          satisfaction_percentage: 0,
          nps_score: null,
          rating_distribution: {},
          trend_data: [],
        },
      });
    }

    // Calculate metrics
    const totalSurveys = surveys.length;
    const averageRating = surveys.reduce((sum: number, s: any) => sum + s.rating, 0) / totalSurveys;
    const satisfiedCount = surveys.filter((s: any) => s.rating >= 4).length;
    const dissatisfiedCount = surveys.filter((s: any) => s.rating <= 2).length;
    const satisfactionPercentage = (satisfiedCount / totalSurveys) * 100;

    // Rating distribution
    const ratingDistribution = surveys.reduce((acc: Record<string, number>, s: any) => {
      acc[s.rating] = (acc[s.rating] || 0) + 1;
      return acc;
    }, {});

    // Calculate NPS if we have NPS type surveys
    const npsSurveys = surveys.filter((s: any) => s.survey_type === 'nps');
    let npsScore = null;
    if (npsSurveys.length > 0) {
      const promoters = npsSurveys.filter((s: any) => s.rating >= 9).length;
      const detractors = npsSurveys.filter((s: any) => s.rating <= 6).length;
      npsScore = ((promoters - detractors) / npsSurveys.length) * 100;
    }

    const metrics: SatisfactionMetrics = {
      total_surveys: totalSurveys,
      average_rating: Math.round(averageRating * 100) / 100,
      satisfied_count: satisfiedCount,
      dissatisfied_count: dissatisfiedCount,
      satisfaction_percentage: Math.round(satisfactionPercentage * 100) / 100,
      nps_score: npsScore,
      rating_distribution: ratingDistribution,
      trend_data: [], // Could be populated with daily/weekly trends
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    throw error;
  }
}

async function getResponseTimeAnalytics(
  supabase: any,
  from?: string | null,
  to?: string | null
): Promise<NextResponse> {
  try {
    // Get response time data from the view
    let query = supabase.from('response_time_metrics').select('*');

    if (from) query = query.gte('submission_time', from);
    if (to) query = query.lte('submission_time', to);

    const { data: responseData, error } = await query;

    if (error) throw error;

    if (!responseData || responseData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          average_first_response_hours: 0,
          median_first_response_hours: 0,
          p95_response_hours: 0,
          sla_compliance_percentage: 100,
          overdue_count: 0,
        },
      });
    }

    // Calculate metrics
    const responseTimes = responseData
      .filter((r: any) => r.response_time_hours !== null)
      .map((r: any) => r.response_time_hours)
      .sort((a: number, b: number) => a - b);

    if (responseTimes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          average_first_response_hours: 0,
          median_first_response_hours: 0,
          p95_response_hours: 0,
          sla_compliance_percentage: 100,
          overdue_count: 0,
        },
      });
    }

    const avgResponseTime =
      responseTimes.reduce((sum: number, t: number) => sum + t, 0) / responseTimes.length;
    const medianResponseTime = responseTimes[Math.floor(responseTimes.length / 2)];
    const p95ResponseTime = responseTimes[Math.floor(responseTimes.length * 0.95)];

    // Assuming SLA is 24 hours for first response
    const slaTarget = 24;
    const withinSla = responseTimes.filter((t: number) => t <= slaTarget).length;
    const slaCompliance = (withinSla / responseTimes.length) * 100;
    const overdueCount = responseTimes.length - withinSla;

    const metrics: ResponseTimeMetrics = {
      average_first_response_hours: Math.round(avgResponseTime * 100) / 100,
      median_first_response_hours: Math.round(medianResponseTime * 100) / 100,
      p95_response_hours: Math.round(p95ResponseTime * 100) / 100,
      sla_compliance_percentage: Math.round(slaCompliance * 100) / 100,
      overdue_count: overdueCount,
    };

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    throw error;
  }
}
