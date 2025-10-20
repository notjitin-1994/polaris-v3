/**
 * Enhanced Viewer Sidebar
 * Integrated sections, AI assistant, reports, and annotations
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, EyeOff, Eye, ChevronDown, Layers } from 'lucide-react';
import { AIAssistantSection } from './sidebar/AIAssistantSection';
import { ReportsSection } from './sidebar/ReportsSection';
import { AnnotationsSection } from './sidebar/AnnotationsSection';
import { glassPanel, glassCard, microInteractions, cn } from '@/lib/design-system';
import type { CustomReport, Annotation } from '@/store/blueprintStore';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface ViewerSidebarEnhancedProps {
  sections: Section[];
  pinnedSections: string[];
  hiddenSections: string[];
  activeSection: string | null;
  customReports: CustomReport[];
  annotations: Record<string, Annotation[]>;
  onNavigate: (sectionId: string) => void;
  onTogglePin: (sectionId: string) => void;
  onToggleHide: (sectionId: string) => void;
  onCreateReport: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateReport: (reportId: string, updates: Partial<CustomReport>) => void;
  onDeleteReport: (reportId: string) => void;
  onAddAnnotation: (sectionId: string, content: string) => void;
  onUpdateAnnotation: (sectionId: string, annotationId: string, content: string) => void;
  onDeleteAnnotation: (sectionId: string, annotationId: string) => void;
  blueprintId: string;
  isPublicView?: boolean;
}

export function ViewerSidebarEnhanced({
  sections,
  pinnedSections,
  hiddenSections,
  activeSection,
  customReports,
  annotations,
  onNavigate,
  onTogglePin,
  onToggleHide,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  blueprintId,
  isPublicView = false,
}: ViewerSidebarEnhancedProps): React.JSX.Element {
  const [expandedSections, setExpandedSections] = useState(true);

  // Group sections
  const groupedSections = {
    pinned: sections.filter((s) => pinnedSections.includes(s.id)),
    visible: sections.filter(
      (s) => !pinnedSections.includes(s.id) && !hiddenSections.includes(s.id)
    ),
    hidden: sections.filter((s) => hiddenSections.includes(s.id)),
  };

  const renderSection = (section: Section) => {
    const isPinned = pinnedSections.includes(section.id);
    const isHidden = hiddenSections.includes(section.id);
    const isActive = activeSection === section.id;

    return (
      <motion.button
        key={section.id}
        onClick={() => onNavigate(section.id)}
        layout
        className={cn(
          'group flex w-full items-center gap-2 rounded-lg px-3 py-2',
          'text-left text-sm transition-all duration-200',
          isActive
            ? 'bg-primary/20 text-primary font-medium'
            : 'text-text-secondary hover:text-foreground hover:bg-white/5'
        )}
      >
        <span className="flex-1 truncate">{section.title}</span>

        {/* Action Buttons */}
        <div
          className={cn(
            'flex items-center gap-1',
            'opacity-0 transition-opacity group-hover:opacity-100'
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(section.id);
            }}
            className={cn('h-6 w-6 rounded p-1', isPinned ? 'text-primary' : 'hover:bg-white/10')}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className="h-full w-full" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleHide(section.id);
            }}
            className="h-6 w-6 rounded p-1 hover:bg-white/10"
            title={isHidden ? 'Show' : 'Hide'}
          >
            {isHidden ? <Eye className="h-full w-full" /> : <EyeOff className="h-full w-full" />}
          </button>
        </div>
      </motion.button>
    );
  };

  return (
    <aside
      className={cn(
        // Use glass panel WITHOUT the ambient effect that blocks interaction
        'border border-white/[0.05] bg-white/[0.02] backdrop-blur-[6px]',
        'shadow-[0_4px_16px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.02)]',
        'pointer-events-auto relative flex h-full flex-col overflow-hidden'
      )}
    >
      {/* Sidebar Header */}
      <div className="relative z-10 flex-shrink-0 border-b border-white/5 p-4">
        <h3 className="text-foreground text-sm font-semibold">Blueprint Tools</h3>
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 flex-1 overflow-y-auto" style={{ touchAction: 'auto' }}>
        {/* Sections */}
        <div className="pointer-events-auto p-4">
          <button
            onClick={() => setExpandedSections(!expandedSections)}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2',
              'text-foreground text-sm font-medium',
              'transition-colors hover:bg-white/5'
            )}
          >
            <div
              className={cn('flex h-7 w-7 items-center justify-center rounded-lg', 'bg-white/10')}
            >
              <Layers className="h-4 w-4" />
            </div>
            <span className="flex-1 text-left">Sections</span>
            <div className="flex items-center gap-1">
              <span className="text-text-disabled text-xs">{sections.length}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  expandedSections && 'rotate-180'
                )}
              />
            </div>
          </button>

          <AnimatePresence>
            {expandedSections && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {/* Pinned Sections */}
                {groupedSections.pinned.length > 0 && (
                  <div className="mb-4">
                    <p className="text-text-disabled mb-2 px-3 text-xs font-medium tracking-wider uppercase">
                      Pinned
                    </p>
                    <div className="space-y-0.5">{groupedSections.pinned.map(renderSection)}</div>
                  </div>
                )}

                {/* All Sections */}
                <div>
                  <p className="text-text-disabled mb-2 px-3 text-xs font-medium tracking-wider uppercase">
                    All Sections
                  </p>
                  <div className="space-y-0.5">{groupedSections.visible.map(renderSection)}</div>
                </div>

                {/* Hidden Sections */}
                {groupedSections.hidden.length > 0 && (
                  <div className="mt-4">
                    <p className="text-text-disabled mb-2 px-3 text-xs font-medium tracking-wider uppercase">
                      Hidden
                    </p>
                    <div className="space-y-0.5">{groupedSections.hidden.map(renderSection)}</div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Assistant */}
        <AIAssistantSection
          currentSection={activeSection || undefined}
          blueprintId={blueprintId}
          isPublicView={isPublicView}
        />

        {/* Reports */}
        <ReportsSection
          customReports={customReports}
          onCreateReport={onCreateReport}
          onUpdateReport={onUpdateReport}
          onDeleteReport={onDeleteReport}
          onShowBuilder={() => console.log('Show report builder')}
          isPublicView={isPublicView}
        />

        {/* Annotations */}
        <AnnotationsSection
          annotations={annotations}
          activeSection={activeSection}
          onAddAnnotation={onAddAnnotation}
          onUpdateAnnotation={onUpdateAnnotation}
          onDeleteAnnotation={onDeleteAnnotation}
          isPublicView={isPublicView}
        />
      </div>
    </aside>
  );
}
