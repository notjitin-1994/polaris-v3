/**
 * Annotations Section for Blueprint Sidebar
 * Collapsible section notes and comments
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
} from 'lucide-react';
import { cn, glassCard, microInteractions, componentStyles } from '@/lib/design-system';

interface Annotation {
  id: string;
  sectionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AnnotationsSectionProps {
  annotations: Record<string, Annotation[]>;
  activeSection?: string | null;
  onAddAnnotation: (sectionId: string, content: string) => void;
  onUpdateAnnotation: (sectionId: string, annotationId: string, content: string) => void;
  onDeleteAnnotation: (sectionId: string, annotationId: string) => void;
  isPublicView?: boolean;
}

export function AnnotationsSection({
  annotations,
  activeSection,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  isPublicView = false,
}: AnnotationsSectionProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  if (isPublicView) return <></>;

  // Get all annotations
  const allAnnotations = Object.entries(annotations).flatMap(([sectionId, notes]) =>
    notes.map(note => ({ ...note, sectionId }))
  );

  const handleAddNote = () => {
    if (!newNote.trim() || !activeSection) return;
    onAddAnnotation(activeSection, newNote.trim());
    setNewNote('');
  };

  const handleStartEdit = (note: Annotation) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = (sectionId: string, noteId: string) => {
    if (editContent.trim()) {
      onUpdateAnnotation(sectionId, noteId, editContent.trim());
    }
    setEditingId(null);
    setEditContent('');
  };

  return (
    <div className="border-t border-white/5 pt-4">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-3 py-2',
          'text-sm font-medium text-foreground',
          'hover:bg-white/5 transition-colors',
        )}
      >
        <div className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg',
          'bg-white/10',
        )}>
          <MessageSquare className="h-4 w-4 text-foreground" />
        </div>
        <span className="flex-1 text-left">Annotations</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-text-disabled">{allAnnotations.length}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden px-3"
          >
            {/* Add Note */}
            {activeSection && (
              <div className={cn(glassCard.base, 'mb-3 p-3')}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note to current section..."
                  rows={3}
                  maxLength={500}
                  className={cn(
                    componentStyles.input.base,
                    componentStyles.input.variants.glass,
                    componentStyles.input.sizes.sm,
                    'resize-none w-full mb-2',
                  )}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-disabled">
                    {newNote.length}/500
                  </span>
                  <motion.button
                    {...microInteractions.buttonPress}
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className={cn(
                      'flex items-center gap-1 rounded-lg px-3 py-1.5',
                      'bg-primary/20 text-primary text-xs font-medium',
                      'hover:bg-primary/30',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-colors',
                    )}
                  >
                    <Plus className="h-3 w-3" />
                    Add Note
                  </motion.button>
                </div>
              </div>
            )}

            {/* Annotations List */}
            <div className="space-y-2">
              {allAnnotations.length > 0 ? (
                allAnnotations.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    className={cn(
                      glassCard.base,
                      'group p-3',
                    )}
                  >
                    {editingId === note.id ? (
                      <div>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={2}
                          className={cn(
                            componentStyles.input.base,
                            componentStyles.input.variants.glass,
                            componentStyles.input.sizes.sm,
                            'resize-none w-full mb-2',
                          )}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(note.sectionId, note.id)}
                            className="text-xs text-primary hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent('');
                            }}
                            className="text-xs text-text-secondary hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs text-foreground mb-1">
                          {note.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-text-disabled">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEdit(note)}
                              className="h-5 w-5 rounded p-0.5 hover:bg-white/10"
                              title="Edit"
                            >
                              <Edit2 className="h-full w-full text-text-secondary" />
                            </button>
                            <button
                              onClick={() => onDeleteAnnotation(note.sectionId, note.id)}
                              className="h-5 w-5 rounded p-0.5 hover:bg-white/10 hover:text-error"
                              title="Delete"
                            >
                              <Trash2 className="h-full w-full" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="py-6 text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 text-text-disabled opacity-50" />
                  <p className="text-xs text-text-disabled">
                    No annotations yet
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

