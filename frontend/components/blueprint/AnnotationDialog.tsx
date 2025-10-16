'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MessageSquare, Sparkles } from 'lucide-react';

interface AnnotationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  sectionTitle: string;
  existingNote?: string;
}

export function AnnotationDialog({
  isOpen,
  onClose,
  onSave,
  sectionTitle,
  existingNote = '',
}: AnnotationDialogProps): React.JSX.Element {
  const [note, setNote] = useState(existingNote);
  const [isSaving, setIsSaving] = useState(false);

  // Reset note when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNote(existingNote);
    }
  }, [isOpen, existingNote]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(note);
      onClose();
    } catch (error) {
      // Failed to save annotation
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNote(existingNote);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

              {/* Header */}
              <div className="border-b border-white/10 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-lg bg-secondary/20 p-2">
                      <MessageSquare className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-white">
                        Add Annotation
                      </h2>
                      <p className="mt-1 text-sm text-text-secondary line-clamp-1">
                        {sectionTitle}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                    aria-label="Close dialog"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Info Banner */}
                  <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 p-4">
                    <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm text-text-secondary">
                        Add your thoughts, insights, or questions about this section. These
                        annotations are private and will be saved locally with your preferences.
                      </p>
                    </div>
                  </div>

                  {/* Textarea */}
                  <div>
                    <label htmlFor="annotation-text" className="mb-2 block text-sm font-medium text-white">
                      Your Note
                    </label>
                    <textarea
                      id="annotation-text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Enter your annotation here..."
                      rows={6}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-text-disabled focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50"
                      autoFocus
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-text-disabled">
                        {note.length} characters
                      </p>
                      {note.length > 0 && (
                        <p className="text-xs text-success">
                          Note ready to save
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-white/5 p-6">
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-white/10 px-6 py-2.5 font-medium text-text-secondary transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || note.trim().length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 font-medium text-secondary-foreground shadow-lg transition-all hover:bg-secondary/90 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Annotation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

