/**
 * Reports Section for Blueprint Sidebar
 * Collapsible report builder and saved reports
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ChevronDown,
  Plus,
  Download,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn, glassCard, microInteractions } from '@/lib/design-system';
import type { CustomReport } from '@/store/blueprintStore';

interface ReportsSectionProps {
  customReports: CustomReport[];
  onCreateReport: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateReport: (reportId: string, updates: Partial<CustomReport>) => void;
  onDeleteReport: (reportId: string) => void;
  onShowBuilder: () => void;
  isPublicView?: boolean;
}

export function ReportsSection({
  customReports,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onShowBuilder,
  isPublicView = false,
}: ReportsSectionProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isPublicView) return <></>;

  return (
    <div className="border-t border-white/5 pt-4">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2',
          'text-sm font-medium text-foreground',
          'hover:bg-white/5 transition-colors',
        )}
      >
        <div className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg',
          'bg-secondary/20',
        )}>
          <FileText className="h-4 w-4 text-secondary" />
        </div>
        <span className="flex-1 text-left">Custom Reports</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-disabled">{customReports.length}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden px-3"
          >
            {/* Create Report Button */}
            <motion.button
              {...microInteractions.buttonPress}
              onClick={onShowBuilder}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3',
                'bg-secondary/10 text-secondary',
                'hover:bg-secondary/20',
                'border border-secondary/20',
                'transition-all duration-200',
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Create Report</span>
            </motion.button>

            {/* Reports List */}
            <div className="mt-3 space-y-2">
              {customReports.length > 0 ? (
                customReports.map((report) => (
                  <motion.div
                    key={report.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      glassCard.base,
                      'group p-3',
                    )}
                  >
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">
                        {report.name}
                      </h4>
                      <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                        {report.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-disabled">
                        {report.sections.length} sections
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => console.log('Preview report:', report.id)}
                          className="h-6 w-6 rounded p-1 hover:bg-white/10"
                          title="Preview"
                        >
                          <Eye className="h-full w-full text-text-secondary" />
                        </button>
                        <button
                          onClick={() => console.log('Download report:', report.id)}
                          className="h-6 w-6 rounded p-1 hover:bg-white/10"
                          title="Download"
                        >
                          <Download className="h-full w-full text-text-secondary" />
                        </button>
                        <button
                          onClick={() => onDeleteReport(report.id)}
                          className="h-6 w-6 rounded p-1 hover:bg-white/10 hover:text-error"
                          title="Delete"
                        >
                          <Trash2 className="h-full w-full" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-6 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-text-disabled opacity-50" />
                  <p className="text-xs text-text-disabled">
                    No reports yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

