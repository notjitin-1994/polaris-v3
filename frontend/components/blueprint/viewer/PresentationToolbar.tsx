/**
 * Presentation Toolbar
 * Modern toolbar for presentation mode with drawing tools
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Pointer,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Trash2,
  Palette,
  MonitorPlay,
  Grid,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/design-system';

export type PresentationTool = 
  | 'none' 
  | 'laser' 
  | 'pen' 
  | 'highlighter' 
  | 'eraser' 
  | 'shape';

export interface PresentationDrawingSettings {
  color: string;
  size: number;
  opacity: number;
}

interface PresentationToolbarProps {
  currentSlide: number;
  totalSlides: number;
  activeTool: PresentationTool;
  drawingSettings: PresentationDrawingSettings;
  onToolChange: (tool: PresentationTool) => void;
  onSettingsChange: (settings: PresentationDrawingSettings) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  onClearDrawings: () => void;
  onPresenterView: () => void;
  onGridView: () => void;
  onToggleFullscreen: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
  isFullscreen: boolean;
  presenterViewActive: boolean;
}

const PRESET_COLORS = [
  { name: 'Primary', value: '#A7DADB' },
  { name: 'Secondary', value: '#E6B89C' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Black', value: '#000000' },
];

const PRESET_SIZES = [
  { name: 'Thin', value: 2 },
  { name: 'Regular', value: 3 },
  { name: 'Medium', value: 5 },
  { name: 'Thick', value: 8 },
];

export function PresentationToolbar({
  currentSlide,
  totalSlides,
  activeTool,
  drawingSettings,
  onToolChange,
  onSettingsChange,
  onPrevSlide,
  onNextSlide,
  onClearDrawings,
  onPresenterView,
  onGridView,
  onToggleFullscreen,
  canGoPrev,
  canGoNext,
  isFullscreen,
  presenterViewActive,
}: PresentationToolbarProps): React.JSX.Element {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const ToolButton = ({
    icon: Icon,
    label,
    tool,
    active,
    onClick,
  }: {
    icon: React.ElementType;
    label: string;
    tool: PresentationTool;
    active: boolean;
    onClick: () => void;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'group relative flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
        active
          ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20'
          : 'border-white/10 bg-white/5 text-white/70 hover:border-primary/30 hover:bg-white/10 hover:text-white'
      )}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </motion.button>
  );

  const ActionButton = ({
    icon: Icon,
    onClick,
    title,
    active = false,
  }: {
    icon: React.ElementType;
    onClick: () => void;
    title: string;
    active?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
        active
          ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg shadow-primary/20'
          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
      )}
      title={title}
    >
      <Icon className="h-5 w-5" />
    </motion.button>
  );

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="relative mx-auto flex justify-center px-6 pb-6 pt-8">
        {/* Main toolbar container - floating pill design with glassmorphic background */}
        <div className="pointer-events-auto relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/20 px-3 py-2.5 shadow-2xl backdrop-blur-2xl">
          {/* Glassmorphic background layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10" />
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-primary/5 via-transparent to-secondary/5" />
          
          {/* Content wrapper */}
          <div className="relative z-10 flex items-center gap-2">
          {/* Left Section: Navigation */}
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrevSlide}
              disabled={!canGoPrev}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
                canGoPrev
                  ? 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
                  : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20'
              )}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextSlide}
              disabled={!canGoNext}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
                canGoNext
                  ? 'border-white/10 bg-white/5 text-white hover:border-white/20 hover:bg-white/10'
                  : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20'
              )}
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Center: Drawing Tools */}
          <div className="flex items-center gap-1.5">
            <ToolButton
              icon={Pointer}
              label="Laser"
              tool="laser"
              active={activeTool === 'laser'}
              onClick={() => onToolChange(activeTool === 'laser' ? 'none' : 'laser')}
            />
            <ToolButton
              icon={Pen}
              label="Pen"
              tool="pen"
              active={activeTool === 'pen'}
              onClick={() => onToolChange(activeTool === 'pen' ? 'none' : 'pen')}
            />
            <ToolButton
              icon={Highlighter}
              label="Highlight"
              tool="highlighter"
              active={activeTool === 'highlighter'}
              onClick={() => onToolChange(activeTool === 'highlighter' ? 'none' : 'highlighter')}
            />
            <ToolButton
              icon={Eraser}
              label="Eraser"
              tool="eraser"
              active={activeTool === 'eraser'}
              onClick={() => onToolChange(activeTool === 'eraser' ? 'none' : 'eraser')}
            />
            <ToolButton
              icon={Square}
              label="Shape"
              tool="shape"
              active={activeTool === 'shape'}
              onClick={() => onToolChange(activeTool === 'shape' ? 'none' : 'shape')}
            />
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Right: Settings */}
          <div className="flex items-center gap-1.5">
            {/* Color Picker */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowColorPicker(!showColorPicker);
                  setShowSizePicker(false);
                }}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
                  showColorPicker
                    ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg shadow-primary/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                )}
                title="Color"
              >
                <div
                  className="h-5 w-5 rounded-lg border-2 border-white/30 shadow-sm"
                  style={{ backgroundColor: drawingSettings.color }}
                />
              </motion.button>

              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-full right-0 mb-3 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/98 to-slate-950/98 p-3 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="mb-2 text-xs font-semibold text-white/90">Drawing Color</div>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESET_COLORS.map((color) => (
                        <motion.button
                          key={color.value}
                          whileHover={{ scale: 1.15, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onSettingsChange({
                              ...drawingSettings,
                              color: color.value,
                            });
                            setShowColorPicker(false);
                          }}
                          className={cn(
                            'h-9 w-9 rounded-xl border-2 transition-all',
                            drawingSettings.color === color.value
                              ? 'border-primary shadow-lg shadow-primary/30 ring-2 ring-primary/20'
                              : 'border-white/20 hover:border-white/40'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        >
                          {drawingSettings.color === color.value && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex h-full w-full items-center justify-center"
                            >
                              <div className="h-2 w-2 rounded-full bg-white shadow-lg" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Size Picker */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowSizePicker(!showSizePicker);
                  setShowColorPicker(false);
                }}
                className={cn(
                  'flex h-11 items-center gap-2 rounded-xl border px-3 transition-all',
                  showSizePicker
                    ? 'border-primary/50 bg-gradient-to-br from-primary/20 to-primary/10 text-white shadow-lg shadow-primary/20'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                )}
                title="Brush Size"
              >
                <div
                  className="rounded-full bg-white shadow-sm"
                  style={{
                    width: Math.min(drawingSettings.size * 2, 16),
                    height: Math.min(drawingSettings.size * 2, 16),
                  }}
                />
                <span className="text-xs font-medium">{drawingSettings.size}px</span>
              </motion.button>

              <AnimatePresence>
                {showSizePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute bottom-full right-0 mb-3 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/98 to-slate-950/98 p-3 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="mb-2 text-xs font-semibold text-white/90">Brush Size</div>
                    <div className="flex flex-col gap-1.5">
                      {PRESET_SIZES.map((size) => (
                        <motion.button
                          key={size.value}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onSettingsChange({
                              ...drawingSettings,
                              size: size.value,
                            });
                            setShowSizePicker(false);
                          }}
                          className={cn(
                            'flex items-center justify-between gap-4 rounded-xl border px-3 py-2.5 transition-all',
                            drawingSettings.size === size.value
                              ? 'border-primary/50 bg-gradient-to-r from-primary/20 to-primary/10 text-white shadow-md'
                              : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          <span className="text-sm font-medium">{size.name}</span>
                          <div
                            className="rounded-full bg-white shadow-sm"
                            style={{
                              width: size.value * 2,
                              height: size.value * 2,
                            }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Clear Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearDrawings}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
              title="Clear all drawings"
            >
              <Trash2 className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/10" />

          {/* Right Section: View Controls */}
          <div className="flex items-center gap-1.5">
            {/* Presenter View Button */}
            <ActionButton
              icon={MonitorPlay}
              onClick={onPresenterView}
              title="Presenter View (N)"
              active={presenterViewActive}
            />

            {/* Grid View Button */}
            <ActionButton
              icon={Grid}
              onClick={onGridView}
              title="Slide Overview (G)"
            />

            {/* Fullscreen Button */}
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleFullscreen}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border transition-all',
                isFullscreen
                  ? 'border-secondary/50 bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary shadow-lg shadow-secondary/20'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10 hover:text-white'
              )}
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </motion.button>
          </div>
          </div>
          {/* End content wrapper */}
        </div>
      </div>
    </motion.div>
  );
}

