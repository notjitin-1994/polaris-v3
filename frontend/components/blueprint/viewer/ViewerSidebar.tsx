/**
 * Viewer Sidebar
 * Section management and custom report builder
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  FileText,
  Pin,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  Edit2,
  Trash2,
  Download,
  Share2,
  Sparkles,
  Layout,
  Palette,
  Type,
} from 'lucide-react';
import { NewReportDialog } from '../reports/NewReportDialog';
import {
  glassPanel,
  glassCard,
  itemAnimations,
  microInteractions,
  cn,
  typographyPresets,
  spacing,
  componentStyles,
} from '@/lib/design-system';
import type { CustomReport, ReportTheme } from '@/store/blueprintStore';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface ViewerSidebarProps {
  sections: Section[];
  pinnedSections: string[];
  hiddenSections: string[];
  activeSection: string | null;
  customReports: CustomReport[];
  onNavigate: (sectionId: string) => void;
  onTogglePin: (sectionId: string) => void;
  onToggleHide: (sectionId: string) => void;
  onCreateReport: (report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateReport: (reportId: string, updates: Partial<CustomReport>) => void;
  onDeleteReport: (reportId: string) => void;
  isPublicView?: boolean;
}

export function ViewerSidebar({
  sections,
  pinnedSections,
  hiddenSections,
  activeSection,
  customReports,
  onNavigate,
  onTogglePin,
  onToggleHide,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  isPublicView = false,
}: ViewerSidebarProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'sections' | 'reports'>('sections');
  const [showNewReportDialog, setShowNewReportDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['pinned']));
  
  // Group sections
  const groupedSections = {
    pinned: sections.filter(s => pinnedSections.includes(s.id)),
    visible: sections.filter(s => !pinnedSections.includes(s.id) && !hiddenSections.includes(s.id)),
    hidden: sections.filter(s => hiddenSections.includes(s.id)),
  };
  
  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folder)) {
        newSet.delete(folder);
      } else {
        newSet.add(folder);
      }
      return newSet;
    });
  };
  
  const renderSection = (section: Section) => {
    const isPinned = pinnedSections.includes(section.id);
    const isHidden = hiddenSections.includes(section.id);
    const isActive = activeSection === section.id;
    
    return (
      <motion.div
        key={section.id}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="group relative"
      >
        <motion.button
          onClick={() => onNavigate(section.id)}
          className={cn(
            'flex w-full items-center justify-between rounded-lg px-3 py-2',
            'text-sm transition-all',
            isActive
              ? 'bg-primary/20 text-primary font-medium'
              : 'text-text-secondary hover:text-foreground hover:bg-white/5',
          )}
        >
          <span className="truncate">{section.title}</span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <motion.button
              {...microInteractions.buttonPress}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(section.id);
              }}
              className={cn(
                'h-6 w-6 rounded p-1',
                isPinned
                  ? 'text-primary hover:bg-primary/20'
                  : 'hover:bg-white/10',
              )}
            >
              <Pin className="h-full w-full" />
            </motion.button>
            
            <motion.button
              {...microInteractions.buttonPress}
              onClick={(e) => {
                e.stopPropagation();
                onToggleHide(section.id);
              }}
              className="h-6 w-6 rounded p-1 hover:bg-white/10"
            >
              <EyeOff className="h-full w-full" />
            </motion.button>
          </div>
        </motion.button>
      </motion.div>
    );
  };
  
  const renderSectionGroup = (title: string, sections: Section[], folderId: string) => {
    const isExpanded = expandedFolders.has(folderId);
    
    if (sections.length === 0 && folderId !== 'pinned') return null;
    
    return (
      <div key={folderId} className="space-y-1">
        <motion.button
          onClick={() => toggleFolder(folderId)}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2 py-1.5',
            'text-xs font-medium uppercase tracking-wider',
            'text-text-secondary hover:text-foreground',
            'transition-colors',
          )}
        >
          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5" />
          ) : (
            <Folder className="h-3.5 w-3.5" />
          )}
          <span>{title}</span>
          <span className="ml-auto text-[10px] opacity-50">
            {sections.length}
          </span>
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </motion.button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-0.5 overflow-hidden pl-2"
            >
              {sections.map(renderSection)}
              
              {sections.length === 0 && (
                <p className="px-3 py-2 text-xs text-text-disabled">
                  No sections pinned yet
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  
  const renderReport = (report: CustomReport) => {
    const isEditing = editingReport === report.id;
    
    return (
      <motion.div
        key={report.id}
        layout
        variants={itemAnimations.fadeInScale}
        className={cn(
          glassCard.base,
          glassCard.hover,
          'group p-3',
        )}
      >
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={report.name}
              onChange={(e) => onUpdateReport(report.id, { name: e.target.value })}
              className={cn(
                componentStyles.input.base,
                componentStyles.input.variants.glass,
                componentStyles.input.sizes.sm,
              )}
              autoFocus
            />
            <textarea
              value={report.description}
              onChange={(e) => onUpdateReport(report.id, { description: e.target.value })}
              className={cn(
                componentStyles.input.base,
                componentStyles.input.variants.glass,
                componentStyles.input.sizes.sm,
                'resize-none',
              )}
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingReport(null)}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.variants.primary,
                  componentStyles.button.sizes.xs,
                )}
              >
                Save
              </button>
              <button
                onClick={() => setEditingReport(null)}
                className={cn(
                  componentStyles.button.base,
                  componentStyles.button.variants.ghost,
                  componentStyles.button.sizes.xs,
                )}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <h4 className="font-medium text-foreground">{report.name}</h4>
              <p className="text-xs text-text-secondary line-clamp-2">
                {report.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-full',
                  'bg-primary/10 px-2 py-0.5 text-[10px] text-primary',
                )}>
                  <Layout className="h-3 w-3" />
                  {report.layout}
                </span>
                <span className="text-[10px] text-text-disabled">
                  {report.sections.length} sections
                </span>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <motion.button
                  {...microInteractions.buttonPress}
                  onClick={() => setEditingReport(report.id)}
                  className="h-6 w-6 rounded p-1 hover:bg-white/10"
                >
                  <Edit2 className="h-full w-full" />
                </motion.button>
                <motion.button
                  {...microInteractions.buttonPress}
                  className="h-6 w-6 rounded p-1 hover:bg-white/10"
                >
                  <Download className="h-full w-full" />
                </motion.button>
                <motion.button
                  {...microInteractions.buttonPress}
                  onClick={() => onDeleteReport(report.id)}
                  className="h-6 w-6 rounded p-1 hover:bg-white/10 hover:text-error"
                >
                  <Trash2 className="h-full w-full" />
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    );
  };
  
  return (
    <aside className={cn(
      glassPanel.sidebar,
      'h-full overflow-hidden',
    )}>
      {/* Tabs */}
      <div className="border-b border-white/10 p-4">
        <div className={cn(
          glassCard.base,
          'flex items-center p-1',
        )}>
          {['sections', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'sections' | 'reports')}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-sm font-medium',
                'capitalize transition-all',
                activeTab === tab
                  ? 'bg-primary/20 text-primary'
                  : 'text-text-secondary hover:text-foreground',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'sections' ? (
            <motion.div
              key="sections"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {renderSectionGroup('Pinned', groupedSections.pinned, 'pinned')}
              {renderSectionGroup('Sections', groupedSections.visible, 'visible')}
              {renderSectionGroup('Hidden', groupedSections.hidden, 'hidden')}
            </motion.div>
          ) : (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {/* Create Report Button */}
              {!isPublicView && (
                <motion.button
                  {...microInteractions.buttonHover}
                  onClick={() => setShowNewReportDialog(true)}
                  className={cn(
                    componentStyles.button.base,
                    componentStyles.button.variants.glass,
                    componentStyles.button.sizes.md,
                    'w-full justify-center',
                  )}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Report</span>
                </motion.button>
              )}
              
              {/* Reports List */}
              {customReports.length > 0 ? (
                <div className="space-y-2">
                  {customReports.map(renderReport)}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <FileText className="mx-auto mb-3 h-12 w-12 text-text-disabled" />
                  <p className="text-sm text-text-secondary">
                    No custom reports yet
                  </p>
                  <p className="mt-1 text-xs text-text-disabled">
                    Create reports from pinned sections
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Create Report Dialog */}
      <NewReportDialog
        isOpen={showNewReportDialog}
        onClose={() => setShowNewReportDialog(false)}
        sections={sections}
        pinnedSections={pinnedSections}
        onCreateReport={onCreateReport}
      />
    </aside>
  );
}
