'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SwirlBackground } from './SwirlBackground';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { UserAvatar } from './UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@supabase/supabase-js';

export interface StandardHeaderProps {
  /**
   * Main title - can be string or custom JSX
   */
  title: string | ReactNode;

  /**
   * Subtitle/description text
   */
  subtitle?: string;

  /**
   * If provided, shows a back button that links to this href
   */
  backHref?: string;

  /**
   * Custom label for back button (default: "Back to Dashboard")
   */
  backLabel?: string;

  /**
   * Custom actions to show next to the title (e.g., rename button)
   */
  titleActions?: ReactNode;

  /**
   * Custom actions to show on the right side (before dark mode toggle and avatar)
   */
  rightActions?: ReactNode;

  /**
   * Whether to show dark mode toggle (default: true)
   */
  showDarkModeToggle?: boolean;

  /**
   * Whether to show user avatar (default: true)
   */
  showUserAvatar?: boolean;

  /**
   * Whether to show the decorative line under title (default: false)
   */
  showDecorativeLine?: boolean;

  /**
   * Whether header should be sticky (default: true)
   */
  sticky?: boolean;

  /**
   * Custom className for additional styling
   */
  className?: string;

  /**
   * Size variant for the header
   */
  size?: 'default' | 'compact';

  /**
   * Override user object (useful for SSR contexts)
   */
  user?: User | null;
}

export function StandardHeader({
  title,
  subtitle,
  backHref,
  backLabel = 'Back to Dashboard',
  titleActions,
  rightActions,
  showDarkModeToggle = true,
  showUserAvatar = true,
  showDecorativeLine = false,
  sticky = true,
  className = '',
  size = 'default',
  user: userProp,
}: StandardHeaderProps): React.JSX.Element {
  const auth = useAuth();
  const user = userProp ?? auth?.user ?? null;

  const isCompact = size === 'compact';

  return (
    <header
      className={`relative overflow-hidden border-b border-white/10 bg-[#020C1B]/80 backdrop-blur-xl ${sticky ? 'sticky top-0' : ''} z-10 ${className}`}
    >
      {/* Swirl Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <SwirlBackground count={12} minSize={32} maxSize={64} opacityMin={0.03} opacityMax={0.08} />
        <div
          className="absolute inset-0 bg-primary/5"
        />
      </div>

      {/* Content */}
      <div
        className={`relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${isCompact ? 'py-4' : 'py-6'}`}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Back button (if present) + Title */}
          <div className="min-w-0 flex-1">
            {backHref && (
              <Link
                href={backHref}
                className="pressable mb-4 inline-flex items-center gap-2 text-[rgb(176,197,198)] transition-colors hover:text-[#a7dadb]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">{backLabel}</span>
              </Link>
            )}

            <div className="flex items-center gap-2">
              {typeof title === 'string' ? (
                <h1
                  className={`font-heading font-bold tracking-tight text-white ${isCompact ? 'text-base sm:text-lg' : 'mb-2 text-3xl sm:text-4xl'}`}
                >
                  {title}
                </h1>
              ) : (
                title
              )}
              {titleActions && <div className="flex items-center gap-2">{titleActions}</div>}
            </div>

            {subtitle && (
              <p
                className={`max-w-3xl text-[rgb(176,197,198)] ${isCompact ? 'text-xs' : 'text-base'}`}
              >
                {subtitle}
              </p>
            )}

            {showDecorativeLine && (
              <div
                aria-hidden="true"
                className="mt-4 h-px w-16 bg-neutral-300"
              />
            )}
          </div>

          {/* Right side: Controls */}
          <div className="flex shrink-0 items-center gap-2">
            {rightActions}
            {showDarkModeToggle && <DarkModeToggle />}
            {showUserAvatar && user && <UserAvatar user={user} sizeClass="w-8 h-8" />}
          </div>
        </div>
      </div>
    </header>
  );
}
