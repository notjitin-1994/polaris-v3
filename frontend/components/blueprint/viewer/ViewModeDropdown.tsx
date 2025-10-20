/**
 * View Mode Dropdown Component
 * Clean, consolidated view mode switcher
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, FileText, Presentation, Focus, ChevronDown, Check } from 'lucide-react';
import { cn, glassCard, microInteractions } from '@/lib/design-system';
import type { ViewMode } from '@/store/blueprintStore';

interface ViewModeDropdownProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const VIEW_MODES = [
  {
    id: 'dashboard' as ViewMode,
    label: 'Dashboard',
    description: 'Interactive analytics view',
    icon: LayoutGrid,
  },
  {
    id: 'document' as ViewMode,
    label: 'Reading',
    description: 'Focused reading experience',
    icon: FileText,
  },
  {
    id: 'presentation' as ViewMode,
    label: 'Present',
    description: 'Full-screen slides',
    icon: Presentation,
  },
  {
    id: 'focus' as ViewMode,
    label: 'Focus',
    description: 'Distraction-free',
    icon: Focus,
  },
];

export function ViewModeDropdown({ value, onChange }: ViewModeDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const activeMode = VIEW_MODES.find((mode) => mode.id === value) || VIEW_MODES[0];
  const Icon = activeMode.icon;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => setIsOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        {...microInteractions.buttonPress}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex h-10 items-center gap-2 rounded-xl px-4',
          'text-foreground bg-white/5',
          'border border-white/10',
          'hover:border-white/20 hover:bg-white/10',
          'transition-all duration-200',
          '[&_svg]:!fill-none [&_svg_*]:!fill-none'
        )}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden text-sm font-medium sm:inline">{activeMode.label}</span>
        <ChevronDown
          className={cn(
            'text-text-secondary h-3.5 w-3.5 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'absolute top-full right-0 z-[100] mt-2 w-72',
              'rounded-2xl border border-white/20',
              'bg-[#0a1628]/98 backdrop-blur-2xl',
              'shadow-2xl shadow-black/50',
              'overflow-hidden'
            )}
          >
            {/* Gradient overlay for premium feel */}
            <div className="from-primary/[0.08] to-secondary/[0.05] pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

            <div className="relative space-y-1 p-3">
              {VIEW_MODES.map((mode, index) => {
                const ModeIcon = mode.icon;
                const isActive = value === mode.id;

                return (
                  <motion.button
                    key={mode.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    {...microInteractions.buttonPress}
                    onClick={() => {
                      onChange(mode.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl px-4 py-3',
                      'text-left transition-all duration-200',
                      'overflow-hidden',
                      '[&_svg]:!fill-none [&_svg_*]:!fill-none',
                      isActive
                        ? 'from-primary/25 to-primary/10 text-primary shadow-primary/10 bg-gradient-to-br shadow-lg'
                        : 'text-text-secondary hover:text-foreground hover:bg-white/8'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeMode"
                        className="from-primary/20 to-primary/5 border-primary/30 absolute inset-0 rounded-xl border bg-gradient-to-br"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        'relative flex h-10 w-10 items-center justify-center rounded-xl',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-primary/20 shadow-primary/20 shadow-lg'
                          : 'bg-white/5 group-hover:scale-110 group-hover:bg-white/10'
                      )}
                    >
                      <ModeIcon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive && 'drop-shadow-[0_0_8px_rgba(167,218,219,0.6)]'
                        )}
                      />
                    </div>

                    {/* Text */}
                    <div className="relative min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-2">
                        <span className={cn('text-sm font-semibold', isActive && 'text-primary')}>
                          {mode.label}
                        </span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <Check className="text-primary drop-shadow-glow h-4 w-4" />
                          </motion.div>
                        )}
                      </div>
                      <p
                        className={cn(
                          'text-xs leading-tight',
                          isActive ? 'text-primary/80' : 'text-text-disabled'
                        )}
                      >
                        {mode.description}
                      </p>
                    </div>

                    {/* Hover glow effect */}
                    {!isActive && (
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 to-transparent" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Keyboard Hint - More elegant */}
            <div className="relative border-t border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <svg
                    className="text-primary/60 h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <p className="text-text-disabled text-[11px] leading-tight">
                  Press{' '}
                  <kbd className="text-foreground mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px]">
                    1
                  </kbd>
                  -
                  <kbd className="text-foreground mx-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px]">
                    4
                  </kbd>{' '}
                  for quick switching
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
