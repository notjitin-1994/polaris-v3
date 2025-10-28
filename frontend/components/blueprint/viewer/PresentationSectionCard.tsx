/**
 * Presentation Section Card
 * Premium section card with glass-morphism matching ComprehensiveBlueprintViewer aesthetic
 * Features refined brand styling with teal accent (#A7DADB)
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, type LucideIcon } from 'lucide-react';

interface PresentationSectionCardProps {
  section: {
    title: string;
    description: string;
    icon: LucideIcon;
    gradient: string;
    iconColor: string;
  };
  children: React.ReactNode;
  isPublicView?: boolean;
}

export function PresentationSectionCard({
  section,
  children,
  isPublicView = false,
}: PresentationSectionCardProps): React.JSX.Element {
  const Icon = section.icon;

  const handleModify = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Modify ${section.title}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="glass-card group hover:border-primary/30 relative overflow-hidden rounded-2xl border border-neutral-300 transition-all duration-300"
    >
      {/* Subtle gradient background overlay on hover */}
      <div className="bg-primary/5 pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Section Header - Refined to match ComprehensiveBlueprintViewer */}
      <div className="relative z-10 flex w-full items-center justify-between p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {/* Icon Container with gradient background */}
          <div
            className={`rounded-xl p-3 ${section.gradient} transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon
              className={`h-6 w-6 ${section.iconColor}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            />
          </div>

          {/* Title and Description */}
          <div className="min-w-0">
            <h3 className="font-heading mb-0.5 text-xl font-bold text-white">{section.title}</h3>
            <p className="text-text-secondary text-sm">{section.description}</p>
          </div>
        </div>

        {/* AI Modify Button - Premium styling with brand teal glow */}
        {!isPublicView && (
          <motion.button
            animate={{
              boxShadow: [
                '0 0 15px rgba(167,218,219,0.4)',
                '0 0 25px rgba(167,218,219,0.6)',
                '0 0 15px rgba(167,218,219,0.4)',
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleModify}
            className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:shadow-[0_0_30px_rgba(167,218,219,0.9)]"
            title="Modify with AI"
            aria-label={`Modify ${section.title} with AI`}
          >
            <Wand2
              className="h-4 w-4 drop-shadow-[0_0_10px_rgba(167,218,219,1)]"
              fill="none"
              stroke="currentColor"
            />
          </motion.button>
        )}
      </div>

      {/* Content Area - Refined border and spacing */}
      <div className="relative z-10 border-t border-white/10 px-8 pt-6 pb-8">{children}</div>
    </motion.div>
  );
}
