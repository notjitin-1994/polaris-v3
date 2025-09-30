'use client';

import React from 'react';
import Image from 'next/image';

type QuestionnaireCardProps = {
  children: React.ReactNode;
  showLogo?: boolean;
};

export function QuestionnaireCard({
  children,
  showLogo = true,
}: QuestionnaireCardProps): JSX.Element {
  return (
    <div
      className="animate-scale-in p-6 md:p-8"
      style={{
        position: 'relative',
        borderRadius: '1rem',
        background:
          'linear-gradient(rgba(13,27,42,0.55), rgba(13,27,42,0.55)) padding-box, linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)) border-box',
        border: '1px solid transparent',
        boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      {showLogo && (
        <div className="animate-fade-in mb-6 flex items-center select-none">
          <Image
            src="/logo.png"
            alt="SmartSlate"
            width={120}
            height={32}
            className="h-8 w-auto"
            style={{
              filter: 'drop-shadow(0 0 0 rgba(167,218,219,0))',
              transition: 'filter 360ms ease',
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
}
