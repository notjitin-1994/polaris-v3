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

export type PresenterTool = 'none' | 'laser' | 'pen' | 'highlighter' | 'eraser' | 'shape';

export interface DrawingSettings {
  color: string;
  size: number;
  opacity: number;
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
  const [activeTool, setActiveTool] = useState<PresentationTool>('none');
  const [drawingSettings, setDrawingSettings] = useState<PresentationDrawingSettings>({
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
    <div className="bg-background text-foreground flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-panel border-b border-neutral-200/20 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="text-primary h-5 w-5" />
              <h1 className="text-foreground text-lg font-bold">Presenter View</h1>
            </div>

            <div className="bg-surface/50 flex items-center gap-2 rounded-lg border border-neutral-200/20 px-3 py-1.5">
              <span className="text-text-secondary text-sm">Slide</span>
              <span className="text-primary text-xl font-bold">{currentSlide + 1}</span>
              <span className="text-text-secondary text-sm">/</span>
              <span className="text-text-secondary text-lg">{totalSlides}</span>
            </div>
          </div>

          {/* Timer */}
          {showTimer && (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimerRunning(!timerRunning)}
                className="touch-target bg-surface/50 text-foreground hover:border-primary/50 hover:bg-primary/10 flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/20 transition-all"
                aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
              >
                <Timer className="h-4 w-4" />
              </motion.button>

              <div className="bg-surface/50 flex items-center gap-2 rounded-lg border border-neutral-200/20 px-4 py-2">
                <Clock className="text-primary h-4 w-4" />
                <span className="text-foreground font-mono text-xl font-bold">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setElapsedTime(0)}
                className="touch-target bg-surface/50 text-foreground hover:border-secondary/50 hover:bg-secondary/10 rounded-lg border border-neutral-200/20 px-3 py-2 text-sm font-medium transition-all"
              >
                Reset
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Notes & Next Slide Panel */}
        <div className="flex w-full flex-1 flex-col gap-4">
          {/* Notes Editor */}
          <div className="bg-surface/30 flex-1 overflow-hidden rounded-2xl border border-neutral-200/20 backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-neutral-200/20 px-4 py-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-foreground text-sm font-semibold">Speaker Notes</h3>
                  {slidesData[currentSlide] && (
                    <span className="text-text-secondary text-xs">
                      - {slidesData[currentSlide].title}
                    </span>
                  )}
                  {isEditingNotes && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-secondary/20 text-secondary flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium"
                    >
                      <span className="bg-secondary h-1.5 w-1.5 animate-pulse rounded-full" />
                      Editing
                    </motion.span>
                  )}
                </div>
                <motion.div
                  key={currentSlide}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-primary/20 flex items-center gap-2 rounded-lg px-3 py-1.5"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: slidesData[currentSlide]?.colorTheme.primary || '#A7DADB',
                    }}
                  />
                  <span className="text-primary text-xs font-semibold">
                    Slide {currentSlide + 1} of {totalSlides}
                  </span>
                </motion.div>
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

          {/* Next Slide Preview */}
          {showNextSlide && currentSlide < totalSlides - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface/30 h-40 overflow-hidden rounded-2xl border border-neutral-200/20 backdrop-blur-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-neutral-200/20 px-4 py-2">
                  <h3 className="text-text-secondary text-xs font-semibold">Next Slide</h3>
                  <span className="text-text-secondary text-xs">
                    {currentSlide + 2} of {totalSlides}
                  </span>
                </div>

                <div className="flex flex-1 items-center justify-center p-4">
                  <div
                    className="flex h-full w-full flex-col items-center justify-center rounded-lg p-4 shadow-lg"
                    style={{
                      background: slidesData[currentSlide + 1]
                        ? `linear-gradient(135deg, ${slidesData[currentSlide + 1].colorTheme.primary}15, ${slidesData[currentSlide + 1].colorTheme.light}10, white)`
                        : 'rgb(249, 250, 251)',
                    }}
                  >
                    {slidesData[currentSlide + 1] ? (
                      <>
                        <div
                          className="mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: slidesData[currentSlide + 1].colorTheme.primary,
                            color: 'white',
                          }}
                        >
                          {currentSlide + 2}
                        </div>
                        <div
                          className="text-center text-sm font-semibold"
                          style={{ color: slidesData[currentSlide + 1].colorTheme.dark }}
                        >
                          {slidesData[currentSlide + 1].title}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-sm text-slate-600">
                        Next: Slide {currentSlide + 2}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Bottom Action Buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goToNextSlide}
              disabled={currentSlide >= totalSlides - 1}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                currentSlide < totalSlides - 1
                  ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-surface/50 text-text-disabled cursor-not-allowed border-neutral-200/20'
              )}
            >
              <Eye className="h-4 w-4" />
              Next Slide
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTimer(!showTimer)}
              className={cn(
                'flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all',
                showTimer
                  ? 'border-secondary/50 bg-secondary/20 text-secondary'
                  : 'bg-surface/50 text-text-secondary hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary border-neutral-200/20'
              )}
            >
              <Clock className="h-4 w-4" />
              Timer
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

      {/* Slide Change Notification */}
      <AnimatePresence>
        {showSlideChangeNotification && slidesData[currentSlide] && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 z-50 -translate-x-1/2"
          >
            <div className="glass-panel rounded-xl border border-neutral-200/20 px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: slidesData[currentSlide].colorTheme.primary,
                  }}
                />
                <div>
                  <div className="text-text-secondary text-xs font-medium">Now viewing</div>
                  <div className="text-foreground text-sm font-bold">
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
