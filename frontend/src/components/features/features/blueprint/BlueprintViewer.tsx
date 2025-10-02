/**
 * Blueprint Viewer Component
 * Main component for viewing blueprints with infographic/markdown toggle
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, FileText } from 'lucide-react';
import { InfographicSection } from './InfographicSection';
import { TimelineSection } from './TimelineSection';
import { ChartSection } from './ChartSection';
import { TableSection } from './TableSection';
import { MarkdownSection } from './MarkdownSection';
import type { BlueprintJSON } from './types';

interface BlueprintViewerProps {
  blueprint: BlueprintJSON;
  initialView?: 'infographic' | 'markdown';
}

export function BlueprintViewer({
  blueprint,
  initialView = 'infographic',
}: BlueprintViewerProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<'infographic' | 'markdown'>(initialView);

  // Get all sections (excluding metadata and internal fields)
  const sections = Object.entries(blueprint).filter(
    ([key]) => key !== 'metadata' && !key.startsWith('_')
  );

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="glass-strong inline-flex gap-1 rounded-xl p-1">
          <button
            onClick={() => setViewMode('infographic')}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              viewMode === 'infographic'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-text-secondary hover:text-foreground hover:bg-foreground/5'
            } `}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Infographic Dashboard</span>
          </button>
          <button
            onClick={() => setViewMode('markdown')}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
              viewMode === 'markdown'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-text-secondary hover:text-foreground hover:bg-foreground/5'
            } `}
          >
            <FileText className="h-4 w-4" />
            <span>Markdown Document</span>
          </button>
        </div>
      </div>

      {/* Blueprint Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {sections.map(([sectionKey, sectionData]) => (
            <BlueprintSection
              key={sectionKey}
              sectionKey={sectionKey}
              data={sectionData}
              viewMode={viewMode}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/**
 * Individual Blueprint Section Router
 * Routes to appropriate component based on displayType and viewMode
 */
function BlueprintSection({
  sectionKey,
  data,
  viewMode,
}: {
  sectionKey: string;
  data: any;
  viewMode: 'infographic' | 'markdown';
}): React.JSX.Element {
  const displayType = data?.displayType || 'markdown';

  // Force markdown view if user selected it
  const effectiveDisplayType = viewMode === 'markdown' ? 'markdown' : displayType;

  // Route to appropriate component
  try {
    switch (effectiveDisplayType) {
      case 'infographic':
        return <InfographicSection sectionKey={sectionKey} data={data} />;

      case 'timeline':
        return <TimelineSection sectionKey={sectionKey} data={data} />;

      case 'chart':
        return <ChartSection sectionKey={sectionKey} data={data} />;

      case 'table':
        return <TableSection sectionKey={sectionKey} data={data} />;

      case 'markdown':
      default:
        return <MarkdownSection sectionKey={sectionKey} data={data} />;
    }
  } catch (error) {
    // Fallback to markdown on rendering error
    console.error(`Error rendering section ${sectionKey}:`, error);
    return <MarkdownSection sectionKey={sectionKey} data={data} />;
  }
}
