'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, FileText, FileImage, Code } from 'lucide-react';
import { ExportFormat, ExportResult, ExportMetadata } from '@/lib/export/types';

interface ExportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportResults: Map<ExportFormat, ExportResult>;
  metadata: ExportMetadata;
  onDownload: (format: ExportFormat) => void;
  onDownloadAll: () => void;
}

export const ExportPreviewModal: React.FC<ExportPreviewModalProps> = ({
  isOpen,
  onClose,
  exportResults,
  metadata,
  onDownload,
  onDownloadAll,
}) => {
  const [activeTab, setActiveTab] = useState<ExportFormat>('pdf');
  const [previewContent, setPreviewContent] = useState<string>('');

  useEffect(() => {
    if (isOpen && exportResults.has(activeTab)) {
      generatePreview(activeTab);
    }
  }, [isOpen, activeTab, exportResults, generatePreview]);

  const generatePreview = useCallback(async (format: ExportFormat) => {
    const result = exportResults.get(format);
    if (!result?.data) return;

    try {
      switch (format) {
        case 'pdf':
          // For PDF, we'll show a placeholder since we can't easily preview PDFs in browser
          setPreviewContent(
            'PDF preview not available in browser. Click download to view the file.',
          );
          break;
        case 'markdown':
          const markdownText = await result.data.text();
          setPreviewContent(markdownText);
          break;
        case 'json':
          const jsonText = await result.data.text();
          const formattedJson = JSON.stringify(JSON.parse(jsonText), null, 2);
          setPreviewContent(formattedJson);
          break;
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
      setPreviewContent('Preview not available');
    }
  }, [exportResults]);

  const formatIcons = {
    pdf: FileImage,
    markdown: FileText,
    json: Code,
  };

  const formatNames = {
    pdf: 'PDF',
    markdown: 'Markdown',
    json: 'JSON',
  };

  const formatDescriptions = {
    pdf: 'Professional document with charts and styling',
    markdown: 'Plain text with formatting for documentation',
    json: 'Structured data for integration and processing',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl max-w-4xl w-full max-h-preview flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Export Preview</h2>
            <p className="text-sm text-foreground/60">
              {metadata.title} - {metadata.exportedAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Format Tabs */}
        <div className="flex border-b border-white/10">
          {Object.entries(formatNames).map(([format, name]) => {
            const Icon = formatIcons[format as ExportFormat];
            const result = exportResults.get(format as ExportFormat);
            const isActive = activeTab === format;
            const isSuccess = result?.success;

            return (
              <button
                key={format}
                onClick={() => setActiveTab(format as ExportFormat)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground/60 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {name}
                {isSuccess ? (
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                ) : (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Format Info */}
          <div className="p-4 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2">
              {React.createElement(formatIcons[activeTab], { className: 'w-5 h-5' })}
              <h3 className="font-medium text-foreground">
                {formatNames[activeTab]}
              </h3>
            </div>
            <p className="text-sm text-foreground/70 mt-1">
              {formatDescriptions[activeTab]}
            </p>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 overflow-auto">
            {(() => {
              const result = exportResults.get(activeTab);
              if (!result?.success) {
                return (
                  <div className="text-center py-8">
                    <div className="text-red-500 text-sm">
                      Export failed: {result?.error || 'Unknown error'}
                    </div>
                  </div>
                );
              }

              if (activeTab === 'pdf') {
                return (
                  <div className="text-center py-8">
                    <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-foreground/70 mb-4">
                      PDF preview not available in browser
                    </p>
                    <p className="text-sm text-foreground/60">
                      Click download to view the generated PDF file
                    </p>
                  </div>
                );
              }

              return (
                <pre className="bg-white/5 border border-white/10 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap text-foreground">
                  {previewContent}
                </pre>
              );
            })()}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <div className="text-sm text-foreground/60">
              {exportResults.size} format{exportResults.size !== 1 ? 's' : ''} ready for download
            </div>
            <div className="flex gap-3">
              <button
                onClick={onDownloadAll}
                className="glass px-6 py-2.5 rounded-lg text-white bg-secondary hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
              <button
                onClick={() => onDownload(activeTab)}
                disabled={!exportResults.get(activeTab)?.success}
                className="glass px-6 py-2.5 rounded-lg text-foreground hover:glass-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download {formatNames[activeTab]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
