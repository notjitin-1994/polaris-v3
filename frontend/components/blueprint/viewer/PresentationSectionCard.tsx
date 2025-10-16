/**
 * Presentation Section Card
 * Replicates the exact visual appearance of an expanded ExpandableSection from analytics dashboard
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
    <div className="glass-card overflow-hidden rounded-2xl border border-white/10 transition-all">
      {/* Section Header - Matches ExpandableSection header exactly */}
      <div className="flex w-full items-center justify-between p-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className={`rounded-xl p-3 ${section.gradient}`}>
            <Icon className={`h-6 w-6 ${section.iconColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{section.title}</h3>
            <p className="text-text-secondary text-sm">{section.description}</p>
          </div>
        </div>

        {/* AI Modify Button - Only visible when not public view */}
        {!isPublicView && (
          <motion.button
            animate={{
              boxShadow: [
                '0 0 15px rgba(167,218,219,0.5)',
                '0 0 20px rgba(167,218,219,0.7)',
                '0 0 15px rgba(167,218,219,0.5)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleModify}
            className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:shadow-[0_0_25px_rgba(167,218,219,0.8)]"
            title="Modify with AI"
            aria-label={`Modify ${section.title} with AI`}
          >
            <Wand2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(167,218,219,0.9)]" />
          </motion.button>
        )}
      </div>

      {/* Content Area - Matches ExpandableSection content area exactly */}
      <div className="border-t border-white/10 px-8 pt-6 pb-8">
        {children}
      </div>
    </div>
  );
}






















