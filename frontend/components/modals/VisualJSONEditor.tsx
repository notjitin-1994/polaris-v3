'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Code2, ChevronDown, ChevronRight, Type, List, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VisualJSONEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (editedJSON: unknown) => Promise<void>;
  sectionTitle: string;
  sectionData: unknown;
}

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/**
 * VisualJSONEditor Component
 *
 * A brand-aligned visual editor for JSON data.
 * Features:
 * - Tree-like structure display
 * - Read-only keys (structure protected)
 * - Editable values only (content between "")
 * - Collapsible nested objects/arrays
 * - Type-aware inputs (text, number, textarea)
 */
export function VisualJSONEditor({
  isOpen,
  onClose,
  onSave,
  sectionTitle,
  sectionData,
}: VisualJSONEditorProps): React.JSX.Element {
  const [editableData, setEditableData] = useState<JsonValue>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize editable data when modal opens or section data changes
  useEffect(() => {
    if (isOpen && sectionData) {
      try {
        // Deep clone the data to avoid mutations
        const cloned = JSON.parse(JSON.stringify(sectionData));
        setEditableData(cloned);
        setError(null);
      } catch (err) {
        console.error('Error cloning section data:', err);
        setError('Failed to load section data');
        setEditableData(null);
      }
    }
  }, [isOpen, sectionData]);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onSave(editableData);
      onClose();
    } catch (err) {
      console.error('Error saving changes:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  // Update a value at a specific path in the data structure
  const updateValue = (path: (string | number)[], newValue: JsonValue) => {
    setEditableData((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      let current: any = cloned;

      // Navigate to the parent of the target
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      // Update the target value
      current[path[path.length - 1]] = newValue;

      return cloned;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl border-0 bg-transparent p-0 shadow-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
              className="glass-card relative flex max-h-[90vh] flex-col overflow-hidden"
            >
              {/* Animated background glow */}
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="bg-primary/20 absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full blur-3xl"
                />
              </div>

              {/* Header */}
              <div className="flex-shrink-0 border-b border-white/10 bg-white/5 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="from-primary via-primary-accent-light to-primary-accent flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md">
                      <Code2 className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <DialogTitle className="text-foreground text-xl font-bold">
                        Edit Section
                      </DialogTitle>
                      <DialogDescription className="text-text-secondary text-sm">
                        {sectionTitle}
                      </DialogDescription>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="pressable inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white/80 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {error ? (
                  <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                    <span>{error}</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <JsonTreeNode data={editableData} path={[]} onUpdate={updateValue} level={0} />
                  </div>
                )}
              </div>

              {/* Footer - Actions */}
              <div className="flex-shrink-0 border-t border-white/10 bg-white/5 px-6 py-4">
                <div className="flex justify-end gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={isLoading}
                    className="text-foreground border-white/10 bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className={cn(
                      'min-w-32',
                      'from-primary to-primary-accent-light bg-gradient-to-r',
                      'font-semibold text-black',
                      'hover:shadow-primary/30 hover:shadow-lg',
                      'transition-all duration-300',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/**
 * JsonTreeNode Component
 * Renders a single node in the JSON tree with collapsible children
 */
interface JsonTreeNodeProps {
  data: JsonValue;
  path: (string | number)[];
  onUpdate: (path: (string | number)[], newValue: JsonValue) => void;
  level: number;
  propertyKey?: string;
}

function JsonTreeNode({ data, path, onUpdate, level, propertyKey }: JsonTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const indent = level * 20;

  // Primitive value (string, number, boolean, null)
  if (data === null || typeof data !== 'object') {
    return (
      <div className="flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
        {propertyKey && (
          <span className="text-primary font-mono text-sm font-semibold">{propertyKey}:</span>
        )}
        <PrimitiveEditor value={data} onChange={(newValue) => onUpdate(path, newValue)} />
      </div>
    );
  }

  // Array
  if (Array.isArray(data)) {
    return (
      <div style={{ paddingLeft: `${indent}px` }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-white/5"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-white/50" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white/50" />
          )}
          {propertyKey && (
            <span className="text-primary font-mono text-sm font-semibold">{propertyKey}:</span>
          )}
          <List className="h-4 w-4 text-yellow-400" />
          <span className="font-mono text-sm text-white/70">Array[{data.length}]</span>
        </button>

        {isExpanded && (
          <div className="mt-1 space-y-1">
            {data.map((item, index) => (
              <JsonTreeNode
                key={index}
                data={item}
                path={[...path, index]}
                onUpdate={onUpdate}
                level={level + 1}
                propertyKey={`[${index}]`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Object
  const entries = Object.entries(data as JsonObject);
  return (
    <div style={{ paddingLeft: `${indent}px` }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 rounded px-2 py-1 text-left transition-colors hover:bg-white/5"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-white/50" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/50" />
        )}
        {propertyKey && (
          <span className="text-primary font-mono text-sm font-semibold">{propertyKey}:</span>
        )}
        <Type className="h-4 w-4 text-blue-400" />
        <span className="font-mono text-sm text-white/70">
          {propertyKey || 'Object'} {'{' + entries.length + '}'}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-1 space-y-1">
          {entries.map(([key, value]) => (
            <JsonTreeNode
              key={key}
              data={value}
              path={[...path, key]}
              onUpdate={onUpdate}
              level={level + 1}
              propertyKey={key}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * PrimitiveEditor Component
 * Input field for editing primitive values (string, number, boolean, null)
 */
interface PrimitiveEditorProps {
  value: string | number | boolean | null;
  onChange: (newValue: string | number | boolean | null) => void;
}

function PrimitiveEditor({ value, onChange }: PrimitiveEditorProps) {
  const [localValue, setLocalValue] = useState(String(value ?? ''));

  useEffect(() => {
    setLocalValue(String(value ?? ''));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Try to infer the type
    if (value === null) {
      onChange(newValue || null);
    } else if (typeof value === 'boolean') {
      onChange(newValue.toLowerCase() === 'true');
    } else if (typeof value === 'number') {
      const parsed = parseFloat(newValue);
      onChange(isNaN(parsed) ? 0 : parsed);
    } else {
      onChange(newValue);
    }
  };

  // Type indicator
  const typeIcon = () => {
    if (value === null) return <span className="text-xs text-white/30">null</span>;
    if (typeof value === 'boolean') return <span className="text-xs text-purple-400">bool</span>;
    if (typeof value === 'number') return <Hash className="h-3 w-3 text-green-400" />;
    return <Type className="h-3 w-3 text-blue-400" />;
  };

  // Multi-line for long strings
  const isLongString = typeof value === 'string' && value.length > 60;

  return (
    <div className="flex flex-1 items-center gap-2">
      {typeIcon()}
      {isLongString ? (
        <textarea
          value={localValue}
          onChange={handleChange}
          className="focus:border-primary/50 focus:ring-primary/20 flex-1 resize-none rounded border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white focus:ring-2 focus:outline-none"
          rows={3}
        />
      ) : (
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          className="focus:border-primary/50 focus:ring-primary/20 flex-1 rounded border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-white focus:ring-2 focus:outline-none"
        />
      )}
    </div>
  );
}
