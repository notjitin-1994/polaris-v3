'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileImage, FileText, File, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardData } from '@/types/dashboard';
import { dashboardExportService, ExportFormat } from '@/lib/dashboard/exportService';

interface ExportButtonProps {
  data: DashboardData;
  elementId: string;
  className?: string;
}

const formatOptions: Array<{
  format: ExportFormat;
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    format: 'png',
    label: 'PNG Image',
    icon: <FileImage className="w-4 h-4" />,
    description: 'High-quality image of the dashboard',
  },
  {
    format: 'jpg',
    label: 'JPG Image',
    icon: <FileImage className="w-4 h-4" />,
    description: 'Compressed image format',
  },
  {
    format: 'pdf',
    label: 'PDF Document',
    icon: <FileText className="w-4 h-4" />,
    description: 'Professional document format',
  },
  {
    format: 'json',
    label: 'JSON Data',
    icon: <File className="w-4 h-4" />,
    description: 'Raw dashboard data',
  },
  {
    format: 'csv',
    label: 'CSV Data',
    icon: <File className="w-4 h-4" />,
    description: 'Spreadsheet-compatible format',
  },
];

export function ExportButton({ data, elementId, className }: ExportButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(format);
      setError(null);

      await dashboardExportService.exportDashboard(data, elementId, {
        format,
        quality: 0.9,
        filename: `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_dashboard`,
      });

      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
      console.error('Export error:', err);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Dashboard
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div
          className="absolute top-full mt-2 right-0 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Export Options
            </div>
            {formatOptions.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting !== null}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {option.icon}
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {option.description}
                  </div>
                </div>
                {isExporting === option.format && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
