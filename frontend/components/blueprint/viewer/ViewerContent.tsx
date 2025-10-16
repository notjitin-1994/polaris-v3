/**
 * Enhanced Content Renderer
 * Magazine layouts with smooth animations
 */

'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pin,
  PinOff,
  Eye,
  EyeOff,
  MessageSquare,
  Copy,
  Check,
  Maximize2,
  Wand2,
} from 'lucide-react';
import { InteractiveBlueprintDashboard } from '@/src/components/features/blueprint/InteractiveBlueprintDashboard';
import { BlueprintRenderer } from '../BlueprintRenderer';
import { EnhancedMarkdownRenderer } from './EnhancedMarkdownRenderer';
import { PresentationView } from './PresentationView';
import { FocusMode } from './FocusMode';
import {
  glassCard,
  sectionTransitions,
  itemAnimations,
  microInteractions,
  orchestratedEntrance,
  cn,
  typographyPresets,
  magazineLayouts,
} from '@/lib/design-system';
import type { BlueprintJSON } from '../types';
import type { AnyBlueprint } from '@/lib/ollama/schema';
import type { ViewMode, LayoutMode } from './BlueprintViewer';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface ViewerContentProps {
  blueprintData: BlueprintJSON | AnyBlueprint;
  markdown: string;
  sections: Section[];
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  showAnnotations: boolean;
  pinnedSections: string[];
  onTogglePin: (sectionId: string) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  onExitPresentation?: () => void;
  isPublicView?: boolean;
}

export function ViewerContent({
  blueprintData,
  markdown,
  sections,
  viewMode,
  layoutMode,
  showAnnotations,
  pinnedSections,
  onTogglePin,
  onViewModeChange,
  onExitPresentation,
  isPublicView = false,
}: ViewerContentProps): React.JSX.Element {
  const [copiedSection, setCopiedSection] = React.useState<string | null>(null);
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
  
  // Determine content padding - Increased for breathing room
  const contentPadding = layoutMode === 'compact' 
    ? 'p-8' 
    : layoutMode === 'spacious' 
      ? 'p-16' 
      : 'p-12';
      
  // Copy section content
  const handleCopySection = async (sectionId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      // Silently fail if clipboard access is denied
      if (error instanceof Error) {
        // Copy failed
      }
    }
  };
  
  // Render content based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            {...sectionTransitions.morph}
            className="mx-auto max-w-7xl space-y-12"
          >
            <InteractiveBlueprintDashboard
              blueprint={blueprintData}
              isPublicView={isPublicView}
            />
          </motion.div>
        );
        
      case 'document':
        return (
          <motion.div
            key="document"
            {...sectionTransitions.slideUp}
            className={cn(
              'mx-auto',
              layoutMode === 'comfortable' ? 'max-w-4xl' : 'max-w-6xl',
            )}
          >
            <EnhancedMarkdownRenderer
              markdown={markdown}
              sections={sections}
              showAnnotations={showAnnotations}
              layoutMode={layoutMode}
            />
          </motion.div>
        );
        
      case 'presentation':
        return (
          <PresentationView
            blueprintData={blueprintData}
            onExit={() => {
              if (onExitPresentation) {
                onExitPresentation();
              } else if (onViewModeChange) {
                onViewModeChange('dashboard');
              }
            }}
          />
        );
        
      case 'focus':
        return (
          <FocusMode
            markdown={markdown}
            sections={sections}
            pinnedSections={pinnedSections}
          />
        );
        
      default:
        return null;
    }
  };
  
  // Magazine-style section renderer for document mode
  const renderMagazineSection = (section: Section, index: number) => {
    const isPinned = pinnedSections.includes(section.id);
    const isExpanded = expandedSection === section.id;
    
    return (
      <motion.section
        key={section.id}
        id={section.id}
        variants={itemAnimations.morphIn}
        className={cn(
          'group relative scroll-mt-32',
          index % 2 === 0 ? 'lg:pr-8' : 'lg:pl-8',
        )}
      >
        {/* Section Card - Cleaner styling */}
        <div className={cn(
          'relative overflow-hidden p-8 md:p-10 rounded-2xl',
          'bg-white/[0.02] backdrop-blur-[6px]',
          'border-0 shadow-sm',
          'transition-all duration-300',
          'hover:bg-white/[0.03] hover:shadow-md',
          isPinned && 'bg-primary/[0.03] ring-1 ring-primary/20',
        )}>
          {/* Section Header */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex-1">
              <h2 className={cn(
                typographyPresets.articleTitle,
                'mb-2 text-foreground',
              )}>
                {section.title}
              </h2>
              {section.type !== 'markdown' && (
                <span className={cn(
                  typographyPresets.labelText,
                  'inline-flex items-center gap-1.5 rounded-full',
                  'bg-primary/10 px-3 py-1 text-primary',
                )}>
                  {section.type}
                </span>
              )}
            </div>
            
            {/* Section Actions */}
            <div className={cn(
              'flex items-center gap-2 opacity-0 transition-opacity',
              'group-hover:opacity-100',
            )}>
              {/* Pin/Unpin */}
              <motion.button
                {...microInteractions.buttonPress}
                onClick={() => onTogglePin(section.id)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  isPinned
                    ? 'bg-primary/20 text-primary'
                    : 'bg-white/5 text-text-secondary hover:text-foreground',
                  'transition-all',
                )}
                title={isPinned ? 'Unpin section' : 'Pin section'}
              >
                {isPinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
              </motion.button>
              
              {/* Copy */}
              <motion.button
                {...microInteractions.buttonPress}
                onClick={() => handleCopySection(section.id, JSON.stringify(section.content))}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'bg-white/5 text-text-secondary hover:text-foreground',
                  'transition-all',
                )}
                title="Copy section"
              >
                {copiedSection === section.id ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </motion.button>
              
              {/* Expand */}
              <motion.button
                {...microInteractions.buttonPress}
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'bg-white/5 text-text-secondary hover:text-foreground',
                  'transition-all',
                )}
                title="Expand section"
              >
                <Maximize2 className="h-4 w-4" />
              </motion.button>
              
              {/* AI Enhance */}
              {!isPublicView && (
                <motion.button
                  {...microInteractions.buttonPress}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg',
                    'bg-primary/10 text-primary hover:bg-primary/20',
                    'transition-all',
                  )}
                  title="Enhance with AI"
                >
                  <Wand2 className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Section Content */}
          <div className={cn(
            'prose prose-invert max-w-none',
            isExpanded && 'prose-lg',
          )}>
            {/* Render section content based on type */}
            {section.type === 'markdown' ? (
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            ) : (
              <pre className="overflow-x-auto rounded-lg bg-white/5 p-4">
                <code>{JSON.stringify(section.content, null, 2)}</code>
              </pre>
            )}
          </div>
          
          {/* Annotations */}
          {showAnnotations && (
            <div className="mt-6 border-t border-white/10 pt-6">
              <button className={cn(
                'flex items-center gap-2 text-sm',
                'text-text-secondary hover:text-foreground',
                'transition-colors',
              )}>
                <MessageSquare className="h-4 w-4" />
                <span>Add annotation</span>
              </button>
            </div>
          )}
          
          {/* Magazine-style decoration */}
          {index === 0 && (
            <div className={cn(
              'absolute -left-4 top-8 h-32 w-1 bg-gradient-to-b',
              'from-primary via-primary/50 to-transparent',
            )} />
          )}
        </div>
      </motion.section>
    );
  };
  
  // Presentation mode takes full control - no wrapper
  if (viewMode === 'presentation') {
    return renderContent();
  }
  
  return (
    <div className={cn('relative min-h-screen', contentPadding)}>
      <AnimatePresence mode="wait">
        {viewMode === 'document' && layoutMode !== 'compact' ? (
          // Magazine-style layout for document mode
          <motion.div
            key="magazine"
            variants={orchestratedEntrance}
            className={cn(
              'mx-auto',
              layoutMode === 'spacious' ? 'max-w-7xl' : 'max-w-5xl',
              'space-y-12',
            )}
          >
            {/* Hero Section */}
            <motion.div
              variants={itemAnimations.morphIn}
              className={cn(
                glassCard.premium,
                'relative overflow-hidden p-12 text-center',
              )}
            >
              <h1 className={cn(
                typographyPresets.heroTitle,
                'mb-4 text-transparent bg-clip-text',
                'bg-gradient-to-r from-primary via-foreground to-secondary',
              )}>
                {blueprintData.metadata?.title || 'Blueprint'}
              </h1>
              <p className={cn(
                typographyPresets.heroSubtitle,
                'mx-auto max-w-3xl text-text-secondary',
              )}>
                {blueprintData.metadata?.organization || 'Organization'} • {blueprintData.metadata?.role || 'Role'}
              </p>
            </motion.div>
            
            {/* Magazine Grid */}
            <div className={cn(
              layoutMode === 'spacious' 
                ? magazineLayouts.columns.two 
                : 'space-y-12',
            )}>
              {sections.map((section, index) => renderMagazineSection(section, index))}
            </div>
          </motion.div>
        ) : (
          // Standard content rendering
          renderContent()
        )}
      </AnimatePresence>
    </div>
  );
}
