/**
 * Presentation Slide
 * Slide wrapper with animations and responsive layout
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

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

export function PresentationSlide({ children, colorTheme }: PresentationSlideProps): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="mx-auto w-full max-w-7xl"
    >
      {/* Simplified container - PresentationSectionCard provides card styling */}
      <div className="space-y-6">
        {children}
      </div>
    </motion.div>
  );
}

