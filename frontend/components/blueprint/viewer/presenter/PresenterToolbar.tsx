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
import { cn } from '@/lib/design-system';

export type PresenterTool = 'none' | 'laser' | 'pen' | 'highlighter' | 'eraser' | 'shape';

export interface DrawingSettings {
  color: string;
  size: number;
  opacity: number;
}

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
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToolChange(tool)}
      className={cn(
        'glass-card group relative flex h-16 w-16 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border shadow-lg transition-all',
        activeTool === tool
          ? 'border-primary/40 shadow-primary/20 shadow-xl'
          : 'hover:border-primary/30 border-white/10 hover:shadow-xl'
      )}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br transition-opacity',
          activeTool === tool
            ? 'from-primary/20 to-transparent opacity-100'
            : 'from-primary/10 to-transparent opacity-0 group-hover:opacity-100'
        )}
      />
      <Icon
        className={cn(
          'relative h-6 w-6 transition-all',
          activeTool === tool
            ? 'text-primary drop-shadow-[0_0_8px_rgba(167,218,219,0.4)]'
            : 'text-text-secondary group-hover:text-primary'
        )}
      />
      <span
        className={cn(
          'relative text-[10px] font-bold tracking-wide transition-colors',
          activeTool === tool ? 'text-primary' : 'text-text-disabled group-hover:text-primary'
        )}
      >
        {label}
      </span>
    </motion.button>
  );

  return (
    <div className="glass-card-morphic relative mx-6 mb-6 overflow-hidden rounded-3xl border border-white/10 p-6 shadow-2xl">
      {/* Ambient gradient background */}
      <div className="from-primary/5 to-secondary/5 pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent" />

      <div className="relative flex items-center justify-between gap-6">
        {/* Enhanced Navigation */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: canGoPrev ? 1.05 : 1, y: canGoPrev ? -2 : 0 }}
            whileTap={{ scale: canGoPrev ? 0.95 : 1 }}
            onClick={onPrevSlide}
            disabled={!canGoPrev}
            className={cn(
              'glass-card group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border shadow-lg transition-all',
              canGoPrev
                ? 'hover:border-secondary/30 border-white/10 hover:shadow-xl'
                : 'cursor-not-allowed border-white/5 opacity-30'
            )}
            aria-label="Previous slide"
          >
            {canGoPrev && (
              <div className="from-secondary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            )}
            <ChevronLeft
              className={cn(
                'relative h-7 w-7 transition-colors',
                canGoPrev ? 'text-text-secondary group-hover:text-secondary' : 'text-text-disabled'
              )}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: canGoNext ? 1.05 : 1, y: canGoNext ? -2 : 0 }}
            whileTap={{ scale: canGoNext ? 0.95 : 1 }}
            onClick={onNextSlide}
            disabled={!canGoNext}
            className={cn(
              'glass-card group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border shadow-lg transition-all',
              canGoNext
                ? 'hover:border-secondary/30 border-white/10 hover:shadow-xl'
                : 'cursor-not-allowed border-white/5 opacity-30'
            )}
            aria-label="Next slide"
          >
            {canGoNext && (
              <div className="from-secondary/10 absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            )}
            <ChevronRight
              className={cn(
                'relative h-7 w-7 transition-colors',
                canGoNext ? 'text-text-secondary group-hover:text-secondary' : 'text-text-disabled'
              )}
            />
          </motion.button>
        </div>

        {/* Enhanced Drawing Tools */}
        <div className="flex items-center gap-3">
          <div className="mr-2 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <ToolButton icon={Pointer} label="Laser" tool="laser" shortcut="L" />
          <ToolButton icon={Pen} label="Pen" tool="pen" shortcut="P" />
          <ToolButton icon={Highlighter} label="Highlight" tool="highlighter" shortcut="H" />
          <ToolButton icon={Eraser} label="Eraser" tool="eraser" shortcut="E" />
          <ToolButton icon={Square} label="Shape" tool="shape" />
          <div className="ml-2 h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
        </div>

        {/* Enhanced Tool Settings */}
        <div className="flex items-center gap-3">
          {/* Color Picker */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowSizePicker(false);
                setShowSettings(false);
              }}
              className={cn(
                'glass-card group relative flex h-14 items-center gap-3 overflow-hidden rounded-2xl border px-4 shadow-lg transition-all',
                showColorPicker
                  ? 'border-primary/40 shadow-xl'
                  : 'hover:border-primary/30 border-white/10 hover:shadow-xl'
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br transition-opacity',
                  showColorPicker
                    ? 'from-primary/20 to-transparent opacity-100'
                    : 'from-primary/10 to-transparent opacity-0 group-hover:opacity-100'
                )}
              />
              <div
                className="relative h-6 w-6 rounded-lg border-2 border-white/20 shadow-lg"
                style={{
                  backgroundColor: drawingSettings.color,
                  boxShadow: `0 0 12px ${drawingSettings.color}60`,
                }}
              />
              <Palette
                className={cn(
                  'relative h-5 w-5 transition-colors',
                  showColorPicker ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                )}
              />
            </motion.button>

            <AnimatePresence>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="glass-card-morphic absolute bottom-full left-0 z-50 mb-3 overflow-hidden rounded-2xl border border-white/20 p-5 shadow-2xl"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Palette className="text-primary h-4 w-4" />
                    <h4 className="font-heading text-sm font-bold text-white">Drawing Color</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {PRESET_COLORS.map((color) => (
                      <motion.button
                        key={color.value}
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onSettingsChange({
                            ...drawingSettings,
                            color: color.value,
                          });
                          setShowColorPicker(false);
                        }}
                        className={cn(
                          'glass-card group relative h-12 w-12 overflow-hidden rounded-xl border-2 shadow-lg transition-all',
                          drawingSettings.color === color.value
                            ? 'border-primary/60 shadow-xl'
                            : 'border-white/20 hover:border-white/40'
                        )}
                        style={{
                          backgroundColor: color.value,
                          boxShadow:
                            drawingSettings.color === color.value
                              ? `0 0 20px ${color.value}60, 0 4px 12px rgba(0,0,0,0.3)`
                              : `0 0 8px ${color.value}30`,
                        }}
                        title={color.name}
                      >
                        {drawingSettings.color === color.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <div className="h-3 w-3 rounded-full bg-white shadow-lg ring-2 ring-white/30" />
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
                setShowSettings(false);
              }}
              className={cn(
                'glass-card group relative flex h-14 items-center gap-3 overflow-hidden rounded-2xl border px-5 shadow-lg transition-all',
                showSizePicker
                  ? 'border-primary/40 shadow-xl'
                  : 'hover:border-primary/30 border-white/10 hover:shadow-xl'
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br transition-opacity',
                  showSizePicker
                    ? 'from-primary/20 to-transparent opacity-100'
                    : 'from-primary/10 to-transparent opacity-0 group-hover:opacity-100'
                )}
              />
              <div
                className="relative rounded-full bg-current shadow-lg"
                style={{
                  width: Math.min(drawingSettings.size * 2.5, 24),
                  height: Math.min(drawingSettings.size * 2.5, 24),
                  boxShadow: `0 0 8px currentColor`,
                }}
              />
              <span
                className={cn(
                  'font-heading relative text-sm font-bold transition-colors',
                  showSizePicker ? 'text-primary' : 'text-text-secondary group-hover:text-primary'
                )}
              >
                {drawingSettings.size}px
              </span>
            </motion.button>

            <AnimatePresence>
              {showSizePicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="glass-card-morphic absolute bottom-full left-0 z-50 mb-3 min-w-[200px] overflow-hidden rounded-2xl border border-white/20 p-5 shadow-2xl"
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="from-primary to-primary/50 h-4 w-4 rounded-full bg-gradient-to-br" />
                    <h4 className="font-heading text-sm font-bold text-white">Brush Size</h4>
                  </div>
                  <div className="flex flex-col gap-2.5">
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
                          'glass-card group relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border px-4 py-3 shadow-lg transition-all',
                          drawingSettings.size === size.value
                            ? 'border-primary/50 shadow-primary/20 shadow-xl'
                            : 'hover:border-primary/30 border-white/10'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute inset-0 bg-gradient-to-br transition-opacity',
                            drawingSettings.size === size.value
                              ? 'from-primary/20 to-transparent opacity-100'
                              : 'from-primary/10 to-transparent opacity-0 group-hover:opacity-100'
                          )}
                        />
                        <span
                          className={cn(
                            'font-heading relative text-sm font-bold transition-colors',
                            drawingSettings.size === size.value
                              ? 'text-primary'
                              : 'text-text-secondary group-hover:text-primary'
                          )}
                        >
                          {size.name}
                        </span>
                        <div
                          className="relative rounded-full bg-current shadow-lg"
                          style={{
                            width: size.value * 2.5,
                            height: size.value * 2.5,
                            boxShadow: `0 0 8px currentColor`,
                          }}
                        />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Clear Button */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Clear all drawings
              onToolChange('none');
            }}
            className="glass-card group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-lg transition-all hover:border-red-500/40 hover:shadow-xl"
            title="Clear all drawings"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <Trash2 className="text-text-secondary relative h-6 w-6 transition-colors group-hover:text-red-500" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
