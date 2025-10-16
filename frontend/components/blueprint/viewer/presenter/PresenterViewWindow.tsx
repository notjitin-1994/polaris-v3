/**
 * Presenter View Window
 * Full-featured presenter display with notes, drawing, and laser pointer
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Monitor,
  Clock,
  Timer,
  Eye,
} from 'lucide-react';
import { RichTextNotesEditor } from './RichTextNotesEditor';
import { PresentationToolbar, type PresentationTool, type PresentationDrawingSettings } from '../PresentationToolbar';
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

export type PresenterTool = 
  | 'none' 
  | 'laser' 
  | 'pen' 
  | 'highlighter' 
  | 'eraser' 
  | 'shape';

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
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Header */}
      <header className="glass-panel border-b border-white/10 px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Presenter View</h1>
            </div>
            
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="text-sm text-text-secondary">Slide</span>
              <span className="text-xl font-bold text-primary">{currentSlide + 1}</span>
              <span className="text-sm text-text-secondary">/</span>
              <span className="text-lg text-text-secondary">{totalSlides}</span>
            </div>
          </div>

          {/* Timer */}
          {showTimer && (
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimerRunning(!timerRunning)}
                className="touch-target flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition-all hover:border-primary/50 hover:bg-primary/10"
                aria-label={timerRunning ? 'Pause timer' : 'Resume timer'}
              >
                <Timer className="h-4 w-4" />
              </motion.button>
              
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xl font-mono font-bold text-white">
                  {formatTime(elapsedTime)}
                </span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setElapsedTime(0)}
                className="touch-target rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-all hover:border-secondary/50 hover:bg-secondary/10"
              >
                Reset
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 gap-4 p-4 overflow-hidden">
        {/* Notes & Next Slide Panel */}
        <div className="flex flex-1 flex-col gap-4 w-full">
          {/* Notes Editor */}
          <div className="flex-1 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Speaker Notes
                  </h3>
                  {slidesData[currentSlide] && (
                    <span className="text-xs text-text-secondary">
                      - {slidesData[currentSlide].title}
                    </span>
                  )}
                  {isEditingNotes && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-1.5 rounded-md bg-secondary/20 px-2 py-1 text-[10px] font-medium text-secondary"
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
                      Editing
                    </motion.span>
                  )}
                </div>
                <motion.div
                  key={currentSlide}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 rounded-lg bg-primary/20 px-3 py-1.5"
                >
                  <div 
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: slidesData[currentSlide]?.colorTheme.primary || '#A7DADB'
                    }}
                  />
                  <span className="text-xs font-semibold text-primary">
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
              className="h-40 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                  <h3 className="text-xs font-semibold text-text-secondary">
                    Next Slide
                  </h3>
                  <span className="text-xs text-text-secondary">
                    {currentSlide + 2} of {totalSlides}
                  </span>
                </div>
                
                <div className="flex flex-1 items-center justify-center p-4">
                  <div 
                    className="h-full w-full rounded-lg shadow-lg flex flex-col items-center justify-center p-4"
                    style={{
                      background: slidesData[currentSlide + 1] 
                        ? `linear-gradient(135deg, ${slidesData[currentSlide + 1].colorTheme.primary}15, ${slidesData[currentSlide + 1].colorTheme.light}10, white)`
                        : 'rgb(249, 250, 251)'
                    }}
                  >
                    {slidesData[currentSlide + 1] ? (
                      <>
                        <div 
                          className="mb-2 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
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
                      <div className="text-center text-slate-600 text-sm">
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
                  : 'cursor-not-allowed border-white/10 bg-white/5 text-text-disabled'
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
                  : 'border-white/10 bg-white/5 text-text-secondary hover:border-secondary/30 hover:bg-secondary/10 hover:text-secondary'
              )}
            >
              <Clock className="h-4 w-4" />
              Timer
            </motion.button>
          </div>
        </div>
      </div>

      {/* Presentation Toolbar */}
      <PresentationToolbar
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        activeTool={activeTool}
        drawingSettings={drawingSettings}
        onToolChange={setActiveTool}
        onSettingsChange={setDrawingSettings}
        onPrevSlide={goToPrevSlide}
        onNextSlide={goToNextSlide}
        onClearDrawings={() => setActiveTool('none')}
        onPresenterView={onClose || (() => window.close())}
        onGridView={() => sendToMainWindow('TOGGLE_GRID')}
        onToggleFullscreen={() => sendToMainWindow('TOGGLE_FULLSCREEN')}
        canGoPrev={currentSlide > 0}
        canGoNext={currentSlide < totalSlides - 1}
        isFullscreen={false}
        presenterViewActive={true}
      />

      {/* Slide Change Notification */}
      <AnimatePresence>
        {showSlideChangeNotification && slidesData[currentSlide] && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div 
              className="rounded-xl px-6 py-3 shadow-2xl backdrop-blur-xl border"
              style={{
                backgroundColor: `${slidesData[currentSlide].colorTheme.bg}dd`,
                borderColor: slidesData[currentSlide].colorTheme.border,
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: slidesData[currentSlide].colorTheme.primary
                  }}
                />
                <div>
                  <div className="text-xs font-medium text-text-secondary">
                    Now viewing
                  </div>
                  <div 
                    className="text-sm font-bold"
                    style={{
                      color: slidesData[currentSlide].colorTheme.dark
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

