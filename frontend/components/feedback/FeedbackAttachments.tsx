'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Download, X } from 'lucide-react';
import type { FeedbackAttachment } from '@/lib/types/feedback';

interface FeedbackAttachmentsProps {
  attachments: FeedbackAttachment[];
}

export function FeedbackAttachments({ attachments }: FeedbackAttachmentsProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('text/')) {
      return '📄';
    } else {
      return '📎';
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getFileIcon(attachment.file_type)}</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{attachment.file_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(attachment.file_size)} • {attachment.file_type}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                const link = document.createElement('a');
                link.href = attachment.file_url;
                link.download = attachment.file_name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
