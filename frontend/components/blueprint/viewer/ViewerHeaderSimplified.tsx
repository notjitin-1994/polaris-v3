/**
 * Simplified Viewer Header Component
 * Clean, minimal header with 5 essential controls
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Presentation } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ViewModeDropdown } from './ViewModeDropdown';
import { ActionsMenu } from './ActionsMenu';
import {
  glassPanel,
  itemAnimations,
  microInteractions,
  cn,
} from '@/lib/design-system';
import type { ViewMode } from '@/store/blueprintStore';

interface ViewerHeaderSimplifiedProps {
  blueprintId: string;
  blueprintTitle: string;
  isPublicView?: boolean;
  onCommandPalette: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onExport?: (format: 'pdf' | 'word' | 'ppt') => void;
  onShare?: () => void;
}

export function ViewerHeaderSimplified({
  blueprintId,
  blueprintTitle,
  isPublicView = false,
  onCommandPalette,
  viewMode,
  onViewModeChange,
  onExport,
  onShare,
}: ViewerHeaderSimplifiedProps): React.JSX.Element {
  const router = useRouter();

  return (
    <motion.header
      variants={itemAnimations.fadeInScale}
      className={cn(
        glassPanel.header,
        'relative z-50 border-b border-white/10',
      )}
    >
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Back button */}
            {!isPublicView && (
              <motion.button
                {...microInteractions.buttonPress}
                onClick={() => router.back()}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0',
                  'text-text-secondary hover:text-foreground',
                  'hover:bg-white/10 transition-all duration-200',
                )}
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            )}

            {/* Title */}
            <div className="min-w-0">
              <h1 className={cn(
                'text-lg font-semibold text-foreground truncate',
              )}>
                {blueprintTitle}
              </h1>
            </div>
          </div>

          {/* Right: Present Button + View Mode + Search + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Present Button - Prominent CTA */}
            {viewMode !== 'presentation' && (
              <motion.button
                {...microInteractions.buttonPress}
                onClick={() => onViewModeChange('presentation')}
                className={cn(
                  'flex h-10 items-center gap-2 rounded-xl px-4',
                  'bg-primary/20 text-primary',
                  'border border-primary/30',
                  'hover:bg-primary/30 hover:border-primary/40',
                  'transition-all duration-200',
                  'shadow-lg shadow-primary/10',
                )}
                aria-label="Start presentation"
              >
                <Presentation className="h-4 w-4" />
                <span className="text-sm font-semibold">Present</span>
              </motion.button>
            )}

            {/* View Mode Dropdown - Hidden in presentation mode */}
            {viewMode !== 'presentation' && (
              <ViewModeDropdown
                value={viewMode}
                onChange={onViewModeChange}
              />
            )}

            {/* Search / Command Palette */}
            <motion.button
              {...microInteractions.buttonPress}
              onClick={onCommandPalette}
              className={cn(
                'flex h-10 items-center gap-2 rounded-xl px-3 sm:px-4',
                'bg-white/5 text-text-secondary hover:text-foreground',
                'border border-white/10 hover:border-white/20',
                'hover:bg-white/10 transition-all duration-200',
              )}
              aria-label="Open search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Search</span>
              <kbd className={cn(
                'hidden lg:inline-flex h-5 items-center gap-0.5 px-1.5',
                'text-xs text-text-disabled',
                'bg-white/5 rounded border border-white/10',
              )}>
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </motion.button>

            {/* Actions Menu */}
            <ActionsMenu
              blueprintId={blueprintId}
              blueprintTitle={blueprintTitle}
              onExport={onExport}
              onShare={onShare}
            />
          </div>
        </div>
      </div>
    </motion.header>
  );
}

