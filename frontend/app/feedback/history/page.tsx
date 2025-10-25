'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MessageSquare, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useFeedbackHistory } from '@/hooks/useFeedbackHistory';
import type { FeedbackSubmission, FeedbackStatus } from '@/lib/types/feedback';

const statusConfig = {
  open: {
    label: 'Open',
    color: 'bg-blue-100 text-blue-800',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  resolved: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  closed: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-800',
    icon: XCircle,
  },
  duplicate: {
    label: 'Duplicate',
    color: 'bg-purple-100 text-purple-800',
    icon: XCircle,
  },
} as const;

const priorityConfig = {
  1: { label: 'Critical', color: 'text-red-600' },
  2: { label: 'High', color: 'text-orange-600' },
  3: { label: 'Medium', color: 'text-yellow-600' },
  4: { label: 'Low', color: 'text-blue-600' },
  5: { label: 'Very Low', color: 'text-gray-600' },
} as const;

export default function FeedbackHistoryPage() {
  const { feedback, isLoading, error, fetchMore, hasMore } = useFeedbackHistory();

  if (isLoading && feedback.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">Error Loading Feedback</h2>
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card className="mx-auto max-w-2xl">
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h2 className="mb-2 text-xl font-semibold text-gray-900">No Feedback Yet</h2>
              <p className="mb-4 text-gray-600">
                You haven't submitted any feedback yet. Start by sharing your thoughts with us!
              </p>
              <Link href="/feedback">
                <Button>Submit Your First Feedback</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Your Feedback History</h1>
          <p className="text-gray-600">Track all your feedback submissions and their status</p>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.map((item) => {
            const status = statusConfig[item.status as FeedbackStatus];
            const priority = priorityConfig[item.priority as keyof typeof priorityConfig];
            const StatusIcon = status.icon;

            return (
              <Card key={item.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={status.color}>{status.label}</Badge>
                          </span>
                          <span className={`font-medium ${priority.color}`}>{priority.label}</span>
                          <span className="text-gray-500">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <Link href={`/feedback/${item.id}`}>
                      <Button variant="outline" size="small">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                {item.description && (
                  <CardContent>
                    <p className="line-clamp-3 text-gray-700">{item.description}</p>
                  </CardContent>
                )}

                {/* Responses Preview */}
                {item.responses && item.responses.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MessageSquare className="h-4 w-4" />
                        <span>
                          {item.responses.length} response{item.responses.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs">
                          (Last:{' '}
                          {formatDistanceToNow(new Date(item.responses[0].created_at), {
                            addSuffix: true,
                          })}
                          )
                        </span>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-6 text-center">
            <Button
              onClick={fetchMore}
              variant="outline"
              disabled={isLoading}
              className="min-w-[150px]"
            >
              {isLoading ? (
                <>
                  <div className="border-primary mr-2 h-4 w-4 animate-spin rounded-full border-b-2"></div>
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
