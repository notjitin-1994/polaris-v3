/**
 * Enhanced Blueprint Viewer Header
 * Smart search, AI tools, and view controls
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  Search,
  Download,
  Share2,
  Settings,
  Sparkles,
  LayoutGrid,
  FileText,
  Presentation,
  Focus,
  ArrowLeft,
  MoreVertical,
  Wand2,
  Brain,
  Bot,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  glassPanel,
  glassCard,
  itemAnimations,
  microInteractions,
  cn,
  typographyPresets,
  elevation,
} from '@/lib/design-system';
import type { ViewMode } from './BlueprintViewer';

interface ViewerHeaderProps {
  blueprintId: string;
  blueprintTitle: string;
  isPublicView?: boolean;
  onCommandPalette: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewerHeader({
  blueprintId,
  blueprintTitle,
  isPublicView = false,
  onCommandPalette,
  viewMode,
  onViewModeChange,
}: ViewerHeaderProps): React.JSX.Element {
  const router = useRouter();
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowAiMenu(false);
      setShowMoreMenu(false);
    };
    
    if (showAiMenu || showMoreMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAiMenu, showMoreMenu]);
  
  const viewModes = [
    { id: 'dashboard' as ViewMode, label: 'Analytics', icon: LayoutGrid },
    { id: 'document' as ViewMode, label: 'Document', icon: FileText },
    { id: 'presentation' as ViewMode, label: 'Present', icon: Presentation },
    { id: 'focus' as ViewMode, label: 'Focus', icon: Focus },
  ];
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Export implementation will be added in export-system phase
      const response = await fetch(`/api/blueprints/${blueprintId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${blueprintTitle}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Export API not yet implemented, silently fail
      if (error instanceof Error) {
        // Export feature pending
      }
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Share implementation
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
      // Share may fail if API endpoint doesn't exist yet
      if (error instanceof Error) {
        // Share feature pending
      }
    } finally {
      setIsSharing(false);
    }
  };
  
  return (
    <motion.header
      variants={itemAnimations.fadeInScale}
      className={cn(
        glassPanel.header,
        'relative z-50 border-b border-white/10',
      )}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Back button */}
            {!isPublicView && (
              <motion.button
                {...microInteractions.buttonHover}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  'text-text-secondary hover:text-foreground',
                  'hover:bg-white/5 transition-colors',
                )}
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            )}
            
            {/* Title */}
            <div className="flex flex-col">
              <h1 className={cn(typographyPresets.labelText, 'text-text-secondary')}>
                Blueprint
              </h1>
              <h2 className={cn('text-lg font-semibold text-foreground line-clamp-1')}>
                {blueprintTitle}
              </h2>
            </div>
          </div>
          
          {/* Center section - View mode switcher */}
          <div className={cn(
            glassCard.base,
            'hidden lg:flex items-center p-1 gap-1',
          )}>
            {viewModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = viewMode === mode.id;
              
              return (
                <motion.button
                  key={mode.id}
                  {...microInteractions.buttonPress}
                  onClick={() => onViewModeChange(mode.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-4 py-2 rounded-lg',
                    'text-sm font-medium transition-all duration-200',
                    isActive ? [
                      'text-primary-foreground',
                      'bg-primary/90',
                      elevation.sm,
                    ] : [
                      'text-text-secondary hover:text-foreground',
                      'hover:bg-white/5',
                    ],
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeViewMode"
                      className="absolute inset-0 bg-primary rounded-lg"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4" />
                  <span className="relative hidden sm:inline">{mode.label}</span>
                </motion.button>
              );
            })}
          </div>
          
          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <motion.button
              {...microInteractions.buttonHover}
              whileTap={{ scale: 0.95 }}
              onClick={onCommandPalette}
              className={cn(
                glassCard.base,
                'flex h-10 items-center gap-2 px-4',
                'text-text-secondary hover:text-foreground',
                'hover:bg-white/5 transition-all',
              )}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Search</span>
              <kbd className={cn(
                'hidden sm:inline-flex h-5 items-center gap-1 px-1.5',
                'text-xs font-medium text-text-secondary',
                'bg-white/5 rounded border border-white/10',
              )}>
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </motion.button>
            
            {/* AI Tools */}
            {!isPublicView && (
              <div className="relative">
                <motion.button
                  {...microInteractions.buttonHover}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAiMenu(!showAiMenu);
                  }}
                  className={cn(
                    glassCard.base,
                    glassCard.hover,
                    'flex h-10 items-center gap-2 px-4',
                    'text-primary hover:text-primary-light',
                    'border-primary/20',
                  )}
                >
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline text-sm font-medium">AI Tools</span>
                </motion.button>
                
                {/* AI Menu Dropdown */}
                <AnimatePresence>
                  {showAiMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        glassCard.premium,
                        elevation.xl,
                        'absolute right-0 top-full mt-2 w-56 p-2',
                      )}
                    >
                      <button
                        onClick={() => setShowAiMenu(false)}
                        className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                      'text-sm text-text-secondary hover:text-foreground',
                      'hover:bg-white/5 transition-colors',
                    )}>
                      <Wand2 className="h-4 w-4" />
                      <span>Generate Summary</span>
                    </button>
                    <button className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                      'text-sm text-text-secondary hover:text-foreground',
                      'hover:bg-white/5 transition-colors',
                    )}>
                      <Brain className="h-4 w-4" />
                      <span>Extract Insights</span>
                    </button>
                      <button
                        onClick={() => setShowAiMenu(false)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                          'text-sm text-text-secondary hover:text-foreground',
                          'hover:bg-white/5 transition-colors',
                        )}
                      >
                        <Bot className="h-4 w-4" />
                        <span>Ask AI Assistant</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Export */}
            <motion.button
              {...microInteractions.buttonPress}
              onClick={handleExport}
              disabled={isExporting}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                'text-text-secondary hover:text-foreground',
                'hover:bg-white/5 transition-colors',
                'disabled:opacity-50',
              )}
            >
              {isExporting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Download className="h-5 w-5" />
                </motion.div>
              ) : (
                <Download className="h-5 w-5" />
              )}
            </motion.button>
            
            {/* Share */}
            <motion.button
              {...microInteractions.buttonPress}
              onClick={handleShare}
              disabled={isSharing}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl',
                'text-text-secondary hover:text-foreground',
                'hover:bg-white/5 transition-colors',
                'disabled:opacity-50',
              )}
            >
              {isSharing ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <Share2 className="h-5 w-5" />
                </motion.div>
              ) : (
                <Share2 className="h-5 w-5" />
              )}
            </motion.button>
            
            {/* More options */}
            <div className="relative">
              <motion.button
                {...microInteractions.buttonPress}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreMenu(!showMoreMenu);
                }}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  'text-text-secondary hover:text-foreground',
                  'hover:bg-white/5 transition-colors',
                )}
              >
                <MoreVertical className="h-5 w-5" />
              </motion.button>
              
              {/* More Menu */}
              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      glassCard.premium,
                      elevation.xl,
                      'absolute right-0 top-full mt-2 w-48 p-2',
                    )}
                  >
                    <button
                      onClick={() => setShowMoreMenu(false)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                        'text-sm text-text-secondary hover:text-foreground',
                        'hover:bg-white/5 transition-colors',
                      )}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* View mode switcher for mobile */}
      <div className="border-t border-white/5 px-4 py-2 lg:hidden">
        <div className="flex items-center gap-2 overflow-x-auto">
          {viewModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            
            return (
              <motion.button
                key={mode.id}
                {...microInteractions.buttonPress}
                onClick={() => onViewModeChange(mode.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5',
                  'text-xs font-medium transition-all',
                  isActive ? [
                    'bg-primary/20 text-primary',
                    'border border-primary/30',
                  ] : [
                    'text-text-secondary',
                    'border border-transparent',
                  ],
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{mode.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.header>
  );
}
