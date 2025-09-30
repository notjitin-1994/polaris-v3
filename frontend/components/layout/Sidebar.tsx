'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Brand } from '@/components/layout/Brand';
import { UserAvatar } from '@/components/layout/UserAvatar';
import { NavSection, type NavItem } from '@/components/layout/NavSection';
import {
  IconSidebarToggle,
  IconApps,
  IconEye,
  IconChecklist,
  IconSun,
  IconLogout,
  IconSettings,
} from '@/components/layout/icons';

interface RecentExploration {
  label: string;
  timestamp: number;
}

interface SidebarProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('portal:sidebarCollapsed');
    return stored ? stored === '1' : true;
  });

  const [recentExplorations, setRecentExplorations] = useState<RecentExploration[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('portal:recentExplorations');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as RecentExploration[];
      if (!Array.isArray(parsed)) return [];
      return parsed.slice(0, 3);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('portal:sidebarCollapsed', sidebarCollapsed ? '1' : '0');
    } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem(
        'portal:recentExplorations',
        JSON.stringify(recentExplorations.slice(0, 3))
      );
    } catch {}
  }, [recentExplorations]);

  const handleItemClick = (section: string, item: NavItem) => {
    const label = typeof item === 'string' ? item : item.label;
    setRecentExplorations((prev) => {
      const next = [{ label: `${section} > ${label}`, timestamp: Date.now() }, ...prev]
        .filter((v, idx, arr) => idx === arr.findIndex((x) => x.label === v.label))
        .slice(0, 3);
      return next;
    });
  };

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

  const collapsedQuickItems = [
    { title: 'Portal', icon: IconApps },
    { title: 'Explore', icon: IconEye },
    { title: 'Blueprints', icon: IconChecklist },
    { title: 'Learn', icon: IconSun },
  ];

  const blueprintItems: NavItem[] = [
    'My Blueprints',
    'Create New',
    { label: 'Templates', tagText: 'Coming Soon', tagTone: 'info' as const },
  ];

  const learningItems: NavItem[] = [
    'Explore Courses',
    'My Learning Path',
    { label: 'Certifications', tagText: 'Coming Soon', tagTone: 'info' as const },
  ];

  return (
    <aside
      className={`hidden md:flex ${sidebarCollapsed ? 'md:w-16 lg:w-16' : 'md:w-72 lg:w-80'} flex-col border-r border-white/10 bg-slate-900/95 backdrop-blur-xl transition-[width] duration-300 ease-in-out`}
    >
      {/* Header */}
      <div
        className={`px-3 ${sidebarCollapsed ? 'py-2' : 'px-4 py-4'} flex items-center border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : 'justify-between'} sticky top-0 z-10 gap-2`}
      >
        {!sidebarCollapsed && <Brand />}
        <button
          type="button"
          onClick={() => setSidebarCollapsed((v) => !v)}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="pressable flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white"
          title={sidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          <IconSidebarToggle className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      {sidebarCollapsed ? (
        <div className="flex flex-1 flex-col items-center gap-3 overflow-y-auto py-4">
          {collapsedQuickItems.map(({ title, icon: Icon }) => (
            <button
              key={title}
              type="button"
              title={title}
              aria-label={title}
              className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition-transform duration-200 hover:scale-[1.04] hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      ) : (
        <nav className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          <NavSection
            title="Blueprints"
            items={blueprintItems}
            defaultOpen
            onItemClick={(item) => handleItemClick('Blueprints', item)}
          />
          <NavSection
            title="Learning"
            items={learningItems}
            defaultOpen
            onItemClick={(item) => handleItemClick('Learning', item)}
          />

          {/* Recent Explorations */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="font-heading px-3 py-1.5 text-sm font-bold text-[#a7dadb]">
              Recent Explorations
            </div>
            <ul className="space-y-0.5">
              {recentExplorations.map((c, idx) => (
                <li key={`${c.label}-${c.timestamp}-${idx}`}>
                  <div className="flex items-start justify-between gap-2 rounded-lg px-3 py-1.5 text-sm text-white/75">
                    <span className="min-w-0 flex-1 break-words whitespace-normal">{c.label}</span>
                    <span className="ml-3 shrink-0 text-[11px] text-white/45">
                      {new Date(c.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
              {recentExplorations.length === 0 && (
                <li>
                  <div className="px-3 py-1.5 text-[12px] text-white/50">No recent items yet</div>
                </li>
              )}
            </ul>
          </div>
        </nav>
      )}

      {/* Footer */}
      <div className="mt-auto w-full">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 px-0 py-3">
            <button
              type="button"
              title={`${getCapitalizedFirstName()}'s Profile`}
              className="pressable flex h-10 w-10 items-center justify-center rounded-full text-white/85 hover:text-white"
            >
              <UserAvatar user={user} sizeClass="w-6 h-6" textClass="text-sm font-semibold" />
            </button>
            <button
              type="button"
              title="Settings"
              className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
            >
              <IconSettings className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Logout"
              onClick={onSignOut}
              className="pressable flex h-10 w-10 items-center justify-center rounded-lg text-white/85 hover:text-white"
            >
              <IconLogout className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2 px-3 py-3">
            <button
              type="button"
              className="pressable flex w-full items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/5"
              title={`${getCapitalizedFirstName()}'s Profile`}
            >
              <UserAvatar user={user} sizeClass="w-5 h-5" />
              <span className="text-sm font-medium text-white/90">
                {getCapitalizedFirstName()}'s Profile
              </span>
            </button>
            <button
              type="button"
              className="pressable inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5"
              title="Settings"
            >
              <IconSettings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="pressable inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/85 transition hover:bg-white/5"
              title="Logout"
            >
              <IconLogout className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
        <div
          className={`border-t border-white/10 text-xs text-white/50 ${sidebarCollapsed ? 'flex items-center justify-center px-0 py-2' : 'px-4 py-3'}`}
        >
          {sidebarCollapsed ? '❤️' : 'Made with ❤️ for better education'}
        </div>
      </div>
    </aside>
  );
}
