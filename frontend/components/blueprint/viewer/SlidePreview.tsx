/**
 * Slide Preview Component
 * Miniaturized, animated preview of slide content for grid overview
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

// Classical animation easing curves for smooth, natural motion
const easing = {
  smooth: [0.25, 0.1, 0.25, 1], // Cubic bezier - butter smooth
  gentle: [0.4, 0, 0.2, 1], // Gentle deceleration
  bounce: [0.68, -0.55, 0.265, 1.55], // Subtle bounce
  elastic: [0.5, 0, 0.5, 1], // Elastic feel
} as const;

interface ColorTheme {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
  glow: string;
}

interface SlidePreviewProps {
  slideId: string;
  colorTheme: ColorTheme;
  icon: LucideIcon;
}

export function SlidePreview({
  slideId,
  colorTheme,
  icon: Icon,
}: SlidePreviewProps): React.JSX.Element {
  // Skeletal replicas of actual infographic layouts
  const previewPatterns: Record<string, React.ReactNode> = {
    'executive-summary': (
      <div className="relative h-full w-full p-1.5">
        {/* Main summary card skeleton */}
        <motion.div
          className="mb-1 h-1/2 rounded border"
          style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
          animate={{ opacity: [0.35, 0.45, 0.35] }}
          transition={{ duration: 4, ease: easing.smooth, repeat: Infinity }}
        >
          <div className="space-y-0.5 p-1.5">
            <motion.div
              className="h-0.5 rounded"
              style={{ backgroundColor: colorTheme.primary }}
              animate={{ width: ['30%', '35%', '30%'], opacity: [0.6, 0.75, 0.6] }}
              transition={{ duration: 5, ease: easing.gentle, repeat: Infinity }}
            />
            <motion.div
              className="h-0.5 rounded"
              style={{ backgroundColor: colorTheme.light }}
              animate={{ width: ['95%', '100%', '95%'], opacity: [0.3, 0.4, 0.3] }}
              transition={{ duration: 5.5, ease: easing.gentle, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
              className="h-0.5 rounded"
              style={{ backgroundColor: colorTheme.light }}
              animate={{ width: ['75%', '85%', '75%'], opacity: [0.3, 0.4, 0.3] }}
              transition={{ duration: 6, ease: easing.gentle, repeat: Infinity, delay: 1 }}
            />
          </div>
        </motion.div>

        {/* Stats grid at bottom - 2x2 */}
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.3, 0.55, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                delay: i * 0.4,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="h-4 rounded border"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            />
          ))}
        </div>
      </div>
    ),
    overview: (
      <div className="flex h-full w-full items-center justify-center p-1.5">
        {/* 2x2 Stats grid */}
        <div className="grid w-full grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.35, 0.65, 0.35],
                y: [0, -1, 0],
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="flex flex-col gap-0.5 rounded border p-1"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <div
                className="h-0.5 w-1/3 rounded"
                style={{ backgroundColor: colorTheme.primary, opacity: 0.5 }}
              />
              <motion.div
                className="h-1 rounded"
                style={{ backgroundColor: colorTheme.primary, opacity: 0.7 }}
                animate={{ width: ['60%', '70%', '60%'] }}
                transition={{ duration: 4, ease: easing.gentle, repeat: Infinity, delay: i * 0.2 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),
    objectives: (
      <div className="flex h-full w-full p-1.5">
        {/* Grid of objective cards (3 columns) - targets being achieved */}
        <div className="grid w-full grid-cols-3 gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -2, 0],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.5,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="flex flex-col gap-0.5 rounded border p-1"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              {/* Icon + number */}
              <div className="flex items-center gap-0.5">
                <motion.div
                  className="h-1.5 w-1.5 rounded"
                  style={{ backgroundColor: colorTheme.primary }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.85, 0.6] }}
                  transition={{
                    duration: 2.5,
                    ease: easing.bounce,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
                <div
                  className="h-0.5 w-2 rounded"
                  style={{ backgroundColor: colorTheme.light, opacity: 0.4 }}
                />
              </div>
              {/* Title */}
              <div
                className="h-0.5 w-full rounded"
                style={{ backgroundColor: colorTheme.primary, opacity: 0.5 }}
              />
              {/* Progress bar - filling animation */}
              <motion.div
                className="h-0.5 rounded"
                style={{ backgroundColor: colorTheme.primary }}
                animate={{ width: ['40%', '85%', '40%'] }}
                transition={{ duration: 4, ease: easing.elastic, repeat: Infinity, delay: i * 0.6 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),
    audience: (
      <div className="h-full space-y-1 p-1.5">
        {/* Demographics section - role badges pulsing in */}
        <div className="flex flex-wrap gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.4, 0.75, 0.4],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 3,
                delay: i * 0.4,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="h-1.5 w-6 rounded-full"
              style={{ backgroundColor: colorTheme.primary }}
            />
          ))}
        </div>
        {/* Learning preferences - modality bars growing */}
        <div className="space-y-0.5">
          {[70, 85, 60].map((width, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="h-0.5 w-4 rounded"
                style={{ backgroundColor: colorTheme.light, opacity: 0.4 }}
              />
              <motion.div
                className="h-1 rounded-full"
                style={{ backgroundColor: colorTheme.primary }}
                animate={{
                  width: [`${width - 15}%`, `${width + 5}%`, `${width - 15}%`],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.5,
                  ease: easing.elastic,
                  repeat: Infinity,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    ),
    strategy: (
      <div className="h-full space-y-1 p-1.5">
        {/* Overview text - reading animation */}
        <div className="mb-1 space-y-0.5">
          <motion.div
            className="h-0.5 rounded"
            style={{ backgroundColor: colorTheme.light }}
            animate={{ width: ['90%', '100%', '90%'], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 5, ease: easing.gentle, repeat: Infinity }}
          />
          <motion.div
            className="h-0.5 rounded"
            style={{ backgroundColor: colorTheme.light }}
            animate={{ width: ['70%', '85%', '70%'], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 5.5, ease: easing.gentle, repeat: Infinity, delay: 0.8 }}
          />
        </div>
        {/* Modality cards - staggered reveal */}
        <div className="space-y-0.5">
          {[80, 65, 45].map((width, i) => (
            <motion.div
              key={i}
              animate={{
                x: [0, 3, 0],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.6,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="rounded border p-0.5"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="h-0.5 w-8 rounded"
                  style={{ backgroundColor: colorTheme.primary, opacity: 0.5 }}
                />
                <motion.div
                  className="h-1 rounded"
                  style={{ backgroundColor: colorTheme.primary }}
                  animate={{ width: ['10px', '12px', '10px'], opacity: [0.7, 0.9, 0.7] }}
                  transition={{
                    duration: 2.5,
                    ease: easing.gentle,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    content: (
      <div className="relative h-full w-full p-1.5">
        {/* Vertical timeline with module cards - progressive learning journey */}
        <div className="relative h-full">
          {/* Timeline line - growing */}
          <motion.div
            className="absolute top-0 left-1 w-px"
            style={{ backgroundColor: colorTheme.primary }}
            animate={{
              height: ['20%', '100%', '20%'],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 6, ease: easing.smooth, repeat: Infinity }}
          />

          {/* Module cards */}
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  x: [0, 3, 0],
                  opacity: [0.4, 0.75, 0.4],
                }}
                transition={{
                  duration: 4,
                  delay: i * 0.7,
                  ease: easing.smooth,
                  repeat: Infinity,
                }}
                className="relative ml-3"
              >
                {/* Timeline dot - pulsing */}
                <motion.div
                  className="absolute top-1 -left-3.5 h-1.5 w-1.5 rounded-full border-2"
                  style={{ borderColor: colorTheme.primary, backgroundColor: colorTheme.bg }}
                  animate={{
                    scale: [1, 1.4, 1],
                    borderWidth: ['2px', '3px', '2px'],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.8,
                    ease: easing.bounce,
                    repeat: Infinity,
                  }}
                />
                {/* Module card */}
                <div
                  className="rounded border p-1"
                  style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
                >
                  <motion.div
                    className="mb-0.5 h-0.5 rounded"
                    style={{ backgroundColor: colorTheme.primary }}
                    animate={{ width: ['70%', '80%', '70%'], opacity: [0.6, 0.8, 0.6] }}
                    transition={{
                      duration: 3.5,
                      ease: easing.gentle,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                  <div
                    className="h-0.5 w-1/2 rounded"
                    style={{ backgroundColor: colorTheme.light, opacity: 0.4 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    ),
    resources: (
      <div className="grid h-full grid-cols-2 gap-1 p-1.5">
        {/* Left: Budget pie chart skeleton - rotating allocation */}
        <div
          className="flex items-center justify-center rounded border"
          style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            className="relative h-10 w-10"
          >
            {/* Pie segments - smooth gradient rotation */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${colorTheme.primary} 0deg 120deg, ${colorTheme.light} 120deg 240deg, ${colorTheme.dark} 240deg 360deg)`,
              }}
              animate={{ opacity: [0.5, 0.7, 0.5] }}
              transition={{ duration: 4, ease: easing.smooth, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* Right: Resource list - cascading appearance */}
        <div className="space-y-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.35, 0.65, 0.35],
                x: [0, 2, 0],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.4,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="rounded border p-0.5"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <motion.div
                className="h-0.5 rounded"
                style={{ backgroundColor: colorTheme.primary }}
                animate={{ width: ['65%', '80%', '65%'], opacity: [0.5, 0.75, 0.5] }}
                transition={{ duration: 4, ease: easing.gentle, repeat: Infinity, delay: i * 0.3 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),
    assessment: (
      <div className="h-full space-y-1 p-1.5">
        {/* Overview text */}
        <motion.div
          className="mb-1 h-0.5 w-full rounded"
          style={{ backgroundColor: colorTheme.light }}
          animate={{ opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 4, ease: easing.gentle, repeat: Infinity }}
        />
        {/* KPI Grid (2 columns) - metrics being measured */}
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -1.5, 0],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.4,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="rounded border p-1"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <div className="mb-0.5 flex justify-between">
                <div
                  className="h-0.5 w-6 rounded"
                  style={{ backgroundColor: colorTheme.light, opacity: 0.4 }}
                />
                <motion.div
                  className="h-1 w-3 rounded"
                  style={{ backgroundColor: colorTheme.primary }}
                  animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.05, 1] }}
                  transition={{
                    duration: 2.5,
                    ease: easing.bounce,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              </div>
              {/* Progress bar - filling to target */}
              <motion.div
                className="h-0.5 rounded"
                style={{ backgroundColor: colorTheme.primary }}
                animate={{ width: ['10%', '85%', '10%'] }}
                transition={{ duration: 5, ease: easing.elastic, repeat: Infinity, delay: i * 0.5 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),
    timeline: (
      <div className="relative h-full w-full p-1.5">
        {/* Vertical timeline - progress flowing through phases */}
        <div className="relative h-full">
          {/* Timeline line - growing from top to bottom */}
          <motion.div
            className="absolute top-0 left-2 w-px"
            style={{ backgroundColor: colorTheme.primary }}
            animate={{
              height: ['0%', '100%', '0%'],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, ease: easing.smooth, repeat: Infinity }}
          />

          {/* Phase cards */}
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="relative ml-5">
                {/* Timeline node - sequential activation */}
                <motion.div
                  className="absolute top-1 -left-6 h-2 w-2 rounded-full border-2"
                  style={{ borderColor: colorTheme.primary, backgroundColor: colorTheme.bg }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 1.2,
                    ease: easing.bounce,
                    repeat: Infinity,
                  }}
                />
                {/* Phase card - slides in */}
                <motion.div
                  className="rounded border p-1"
                  style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
                  animate={{
                    x: [0, 3, 0],
                    opacity: [0.4, 0.75, 0.4],
                  }}
                  transition={{
                    duration: 4,
                    delay: i * 1,
                    ease: easing.smooth,
                    repeat: Infinity,
                  }}
                >
                  <motion.div
                    className="mb-0.5 h-0.5 rounded"
                    style={{ backgroundColor: colorTheme.primary }}
                    animate={{ width: ['65%', '80%', '65%'], opacity: [0.6, 0.85, 0.6] }}
                    transition={{
                      duration: 3.5,
                      ease: easing.gentle,
                      repeat: Infinity,
                      delay: i * 0.7,
                    }}
                  />
                  <div
                    className="h-0.5 w-1/2 rounded"
                    style={{ backgroundColor: colorTheme.light, opacity: 0.3 }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    risks: (
      <div className="h-full space-y-1 p-1.5">
        {/* Risk cards - pulsing warnings */}
        <div className="space-y-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.4, 0.75, 0.4],
                scale: [1, 1.01, 1],
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="rounded border p-1"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <div className="mb-0.5 flex items-center justify-between">
                <motion.div
                  className="h-0.5 rounded"
                  style={{ backgroundColor: colorTheme.primary }}
                  animate={{ width: ['30%', '35%', '30%'], opacity: [0.5, 0.75, 0.5] }}
                  transition={{
                    duration: 3.5,
                    ease: easing.gentle,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
                <div className="flex gap-0.5">
                  <motion.div
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: colorTheme.light }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{
                      duration: 2,
                      ease: easing.smooth,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                  />
                  <motion.div
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: colorTheme.primary }}
                    animate={{ opacity: [0.5, 0.9, 0.5] }}
                    transition={{
                      duration: 2,
                      ease: easing.smooth,
                      repeat: Infinity,
                      delay: i * 0.4 + 0.3,
                    }}
                  />
                </div>
              </div>
              <motion.div
                className="h-0.5 rounded"
                style={{ backgroundColor: colorTheme.light }}
                animate={{ width: ['90%', '100%', '90%'], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, ease: easing.gentle, repeat: Infinity, delay: i * 0.6 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),
    metrics: (
      <div className="h-full space-y-1 p-1.5">
        {/* Metrics cards grid - success tracking */}
        <div className="grid grid-cols-2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -2, 0],
                opacity: [0.4, 0.75, 0.4],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.45,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="rounded border p-1"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <motion.div
                className="mb-0.5 h-0.5 rounded"
                style={{ backgroundColor: colorTheme.primary }}
                animate={{ width: ['60%', '70%', '60%'], opacity: [0.5, 0.75, 0.5] }}
                transition={{ duration: 3, ease: easing.gentle, repeat: Infinity, delay: i * 0.3 }}
              />
              <div className="mb-0.5 flex gap-1">
                <motion.div
                  className="h-1 w-4 rounded"
                  style={{ backgroundColor: colorTheme.light }}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{
                    duration: 2.5,
                    ease: easing.gentle,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
                <motion.div
                  className="h-1 rounded"
                  style={{ backgroundColor: colorTheme.primary }}
                  animate={{ width: ['14px', '18px', '14px'], opacity: [0.6, 0.85, 0.6] }}
                  transition={{
                    duration: 3,
                    ease: easing.elastic,
                    repeat: Infinity,
                    delay: i * 0.4,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    ),
    sustainability: (
      <div className="h-full space-y-1 p-1.5">
        {/* Overview card - breathing */}
        <motion.div
          className="mb-1 rounded border p-1"
          style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 4.5, ease: easing.smooth, repeat: Infinity }}
        >
          <div className="space-y-0.5">
            <motion.div
              className="h-0.5 rounded"
              style={{ backgroundColor: colorTheme.light }}
              animate={{ width: ['95%', '100%', '95%'], opacity: [0.3, 0.45, 0.3] }}
              transition={{ duration: 5, ease: easing.gentle, repeat: Infinity }}
            />
            <motion.div
              className="h-0.5 rounded"
              style={{ backgroundColor: colorTheme.light }}
              animate={{ width: ['75%', '85%', '75%'], opacity: [0.3, 0.45, 0.3] }}
              transition={{ duration: 5.5, ease: easing.gentle, repeat: Infinity, delay: 0.5 }}
            />
          </div>
        </motion.div>
        {/* Maintenance schedule - cyclic updates */}
        <div className="space-y-0.5">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.4, 0.75, 0.4],
                x: [0, 2, 0],
              }}
              transition={{
                duration: 3.5,
                delay: i * 0.8,
                ease: easing.smooth,
                repeat: Infinity,
              }}
              className="rounded border p-0.5"
              style={{ borderColor: colorTheme.border, backgroundColor: colorTheme.bg }}
            >
              <motion.div
                className="h-0.5 rounded"
                style={{ backgroundColor: colorTheme.primary }}
                animate={{ width: ['60%', '70%', '60%'], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 4, ease: easing.gentle, repeat: Infinity, delay: i * 0.6 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Render the appropriate skeletal preview */}
      {previewPatterns[slideId] || (
        <div className="flex h-full items-center justify-center">
          <Icon className="h-8 w-8 opacity-50" style={{ color: colorTheme.primary }} />
        </div>
      )}
    </div>
  );
}
