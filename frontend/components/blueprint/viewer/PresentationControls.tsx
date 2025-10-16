/**
 * Presentation Controls
 * Bottom control bar with navigation, timer, and presenter tools
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  MonitorPlay,
  Grid,
  Maximize2,
  Minimize2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/design-system';

interface PresentationControlsProps {
  currentSlide: number;
  totalSlides: number;
  elapsedTime: number;
  showNotes: boolean;
  isFullscreen: boolean;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onToggleNotes: () => void;
  onToggleGrid: () => void;
  onToggleFullscreen: () => void;
}

export function PresentationControls({
  currentSlide,
  totalSlides,
  elapsedTime,
  showNotes,
  isFullscreen,
  onPrevSlide,
  onNextSlide,
  onToggleNotes,
  onToggleGrid,
  onToggleFullscreen,
}: PresentationControlsProps): React.JSX.Element {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === totalSlides - 1;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="glass-panel fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrevSlide}
              disabled={isFirstSlide}
              className={cn(
                'touch-target flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                isFirstSlide
                  ? 'cursor-not-allowed border-white/5 bg-white/5 text-text-disabled'
                  : 'border-white/10 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <div className="hidden sm:flex items-center gap-2 px-4">
              <span className="text-2xl font-bold text-white">{currentSlide + 1}</span>
              <span className="text-text-secondary text-sm">/</span>
              <span className="text-text-secondary text-lg">{totalSlides}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextSlide}
              disabled={isLastSlide}
              className={cn(
                'touch-target flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                isLastSlide
                  ? 'cursor-not-allowed border-white/5 bg-white/5 text-text-disabled'
                  : 'border-white/10 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Center: Slide counter (mobile) and Timer */}
          <div className="flex items-center gap-4">
            {/* Mobile slide counter */}
            <div className="flex sm:hidden items-center gap-2">
              <span className="text-xl font-bold text-white">{currentSlide + 1}</span>
              <span className="text-text-secondary text-xs">/</span>
              <span className="text-text-secondary text-sm">{totalSlides}</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-mono text-white">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Right: Tools */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleNotes}
              className={cn(
                'touch-target hidden sm:flex h-10 items-center gap-2 rounded-lg border px-3 transition-all',
                showNotes
                  ? 'border-primary/50 bg-primary/20 text-primary'
                  : 'border-white/10 bg-white/5 text-white hover:border-primary/50 hover:bg-primary/10 hover:text-primary'
              )}
              aria-label="Toggle presenter view"
              title="Toggle presenter view (N)"
            >
              <MonitorPlay className="h-4 w-4" />
              <span className="text-sm font-medium">Presenter View</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleGrid}
              className="touch-target flex h-10 w-10 sm:w-auto items-center justify-center sm:gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
              aria-label="Show slide overview"
              title="Slide overview (G)"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">Grid</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFullscreen}
              className="touch-target flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

