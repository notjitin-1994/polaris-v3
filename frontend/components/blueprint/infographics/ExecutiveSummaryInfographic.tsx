/**
 * Executive Summary Infographic
 * Visual dashboard-style summary with key highlights
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, Users, TrendingUp, Wand2 } from 'lucide-react';

interface ExecutiveSummaryInfographicProps {
  content: string;
  metadata?: {
    organization?: string;
    role?: string;
    generated_at?: string;
  };
}

export function ExecutiveSummaryInfographic({
  content,
  metadata,
}: ExecutiveSummaryInfographicProps): React.JSX.Element {
  // Extract key sentences for highlights (first 3 sentences)
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const highlights = sentences.slice(0, Math.min(3, sentences.length));

  return (
    <div className="space-y-6">
      {/* Main Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-primary/10 p-6 md:p-8"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-secondary blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="rounded-xl bg-primary/20 p-3"
              >
                <Sparkles className="h-6 w-6 text-primary" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-white">Strategic Overview</h3>
                {metadata?.organization && (
                  <p className="text-sm text-text-secondary">{metadata.organization}</p>
                )}
              </div>
            </div>

            {/* AI Modify Button with Vibrant Glow & Pulse */}
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
              className="pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary transition-all hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_25px_rgba(167,218,219,0.8)]"
              title="Modify with AI"
              aria-label="Modify Strategic Overview with AI"
            >
              <Wand2 className="h-4 w-4 drop-shadow-[0_0_8px_rgba(167,218,219,0.9)]" />
            </motion.button>
          </div>

          <p className="text-base leading-relaxed text-text-secondary">{content}</p>
        </div>
      </motion.div>

      {/* Key Highlights Grid */}
      {highlights.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {highlights.map((highlight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card group rounded-xl border border-white/10 p-5 transition-all hover:border-primary/30"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="rounded-lg bg-primary/20 p-2">
                  {index === 0 && <Target className="h-4 w-4 text-primary" />}
                  {index === 1 && <Users className="h-4 w-4 text-secondary" />}
                  {index === 2 && <TrendingUp className="h-4 w-4 text-success" />}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Highlight {index + 1}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">{highlight.trim()}.</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

