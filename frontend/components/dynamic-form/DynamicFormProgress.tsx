'use client';

import React from 'react';

type DynamicFormProgressProps = {
  currentSection: number;
  totalSections: number;
  sectionTitle?: string;
  sectionDescription?: string;
};

export function DynamicFormProgress({
  currentSection,
  totalSections,
  sectionTitle,
  sectionDescription,
}: DynamicFormProgressProps): React.JSX.Element {
  const progress = ((currentSection + 1) / totalSections) * 100;
  
  return (
    <div className="animate-fade-in-up space-y-6 mb-10">
      {/* Progress bar with segments */}
      <div className="relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5 shadow-inner">
          <div
            className="relative h-full rounded-full bg-gradient-to-r from-primary-accent via-primary-accent-light to-primary-accent transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              boxShadow: '0 0 16px rgba(167, 218, 219, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Animated shimmer effect */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
              }}
            />
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-1">
          {Array.from({ length: totalSections }).map((_, index) => (
            <div
              key={index}
              className={`h-3 w-3 rounded-full border-2 transition-all duration-300 ${
                index <= currentSection
                  ? 'bg-primary-accent border-primary-accent-light shadow-[0_0_8px_rgba(167,218,219,0.6)]'
                  : 'bg-background border-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step info with refined typography */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center h-7 px-3 rounded-full bg-primary/10 border border-primary/20 text-[13px] font-semibold text-primary-accent tracking-wide">
              Section {currentSection + 1} of {totalSections}
            </span>
          </div>
          {sectionTitle && (
            <h3 className="text-[22px] font-semibold text-foreground font-heading leading-tight tracking-tight">
              {sectionTitle}
            </h3>
          )}
          {sectionDescription && (
            <p className="text-[15px] text-text-secondary leading-relaxed max-w-lg">
              {sectionDescription}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}