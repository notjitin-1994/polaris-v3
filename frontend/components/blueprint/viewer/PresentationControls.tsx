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
      className="glass-panel fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 backdrop-blur-xl"
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
                  ? 'text-text-disabled cursor-not-allowed border-white/5 bg-white/5'
                  : 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary border-white/10 bg-white/5 text-white'
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <div className="hidden items-center gap-2 px-4 sm:flex">
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
                  ? 'text-text-disabled cursor-not-allowed border-white/5 bg-white/5'
                  : 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary border-white/10 bg-white/5 text-white'
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Center: Slide counter (mobile) and Timer */}
          <div className="flex items-center gap-4">
            {/* Mobile slide counter */}
            <div className="flex items-center gap-2 sm:hidden">
              <span className="text-xl font-bold text-white">{currentSlide + 1}</span>
              <span className="text-text-secondary text-xs">/</span>
              <span className="text-text-secondary text-sm">{totalSlides}</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Clock className="text-primary h-4 w-4" />
              <span className="font-mono text-sm text-white">{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Right: Tools */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleNotes}
              className={cn(
                'touch-target hidden h-10 items-center gap-2 rounded-lg border px-3 transition-all sm:flex',
                showNotes
                  ? 'border-primary/50 bg-primary/20 text-primary'
                  : 'hover:border-primary/50 hover:bg-primary/10 hover:text-primary border-white/10 bg-white/5 text-white'
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
              className="touch-target hover:border-primary/50 hover:bg-primary/10 hover:text-primary flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-white transition-all sm:w-auto sm:gap-2"
              aria-label="Show slide overview"
              title="Slide overview (G)"
            >
              <Grid className="h-4 w-4" />
              <span className="hidden text-sm font-medium sm:inline">Grid</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFullscreen}
              className="touch-target hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
