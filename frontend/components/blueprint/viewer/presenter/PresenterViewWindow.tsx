/**
 * Presenter View Window
 * Full-featured presenter display with notes, drawing, and laser pointer
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Clock, Timer, Eye } from 'lucide-react';
import { RichTextNotesEditor } from './RichTextNotesEditor';
import { PresenterToolbar, type PresenterTool, type DrawingSettings } from './PresenterToolbar';
import { cn } from '@/lib/design-system';

interface SlideData {
  id: string;
  title: string;
  notes: string;
  colorTheme: {
    primary: string;
    light: string;
    dark: string;
    bg: string;
    border: string;
    glow: string;
  };
}

interface PresenterViewWindowProps {
  blueprintData: any;
  slidesData?: SlideData[];
  currentSlide: number;
  totalSlides: number;
  onSlideChange: (slide: number) => void;
  onClose?: () => void;
}

export function PresenterViewWindow({
  blueprintData,
  slidesData = [],
  currentSlide,
  totalSlides,
  onSlideChange,
  onClose,
}: PresenterViewWindowProps): React.JSX.Element {
  // Initialize notes from slidesData
  const [notes, setNotes] = useState<Record<number, string>>(() => {
    const initialNotes: Record<number, string> = {};
    slidesData.forEach((slide, index) => {
      if (slide.notes) {
        initialNotes[index] = slide.notes;
      }
    });
    return initialNotes;
  });

  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showNextSlide, setShowNextSlide] = useState(true);
  const [showTimer, setShowTimer] = useState(true);
  const [showSlideChangeNotification, setShowSlideChangeNotification] = useState(false);
  const [previousSlide, setPreviousSlide] = useState(currentSlide);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Drawing tools state
  const [activeTool, setActiveTool] = useState<PresenterTool>('none');
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    color: '#A7DADB',
    size: 3,
    opacity: 1,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Send tool state changes to main window
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage(
        {
          type: 'PRESENTER_TOOL_CHANGE',
          tool: activeTool,
          settings: drawingSettings,
        },
        window.location.origin
      );
    }
  }, [activeTool, drawingSettings]);

  // Show notification when slide changes
  useEffect(() => {
    if (previousSlide !== currentSlide && previousSlide !== -1) {
      setShowSlideChangeNotification(true);
      const timer = setTimeout(() => {
        setShowSlideChangeNotification(false);
      }, 2000);
      setPreviousSlide(currentSlide);
      return () => clearTimeout(timer);
    }
    setPreviousSlide(currentSlide);
  }, [currentSlide]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  // Format time
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Navigation
  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      onSlideChange(currentSlide - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      onSlideChange(currentSlide + 1);
    }
  };

  // Send commands to main window
  const sendToMainWindow = (type: string, data?: any) => {
    if (window.opener) {
      window.opener.postMessage({ type, ...data }, window.location.origin);
    }
  };

  // Keyboard shortcuts (disabled when editing notes)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Disable shortcuts when user is editing notes
      if (isEditingNotes) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 't' || e.key === 'T') {
        setShowTimer(!showTimer);
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNextSlide(!showNextSlide);
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveTool(activeTool === 'laser' ? 'none' : 'laser');
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveTool(activeTool === 'pen' ? 'none' : 'pen');
      } else if (e.key === 'h' || e.key === 'H') {
        setActiveTool(activeTool === 'highlighter' ? 'none' : 'highlighter');
      } else if (e.key === 'e' || e.key === 'E') {
        setActiveTool(activeTool === 'eraser' ? 'none' : 'eraser');
      } else if (e.key === 'g' || e.key === 'G') {
        sendToMainWindow('TOGGLE_GRID');
      } else if (e.key === 'f' || e.key === 'F') {
        sendToMainWindow('TOGGLE_FULLSCREEN');
      } else if (e.key === 'Escape') {
        if (activeTool !== 'none') {
          setActiveTool('none');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, totalSlides, showTimer, showNextSlide, isEditingNotes, activeTool]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-[#020c1b] via-[#0d1b2a] to-[#020c1b]">
      {/* Premium Header with Enhanced Glassmorphism */}
      <header className="glass-card-morphic relative border-b border-white/10 px-8 py-5 shadow-2xl">
        {/* Ambient gradient overlay */}
        <div className="from-primary/5 to-secondary/5 pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Brand Icon with Glow */}
            <div className="flex items-center gap-3">
              <div className="from-primary/20 to-primary/5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg ring-1 ring-white/10">
                <Monitor className="text-primary h-5 w-5 drop-shadow-[0_0_8px_rgba(167,218,219,0.4)]" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold tracking-tight text-white">
                  Presenter View
                </h1>
                <p className="text-text-secondary text-xs">SmartSlate Polaris</p>
              </div>
            </div>

            {/* Enhanced Slide Counter */}
            <div className="glass-card group hover:border-primary/30 relative overflow-hidden rounded-2xl border border-white/10 px-5 py-3 shadow-lg transition-all hover:shadow-xl">
              <div className="from-primary/5 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <span className="text-text-secondary text-xs font-medium tracking-wider uppercase">
                  Slide
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-primary text-3xl font-bold drop-shadow-[0_0_12px_rgba(167,218,219,0.3)]">
                    {currentSlide + 1}
                  </span>
                  <span className="text-text-secondary/60 text-lg">/</span>
                  <span className="text-text-secondary text-xl font-semibold">{totalSlides}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Timer Section */}
          {showTimer && (
            <div className="flex items-center gap-4">
              {/* Timer Controls */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimerRunning(!timerRunning)}
                className="glass-card group hover:border-secondary/40 relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 shadow-lg transition-all hover:shadow-xl"
                aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
              >
                <div className="from-secondary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex h-full items-center justify-center">
                  <Timer
                    className={cn(
                      'h-5 w-5 transition-colors',
                      timerRunning ? 'text-secondary' : 'text-text-secondary'
                    )}
                  />
                </div>
              </motion.button>

              {/* Enhanced Timer Display */}
              <div className="glass-card group relative overflow-hidden rounded-2xl border border-white/10 px-6 py-3 shadow-xl">
                <div className="from-primary/5 to-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent" />
                <div className="relative flex items-center gap-3">
                  <Clock className="text-primary h-5 w-5 drop-shadow-[0_0_8px_rgba(167,218,219,0.4)]" />
                  <span className="font-heading text-2xl font-bold tracking-tight text-white">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
              </div>

              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setElapsedTime(0)}
                className="glass-card group hover:border-secondary/40 relative overflow-hidden rounded-xl border border-white/10 px-4 py-2.5 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="from-secondary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="text-text-secondary group-hover:text-secondary relative text-sm font-semibold">
                  Reset
                </span>
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-6 overflow-hidden p-6">
        {/* Notes & Next Slide Panel */}
        <div className="flex w-full flex-1 flex-col gap-6">
          {/* Enhanced Notes Editor */}
          <div className="glass-card relative flex-1 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex h-full flex-col">
              {/* Premium Notes Header */}
              <div className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="from-primary/20 to-primary/5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-white/10">
                      <svg
                        className="text-primary h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">Speaker Notes</h3>
                      {slidesData[currentSlide] && (
                        <p className="text-text-secondary text-xs">
                          {slidesData[currentSlide].title}
                        </p>
                      )}
                    </div>
                    {isEditingNotes && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card border-secondary/30 flex items-center gap-2 rounded-full border px-3 py-1.5"
                      >
                        <span className="bg-secondary h-2 w-2 animate-pulse rounded-full shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                        <span className="text-secondary text-xs font-semibold">Editing</span>
                      </motion.span>
                    )}
                  </div>
                  <motion.div
                    key={currentSlide}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2 shadow-lg"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full shadow-lg"
                      style={{
                        backgroundColor: slidesData[currentSlide]?.colorTheme.primary || '#A7DADB',
                        boxShadow: `0 0 12px ${slidesData[currentSlide]?.colorTheme.primary || '#A7DADB'}80`,
                      }}
                    />
                    <span className="text-primary text-xs font-bold">
                      Slide {currentSlide + 1}/{totalSlides}
                    </span>
                  </motion.div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <RichTextNotesEditor
                    content={notes[currentSlide] || ''}
                    onChange={(content) => {
                      setNotes((prev) => ({
                        ...prev,
                        [currentSlide]: content,
                      }));
                    }}
                    onFocus={() => setIsEditingNotes(true)}
                    onBlur={() => setIsEditingNotes(false)}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Enhanced Next Slide Preview */}
          {showNextSlide && currentSlide < totalSlides - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card relative h-48 overflow-hidden rounded-3xl border border-white/10 shadow-xl"
            >
              <div className="flex h-full flex-col">
                {/* Next Slide Header */}
                <div className="relative border-b border-white/10 bg-gradient-to-r from-white/5 to-transparent px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="text-primary h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                      <h3 className="font-heading text-text-secondary text-sm font-bold">
                        Up Next
                      </h3>
                    </div>
                    <span className="glass-card text-text-secondary rounded-full border border-white/10 px-3 py-1 text-xs font-semibold">
                      Slide {currentSlide + 2}/{totalSlides}
                    </span>
                  </div>
                </div>

                {/* Next Slide Content */}
                <div className="flex flex-1 items-center justify-center p-6">
                  <div
                    className="glass-card flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 p-6 shadow-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: slidesData[currentSlide + 1]
                        ? `linear-gradient(135deg, ${slidesData[currentSlide + 1].colorTheme.primary}20, ${slidesData[currentSlide + 1].colorTheme.light}10, transparent)`
                        : 'rgba(255, 255, 255, 0.02)',
                    }}
                  >
                    {slidesData[currentSlide + 1] ? (
                      <>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold shadow-lg"
                          style={{
                            backgroundColor: slidesData[currentSlide + 1].colorTheme.primary,
                            color: 'white',
                            boxShadow: `0 0 20px ${slidesData[currentSlide + 1].colorTheme.primary}60`,
                          }}
                        >
                          {currentSlide + 2}
                        </div>
                        <div
                          className="font-heading text-center text-base leading-tight font-bold"
                          style={{
                            color: slidesData[currentSlide + 1].colorTheme.primary,
                            textShadow: `0 0 20px ${slidesData[currentSlide + 1].colorTheme.primary}40`,
                          }}
                        >
                          {slidesData[currentSlide + 1].title}
                        </div>
                      </>
                    ) : (
                      <div className="text-text-secondary text-center text-sm">
                        Next: Slide {currentSlide + 2}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{
                scale: currentSlide < totalSlides - 1 ? 1.02 : 1,
                y: currentSlide < totalSlides - 1 ? -2 : 0,
              }}
              whileTap={{ scale: currentSlide < totalSlides - 1 ? 0.98 : 1 }}
              onClick={goToNextSlide}
              disabled={currentSlide >= totalSlides - 1}
              className={cn(
                'glass-card group relative flex flex-1 items-center justify-center gap-3 overflow-hidden rounded-2xl border px-6 py-4 shadow-lg transition-all',
                currentSlide < totalSlides - 1
                  ? 'border-primary/30 hover:border-primary/50 hover:shadow-xl'
                  : 'cursor-not-allowed border-white/5 opacity-40'
              )}
            >
              {currentSlide < totalSlides - 1 && (
                <div className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              )}
              <Eye
                className={cn(
                  'relative h-5 w-5',
                  currentSlide < totalSlides - 1 ? 'text-primary' : 'text-text-disabled'
                )}
              />
              <span
                className={cn(
                  'font-heading relative text-sm font-bold',
                  currentSlide < totalSlides - 1 ? 'text-primary' : 'text-text-disabled'
                )}
              >
                Next Slide
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTimer(!showTimer)}
              className={cn(
                'glass-card group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl border px-6 py-4 shadow-lg transition-all',
                showTimer
                  ? 'border-secondary/40 hover:border-secondary/60 hover:shadow-xl'
                  : 'hover:border-secondary/30 border-white/10 hover:shadow-xl'
              )}
            >
              <div
                className={cn(
                  'from-secondary/10 absolute inset-0 bg-gradient-to-br to-transparent transition-opacity',
                  showTimer ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
              />
              <Clock
                className={cn(
                  'relative h-5 w-5 transition-colors',
                  showTimer ? 'text-secondary' : 'text-text-secondary group-hover:text-secondary'
                )}
              />
              <span
                className={cn(
                  'font-heading relative text-sm font-bold transition-colors',
                  showTimer ? 'text-secondary' : 'text-text-secondary group-hover:text-secondary'
                )}
              >
                Timer
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Presentation Toolbar */}
      <PresenterToolbar
        activeTool={activeTool}
        drawingSettings={drawingSettings}
        onToolChange={setActiveTool}
        onSettingsChange={setDrawingSettings}
        onPrevSlide={goToPrevSlide}
        onNextSlide={goToNextSlide}
        canGoPrev={currentSlide > 0}
        canGoNext={currentSlide < totalSlides - 1}
      />

      {/* Enhanced Slide Change Notification */}
      <AnimatePresence>
        {showSlideChangeNotification && slidesData[currentSlide] && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-28 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="glass-card-morphic relative overflow-hidden rounded-2xl border border-white/20 shadow-2xl">
              {/* Ambient glow effect */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(circle at center, ${slidesData[currentSlide].colorTheme.primary}15, transparent 70%)`,
                }}
              />

              <div className="relative flex items-center gap-4 px-8 py-4">
                {/* Pulsing indicator */}
                <div className="relative">
                  <div
                    className="h-4 w-4 animate-pulse rounded-full shadow-lg"
                    style={{
                      backgroundColor: slidesData[currentSlide].colorTheme.primary,
                      boxShadow: `0 0 20px ${slidesData[currentSlide].colorTheme.primary}80`,
                    }}
                  />
                  <div
                    className="absolute inset-0 animate-ping rounded-full opacity-50"
                    style={{
                      backgroundColor: slidesData[currentSlide].colorTheme.primary,
                    }}
                  />
                </div>

                <div>
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                      Now Viewing
                    </span>
                  </div>
                  <div
                    className="font-heading text-base font-bold"
                    style={{
                      color: slidesData[currentSlide].colorTheme.primary,
                      textShadow: `0 0 20px ${slidesData[currentSlide].colorTheme.primary}40`,
                    }}
                  >
                    Slide {currentSlide + 1}: {slidesData[currentSlide].title}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
