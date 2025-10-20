/**
 * Focus Mode
 * Distraction-free reading experience
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Type,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Palette,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  glassCard,
  glassPanel,
  itemAnimations,
  microInteractions,
  cn,
  typographyPresets,
  componentStyles,
} from '@/lib/design-system';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface FocusModeProps {
  markdown: string;
  sections: Section[];
  pinnedSections: string[];
}

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
type FontFamily = 'sans' | 'serif' | 'mono';
type TextAlign = 'left' | 'center' | 'justify';
type Theme = 'light' | 'dark' | 'sepia';

interface ReadingSettings {
  fontSize: FontSize;
  fontFamily: FontFamily;
  textAlign: TextAlign;
  theme: Theme;
  lineHeight: number;
  maxWidth: number;
}

export function FocusMode({
  markdown,
  sections,
  pinnedSections,
}: FocusModeProps): React.JSX.Element {
  const [showSettings, setShowSettings] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [settings, setSettings] = useState<ReadingSettings>({
    fontSize: 'medium',
    fontFamily: 'serif',
    textAlign: 'left',
    theme: 'dark',
    lineHeight: 1.8,
    maxWidth: 720,
  });

  // Filter to pinned sections if any exist
  const displaySections =
    pinnedSections.length > 0 ? sections.filter((s) => pinnedSections.includes(s.id)) : sections;

  // Extract content for current section
  const sectionContent = displaySections[currentSection];

  // Keyboard shortcuts
  useKeyboardShortcuts({
    up: () => navigateSection(-1),
    down: () => navigateSection(1),
    'cmd+up': () => changeFontSize(1),
    'cmd+down': () => changeFontSize(-1),
    s: () => setShowSettings(!showSettings),
    escape: () => setShowSettings(false),
  });

  function navigateSection(direction: number) {
    const newIndex = currentSection + direction;
    if (newIndex >= 0 && newIndex < displaySections.length) {
      setCurrentSection(newIndex);
    }
  }

  function changeFontSize(direction: number) {
    const sizes: FontSize[] = ['small', 'medium', 'large', 'xlarge'];
    const currentIndex = sizes.indexOf(settings.fontSize);
    const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + direction));
    setSettings({ ...settings, fontSize: sizes[newIndex] });
  }

  // Font size classes
  const fontSizeClasses = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
    xlarge: 'text-2xl',
  };

  // Font family classes
  const fontFamilyClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Theme styles
  const themeStyles = {
    light: {
      background: 'bg-white',
      text: 'text-gray-900',
      muted: 'text-gray-600',
    },
    dark: {
      background: 'bg-background',
      text: 'text-foreground',
      muted: 'text-text-secondary',
    },
    sepia: {
      background: 'bg-[#f4f1ea]',
      text: 'text-[#5c4b37]',
      muted: 'text-[#8b7355]',
    },
  };

  const currentTheme = themeStyles[settings.theme];

  return (
    <div
      className={cn(
        'relative min-h-screen transition-colors duration-500',
        currentTheme.background
      )}
    >
      {/* Focus content */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <motion.article
          key={currentSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ maxWidth: settings.maxWidth }}
          className={cn(
            'w-full',
            fontSizeClasses[settings.fontSize],
            fontFamilyClasses[settings.fontFamily],
            currentTheme.text
          )}
        >
          {/* Section indicator */}
          {displaySections.length > 1 && (
            <div className={cn('mb-8 text-center', currentTheme.muted)}>
              <span className="text-sm">
                Section {currentSection + 1} of {displaySections.length}
              </span>
            </div>
          )}

          {/* Content */}
          <div
            style={{
              lineHeight: settings.lineHeight,
              textAlign: settings.textAlign,
            }}
          >
            <h1
              className={cn(
                'mb-8 text-3xl font-bold',
                settings.fontFamily === 'serif' && typographyPresets.heroTitle
              )}
            >
              {sectionContent?.title || 'Focus Reading'}
            </h1>

            <div
              className={cn(
                'prose max-w-none',
                settings.theme === 'dark' && 'prose-invert',
                settings.theme === 'sepia' && 'prose-sepia'
              )}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children }) => <p className="mb-6">{children}</p>,
                  h1: ({ children }) => (
                    <h1 className="mt-12 mb-6 text-2xl font-bold">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-10 mb-4 text-xl font-semibold">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-8 mb-3 text-lg font-medium">{children}</h3>
                  ),
                  ul: ({ children }) => <ul className="mb-6 list-disc pl-6">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-6 list-decimal pl-6">{children}</ol>,
                  li: ({ children }) => <li className="mb-2">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote
                      className={cn(
                        'my-6 border-l-4 pl-6 italic',
                        settings.theme === 'dark' ? 'border-primary' : 'border-gray-300'
                      )}
                    >
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>

          {/* Navigation controls */}
          {displaySections.length > 1 && (
            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={() => navigateSection(-1)}
                disabled={currentSection === 0}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  currentTheme.muted,
                  'hover:opacity-70 disabled:opacity-30'
                )}
              >
                <ChevronUp className="h-4 w-4" />
                Previous
              </button>

              <button
                onClick={() => navigateSection(1)}
                disabled={currentSection === displaySections.length - 1}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  currentTheme.muted,
                  'hover:opacity-70 disabled:opacity-30'
                )}
              >
                Next
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          )}
        </motion.article>
      </div>

      {/* Settings button */}
      <motion.button
        {...microInteractions.buttonHover}
        onClick={() => setShowSettings(!showSettings)}
        className={cn(
          'fixed right-6 bottom-6 z-40',
          'flex h-14 w-14 items-center justify-center rounded-full',
          glassCard.base,
          glassCard.hover,
          settings.theme === 'light' && 'bg-gray-100 hover:bg-gray-200',
          settings.theme === 'sepia' && 'bg-[#e8e5de] hover:bg-[#ddd9ce]'
        )}
      >
        <Settings className="h-6 w-6" />
      </motion.button>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              glassPanel.floating,
              'fixed right-6 bottom-24 z-50 w-80 rounded-2xl p-6',
              elevation.xl
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-foreground font-semibold">Reading Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-text-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Font Size */}
            <div className="mb-6">
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Font Size
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeFontSize(-1)}
                  className={cn(
                    componentStyles.button.base,
                    componentStyles.button.variants.ghost,
                    componentStyles.button.sizes.sm
                  )}
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <div className="flex-1 text-center text-sm">{settings.fontSize}</div>
                <button
                  onClick={() => changeFontSize(1)}
                  className={cn(
                    componentStyles.button.base,
                    componentStyles.button.variants.ghost,
                    componentStyles.button.sizes.sm
                  )}
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6">
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Font Family
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['sans', 'serif', 'mono'] as FontFamily[]).map((font) => (
                  <button
                    key={font}
                    onClick={() => setSettings({ ...settings, fontFamily: font })}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm capitalize',
                      settings.fontFamily === font
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-secondary hover:text-foreground bg-white/5'
                    )}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Align */}
            <div className="mb-6">
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Text Align
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSettings({ ...settings, textAlign: 'left' })}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    settings.textAlign === 'left'
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-foreground bg-white/5'
                  )}
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSettings({ ...settings, textAlign: 'center' })}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    settings.textAlign === 'center'
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-foreground bg-white/5'
                  )}
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSettings({ ...settings, textAlign: 'justify' })}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    settings.textAlign === 'justify'
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-foreground bg-white/5'
                  )}
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <label className="text-text-secondary mb-2 block text-sm font-medium">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSettings({ ...settings, theme: 'light' })}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    settings.theme === 'light'
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-foreground bg-white/5'
                  )}
                >
                  <Sun className="h-4 w-4" />
                  Light
                </button>
                <button
                  onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    settings.theme === 'dark'
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-foreground bg-white/5'
                  )}
                >
                  <Moon className="h-4 w-4" />
                  Dark
                </button>
                <button
                  onClick={() => setSettings({ ...settings, theme: 'sepia' })}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
                    settings.theme === 'sepia'
                      ? 'bg-primary/20 text-primary'
                      : 'text-text-secondary hover:text-foreground bg-white/5'
                  )}
                >
                  <Palette className="h-4 w-4" />
                  Sepia
                </button>
              </div>
            </div>

            {/* Line Height */}
            <div className="mb-6">
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Line Height: {settings.lineHeight}
              </label>
              <input
                type="range"
                min="1.2"
                max="2.4"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) =>
                  setSettings({ ...settings, lineHeight: parseFloat(e.target.value) })
                }
                className="w-full"
              />
            </div>

            {/* Max Width */}
            <div>
              <label className="text-text-secondary mb-2 block text-sm font-medium">
                Max Width: {settings.maxWidth}px
              </label>
              <input
                type="range"
                min="480"
                max="960"
                step="40"
                value={settings.maxWidth}
                onChange={(e) => setSettings({ ...settings, maxWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
