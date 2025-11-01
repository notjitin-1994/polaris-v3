'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Crown } from 'lucide-react';
import { Brand } from '@/components/layout/Brand';
import { UserAvatar } from '@/components/layout/UserAvatar';
import {
  IconSidebarToggle,
  IconApps,
  IconEye,
  IconSun,
  IconLogout,
  IconSettings,
} from '@/components/layout/icons';
import { useBlueprintSidebar } from '@/contexts/BlueprintSidebarContext';
import { BlueprintSidebarContent } from './BlueprintSidebarContent';
import { SettingsSidebarContent } from './SettingsSidebarContent';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

interface SidebarProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false); // Default to expanded
  const [isMounted, setIsMounted] = useState(false);
  const { isActiveBlueprintPage, blueprintData } = useBlueprintSidebar();
  const { profile, loading: profileLoading } = useUserProfile();

  // Check if we're on the settings page
  const isSettingsPage = pathname === '/settings';

  // Load state from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);

    // Load sidebar collapsed state
    try {
      const stored = localStorage.getItem('portal:sidebarCollapsed');
      if (stored) {
        setSidebarCollapsed(stored === '1');
      }
    } catch {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('portal:sidebarCollapsed', sidebarCollapsed ? '1' : '0');
    } catch {}
  }, [sidebarCollapsed, isMounted]);

  // Add keyboard shortcut for sidebar toggle (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getFirstName = (): string => {
    const rawName =
      (user?.user_metadata?.first_name as string) ||
      (user?.user_metadata?.name as string) ||
      (user?.user_metadata?.full_name as string) ||
      (user?.email as string) ||
      'User';
    return rawName.toString().trim().split(' ')[0];
  };

  const getCapitalizedFirstName = (): string => {
    const name = getFirstName();
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Check if user is admin/developer
  const isAdmin = profile?.user_role === 'developer';

  const collapsedQuickItems = [
    { title: 'Dashboard', icon: IconApps, path: '/' },
    ...(isAdmin
      ? [
          {
            title: 'Admin',
            icon: IconSettings,
            path: '/admin',
            badge: 'Admin',
            badgeType: 'admin' as const,
          },
        ]
      : []),
    {
      title: 'Solara Learning Engine',
      icon: IconSun,
      path: 'https://solara.smartslate.io',
      isExternal: true,
    },
    {
      title: 'Learn More',
      icon: IconEye,
      path: 'https://www.smartslate.io',
      isExternal: true,
    },
  ];

  const productLinks = [
    {
      name: 'Constellation',
      path: 'https://solara.smartslate.io/constellation',
      badge: 'Coming Soon',
      badgeType: 'soon' as const,
      isExternal: true,
    },
    {
      name: 'Nova',
      path: 'https://solara.smartslate.io/nova',
      badge: 'Coming Soon',
      badgeType: 'soon' as const,
      isExternal: true,
    },
    {
      name: 'Orbit',
      path: 'https://solara.smartslate.io/orbit',
      badge: 'Coming Soon',
      badgeType: 'soon' as const,
      isExternal: true,
    },
    {
      name: 'Spectrum',
      path: 'https://solara.smartslate.io/spectrum',
      badge: 'Coming Soon',
      badgeType: 'soon' as const,
      isExternal: true,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 hidden h-screen flex-col md:flex ${sidebarCollapsed ? 'md:w-16 lg:w-16' : 'md:w-72 lg:w-80'} bg-surface z-[9999] shadow-sm backdrop-blur-xl transition-all duration-300 ease-out`}
      aria-label="Main navigation"
      role="navigation"
    >
      {/* Header with Brand & Toggle */}
      <div
        className={` ${sidebarCollapsed ? 'px-2 py-3' : 'px-6 py-5'} flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} bg-surface/80 sticky top-0 z-20 backdrop-blur-sm`}
      >
        {!sidebarCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <Brand />
          </div>
        )}
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`group text-text-secondary hover:text-foreground hover:bg-foreground/5 active:bg-foreground/10 focus-visible:ring-secondary/50 relative flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 ${sidebarCollapsed ? 'h-8 w-8' : 'h-9 w-9'}`}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <IconSidebarToggle
            className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation Content */}
      {!sidebarCollapsed &&
        // Conditional Content: Blueprint Tools, Settings, or Normal Navigation
        (isActiveBlueprintPage && blueprintData ? (
          <BlueprintSidebarContent {...blueprintData} />
        ) : isSettingsPage ? (
          <SettingsSidebarContent />
        ) : (
          // Expanded View: Full Navigation
          <nav
            className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4"
            aria-label="Primary navigation"
          >
            {/* Quick Access Section */}
            <div className="space-y-1.5">
              <h2 className="text-primary mb-2 px-3 text-[5px] font-bold tracking-wider uppercase">
                Quick Access
              </h2>
              {collapsedQuickItems.map(
                ({ title, icon: Icon, path, badge, badgeType, disabled, isExternal }) => {
                  const isActive = pathname === path;
                  const content = (
                    <>
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 truncate text-left">{title}</span>
                      {badge && (
                        <span
                          className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase shadow transition-all duration-200 ${
                            badgeType === 'admin'
                              ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400 shadow-indigo-500/20'
                              : 'border-primary/40 bg-primary/10 text-primary shadow-primary/20'
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                      {isActive && !disabled && (
                        <div className="bg-primary absolute top-1/2 right-0 h-8 w-1 -translate-y-1/2 rounded-l-full" />
                      )}
                    </>
                  );

                  const className = `group focus-visible:ring-secondary/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : disabled
                        ? 'text-text-disabled cursor-not-allowed'
                        : 'text-text-secondary hover:text-foreground hover:bg-foreground/5 active:scale-[0.98]'
                  }`;

                  return isExternal ? (
                    <a
                      key={title}
                      href={path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={className}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      key={title}
                      type="button"
                      onClick={() => !disabled && router.push(path)}
                      disabled={disabled}
                      className={className}
                    >
                      {content}
                    </button>
                  );
                }
              )}
            </div>

            {/* Product Links */}
            <div className="space-y-1">
              <h2 className="text-primary mb-2 px-3 text-[5px] font-bold tracking-wider uppercase">
                Explore Suite
              </h2>
              {productLinks.map(({ name, path, badge, badgeType, isExternal }) => {
                const isActive = pathname === path;
                const content = (
                  <>
                    <span className="flex-1 truncate text-left">{name}</span>
                    <span
                      className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 ${
                        badgeType === 'soon'
                          ? 'border-primary/40 bg-primary/10 text-primary shadow-primary/20 shadow'
                          : 'text-text-disabled border-neutral-300 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800'
                      }`}
                    >
                      {badge}
                    </span>
                  </>
                );

                const className = `group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-text-secondary hover:text-foreground hover:bg-foreground/5 focus-visible:ring-secondary/50 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]'
                }`;

                return isExternal ? (
                  <a
                    key={name}
                    href={path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    key={name}
                    type="button"
                    onClick={() => router.push(path)}
                    className={className}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </nav>
        ))}

      {/* Footer Section */}
      <div className="bg-surface/50 mt-auto w-full flex-shrink-0 backdrop-blur-sm">
        {sidebarCollapsed ? (
          // Collapsed Footer - Subscribe and Logout Buttons
          <div className="flex flex-col items-center space-y-2 px-2 py-3">
            {/* Subscribe Button - Collapsed */}
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              title="Subscribe to Polaris"
              aria-label="Subscribe to Polaris"
              className="group relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-indigo-400 transition-all duration-200 hover:bg-indigo-500/10 hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 active:scale-95"
            >
              <Crown className="h-4 w-4" />
            </button>

            {/* Logout Button - Collapsed */}
            <button
              type="button"
              onClick={onSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="group relative flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 transition-all duration-200 hover:bg-red-700 hover:shadow-red-500/25 focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 active:scale-95"
            >
              <IconLogout className="h-4 w-4 text-white" />
            </button>
          </div>
        ) : (
          // Expanded Footer
          <div className="space-y-2 px-4 py-4">
            {/* Subscribe Button - Expanded */}
            <button
              type="button"
              onClick={() => router.push('/pricing')}
              className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-400 transition-all duration-200 hover:bg-indigo-500/10 hover:text-indigo-300 focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <span className="flex-1 text-left font-semibold">Subscribe to Polaris</span>
              <Crown className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
            </button>

            {/* Divider below subscribe removed per request; keep profile divider intact above */}

            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="group hover:bg-foreground/5 focus-visible:ring-secondary/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <div className="relative">
                <UserAvatar
                  user={user}
                  sizeClass="w-9 h-9"
                  textClass="text-sm font-bold"
                  avatarUrl={profile?.avatar_url}
                />
                <div className="bg-success border-surface absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-foreground truncate text-sm font-semibold">
                  {getCapitalizedFirstName()}
                </p>
                <p className="text-text-secondary truncate text-xs">{user?.email}</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => router.push('/settings')}
              className="group text-text-secondary hover:text-foreground hover:bg-foreground/5 focus-visible:ring-secondary/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <IconSettings className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">Settings</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="group text-text-secondary hover:text-error hover:bg-error/5 focus-visible:ring-error/50 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              <IconLogout className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
