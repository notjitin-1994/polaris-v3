/**
 * Rich Text Notes Editor
 * Full-featured text editor with formatting toolbar
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Highlighter,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/design-system';

interface RichTextNotesEditorProps {
  content: string;
  onChange: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

type FormatCommand = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikeThrough'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'justifyLeft'
  | 'justifyCenter'
  | 'justifyRight';

const TEXT_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#A7DADB', // Primary
  '#E6B89C', // Secondary
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

const HIGHLIGHT_COLORS = [
  'transparent',
  '#FEF3C7', // Yellow
  '#DBEAFE', // Blue
  '#D1FAE5', // Green
  '#FCE7F3', // Pink
  '#E0E7FF', // Indigo
  '#FED7AA', // Orange
];

export function RichTextNotesEditor({
  content,
  onChange,
  onFocus,
  onBlur,
}: RichTextNotesEditorProps): React.JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, []);

  // Update active formats
  const updateActiveFormats = () => {
    const formats = new Set<string>();
    
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('underline')) formats.add('underline');
    if (document.queryCommandState('strikeThrough')) formats.add('strikeThrough');
    if (document.queryCommandState('insertUnorderedList')) formats.add('insertUnorderedList');
    if (document.queryCommandState('insertOrderedList')) formats.add('insertOrderedList');
    
    setActiveFormats(formats);
  };

  // Handle content change
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    updateActiveFormats();
  };

  // Execute formatting command
  const executeCommand = (command: FormatCommand) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    updateActiveFormats();
  };

  // Apply heading
  const applyHeading = (level: 1 | 2 | 3) => {
    document.execCommand('formatBlock', false, `h${level}`);
    editorRef.current?.focus();
  };

  // Apply text color
  const applyTextColor = (color: string) => {
    document.execCommand('foreColor', false, color);
    setShowTextColorPicker(false);
    editorRef.current?.focus();
  };

  // Apply highlight color
  const applyHighlightColor = (color: string) => {
    document.execCommand('hiliteColor', false, color);
    setShowHighlightPicker(false);
    editorRef.current?.focus();
  };

  // Toolbar button component
  const ToolbarButton = ({
    icon: Icon,
    label,
    onClick,
    active = false,
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg border transition-all',
        active
          ? 'border-primary/50 bg-primary/20 text-primary'
          : 'border-white/10 bg-white/5 text-text-secondary hover:border-primary/30 hover:bg-primary/10 hover:text-primary'
      )}
      title={label}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="border-b border-white/10 bg-white/[0.02] p-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Text Style */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={Bold}
              label="Bold (Ctrl+B)"
              onClick={() => executeCommand('bold')}
              active={activeFormats.has('bold')}
            />
            <ToolbarButton
              icon={Italic}
              label="Italic (Ctrl+I)"
              onClick={() => executeCommand('italic')}
              active={activeFormats.has('italic')}
            />
            <ToolbarButton
              icon={Underline}
              label="Underline (Ctrl+U)"
              onClick={() => executeCommand('underline')}
              active={activeFormats.has('underline')}
            />
            <ToolbarButton
              icon={Strikethrough}
              label="Strikethrough"
              onClick={() => executeCommand('strikeThrough')}
              active={activeFormats.has('strikeThrough')}
            />
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={Heading1}
              label="Heading 1"
              onClick={() => applyHeading(1)}
            />
            <ToolbarButton
              icon={Heading2}
              label="Heading 2"
              onClick={() => applyHeading(2)}
            />
            <ToolbarButton
              icon={Heading3}
              label="Heading 3"
              onClick={() => applyHeading(3)}
            />
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={List}
              label="Bullet List"
              onClick={() => executeCommand('insertUnorderedList')}
              active={activeFormats.has('insertUnorderedList')}
            />
            <ToolbarButton
              icon={ListOrdered}
              label="Numbered List"
              onClick={() => executeCommand('insertOrderedList')}
              active={activeFormats.has('insertOrderedList')}
            />
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              icon={AlignLeft}
              label="Align Left"
              onClick={() => executeCommand('justifyLeft')}
            />
            <ToolbarButton
              icon={AlignCenter}
              label="Align Center"
              onClick={() => executeCommand('justifyCenter')}
            />
            <ToolbarButton
              icon={AlignRight}
              label="Align Right"
              onClick={() => executeCommand('justifyRight')}
            />
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* Colors */}
          <div className="relative flex items-center gap-1">
            {/* Text Color */}
            <div className="relative">
              <ToolbarButton
                icon={Type}
                label="Text Color"
                onClick={() => {
                  setShowTextColorPicker(!showTextColorPicker);
                  setShowHighlightPicker(false);
                }}
              />
              
              {showTextColorPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-white/10 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="grid grid-cols-5 gap-1">
                    {TEXT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => applyTextColor(color)}
                        className="h-6 w-6 rounded border border-white/20 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Highlight Color */}
            <div className="relative">
              <ToolbarButton
                icon={Highlighter}
                label="Highlight Color"
                onClick={() => {
                  setShowHighlightPicker(!showHighlightPicker);
                  setShowTextColorPicker(false);
                }}
              />
              
              {showHighlightPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-full z-50 mt-2 rounded-lg border border-white/10 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl"
                >
                  <div className="grid grid-cols-4 gap-1">
                    {HIGHLIGHT_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => applyHighlightColor(color)}
                        className={cn(
                          'h-6 w-6 rounded border transition-transform hover:scale-110',
                          color === 'transparent' 
                            ? 'border-white/20 bg-slate-800'
                            : 'border-white/20'
                        )}
                        style={{ backgroundColor: color === 'transparent' ? undefined : color }}
                        title={color === 'transparent' ? 'No highlight' : color}
                      >
                        {color === 'transparent' && (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="h-px w-4 rotate-45 bg-red-500" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        onFocus={() => onFocus?.()}
        onBlur={() => onBlur?.()}
        className="notes-editor flex-1 overflow-y-auto p-4 text-foreground focus:outline-none"
        style={{
          minHeight: '200px',
        }}
      />

      {/* Custom Styles */}
      <style jsx global>{`
        .notes-editor {
          line-height: 1.6;
        }
        
        .notes-editor h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--foreground);
        }
        
        .notes-editor h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        
        .notes-editor h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }
        
        .notes-editor p {
          margin-bottom: 0.5rem;
        }
        
        .notes-editor ul,
        .notes-editor ol {
          margin-left: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .notes-editor ul {
          list-style-type: disc;
        }
        
        .notes-editor ol {
          list-style-type: decimal;
        }
        
        .notes-editor li {
          margin-bottom: 0.25rem;
        }
        
        .notes-editor strong {
          font-weight: 700;
        }
        
        .notes-editor em {
          font-style: italic;
        }
        
        .notes-editor u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

