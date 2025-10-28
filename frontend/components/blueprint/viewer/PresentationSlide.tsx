/**
 * Presentation Slide
 * Premium slide wrapper with glass-morphism and brand-aligned aesthetics
 * Matches the ComprehensiveBlueprintViewer design system
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { glassCard } from '@/lib/design-system';

interface ColorTheme {
  primary: string;
  light: string;
  dark: string;
  bg: string;
  border: string;
  glow: string;
}

interface PresentationSlideProps {
  children: React.ReactNode;
  colorTheme?: ColorTheme;
}

export function PresentationSlide({
  children,
  colorTheme,
}: PresentationSlideProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="mx-auto w-full max-w-7xl"
    >
      {/* Container with subtle animations - cards provide their own styling */}
      <div className="space-y-6">{children}</div>
    </motion.div>
  );
}
