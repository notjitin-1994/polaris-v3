'use client';

import React, { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, BarChart3, Layers, Eye, Sparkles, Loader2 } from 'lucide-react';
import { BlueprintRenderer } from './BlueprintRenderer';
import type { BlueprintJSON } from './types';
import type { AnyBlueprint } from '@/lib/ollama/schema';

// Lazy load ComprehensiveBlueprintViewer for better performance
const ComprehensiveBlueprintViewer = lazy(() =>
  import('./ComprehensiveBlueprintViewer').then((module) => ({
    default: module.ComprehensiveBlueprintViewer,
  }))
);

interface TabbedBlueprintViewerProps {
  blueprint: BlueprintJSON | AnyBlueprint;
  markdown: string;
  isEditMode?: boolean;
  onSaveMarkdown?: (newMarkdown: string) => Promise<void>;
  onCancelEdit?: () => void;
}

type TabType = 'content' | 'comprehensive';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ElementType;
  description: string;
}

export function TabbedBlueprintViewer({
  blueprint,
  markdown,
  isEditMode = false,
  onSaveMarkdown,
  onCancelEdit,
}: TabbedBlueprintViewerProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('comprehensive');

  // Auto-switch to content tab when edit mode is enabled
  React.useEffect(() => {
    if (isEditMode) {
      setActiveTab('content');
    }
  }, [isEditMode]);

  // Define tabs configuration
  const tabs: TabConfig[] = useMemo(
    () => [
      {
        id: 'comprehensive',
        label: 'Overview',
        icon: Layers,
        description: 'Interactive dashboard with metrics and visualizations',
      },
      {
        id: 'content',
        label: 'Content',
        icon: FileText,
        description: 'Detailed blueprint content with navigation',
      },
    ],
    []
  );

  // Normalize blueprint for ComprehensiveBlueprintViewer with memoization
  const normalizedBlueprint = useMemo(() => {
    // Check if it's already in the right format
    if (
      blueprint &&
      typeof blueprint === 'object' &&
      ('learning_objectives' in blueprint || 'executive_summary' in blueprint)
    ) {
      return blueprint as BlueprintJSON;
    }

    // For other blueprint formats, return as-is for BlueprintRenderer to handle
    return blueprint as AnyBlueprint;
  }, [blueprint]);

  // Memoize tab content to prevent unnecessary re-renders
  const comprehensiveTabContent = useMemo(
    () => (
      <Suspense
        fallback={
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
              <p className="text-text-secondary">Loading overview...</p>
            </div>
          </div>
        }
      >
        <ComprehensiveBlueprintViewer blueprint={normalizedBlueprint as BlueprintJSON} />
      </Suspense>
    ),
    [normalizedBlueprint]
  );

  const contentTabContent = useMemo(
    () => (
      <BlueprintRenderer
        markdown={markdown}
        blueprint={blueprint as AnyBlueprint}
        isEditMode={isEditMode}
        onSaveMarkdown={onSaveMarkdown}
        onCancelEdit={onCancelEdit}
      />
    ),
    [markdown, blueprint, isEditMode, onSaveMarkdown, onCancelEdit]
  );

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Tabbed Navigation */}
      <div className="sticky top-0 z-30 backdrop-blur-xl">
        <div className="relative">
          {/* Tab Background Glow */}
          <div className="bg-primary/10 absolute inset-0 rounded-2xl blur-xl" />

          <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => !isEditMode && setActiveTab(tab.id)}
                  disabled={isEditMode && tab.id !== 'content'}
                  className={`group relative flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-lg'
                      : isEditMode
                        ? 'text-text-secondary/50 cursor-not-allowed'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                  title={tab.description}
                >
                  {/* Animated background for active tab */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="border-primary/50 bg-primary/30 absolute inset-0 rounded-xl border"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Tab content */}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon
                      className={`h-5 w-5 transition-all duration-300 ${
                        isActive
                          ? 'text-primary drop-shadow-glow'
                          : isEditMode
                            ? ''
                            : 'group-hover:text-primary'
                      }`}
                    />
                    <span
                      className={`font-heading text-sm font-semibold ${isActive ? 'text-white' : ''}`}
                    >
                      {tab.label}
                    </span>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center"
                    >
                      <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                      <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Description */}
        <motion.div
          key={`tab-desc-${activeTab}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          <p className="text-text-secondary text-sm">
            {tabs.find((tab) => tab.id === activeTab)?.description}
          </p>
        </motion.div>
      </div>

      {/* Tab Content with Enhanced Animations and Performance Optimization */}
      <AnimatePresence mode="wait">
        {activeTab === 'comprehensive' ? (
          <motion.div
            key="comprehensive"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="min-h-[500px]"
          >
            {comprehensiveTabContent}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="min-h-[500px]"
          >
            {contentTabContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Footer with Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="border-t border-white/10 pt-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-lg p-2">
              <Sparkles className="text-primary h-4 w-4" />
            </div>
            <div>
              <p className="text-text-secondary text-sm">Interactive Blueprint Viewer</p>
              <p className="text-text-disabled text-xs">
                Seamlessly switch between different views
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
              {activeTab === 'comprehensive' ? 'Dashboard View' : 'Content View'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
