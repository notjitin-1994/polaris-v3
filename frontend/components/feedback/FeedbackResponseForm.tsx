'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { feedbackService } from '@/lib/feedback/feedbackService';
import type { ResponseType } from '@/lib/types/feedback';

interface FeedbackResponseFormProps {
  feedbackId: string;
  onSuccess?: () => void;
}

export function FeedbackResponseForm({ feedbackId, onSuccess }: FeedbackResponseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      response: '',
      response_type: 'comment',
      is_internal: false,
    },
  });

  const responseMutation = useMutation({
    mutationFn: async (data) => {
      setIsSubmitting(true);
      try {
        await feedbackService.addResponse(
          feedbackId,
          'current-user', // This would come from auth context
          data.response,
          data.response_type,
          data.is_internal
        );
        reset();
        onSuccess?.();
        queryClient.invalidateQueries({ queryKey: ['feedback-detail'] });
      } catch (error) {
        console.error('Failed to submit response:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const onSubmit = (data: any) => {
    responseMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="response">Your Response</Label>
        <Textarea
          id="response"
          {...register('response', { required: 'Please enter your response' })}
          placeholder="Share your thoughts or additional information..."
          rows={4}
          className="resize-none"
        />
        {errors.response && <p className="mt-1 text-sm text-red-500">{errors.response.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="response_type">Response Type</Label>
          <Select {...register('response_type')}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comment">Comment</SelectItem>
              <SelectItem value="internal_note">Internal Note</SelectItem>
              <SelectItem value="status_change">Status Change</SelectItem>
            </SelectContent>
          </Select>
          {errors.response_type && (
            <p className="mt-1 text-sm text-red-500">{errors.response_type.message}</p>
          )}
        </div>

        <div className="flex items-end">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <div className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-b-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Response
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
