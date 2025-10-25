'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { feedbackService } from '@/lib/feedback/feedbackService';
import type { FeedbackWithRelations } from '@/lib/types/feedback';

export function useFeedbackDetail(feedbackId: string) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const {
    data: feedback,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['feedback-detail', feedbackId],
    queryFn: () => {
      if (!userId) return null;
      return feedbackService.getFeedbackById(feedbackId, userId);
    },
    enabled: !!feedbackId && !!userId,
  });

  // Check if user is admin (this would come from auth context)
  useEffect(() => {
    // For now, we'll assume non-admin
    // In a real implementation, this would check user role
    setIsAdmin(false);
    // Get user ID from auth context or session
    // This is a placeholder - in real implementation, you'd get this from your auth context
    setUserId('user-placeholder');
  }, [feedbackId]);

  return {
    feedback: feedback as FeedbackWithRelations | null,
    isLoading,
    error: error?.message || null,
    refetch,
    isAdmin,
  };
}
