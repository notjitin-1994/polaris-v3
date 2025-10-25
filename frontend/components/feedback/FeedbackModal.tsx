'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { FeedbackFormData, FeedbackType } from '@/lib/types/feedback';

// Create a schema for the form that matches FeedbackFormData
const feedbackFormSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'ui_ux', 'performance', 'documentation', 'security']),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  // Bug report specific fields
  steps_to_reproduce: z.string().optional(),
  expected_behavior: z.string().optional(),
  actual_behavior: z.string().optional(),
  // UI/UX specific
  impact: z.string().optional(),
  feature_area: z.string().optional(),
  // Attachments
  attachments: z.array(z.any()).optional(),
  auto_capture: z.boolean().optional(),
});
import { cn } from '@/lib/utils';
import { useDropzone } from 'react-dropzone';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: FeedbackFormData['type'];
  defaultValues?: Partial<FeedbackFormData>;
  onSubmit: (data: FeedbackFormData) => void | Promise<void>;
}

export function FeedbackModal({
  isOpen,
  onClose,
  defaultType = 'general',
  defaultValues,
  onSubmit,
}: FeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      type: defaultType,
      priority: 'medium',
      ...defaultValues,
    },
  });

  const feedbackType = watch('type');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Limit to 5 files, max 10MB each
      const validFiles = acceptedFiles
        .filter((file) => {
          if (file.size > 10 * 1024 * 1024) {
            setSubmitError(`File "${file.name}" is too large. Max size is 10MB.`);
            return false;
          }
          return true;
        })
        .slice(0, 5 - attachments.length);

      setAttachments((prev) => [...prev, ...validFiles]);
    },
    [attachments]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.log', '.json'],
    },
    maxFiles: 5,
    disabled: attachments.length >= 5,
  });

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      });

      // Append attachments
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      // Submit feedback
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      // Handle success
      setSubmitSuccess(true);
      await onSubmit(data);

      // Reset form and close modal after a delay
      setTimeout(() => {
        reset();
        setAttachments([]);
        setSubmitSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeSpecificFields = () => {
    switch (feedbackType) {
      case 'bug':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="steps_to_reproduce">Steps to Reproduce *</Label>
              <Textarea
                id="steps_to_reproduce"
                {...register('steps_to_reproduce')}
                placeholder="1. Go to...\n2. Click on...\n3. See error"
                className="min-h-[100px]"
              />
              {errors.steps_to_reproduce && (
                <p className="text-sm text-red-500">{errors.steps_to_reproduce.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="browser">Browser</Label>
                <Input
                  id="browser"
                  onChange={(e) => setValue('auto_capture', true)}
                  placeholder="e.g., Chrome 119"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="os">Operating System</Label>
                <Input
                  id="os"
                  onChange={(e) => setValue('auto_capture', true)}
                  placeholder="e.g., Windows 11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_behavior">Expected Behavior</Label>
              <Textarea
                id="expected_behavior"
                {...register('expected_behavior')}
                placeholder="What should have happened?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_behavior">Actual Behavior</Label>
              <Textarea
                id="actual_behavior"
                {...register('actual_behavior')}
                placeholder="What actually happened?"
              />
            </div>
          </>
        );

      case 'feature':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="feature_area">Feature Area *</Label>
              <Input
                id="feature_area"
                {...register('feature_area')}
                placeholder="e.g., Dashboard, Analytics, User Management"
              />
              {errors.feature_area && (
                <p className="text-sm text-red-500">{errors.feature_area.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_behavior">Expected Behavior</Label>
              <Textarea
                id="expected_behavior"
                {...register('expected_behavior')}
                placeholder="Describe how this feature would work"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact Level</Label>
              <Controller
                name="impact"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Nice to have</SelectItem>
                      <SelectItem value="medium">Medium - Important</SelectItem>
                      <SelectItem value="high">High - Very important</SelectItem>
                      <SelectItem value="critical">Critical - Must have</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </>
        );

      case 'ui_ux':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="feature_area">UI Component/Page</Label>
              <Input
                id="feature_area"
                {...register('feature_area')}
                placeholder="e.g., Navigation bar, Dashboard, Settings page"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="impact">Impact Level</Label>
              <Controller
                name="impact"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select impact level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                      <SelectItem value="medium">Medium - Affects workflow</SelectItem>
                      <SelectItem value="high">High - Significant impact</SelectItem>
                      <SelectItem value="critical">Critical - Unusable</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_behavior">Suggested Improvement</Label>
              <Textarea
                id="expected_behavior"
                {...register('expected_behavior')}
                placeholder="How would you improve this?"
                className="min-h-[80px]"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            We appreciate your feedback! Please provide as much detail as possible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Success Message */}
          {submitSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Thank you for your feedback! We'll review it and get back to you soon.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Basic Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Feedback Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="general">General Feedback</SelectItem>
                        <SelectItem value="ui_ux">UI/UX Issue</SelectItem>
                        <SelectItem value="performance">Performance Issue</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                        <SelectItem value="security">Security Concern</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Brief summary of your feedback"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Provide detailed information about your feedback"
                className="min-h-[120px]"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Type-specific Fields */}
          {getTypeSpecificFields()}

          {/* File Attachments */}
          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div
              {...getRootProps()}
              className={cn(
                'cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400',
                attachments.length >= 5 && 'cursor-not-allowed opacity-50'
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive
                  ? 'Drop files here...'
                  : attachments.length >= 5
                    ? 'Maximum 5 files allowed'
                    : 'Drag & drop files here, or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Max 5 files, 10MB each. Supports images, PDFs, and text files.
              </p>
            </div>

            {/* Attached Files List */}
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded bg-gray-50 p-2 dark:bg-gray-800"
                  >
                    <span className="flex-1 truncate text-sm">{file.name}</span>
                    <span className="mx-2 text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-capture Option */}
          <div className="flex items-center space-x-2">
            <Controller
              name="auto_capture"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="auto_capture"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="auto_capture" className="text-sm font-normal">
              Automatically capture browser and system information
            </Label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : submitSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submitted!
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
