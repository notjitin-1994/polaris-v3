/**
 * Slide Grid Overview
 * Full-screen modal with thumbnail navigation
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ArrowLeft, Grid as GridIcon } from 'lucide-react';
import { glassPanel, microInteractions, cn } from '@/lib/design-system';
import { SlidePreview } from './SlidePreview';

interface ColorTheme {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
  glow: string;
}

interface Slide {
  id: string;
  title: string;
  content: React.ReactNode;
  notes: string;
  icon: any;
  colorTheme: ColorTheme;
}

interface SlideGridOverviewProps {
  isOpen: boolean;
  slides: Slide[];
  currentSlide: number;
  onSelectSlide: (index: number) => void;
  onClose: () => void;
}

export function SlideGridOverview({
  isOpen,
  slides,
  currentSlide,
  onSelectSlide,
  onClose,
}: SlideGridOverviewProps): React.JSX.Element {
  // Calculate layout to fit all slides in viewport
  const totalSlides = slides.length;
  const columns = 3; // 3 columns on desktop
  const fullRows = Math.floor(totalSlides / columns);
  const remainingSlides = totalSlides % columns;
  const shouldExpandLastRow = remainingSlides > 0 && remainingSlides < columns;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-background/95 fixed inset-0 z-50 flex flex-col backdrop-blur-xl"
          onClick={onClose}
        >
          {/* Brand-Compliant Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(glassPanel.header, 'relative z-50 border-b border-white/10')}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-14 items-center justify-between gap-4">
                {/* Left: Back + Title */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* Back button */}
                  <motion.button
                    {...microInteractions.buttonPress}
                    onClick={onClose}
                    className={cn(
                      'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                      'text-text-secondary hover:text-foreground',
                      'transition-all duration-200 hover:bg-white/10'
                    )}
                    aria-label="Close grid overview"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.button>

                  {/* Title with accent */}
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="from-primary to-primary/50 hidden h-6 w-0.5 rounded-full bg-gradient-to-b sm:flex" />
                    {/* Grid Icon */}
                    <div className="flex-shrink-0">
                      <GridIcon className="text-primary/80 h-5 w-5" />
                    </div>
                    <h1
                      className="text-primary truncate text-lg font-bold"
                      style={{
                        textShadow: '0 0 20px rgba(167, 218, 219, 0.3)',
                      }}
                    >
                      All Slides
                    </h1>
                  </div>
                </div>

                {/* Right: Slide count */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="text-text-secondary text-sm font-medium">
                    <span className="text-foreground font-semibold">{slides.length}</span>
                    <span className="mx-1">slides</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* Grid - Fits all slides in viewport */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex w-full flex-1 items-center justify-center overflow-y-auto px-12 py-12"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto w-full max-w-6xl">
              {/* 6-column grid system for perfect last-row distribution */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 sm:gap-6 lg:grid-cols-6 lg:gap-8">
                {slides.map((slide, index) => {
                  // Determine if this is in the last row
                  const isLastRow = index >= fullRows * columns;
                  const lastRowIndex = index - fullRows * columns;

                  // Smart column spanning for aesthetic distribution
                  let gridColumnClass = 'sm:col-span-2 lg:col-span-2'; // Default: each card takes 2 columns (3 per row)

                  if (shouldExpandLastRow && isLastRow) {
                    if (remainingSlides === 1) {
                      // Single card - takes 4 columns, starts at column 2 (centered)
                      gridColumnClass = 'sm:col-span-4 lg:col-start-2 lg:col-span-4';
                    } else if (remainingSlides === 2) {
                      // Two cards - each takes 3 columns (perfectly fills 6-column grid)
                      gridColumnClass = 'sm:col-span-2 lg:col-span-3';
                    }
                  }

                  return (
                    <motion.button
                      key={slide.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectSlide(index)}
                      className={`glass-card group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${gridColumnClass}`}
                      style={{
                        borderColor:
                          index === currentSlide
                            ? slide.colorTheme.border
                            : 'rgba(255, 255, 255, 0.1)',
                        boxShadow:
                          index === currentSlide
                            ? `0 10px 40px -10px ${slide.colorTheme.glow}`
                            : undefined,
                      }}
                    >
                      {/* Decorative background with slide color */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10"
                        style={{ background: slide.colorTheme.bg }}
                      />

                      {/* Slide Number Badge */}
                      <div
                        className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor:
                            index === currentSlide
                              ? slide.colorTheme.primary
                              : 'rgba(255, 255, 255, 0.1)',
                          color: index === currentSlide ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Current Slide Indicator */}
                      {index === currentSlide && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 left-3"
                        >
                          <CheckCircle2
                            className="h-4 w-4"
                            style={{ color: slide.colorTheme.primary }}
                          />
                        </motion.div>
                      )}

                      {/* Slide Title */}
                      <div className="relative z-10 mt-7">
                        <div className="mb-1.5 flex items-center gap-1.5">
                          {/* Icon */}
                          {slide.icon && (
                            <div className="flex-shrink-0">
                              {React.createElement(slide.icon, {
                                className: 'h-4 w-4',
                                style: { color: slide.colorTheme.primary },
                              })}
                            </div>
                          )}
                          {/* Accent bar */}
                          <div
                            className="h-5 w-0.5 rounded-full"
                            style={{
                              background: `linear-gradient(to bottom, ${slide.colorTheme.primary}, ${slide.colorTheme.primary}80)`,
                            }}
                          />
                          <h3
                            className="text-base font-bold transition-colors"
                            style={{ color: slide.colorTheme.primary }}
                          >
                            {slide.title}
                          </h3>
                        </div>
                        <p className="text-text-secondary mt-1.5 line-clamp-2 text-xs leading-relaxed">
                          {slide.notes}
                        </p>
                      </div>

                      {/* Thumbnail Preview with color accent */}
                      <div
                        className="relative z-10 mt-3 h-28 overflow-hidden rounded-lg border"
                        style={{
                          borderColor: slide.colorTheme.border,
                          backgroundColor: slide.colorTheme.bg,
                        }}
                      >
                        <SlidePreview
                          slideId={slide.id}
                          colorTheme={slide.colorTheme}
                          icon={slide.icon}
                        />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
