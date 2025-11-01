'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Menu,
  X,
  Home,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Brand } from './Brand';
import { UserAvatar } from './UserAvatar';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { useGlobalHeader } from '@/contexts/GlobalHeaderContext';
import { cn } from '@/lib/utils';
import type { User } from '@supabase/supabase-js';

interface GlobalHeaderProps {
  /**
   * Override the automatic title detection
   */
  title?: string | ReactNode;

  /**
   * Override the automatic subtitle
   */
  subtitle?: string;

  /**
   * Show back button with navigation
   */
  showBackButton?: boolean;

  /**
   * Custom back button href
   */
  backHref?: string;

  /**
   * Custom back button label
   */
  backLabel?: string;

  /**
   * Custom actions to show on the right side
   */
  rightActions?: ReactNode;

  /**
   * Whether to show user menu
   */
  showUserMenu?: boolean;

  /**
   * Whether to show dark mode toggle
   */
  showDarkMode?: boolean;

  /**
   * Whether to show notifications
   */
  showNotifications?: boolean;

  /**
   * Whether to show search
   */
  showSearch?: boolean;

  /**
   * Custom className
   */
  className?: string;

  /**
   * Whether header should be sticky
   */
  sticky?: boolean;
}

export function GlobalHeader(props: GlobalHeaderProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { config } = useGlobalHeader();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Merge props with context config
  const {
    title: customTitle = config.title,
    subtitle: customSubtitle = config.subtitle,
    showBackButton = config.showBackButton ?? false,
    backHref = config.backHref ?? '/',
    backLabel = config.backLabel ?? 'Back to Dashboard',
    rightActions = config.rightActions,
    showUserMenu = config.showUserMenu ?? true,
    showDarkMode = config.showDarkMode ?? true,
    showNotifications = config.showNotifications ?? true,
    showSearch = config.showSearch ?? false,
    className = '',
    sticky = true,
  } = props;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-detect title and subtitle based on current route
  const getPageInfo = () => {
    if (customTitle) {
      return {
        title: customTitle,
        subtitle: customSubtitle || '',
      };
    }

    switch (pathname) {
      case '/':
      case '/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Welcome to your learning command center',
        };
      case '/blueprint':
        return {
          title: 'My Blueprints',
          subtitle: 'Manage and organize your learning blueprints',
        };
      case '/static-wizard':
        return {
          title: 'Blueprint Creator',
          subtitle: 'Design your learning journey step by step',
        };
      case '/pricing':
        return {
          title: 'Pricing Plans',
          subtitle: 'Choose the perfect plan for your needs',
        };
      case '/profile':
        return {
          title: 'Profile Settings',
          subtitle: 'Manage your account and preferences',
        };
      case '/settings':
        return {
          title: 'Settings',
          subtitle: 'Configure your application preferences',
        };
      case '/admin':
        return {
          title: 'Admin Dashboard',
          subtitle: 'System administration and monitoring',
        };
      default:
        if (pathname?.startsWith('/blueprint/')) {
          return {
            title: 'Blueprint Viewer',
            subtitle: 'Explore your learning blueprint',
          };
        }
        if (pathname?.startsWith('/dynamic-wizard/')) {
          return {
            title: 'Dynamic Questionnaire',
            subtitle: 'Complete your personalized assessment',
          };
        }
        return {
          title: 'SmartSlate Polaris',
          subtitle: 'Your learning companion',
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  // Get user's first name
  const getFirstName = () => {
    if (profile?.first_name) return profile.first_name;
    if (!user) return 'User';
    const rawName =
      (user.user_metadata?.first_name as string) ||
      (user.user_metadata?.name as string) ||
      (user.user_metadata?.full_name as string) ||
      (user.email as string) ||
      'User';
    return rawName.toString().trim().split(' ')[0];
  };

  // Navigation items for mobile menu
  const navItems = [
    { label: 'Dashboard', href: '/', icon: Home },
    { label: 'My Blueprints', href: '/blueprints', icon: FileText },
    { label: 'Create New', href: '/static-wizard', icon: Plus },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      <header
        className={cn(
          'relative z-50 w-full border-b transition-all duration-300',
          sticky && 'sticky top-0',
          scrolled ? 'bg-background/95 backdrop-blur-md border-border/50' : 'bg-background border-border/30',
          className
        )}
      >
        <div className="relative">
          {/* Main Header Content */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* Left Side: Logo/Back Button + Title */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Logo or Back Button */}
                {showBackButton ? (
                  <Link
                    href={backHref}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">{backLabel}</span>
                  </Link>
                ) : (
                  <div className="hidden lg:block">
                    <Brand />
                  </div>
                )}

                {/* Title and Subtitle */}
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg font-semibold text-foreground truncate">
                    {typeof title === 'string' ? title : title}
                  </h1>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground truncate hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side: Actions + User Menu */}
              <div className="flex items-center gap-2">
                {/* Search (Optional) */}
                {showSearch && (
                  <button
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}

                {/* Notifications (Optional) */}
                {showNotifications && (
                  <button
                    className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                  </button>
                )}

                {/* Custom Right Actions */}
                {rightActions && <div className="flex items-center gap-2">{rightActions}</div>}

                {/* Dark Mode Toggle */}
                {showDarkMode && <DarkModeToggle />}

                {/* User Menu */}
                {showUserMenu && user && (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
                      aria-label="User menu"
                    >
                      <UserAvatar user={user} sizeClass="w-8 h-8" />
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform hidden sm:block",
                        showUserDropdown && "rotate-180"
                      )} />
                    </button>

                    {/* User Dropdown Menu */}
                    <AnimatePresence>
                      {showUserDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-56 rounded-lg border bg-background shadow-lg"
                        >
                          <div className="p-3 border-b">
                            <p className="font-semibold text-foreground">{getFirstName()}</p>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                          </div>
                          <div className="p-1">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <User className="h-4 w-4" />
                              Profile
                            </Link>
                            <Link
                              href="/settings"
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              <Settings className="h-4 w-4" />
                              Settings
                            </Link>
                            <button
                              onClick={() => {
                                setShowUserDropdown(false);
                                signOut();
                              }}
                              className="flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted text-destructive transition-colors"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Quick Create Button */}
                <Link
                  href="/static-wizard"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Create</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden border-t overflow-hidden"
              >
                <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  {user && (
                    <>
                      <div className="my-2 border-t" />
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          signOut();
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-muted text-destructive transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Click outside to close dropdowns */}
      {(showUserDropdown || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserDropdown(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
}