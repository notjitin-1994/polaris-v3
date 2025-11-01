'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Plus, Rocket, Presentation } from 'lucide-react';
import { InteractiveBlueprintDashboard } from '@/components/features/blueprints/InteractiveBlueprintDashboard';
import { Footer } from '@/components/layout/Footer';
import type { BlueprintJSON } from '@/components/features/blueprints/types';

interface SharedBlueprintViewProps {
  blueprint: {
    id: string;
    title: string;
    created_at: string;
    blueprint_json: BlueprintJSON;
    blueprint_markdown?: string;
  };
}

export default function SharedBlueprintView({ blueprint }: SharedBlueprintViewProps) {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isSolaraButtonHovered, setIsSolaraButtonHovered] = useState(false);
  const [isPresentButtonHovered, setIsPresentButtonHovered] = useState(false);

  // Normalize blueprint data structure
  const normalizedBlueprint = blueprint.blueprint_json;

  // Extract executive summary for hero section
  const executiveSummary = typeof normalizedBlueprint?.executive_summary === 'string'
    ? normalizedBlueprint.executive_summary
    : normalizedBlueprint?.executive_summary?.content || 'No executive summary available.';

  return (
    <>
      {/* Main Content */}
      <div className="bg-background relative w-full overflow-x-hidden">
        {/* Animated Background Pattern */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full blur-3xl" />
          <div className="bg-secondary/10 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full blur-3xl delay-1000" />
          <div className="bg-primary/5 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full blur-3xl delay-500" />
        </div>

        {/* Hero Section - Minimalistic Design */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Title Section - Clean Typography */}
            <div className="space-y-6">
              {/* Platform Banner and Create Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex flex-wrap items-center justify-between gap-4"
              >
                {/* Platform Banner */}
                <div className="inline-flex items-center gap-2.5 rounded-full border border-primary/40 bg-white/5 pl-2 pr-4 py-1.5 text-sm shadow-[0_0_20px_rgba(167,218,219,0.3)]">
                  <motion.div
                    className="relative flex-shrink-0 h-7 w-7"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Image
                      src="/logo-swirl.png"
                      alt="Smartslate Polaris Logo"
                      fill
                      className="relative object-contain p-0.5"
                    />
                  </motion.div>
                  <span className="text-text-secondary font-medium">
                    Built by{' '}
                    <span className="text-primary font-semibold">
                      Smartslate Polaris
                    </span>
                    {' '}| Powered by{' '}
                    <span className="text-yellow-400 font-semibold">
                      Solara Learning Engine
                    </span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Animated Explore Solara Button */}
                  <motion.button
                    onClick={() => window.open('https://solara.smartslate.io', '_blank')}
                    onHoverStart={() => setIsSolaraButtonHovered(true)}
                    onHoverEnd={() => setIsSolaraButtonHovered(false)}
                    className="relative flex items-center overflow-hidden rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isSolaraButtonHovered ? '250px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute left-0 top-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        rotate: isSolaraButtonHovered ? -15 : 0,
                        y: isSolaraButtonHovered ? -2 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Rocket className="h-5 w-5 text-black" strokeWidth={2.5} />
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isSolaraButtonHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pl-10 pr-4 text-sm font-semibold text-black whitespace-nowrap"
                        >
                          Explore Solara Learning Engine
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Animated Present Button - Placeholder */}
                  <motion.button
                    onClick={() => alert('Presentation mode coming soon!')}
                    onHoverStart={() => setIsPresentButtonHovered(true)}
                    onHoverEnd={() => setIsPresentButtonHovered(false)}
                    className="relative flex items-center overflow-hidden rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg"
                    initial={{ width: '40px', height: '40px' }}
                    animate={{
                      width: isPresentButtonHovered ? '140px' : '40px',
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    {/* Icon Container - Always Visible */}
                    <motion.div
                      className="absolute left-0 top-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                      animate={{
                        scale: isPresentButtonHovered ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Presentation className="h-5 w-5 text-black" strokeWidth={2.5} />
                    </motion.div>

                    {/* Text - Animated */}
                    <AnimatePresence>
                      {isPresentButtonHovered && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2, delay: 0.05 }}
                          className="pl-10 pr-4 text-sm font-semibold text-black whitespace-nowrap"
                        >
                          Present
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Animated Create New Blueprint Button */}
                  <motion.button
                  onClick={() => window.open('https://polaris.smartslate.io', '_blank')}
                  onHoverStart={() => setIsButtonHovered(true)}
                  onHoverEnd={() => setIsButtonHovered(false)}
                  className="relative flex items-center overflow-hidden rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-lg"
                  initial={{ width: '40px', height: '40px' }}
                  animate={{
                    width: isButtonHovered ? '210px' : '40px',
                  }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  {/* Icon Container - Always Visible */}
                  <motion.div
                    className="absolute left-0 top-0 flex h-10 w-10 flex-shrink-0 items-center justify-center"
                    animate={{
                      rotate: isButtonHovered ? 90 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <Plus className="h-5 w-5 text-black" strokeWidth={2.5} />
                  </motion.div>

                  {/* Text - Animated */}
                  <AnimatePresence>
                    {isButtonHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                        className="pl-10 pr-4 text-sm font-semibold text-black whitespace-nowrap"
                      >
                        Create New Blueprint
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary"
              >
                {blueprint.title || 'Learning Blueprint'}
              </motion.h1>

              {/* Executive Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <p className="text-text-secondary text-lg leading-relaxed">
                  {executiveSummary}
                </p>
              </motion.div>

              {/* Metadata - Organization and Role Banners */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex flex-wrap items-center gap-3"
              >
                {normalizedBlueprint?.metadata?.organization && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                    <span className="text-sm font-medium text-text-secondary">Organization:</span>
                    <span className="text-sm font-semibold text-white">{normalizedBlueprint.metadata.organization}</span>
                  </div>
                )}
                {normalizedBlueprint?.metadata?.role && (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
                    <span className="text-sm font-medium text-text-secondary">Role:</span>
                    <span className="text-sm font-semibold text-white">{normalizedBlueprint.metadata.role}</span>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Blueprint Content */}
        <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <InteractiveBlueprintDashboard
              blueprint={normalizedBlueprint}
              isPublicView={true}
            />
          </motion.div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
