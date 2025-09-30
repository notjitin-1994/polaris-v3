'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Edit3, AlertCircle } from 'lucide-react';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => Promise<void>;
  currentName: string;
  title?: string;
  description?: string;
  placeholder?: string;
  maxLength?: number;
}

export function RenameDialog({
  isOpen,
  onClose,
  onConfirm,
  currentName,
  title = 'Rename Blueprint',
  description = 'Enter a new name for your blueprint',
  placeholder = 'Blueprint name',
  maxLength = 100,
}: RenameDialogProps): JSX.Element | null {
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError(null);
      setIsLoading(false);
      // Focus input after a short delay to ensure it's rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentName]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    const trimmedName = newName.trim();

    // Validation
    if (!trimmedName) {
      setError('Blueprint name cannot be empty');
      return;
    }

    if (trimmedName === currentName) {
      onClose();
      return;
    }

    if (trimmedName.length > maxLength) {
      setError(`Blueprint name cannot exceed ${maxLength} characters`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('RenameDialog: Calling onConfirm with:', trimmedName);
      await onConfirm(trimmedName);
      console.log('RenameDialog: onConfirm completed successfully');
      onClose();
    } catch (err) {
      console.error('RenameDialog: Error in onConfirm:', err);
      setError(err instanceof Error ? err.message : 'Failed to rename blueprint');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) {
    console.log('RenameDialog: Dialog is not open');
    return null;
  }

  console.log('RenameDialog: Rendering dialog with currentName:', currentName);

  const hasChanges = newName.trim() !== currentName;
  const isValid = newName.trim().length > 0 && newName.trim().length <= maxLength;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="glass-strong mx-4 w-full max-w-md overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                <Edit3 className="text-primary h-5 w-5" />
              </div>
              <div>
                <h2 className="text-foreground text-xl font-semibold">{title}</h2>
                <p className="text-foreground/70 text-sm">{description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-foreground/50 hover:text-foreground/80 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Input */}
            <div>
              <label
                htmlFor="blueprint-name"
                className="text-foreground mb-2 block text-sm font-medium"
              >
                Blueprint Name
              </label>
              <input
                ref={inputRef}
                id="blueprint-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={placeholder}
                maxLength={maxLength}
                disabled={isLoading}
                className="bg-background/50 text-foreground placeholder-foreground/50 focus:ring-primary/50 focus:border-primary w-full rounded-lg border border-neutral-200 px-4 py-3 transition-all focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700"
              />
              <div className="mt-2 flex justify-between">
                <div className="text-foreground/60 text-xs">
                  {newName.length}/{maxLength} characters
                </div>
                {hasChanges && <div className="text-primary text-xs">Changes will be saved</div>}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-error bg-error/10 flex items-center space-x-2 rounded-lg px-3 py-2 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="min-w-24"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Rename'
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 pb-4">
          <div className="text-foreground/50 bg-background/30 rounded-lg px-3 py-2 text-xs">
            <span className="font-medium">Tip:</span> Press{' '}
            <kbd className="bg-background/50 text-foreground/70 rounded border px-1.5 py-0.5">
              Esc
            </kbd>{' '}
            to cancel,{' '}
            <kbd className="bg-background/50 text-foreground/70 rounded border px-1.5 py-0.5">
              Cmd+Enter
            </kbd>{' '}
            to save
          </div>
        </div>
      </div>
    </div>
  );
}
