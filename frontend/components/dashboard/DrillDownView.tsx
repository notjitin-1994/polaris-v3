'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useDrillDown } from './DrillDownProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DrillDownViewProps {
  className?: string;
}

export function DrillDownView({ className }: DrillDownViewProps): JSX.Element {
  const { drillDownState, drillUp, resetDrillDown } = useDrillDown();

  if (!drillDownState || drillDownState.path.length === 0) {
    return <div className={cn('hidden', className)} />;
  }

  const currentPath = drillDownState.path[drillDownState.path.length - 1];
  const pathString = drillDownState.path.join(' > ');

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4',
          className,
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-preview overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={drillUp}
                disabled={drillDownState.path.length <= 1}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {currentPath}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">{pathString}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetDrillDown}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <DrillDownContent data={drillDownState.data} filters={drillDownState.filters} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <span>Path: {pathString}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={drillUp}>
                Back
              </Button>
              <Button variant="secondary" size="sm" onClick={resetDrillDown}>
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface DrillDownContentProps {
  data: unknown;
  filters: Record<string, unknown>;
}

function DrillDownContent({ data, filters }: DrillDownContentProps): JSX.Element {
  if (typeof data === 'object' && data !== null) {
    return (
      <div className="space-y-6">
        {/* Object properties */}
        {Object.entries(data).map(([key, value]) => (
          <motion.div
            key={key}
            className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            </h3>
            <div className="text-slate-700 dark:text-slate-300">
              {typeof value === 'object' && value !== null ? (
                <DrillDownContent data={value} filters={filters} />
              ) : (
                <p className="font-mono text-sm bg-white dark:bg-slate-700 p-2 rounded border">
                  {String(value)}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
      <p className="font-mono text-sm bg-white dark:bg-slate-700 p-2 rounded border">
        {String(data)}
      </p>
    </div>
  );
}
