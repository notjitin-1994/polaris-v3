'use client';

import React from 'react';

type DynamicFormLayoutProps = {
  children: React.ReactNode;
  currentSection?: number;
  totalSections?: number;
};

export function DynamicFormLayout({ children }: DynamicFormLayoutProps): React.JSX.Element {
  return <div className="w-full">{children}</div>;
}
