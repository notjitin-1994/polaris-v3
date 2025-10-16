/**
 * Enhanced Blueprint Viewer - Main Orchestrator
 * Premium user experience with world-class aesthetics
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useScroll } from 'framer-motion';
import { ViewerHeaderSimplified } from './ViewerHeaderSimplified';
import { ViewerContent } from './ViewerContent';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useBlueprintStore } from '@/store/blueprintStore';
import { useBlueprintSidebar } from '@/contexts/BlueprintSidebarContext';
import type { BlueprintJSON } from '../types';
import type { AnyBlueprint } from '@/lib/ollama/schema';
import {
  orchestratedEntrance,
  cn,
} from '@/lib/design-system';

interface BlueprintViewerProps {
  blueprintId: string;
  blueprintData: BlueprintJSON | AnyBlueprint;
  markdown: string;
  isPublicView?: boolean;
  userId?: string;
  /**
   * Optional: force the initial view mode on mount (e.g., 'presentation').
   * When provided, saved preferences will be ignored to avoid overriding.
   */
  initialViewMode?: ViewMode;
  /**
   * Optional: if true, do not load saved preferences from localStorage.
   * Useful to ensure direct transitions (like Present) do not flash other views.
   */
  ignoreSavedPrefs?: boolean;
  /**
   * Optional: callback when exiting presentation mode (e.g., back button clicked).
   * If provided, this will be called instead of the internal mode change.
   */
  onExitPresentation?: () => void;
}

export type ViewMode = 'dashboard' | 'document' | 'presentation' | 'focus';
export type LayoutMode = 'comfortable' | 'compact' | 'spacious';

export interface ViewerState {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  showSidebar: boolean;
  showMinimap: boolean;
  showAnnotations: boolean;
  searchQuery: string;
  activeSection: string | null;
  pinnedSections: string[];
  hiddenSections: string[];
  customReports: CustomReport[];
  readingProgress: number;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  sections: string[];
  layout: 'dashboard' | 'document' | 'presentation';
  theme: ReportTheme;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTheme {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  spacing: 'tight' | 'normal' | 'relaxed';
}

export function BlueprintViewer({
  blueprintId,
  blueprintData,
  markdown,
  isPublicView = false,
  userId,
  initialViewMode,
  ignoreSavedPrefs,
  onExitPresentation,
}: BlueprintViewerProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  
  // State management with Zustand
  const {
    viewMode,
    layoutMode,
    showSidebar,
    showMinimap,
    showAnnotations,
    searchQuery,
    activeSection,
    pinnedSections,
    hiddenSections,
    customReports,
    annotations,
    setViewMode,
    setLayoutMode,
    toggleSidebar,
    toggleMinimap,
    toggleAnnotations,
    setSearchQuery,
    setActiveSection,
    togglePinSection,
    toggleHideSection,
    addCustomReport,
    updateCustomReport,
    deleteCustomReport,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  } = useBlueprintStore();
  
  // Command palette state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  
  // Blueprint sidebar context
  const { setActiveBlueprintPage } = useBlueprintSidebar();
  
  // Extract sections from blueprint data
  const sections = useMemo(() => {
    const allSections = [];
    
    // Define proper order for blueprint sections
    const sectionOrder = [
      'executive_summary',
      'learning_objectives',
      'target_audience',
      'instructional_strategy',
      'content_outline',
      'resources',
      'assessment_strategy',
      'implementation_timeline',
      'risk_mitigation',
      'success_metrics',
      'sustainability_plan',
    ];
    
    // Extract from BlueprintJSON format in proper order
    if ('metadata' in blueprintData) {
      // First, add sections in the defined order
      sectionOrder.forEach(key => {
        if (key in blueprintData && typeof blueprintData[key] === 'object') {
          allSections.push({
            id: key,
            title: formatSectionTitle(key),
            type: blueprintData[key].displayType || 'markdown',
            content: blueprintData[key],
          });
        }
      });
      
      // Then add any additional sections not in the predefined order
      Object.entries(blueprintData).forEach(([key, value]) => {
        if (
          key !== 'metadata' && 
          !sectionOrder.includes(key) && 
          typeof value === 'object'
        ) {
          allSections.push({
            id: key,
            title: formatSectionTitle(key),
            type: value.displayType || 'markdown',
            content: value,
          });
        }
      });
    } else {
      // For non-BlueprintJSON formats, extract from markdown headers
      const headerRegex = /^(#{1,3})\s+(.+)$/gm;
      const matches = Array.from(markdown.matchAll(headerRegex));
      matches.forEach((match, index) => {
        const level = match[1].length;
        if (level <= 2) {
          allSections.push({
            id: `markdown-section-${index}`,
            title: match[2].trim(),
            type: 'markdown',
            content: null,
          });
        }
      });
    }
    
    return allSections;
  }, [blueprintData, markdown]);
  
  // Filter visible sections
  const visibleSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = !searchQuery || 
        section.title.toLowerCase().includes(searchQuery.toLowerCase());
      const notHidden = !hiddenSections.includes(section.id);
      return matchesSearch && notHidden;
    });
  }, [sections, searchQuery, hiddenSections]);
  
  // Handler to exit presentation mode - call parent callback if provided, otherwise return to dashboard
  const exitPresentationMode = useCallback(() => {
    if (onExitPresentation) {
      // Let parent handle the exit (e.g., unmount BlueprintViewer and show Analytics/Content page)
      onExitPresentation();
    } else if (viewMode === 'presentation') {
      // Internal fallback: return to dashboard (analytics view)
      setViewMode('dashboard');
    }
  }, [viewMode, setViewMode, onExitPresentation]);
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+k': () => setShowCommandPalette(true),
    'cmd+/': () => setShowCommandPalette(true),
    'cmd+b': () => toggleSidebar(),
    'cmd+m': () => toggleMinimap(),
    'cmd+f': () => {
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    },
    'escape': () => {
      if (viewMode === 'presentation') {
        exitPresentationMode();
      } else if (showCommandPalette) {
        setShowCommandPalette(false);
      } else {
        setSearchQuery('');
      }
    },
    // View mode shortcuts
    '1': () => setViewMode('dashboard'),
    '2': () => setViewMode('document'),
    '3': () => setViewMode('presentation'),
    '4': () => setViewMode('focus'),
  });
  
  // Handle section navigation
  const navigateToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [setActiveSection]);
  
  // Track reading progress
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      // Update reading progress in store
      useBlueprintStore.setState({ readingProgress: Math.min(progress, 100) });
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Register blueprint sidebar data with context
  useEffect(() => {
    setActiveBlueprintPage(true, {
      blueprintId,
      sections,
      pinnedSections,
      hiddenSections,
      activeSection,
      customReports,
      annotations,
      isPublicView,
      onNavigate: navigateToSection,
      onTogglePin: togglePinSection,
      onToggleHide: toggleHideSection,
      onCreateReport: addCustomReport,
      onUpdateReport: updateCustomReport,
      onDeleteReport: deleteCustomReport,
      onAddAnnotation: addAnnotation,
      onUpdateAnnotation: updateAnnotation,
      onDeleteAnnotation: deleteAnnotation,
    });
    
    return () => {
      setActiveBlueprintPage(false);
    };
  }, [
    blueprintId,
    sections,
    pinnedSections,
    hiddenSections,
    activeSection,
    customReports,
    annotations,
    isPublicView,
    setActiveBlueprintPage,
    togglePinSection,
    toggleHideSection,
    addCustomReport,
    updateCustomReport,
    deleteCustomReport,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
  ]);
  
  // Save preferences to localStorage
  useEffect(() => {
    if (!blueprintId || isPublicView) return;
    
    const preferences = {
      viewMode,
      layoutMode,
      showSidebar,
      showMinimap,
      showAnnotations,
      pinnedSections,
      hiddenSections,
    };
    
    localStorage.setItem(`blueprint-prefs-${blueprintId}`, JSON.stringify(preferences));
  }, [
    blueprintId,
    viewMode,
    layoutMode,
    showSidebar,
    showMinimap,
    showAnnotations,
    pinnedSections,
    hiddenSections,
    isPublicView,
  ]);
  
  // Load preferences from localStorage
  useEffect(() => {
    if (!blueprintId || isPublicView || ignoreSavedPrefs) return;
    
    const savedPrefs = localStorage.getItem(`blueprint-prefs-${blueprintId}`);
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        useBlueprintStore.setState(prefs);
      } catch (error) {
        // Silently fail for corrupted preferences, use defaults
        if (error instanceof Error) {
          // Preferences reset due to error
        }
      }
    }
  }, [blueprintId, isPublicView, ignoreSavedPrefs]);

  // Apply an explicit initial view mode if provided (before first paint to avoid dashboard flash)
  useLayoutEffect(() => {
    if (!initialViewMode) return;
    setViewMode(initialViewMode);
  }, [initialViewMode, setViewMode]);
  
  // Export handler
  const handleExport = useCallback(async (format: 'pdf' | 'word' | 'ppt') => {
    // Export implementation - placeholder for now
    console.log(`Exporting as ${format}`);
  }, []);
  
  // Share handler
  const handleShare = useCallback(async () => {
    try {
      const response = await fetch('/api/blueprints/share/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprintId }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.shareUrl) {
          await navigator.clipboard.writeText(result.shareUrl);
        }
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [blueprintId]);
  
  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen bg-background"
      initial="hidden"
      animate="visible"
      variants={orchestratedEntrance}
    >
      {/* Ambient background effects - Softer gradients */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.015] via-transparent to-secondary/[0.015]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(167,218,219,0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(230,184,156,0.03),transparent_50%)]" />
      </div>
      
      {/* Simplified Header - Hidden in presentation mode */}
      {viewMode !== 'presentation' && (
        <div className="sticky top-0 z-50">
          <ViewerHeaderSimplified
            blueprintId={blueprintId}
            blueprintTitle={blueprintData.metadata?.title || 'Blueprint'}
            isPublicView={isPublicView}
            onCommandPalette={() => setShowCommandPalette(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onExport={handleExport}
            onShare={handleShare}
          />
        </div>
      )}
      
      {/* Main content area - Blueprint tools now in global sidebar */}
      <main className="relative flex flex-1">
        <div className={cn(
          'flex-1 transition-all duration-300',
        )}>
          {/* Content renderer */}
          <ViewerContent
            blueprintData={blueprintData}
            markdown={markdown}
            sections={visibleSections}
            viewMode={viewMode}
            layoutMode={layoutMode}
            showAnnotations={showAnnotations}
            pinnedSections={pinnedSections}
            onTogglePin={togglePinSection}
            onViewModeChange={setViewMode}
            onExitPresentation={exitPresentationMode}
            isPublicView={isPublicView}
          />
        </div>
      </main>
      
      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        sections={sections}
        onNavigate={navigateToSection}
        onViewModeChange={setViewMode}
        onToggleSidebar={toggleSidebar}
        onToggleMinimap={toggleMinimap}
        onToggleAnnotations={toggleAnnotations}
      />
      
      {/* Reading progress bar */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 h-1 bg-white/10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollYProgress }}
        style={{ transformOrigin: 'left' }}
      >
        <div className="h-full bg-gradient-to-r from-primary to-secondary" />
      </motion.div>
    </motion.div>
  );
}

// Utility function to format section titles
function formatSectionTitle(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
