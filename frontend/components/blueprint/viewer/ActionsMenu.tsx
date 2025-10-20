/**
 * Actions Menu Component
 * Consolidated Export, Share, and Settings menu
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  Download,
  Share2,
  Settings,
  FileText,
  File,
  Presentation,
  Link,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import { cn, glassCard, microInteractions } from '@/lib/design-system';

interface ActionsMenuProps {
  blueprintId: string;
  blueprintTitle: string;
  onExport?: (format: 'pdf' | 'word' | 'ppt') => void;
  onShare?: () => void;
  onSettings?: () => void;
}

export function ActionsMenu({
  blueprintId,
  blueprintTitle,
  onExport,
  onShare,
  onSettings,
}: ActionsMenuProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = () => {
      setIsOpen(false);
      setShowExportMenu(false);
      setShowShareMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Failed to copy link
    }
  };

  const handleShare = async () => {
    if (onShare) {
      await onShare();
    }
    setShowShareMenu(false);
    setIsOpen(false);
  };

  const handleExport = (format: 'pdf' | 'word' | 'ppt') => {
    if (onExport) {
      onExport(format);
    }
    setShowExportMenu(false);
    setIsOpen(false);
  };

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
          'flex h-10 w-10 items-center justify-center rounded-xl',
          'text-text-secondary hover:text-foreground',
          'transition-all duration-200 hover:bg-white/10',
          isOpen && 'text-foreground bg-white/10'
        )}
        aria-label="Actions menu"
      >
        <MoreVertical className="h-5 w-5" />
      </motion.button>

      {/* Main Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'absolute top-full right-0 z-[100] mt-2 w-64',
              'rounded-2xl border border-white/20',
              'bg-[#0a1628]/98 backdrop-blur-2xl',
              'shadow-2xl shadow-black/50',
              'overflow-hidden'
            )}
          >
            {/* Gradient overlay */}
            <div className="from-primary/[0.08] to-secondary/[0.05] pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent" />

            <div className="relative space-y-1 p-3">
              {/* Export Section */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-2.5',
                    'text-foreground text-sm font-medium',
                    'transition-all duration-200 hover:bg-white/8',
                    showExportMenu && 'bg-white/5'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Download className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Export</span>
                  <ChevronDown
                    className={cn(
                      'text-text-secondary h-4 w-4 transition-transform duration-200',
                      showExportMenu && 'rotate-180'
                    )}
                  />
                </button>

                {/* Export Submenu */}
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 ml-3 space-y-1 overflow-hidden border-l border-white/10 pl-3"
                    >
                      <button
                        onClick={() => handleExport('pdf')}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                          'text-text-secondary hover:text-foreground text-xs',
                          'transition-all duration-200 hover:bg-white/8'
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        <span>PDF Document</span>
                      </button>
                      <button
                        onClick={() => handleExport('word')}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                          'text-text-secondary hover:text-foreground text-xs',
                          'transition-all duration-200 hover:bg-white/8'
                        )}
                      >
                        <File className="h-4 w-4" />
                        <span>Word Document</span>
                      </button>
                      <button
                        onClick={() => handleExport('ppt')}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                          'text-text-secondary hover:text-foreground text-xs',
                          'transition-all duration-200 hover:bg-white/8'
                        )}
                      >
                        <Presentation className="h-4 w-4" />
                        <span>PowerPoint</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="my-1 h-px bg-white/10" />

              {/* Share Section */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-2.5',
                    'text-foreground text-sm font-medium',
                    'transition-all duration-200 hover:bg-white/8',
                    showShareMenu && 'bg-white/5'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">Share</span>
                  <ChevronDown
                    className={cn(
                      'text-text-secondary h-4 w-4 transition-transform duration-200',
                      showShareMenu && 'rotate-180'
                    )}
                  />
                </button>

                {/* Share Submenu */}
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 ml-3 space-y-1 overflow-hidden border-l border-white/10 pl-3"
                    >
                      <button
                        onClick={handleCopyLink}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                          'text-xs transition-all duration-200',
                          copied
                            ? 'text-success bg-success/10'
                            : 'text-text-secondary hover:text-foreground hover:bg-white/8'
                        )}
                      >
                        {copied ? (
                          <>
                            <Check className="text-success h-4 w-4" />
                            <span className="font-medium">Link copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleShare}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2',
                          'text-text-secondary hover:text-foreground text-xs',
                          'transition-all duration-200 hover:bg-white/8'
                        )}
                      >
                        <Link className="h-4 w-4" />
                        <span>Generate Share Link</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="my-1 h-px bg-white/10" />

              {/* Settings */}
              <button
                onClick={() => {
                  if (onSettings) onSettings();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-2.5',
                  'text-text-secondary hover:text-foreground text-sm font-medium',
                  'transition-all duration-200 hover:bg-white/8'
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                  <Settings className="h-4 w-4" />
                </div>
                <span>Preferences</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
