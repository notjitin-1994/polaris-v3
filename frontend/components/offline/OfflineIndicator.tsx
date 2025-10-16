/**
 * Offline Indicator Component
 * Shows connectivity status and queued requests count
 */

'use client';

import { useOfflineQueue } from '@/lib/hooks/useOfflineQueue';
import { motion, AnimatePresence } from 'framer-motion';

export function OfflineIndicator() {
  const { isOnline, queuedCount } = useOfflineQueue();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full px-6 py-3 flex items-center gap-3 shadow-lg border border-neutral-300"
          role="alert"
          aria-live="polite"
        >
          {/* Offline icon */}
          <svg
            className="w-5 h-5 text-error"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>

          {/* Status text */}
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              You're offline
            </span>
            {queuedCount > 0 && (
              <span className="text-xs text-text-secondary">
                {queuedCount} {queuedCount === 1 ? 'change' : 'changes'} will sync when back online
              </span>
            )}
          </div>

          {/* Pulsing indicator */}
          <motion.div
            className="w-2 h-2 rounded-full bg-error"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
