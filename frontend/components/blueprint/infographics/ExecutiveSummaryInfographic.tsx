/**
 * Executive Summary Infographic
 * Visual dashboard-style summary with key stats
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Target, Users, TrendingUp, Wand2 } from 'lucide-react';

interface ExecutiveSummaryInfographicProps {
  content: string;
  metadata?: {
    organization?: string;
    role?: string;
    generated_at?: string;
  };
  isPublicView?: boolean;
  statsCards?: React.ReactNode;
}

export function ExecutiveSummaryInfographic({
  content,
  metadata,
  isPublicView = false,
  statsCards,
}: ExecutiveSummaryInfographicProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Main Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary/10 relative overflow-hidden rounded-2xl border border-white/10 p-6 md:p-8"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="bg-primary absolute top-0 right-0 h-64 w-64 rounded-full blur-3xl" />
          <div className="bg-primary absolute bottom-0 left-0 h-64 w-64 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex flex-1 items-center gap-3">
              <div className="rounded-xl bg-white/15 p-3.5 backdrop-blur-sm">
                <FileText className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Strategic Overview</h3>
                {metadata?.organization && (
                  <p className="text-text-secondary text-sm">{metadata.organization}</p>
                )}
              </div>
            </div>

            {/* AI Modify Button with Vibrant Glow & Pulse */}
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
                onClick={() => console.log('Modify Strategic Overview')}
                className="pressable border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all hover:shadow-[0_0_25px_rgba(167,218,219,0.8)]"
                title="Modify with AI"
                aria-label="Modify Strategic Overview with AI"
              >
                <Wand2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(167,218,219,0.9)]" />
              </motion.button>
            )}
          </div>

          <p className="text-text-secondary text-base leading-relaxed">{content}</p>
        </div>
      </motion.div>

      {/* Stats Grid - Replaces highlights */}
      {statsCards && <div>{statsCards}</div>}
    </div>
  );
}
