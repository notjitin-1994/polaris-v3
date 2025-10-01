'use client';

import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Brand } from './Brand';
import { NavSection, type NavItem } from './NavSection';
import { UserAvatar } from './UserAvatar';
import { SidebarToggleIcon } from './icons';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  className?: string;
}

export const AppLayout = memo(function AppLayout({
  children,
  headerTitle,
  headerSubtitle,
  className = '',
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const learningItems: NavItem[] = ['Explore Learning', 'My Learning', 'Dynamic Learning'];

  const architectureItems: NavItem[] = ['Explore Partnership', 'My Architecture'];

  function handleMobileNavItemClick(item: NavItem) {
    setMobileMenuOpen(false);
    // Handle navigation logic here
    const label = typeof item === 'string' ? item : item.label;
    console.log(`Navigate to: ${label}`);
  }

  return (
    <div
      className={`h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${className}`}
    >
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="h-full min-w-0 flex-1 overflow-y-auto">
          <Header
            title={headerTitle}
            subtitle={headerSubtitle}
            showMobileMenu={mobileMenuOpen}
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
          />

          {/* Page Content */}
          <div className="flex-1">{children}</div>
        </main>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              className="absolute top-0 right-0 flex h-full w-72 max-w-[85vw] flex-col border-l border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-1 py-2 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <span className="text-lg">×</span>
                </button>
                <Brand />
              </div>

              {/* Mobile Navigation */}
              <nav className="mt-3 flex-1 space-y-3 overflow-y-auto pb-6">
                <NavSection
                  title="Learning Hub"
                  items={learningItems}
                  defaultOpen
                  onItemClick={handleMobileNavItemClick}
                />
                <NavSection
                  title="Strategic Skills Architecture"
                  items={architectureItems}
                  defaultOpen
                  onItemClick={handleMobileNavItemClick}
                />
              </nav>

              {/* Mobile Menu Footer */}
              <div className="mt-auto">
                <div className="border-t border-slate-200 px-1 py-2 dark:border-slate-700">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <UserAvatar user={user} sizeClass="w-8 h-8" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {user?.user_metadata?.first_name || user?.email || 'User'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
});





