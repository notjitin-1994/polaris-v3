'use client';

import { memo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Brand } from './Brand';
import { UserAvatar } from './UserAvatar';
import { IconSidebarToggle, IconLogout } from './icons';
import { useAuth } from '@/contexts/AuthContext';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
  className?: string;
}

export const Header = memo(function Header({
  title,
  subtitle,
  showMobileMenu = false,
  onMobileMenuToggle,
  className = '',
}: HeaderProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  function getFirstName(): string {
    if (!user) return 'User';
    const rawName =
      (user.user_metadata?.first_name as string) ||
      (user.user_metadata?.name as string) ||
      (user.user_metadata?.full_name as string) ||
      (user.email as string) ||
      'User';
    return rawName.toString().trim().split(' ')[0];
  }

  function getPageInfo() {
    switch (pathname) {
      case '/dashboard':
        return {
          title: title || `Welcome back, ${getFirstName()}`,
          subtitle: subtitle || 'Track your learning progress and explore new opportunities',
        };
      case '/static-wizard':
        return {
          title: title || 'Learning Blueprint Wizard',
          subtitle: subtitle || 'Create personalized learning experiences with AI guidance',
        };
      case '/dynamic-wizard':
        return {
          title: title || 'Dynamic Learning Path',
          subtitle: subtitle || 'Adaptive learning tailored to your responses',
        };
      case '/settings':
        return {
          title: title || 'Settings',
          subtitle: subtitle || 'Manage your account and preferences',
        };
      default:
        return {
          title: title || 'SmartSlate',
          subtitle: subtitle || 'Your learning companion',
        };
    }
  }

  const pageInfo = getPageInfo();

  async function handleLogout() {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <motion.header
      className={`bg-background/80 sticky top-0 z-10 border-b border-neutral-200 backdrop-blur-xl ${className}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative mx-auto max-w-7xl px-4 py-3 sm:py-4">
        {/* Decorative gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-br from-blue-400/10 via-purple-400/5 to-transparent blur-2xl"
        />

        <div className="relative">
          {/* Mobile header */}
          <div className="flex items-center gap-2 md:hidden">
            <Brand size="lg" />
            <div className="ml-auto inline-flex items-center gap-2">
              <DarkModeToggle />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hover:bg-foreground/5 inline-flex h-9 w-9 items-center justify-center rounded-full transition"
                  aria-label="User menu"
                >
                  <UserAvatar user={user} sizeClass="w-8 h-8" />
                </button>

                {/* Mobile user menu */}
                {showUserMenu && (
                  <div className="bg-paper absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-neutral-200 shadow-xl">
                    <div className="p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-text-secondary hover:bg-foreground/5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
                      >
                        <IconLogout className="h-4 w-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {onMobileMenuToggle && (
                <button
                  type="button"
                  onClick={onMobileMenuToggle}
                  aria-label="Open menu"
                  className="bg-background/50 text-text-secondary hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 transition"
                >
                  <IconSidebarToggle className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Desktop header content */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                    {pageInfo.title}
                  </h1>
                  <p className="text-text-secondary mt-2 max-w-3xl text-sm sm:text-base">
                    {pageInfo.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <DarkModeToggle />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="hover:bg-foreground/5 flex items-center gap-2 rounded-lg px-3 py-2 transition"
                      aria-label="User menu"
                    >
                      <UserAvatar user={user} sizeClass="w-8 h-8" />
                      <span className="text-text-secondary text-sm font-medium">
                        {getFirstName()}
                      </span>
                    </button>

                    {/* Desktop user menu */}
                    {showUserMenu && (
                      <div className="bg-paper absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-neutral-200 shadow-xl">
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="text-text-secondary hover:bg-foreground/5 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition"
                          >
                            <IconLogout className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Decorative line */}
              <div
                aria-hidden="true"
                className="from-primary mt-3 h-px w-16 bg-gradient-to-r to-transparent"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
          aria-hidden="true"
        />
      )}
    </motion.header>
  );
});
