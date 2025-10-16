/**
 * Presenter Notes Panel
 * Collapsible side panel with contextual guidance
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';

interface PresenterNotesProps {
  isOpen: boolean;
  notes: string;
  onClose: () => void;
}

export function PresenterNotes({
  isOpen,
  notes,
  onClose,
}: PresenterNotesProps): React.JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="glass-panel absolute right-0 top-0 bottom-0 z-30 flex w-full max-w-md flex-col border-l border-white/10 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-white">Presenter Notes</h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-text-secondary transition-all hover:bg-white/10 hover:text-white"
              aria-label="Close notes"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Notes Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed">{notes}</p>
            </div>

            {/* Tips Section */}
            <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <h4 className="mb-2 text-sm font-bold text-primary">Presentation Tips</h4>
              <ul className="space-y-1 text-sm text-text-secondary">
                <li>• Maintain eye contact with your audience</li>
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Use examples to illustrate key points</li>
                <li>• Allow time for questions and discussion</li>
              </ul>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <h4 className="mb-2 text-sm font-bold text-white">Keyboard Shortcuts</h4>
              <div className="space-y-1 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Next slide</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
                    →
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Previous slide</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
                    ←
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle notes</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
                    N
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Grid overview</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
                    G
                  </kbd>
                </div>
                <div className="flex justify-between">
                  <span>Fullscreen</span>
                  <kbd className="rounded bg-white/10 px-2 py-0.5 font-mono text-white">
                    F
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

