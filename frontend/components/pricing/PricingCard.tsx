/**
 * Pricing Card Component
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingCardProps {
  plan: any;
  billing?: 'monthly' | 'annual';
  billingCycle?: 'monthly' | 'annual';
  savings?: number;
  isCenter?: boolean;
  isTeam?: boolean;
  isActive?: boolean;
  delay?: number;
  onSelect: (planId: string) => void;
  children?: React.ReactNode;
}

export function PricingCard({
  plan,
  billing,
  billingCycle,
  savings,
  isCenter,
  delay = 0,
  onSelect,
  children
}: PricingCardProps): React.JSX.Element {
  const cycle = billing || billingCycle || 'monthly';
  // plan.price is the per-month price already adjusted for billing (e.g., discounted monthly when annual)
  // For annual display, we show the price per year instead of per month
  const monthlyBase: number = (plan.price ?? plan.priceMonthly) || 0;
  const price: number = cycle === 'annual' ? monthlyBase * 12 : monthlyBase;
  const unitLabel = cycle === 'annual' ? '/year' : '/month';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        scale: 1.015,
        y: -12,
        transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
      }}
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 h-full flex flex-col ${
        plan.popular || isCenter
          ? 'border-primary/50 bg-gradient-to-br from-primary/8 via-primary/4 to-background/60 shadow-2xl shadow-primary/15 ring-2 ring-primary/25'
          : 'border-neutral-200/60 bg-gradient-to-br from-background/50 to-background/20 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8'
      }`}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      </div>

      {plan.badge && (
        <motion.div
          className="relative z-10 mb-6"
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: delay + 0.2,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-2 text-xs font-bold text-primary shadow-lg backdrop-blur-sm border border-primary/20">
            {plan.badge}
          </span>
        </motion.div>
      )}

      <motion.div
        className="relative z-10 flex-1 flex flex-col px-8 py-8"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: delay + 0.3,
          duration: 0.5,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {/* Plan name and tagline */}
        <div className="mb-8">
          <h3 className="mb-3 text-2xl font-bold text-foreground leading-tight tracking-tight">
            {plan.name}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed font-medium">
            {plan.tagline}
          </p>
        </div>

        {/* Price section */}
        <div className="mb-10">
          <div className="flex items-end gap-2 mb-3">
            <span className="text-6xl font-black text-foreground leading-none tracking-tighter">
              ${price.toLocaleString()}
            </span>
            <span className="text-xl text-text-secondary font-semibold leading-none mb-1">
              {unitLabel}
            </span>
          </div>
          {cycle === 'annual' && savings && (
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: delay + 0.6,
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <svg className="w-3.5 h-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-success">
                Save ${savings.toLocaleString()} annually
              </span>
            </motion.div>
          )}
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={() => onSelect(plan.id)}
          className={`w-full rounded-2xl py-4 font-bold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 min-h-[56px] mb-8 ${
            plan.popular || isCenter
              ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 shadow-xl hover:shadow-2xl focus-visible:ring-primary/50'
              : 'bg-gradient-to-r from-surface to-surface/90 text-foreground hover:from-surface/90 hover:to-surface/80 border border-neutral-200/40 hover:border-neutral-300/60 focus-visible:ring-neutral-400/50 shadow-md hover:shadow-lg'
          }`}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
          }}
          whileTap={{
            scale: 0.98,
            transition: { duration: 0.1 }
          }}
          aria-label={`Get started with ${plan.name} plan for $${price}${unitLabel}`}
        >
          Get Started
        </motion.button>

        {/* Custom children content (e.g., generation/saved limits) */}
        {children && (
          <div className="mb-8">
            {children}
          </div>
        )}

        {/* Features list */}
        <ul className="mt-auto space-y-5">
          {plan.features.map((feature: string, index: number) => (
            <motion.li
              key={feature}
              className="flex items-start gap-4 text-sm text-text-secondary leading-relaxed"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: delay + 0.5 + index * 0.08,
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              </div>
              <span className="font-medium">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
