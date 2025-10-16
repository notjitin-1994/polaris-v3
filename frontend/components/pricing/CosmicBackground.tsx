/**
 * Cosmic Background Component
 * Animated background for pricing page
 */

'use client';

import React from 'react';

export function CosmicBackground(): React.JSX.Element {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(167,218,219,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(230,184,156,0.05),transparent_50%)]" />
      
      {/* Animated orbs */}
      <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-primary/10 blur-3xl" />
      <div className="delay-1000 absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
      <div className="delay-500 absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/5 blur-3xl" />
    </div>
  );
}
