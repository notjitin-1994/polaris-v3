/**
 * Presenter Toolbar
 * Comprehensive toolbar with all presenter tools
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pointer,
  Pen,
  Highlighter,
  Eraser,
  Square,
  Type,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Palette,
  Settings,
  Undo,
  Redo,
} from 'lucide-react';
import type { PresenterTool, DrawingSettings } from './PresenterViewWindow';
import { cn } from '@/lib/design-system';

interface PresenterToolbarProps {
  activeTool: PresenterTool;
  drawingSettings: DrawingSettings;
  onToolChange: (tool: PresenterTool) => void;
  onSettingsChange: (settings: DrawingSettings) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
  canGoPrev: boolean;
  canGoNext: boolean;
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
  { name: 'Extra Thick', value: 12 },
];

export function PresenterToolbar({
  activeTool,
  drawingSettings,
  onToolChange,
  onSettingsChange,
  onPrevSlide,
  onNextSlide,
  canGoPrev,
  canGoNext,
}: PresenterToolbarProps): React.JSX.Element {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const ToolButton = ({
    icon: Icon,
    label,
    tool,
    shortcut,
  }: {
    icon: React.ElementType;
    label: string;
    tool: PresenterTool;
    shortcut?: string;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToolChange(tool)}
      className={cn(
        'flex h-12 w-12 flex-col items-center justify-center rounded-xl border transition-all',
        activeTool === tool
          ? 'border-primary/50 bg-primary/20 text-primary shadow-primary/20 shadow-lg'
          : 'bg-surface/50 text-text-secondary hover:border-primary/30 hover:bg-primary/10 hover:text-primary border-neutral-200/20'
      )}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <Icon className="h-5 w-5" />
      <span className="mt-0.5 text-[10px] font-medium">{label}</span>
    </motion.button>
  );

  return (
    <div className="glass-panel relative rounded-2xl border border-neutral-200/20 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onPrevSlide}
            disabled={!canGoPrev}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border transition-all',
              canGoPrev
                ? 'bg-surface/50 text-foreground hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary border-neutral-200/20'
                : 'bg-surface/30 text-text-disabled cursor-not-allowed border-neutral-200/10'
            )}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNextSlide}
            disabled={!canGoNext}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl border transition-all',
              canGoNext
                ? 'bg-surface/50 text-foreground hover:border-secondary/50 hover:bg-secondary/10 hover:text-secondary border-neutral-200/20'
                : 'bg-surface/30 text-text-disabled cursor-not-allowed border-neutral-200/10'
            )}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center gap-2">
          <ToolButton icon={Pointer} label="Laser" tool="laser" shortcut="L" />
          <ToolButton icon={Pen} label="Pen" tool="pen" shortcut="P" />
          <ToolButton icon={Highlighter} label="Highlight" tool="highlighter" shortcut="H" />
          <ToolButton icon={Eraser} label="Eraser" tool="eraser" shortcut="E" />
          <ToolButton icon={Square} label="Shape" tool="shape" />
        </div>

        {/* Tool Settings */}
        <div className="flex items-center gap-2">
          {/* Color Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowSizePicker(false);
                setShowSettings(false);
              }}
              className={cn(
                'flex h-12 items-center gap-2 rounded-xl border px-4 transition-all',
                showColorPicker
                  ? 'border-primary/50 bg-primary/20 text-primary'
                  : 'bg-surface/50 text-text-secondary hover:border-primary/30 hover:bg-primary/10 border-neutral-200/20'
              )}
            >
              <div
                className="h-5 w-5 rounded-md border-2 border-neutral-200/20"
                style={{ backgroundColor: drawingSettings.color }}
              />
              <Palette className="h-4 w-4" />
            </motion.button>

            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="bg-surface/80 absolute bottom-full left-0 z-50 mb-2 rounded-xl border border-neutral-200/20 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <h4 className="text-foreground mb-3 text-xs font-semibold">Drawing Color</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => {
                          onSettingsChange({
                            ...drawingSettings,
                            color: color.value,
                          });
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          'group relative h-10 w-10 rounded-lg border-2 transition-all hover:scale-110',
                          drawingSettings.color === color.value
                            ? 'border-primary shadow-primary/30 shadow-lg'
                            : 'border-neutral-200/20 hover:border-neutral-200/40'
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {drawingSettings.color === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white shadow-lg" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Size Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowSizePicker(!showSizePicker);
                setShowColorPicker(false);
                setShowSettings(false);
              }}
              className={cn(
                'flex h-12 items-center gap-2 rounded-xl border px-4 transition-all',
                showSizePicker
                  ? 'border-primary/50 bg-primary/20 text-primary'
                  : 'bg-surface/50 text-text-secondary hover:border-primary/30 hover:bg-primary/10 border-neutral-200/20'
              )}
            >
              <div
                className="rounded-full bg-current"
                style={{
                  width: drawingSettings.size * 2,
                  height: drawingSettings.size * 2,
                }}
              />
              <span className="text-sm font-medium">{drawingSettings.size}px</span>
            </motion.button>

            <AnimatePresence>
              {showSizePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="bg-surface/80 absolute bottom-full left-0 z-50 mb-2 rounded-xl border border-neutral-200/20 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <h4 className="text-foreground mb-3 text-xs font-semibold">Brush Size</h4>
                  <div className="flex flex-col gap-2">
                    {PRESET_SIZES.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => {
                          onSettingsChange({
                            ...drawingSettings,
                            size: size.value,
                          });
                          setShowSizePicker(false);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-4 rounded-lg border px-4 py-2 transition-all',
                          drawingSettings.size === size.value
                            ? 'border-primary/50 bg-primary/20 text-primary'
                            : 'bg-surface/50 text-text-secondary hover:border-primary/30 hover:bg-primary/10 border-neutral-200/20'
                        )}
                      >
                        <span className="text-sm font-medium">{size.name}</span>
                        <div
                          className="rounded-full bg-current"
                          style={{
                            width: size.value * 2,
                            height: size.value * 2,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Clear all drawings
              onToolChange('none');
            }}
            className="bg-surface/50 text-text-secondary flex h-12 w-12 items-center justify-center rounded-xl border border-neutral-200/20 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
            title="Clear all drawings"
          >
            <Trash2 className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
