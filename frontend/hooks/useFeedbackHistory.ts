'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedbackService } from '@/lib/feedback/feedbackService';
import type { FeedbackSubmission, FeedbackListParams } from '@/lib/types/feedback';

interface UseFeedbackHistoryOptions {
  initialParams?: Partial<FeedbackListParams>;
  pageSize?: number;
}

export function useFeedbackHistory(options: UseFeedbackHistoryOptions = {}) {
  const { initialParams = {}, pageSize = 20 } = options;
  const [params, setParams] = useState<FeedbackListParams>({
    page: 1,
    limit: pageSize,
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialParams,
  });

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['feedback-history', params],
    queryFn: () => feedbackService.listFeedback(params),
  });

  const feedback = response?.data || [];
  const hasMore = response?.has_more || false;

  const fetchMore = () => {
    if (hasMore && !isLoading && params.page) {
      setParams((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  const resetParams = (newParams: Partial<FeedbackListParams>) => {
    setParams({
      page: 1,
      limit: pageSize,
      sort_by: 'created_at',
      sort_order: 'desc',
      ...newParams,
    });
  };

  return {
    feedback,
    isLoading,
    error: error?.message || null,
    fetchMore,
    hasMore,
    refetch,
    params,
    setParams: resetParams,
  };
}
