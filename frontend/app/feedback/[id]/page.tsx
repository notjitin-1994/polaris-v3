'use client';

import React from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  User,
  Calendar,
  Tag,
  Paperclip,
} from 'lucide-react';
import { useFeedbackDetail } from '@/hooks/useFeedbackDetail';
import { FeedbackResponseForm } from '@/components/feedback/FeedbackResponseForm';
import { FeedbackAttachments } from '@/components/feedback/FeedbackAttachments';
import { FeedbackStatusHistory } from '@/components/feedback/FeedbackStatusHistory';
import type { FeedbackSubmission, FeedbackStatus, FeedbackPriority } from '@/lib/types/feedback';

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

export default function FeedbackDetailPage({ params }: { params: { id: string } }) {
  const { feedback, isLoading, error } = useFeedbackDetail(params.id);

  if (isLoading) {
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

  if (!feedback) {
    notFound();
  }

  const status = statusConfig[feedback.status as FeedbackStatus];
  const priority = priorityConfig[feedback.priority as keyof typeof priorityConfig];
  const StatusIcon = status.icon;

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{feedback.title}</h1>
            <div className="mt-2 flex items-center gap-4">
              <Badge className={status.color}>{status.label}</Badge>
              <span className={`font-medium ${priority.color}`}>{priority.label} Priority</span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Back to History
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Feedback Info */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">Type</h4>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium dark:bg-gray-800">
                      {feedback.feedback_type?.name}
                    </span>
                  </div>
                </div>

                {feedback.description && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Description</h4>
                    <p className="whitespace-pre-wrap text-gray-700">{feedback.description}</p>
                  </div>
                )}

                {/* Metadata Display */}
                {feedback.metadata && Object.keys(feedback.metadata).length > 0 && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Additional Information</h4>
                    <div className="space-y-2">
                      {Object.entries(feedback.metadata).map(([key, value]) => (
                        <div key={key} className="border-l-2 pl-4">
                          <span className="font-medium text-gray-600 capitalize">
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span className="text-gray-700">
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Page URL */}
                {feedback.page_url && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">Page URL</h4>
                    <a
                      href={feedback.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark break-all"
                    >
                      {feedback.page_url}
                    </a>
                  </div>
                )}

                {/* User Agent */}
                {feedback.user_agent && (
                  <div>
                    <h4 className="mb-2 font-medium text-gray-900">User Agent</h4>
                    <p className="font-mono text-xs break-all text-gray-600">
                      {feedback.user_agent}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attachments */}
            {feedback.attachments && feedback.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackAttachments attachments={feedback.attachments} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Responses & History */}
          <div className="space-y-6">
            {/* Response Form */}
            <Card>
              <CardHeader>
                <CardTitle>Add Response</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackResponseForm feedbackId={feedback.id} />
              </CardContent>
            </Card>

            {/* Responses List */}
            {feedback.responses && feedback.responses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Responses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.responses.map((response) => (
                      <div key={response.id} className="rounded-lg border p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {response.responder?.full_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500">{response.responder?.email}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(response.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-wrap text-gray-700">{response.response}</p>
                        </div>
                        {response.response_type && (
                          <div className="mt-2">
                            <Badge variant="outline" className="text-xs">
                              {response.response_type.replace('_', ' ')}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status History */}
            {feedback.status_history && feedback.status_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Status History</CardTitle>
                </CardHeader>
                <CardContent>
                  <FeedbackStatusHistory history={feedback.status_history} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
