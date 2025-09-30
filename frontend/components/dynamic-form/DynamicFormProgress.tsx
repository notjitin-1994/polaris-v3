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
  return (
    <div className="animate-fade-in-up mb-8">
      {/* Progress bar */}
      <div
        className="relative mb-6 h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((currentSection + 1) / totalSections) * 100}%`,
            backgroundColor: '#a7dadb',
            boxShadow: '0 0 12px rgba(167, 218, 219, 0.5)',
          }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex-1">
          <p className="mb-1 text-white/50">
            Step {currentSection + 1} of {totalSections}
          </p>
          {sectionTitle && (
            <h3
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--font-quicksand), sans-serif' }}
            >
              {sectionTitle}
            </h3>
          )}
          {sectionDescription && <p className="mt-1 text-sm text-white/60">{sectionDescription}</p>}
        </div>
      </div>
    </div>
  );
}
