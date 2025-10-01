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
    <div className="glass-card p-8 md:p-10 space-y-8">
      {showLogo && (
        <div className="animate-fade-in flex items-center justify-center pb-2">
          <Image
            src="/logo.png"
            alt="SmartSlate"
            width={140}
            height={38}
            className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
            priority
          />
        </div>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}