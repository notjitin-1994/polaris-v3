/**
 * Command Palette
 * Quick access to all features with fuzzy search
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  LayoutGrid,
  Presentation,
  Focus,
  Pin,
  Eye,
  Download,
  Share2,
  Settings,
  Sparkles,
  Command,
  ArrowRight,
  Hash,
  Type,
  Image,
  BarChart3,
  Clock,
  Calendar,
  DollarSign,
  Users,
  Target,
  Shield,
  TrendingUp,
  Leaf,
} from 'lucide-react';
import Fuse from 'fuse.js';
import {
  glassPanel,
  glassCard,
  sectionTransitions,
  microInteractions,
  cn,
  typographyPresets,
  componentStyles,
  elevation,
} from '@/lib/design-system';
import type { ViewMode } from './BlueprintViewer';

interface Section {
  id: string;
  title: string;
  type: string;
  content: any;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  sections: Section[];
  onNavigate: (sectionId: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onToggleSidebar: () => void;
  onToggleMinimap: () => void;
  onToggleAnnotations: () => void;
}

interface Command {
  id: string;
  title: string;
  description?: string;
  icon: React.ElementType;
  category: 'navigation' | 'view' | 'actions' | 'settings' | 'ai';
  keywords: string[];
  action: () => void;
  shortcut?: string;
}

const sectionIcons: Record<string, React.ElementType> = {
  objectives: Target,
  target_audience: Users,
  resources: DollarSign,
  timeline: Calendar,
  risks: Shield,
  metrics: TrendingUp,
  strategy: FileText,
  sustainability: Leaf,
  default: Hash,
};

export function CommandPalette({
  isOpen,
  onClose,
  sections,
  onNavigate,
  onViewModeChange,
  onToggleSidebar,
  onToggleMinimap,
  onToggleAnnotations,
}: CommandPaletteProps): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Build command list
  const commands: Command[] = [
    // Navigation commands
    ...sections.map(section => ({
      id: `nav-${section.id}`,
      title: `Go to ${section.title}`,
      description: section.type,
      icon: sectionIcons[section.id] || sectionIcons.default,
      category: 'navigation' as const,
      keywords: [section.title, section.id, 'navigate', 'jump', 'go'],
      action: () => {
        onNavigate(section.id);
        onClose();
      },
    })),
    
    // View mode commands
    {
      id: 'view-dashboard',
      title: 'Analytics View',
      description: 'Interactive data visualizations',
      icon: LayoutGrid,
      category: 'view',
      keywords: ['dashboard', 'analytics', 'charts', 'data', 'view'],
      action: () => {
        onViewModeChange('dashboard');
        onClose();
      },
      shortcut: '1',
    },
    {
      id: 'view-document',
      title: 'Document View',
      description: 'Traditional reading experience',
      icon: FileText,
      category: 'view',
      keywords: ['document', 'read', 'text', 'markdown', 'view'],
      action: () => {
        onViewModeChange('document');
        onClose();
      },
      shortcut: '2',
    },
    {
      id: 'view-presentation',
      title: 'Presentation Mode',
      description: 'Full-screen slides',
      icon: Presentation,
      category: 'view',
      keywords: ['presentation', 'slides', 'present', 'fullscreen', 'view'],
      action: () => {
        onViewModeChange('presentation');
        onClose();
      },
      shortcut: '3',
    },
    {
      id: 'view-focus',
      title: 'Focus Mode',
      description: 'Distraction-free reading',
      icon: Focus,
      category: 'view',
      keywords: ['focus', 'zen', 'minimal', 'clean', 'view'],
      action: () => {
        onViewModeChange('focus');
        onClose();
      },
      shortcut: '4',
    },
    
    // Action commands
    {
      id: 'toggle-sidebar',
      title: 'Toggle Sidebar',
      description: 'Show/hide the sidebar',
      icon: Command,
      category: 'actions',
      keywords: ['sidebar', 'toggle', 'hide', 'show', 'panel'],
      action: () => {
        onToggleSidebar();
        onClose();
      },
      shortcut: '⌘B',
    },
    {
      id: 'toggle-minimap',
      title: 'Toggle Minimap',
      description: 'Show/hide document overview',
      icon: Image,
      category: 'actions',
      keywords: ['minimap', 'map', 'overview', 'toggle'],
      action: () => {
        onToggleMinimap();
        onClose();
      },
      shortcut: '⌘M',
    },
    {
      id: 'toggle-annotations',
      title: 'Toggle Annotations',
      description: 'Show/hide notes and comments',
      icon: Type,
      category: 'actions',
      keywords: ['annotations', 'notes', 'comments', 'toggle'],
      action: () => {
        onToggleAnnotations();
        onClose();
      },
    },
    {
      id: 'export-pdf',
      title: 'Export as PDF',
      description: 'Download blueprint as PDF',
      icon: Download,
      category: 'actions',
      keywords: ['export', 'pdf', 'download', 'save'],
      action: () => {
        // Export will be handled by parent component
        onClose();
      },
    },
    {
      id: 'share',
      title: 'Share Blueprint',
      description: 'Get shareable link',
      icon: Share2,
      category: 'actions',
      keywords: ['share', 'link', 'collaborate', 'send'],
      action: () => {
        // Share will be handled by parent component
        onClose();
      },
    },
    
    // AI commands
    {
      id: 'ai-summary',
      title: 'Generate AI Summary',
      description: 'Create executive summary with AI',
      icon: Sparkles,
      category: 'ai',
      keywords: ['ai', 'summary', 'generate', 'artificial', 'intelligence'],
      action: () => {
        // AI summary will be implemented in ai-features phase
        onClose();
      },
    },
  ];
  
  // Set up fuzzy search
  const fuse = new Fuse(commands, {
    keys: ['title', 'description', 'keywords'],
    threshold: 0.3,
    includeScore: true,
  });
  
  // Filter results
  const results = query
    ? fuse.search(query).map(result => result.item)
    : commands;
    
  // Group results by category
  const groupedResults = results.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);
  
  // Category labels
  const categoryLabels = {
    navigation: 'Navigation',
    view: 'View Modes',
    actions: 'Actions',
    settings: 'Settings',
    ai: 'AI Tools',
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, onClose]);
  
  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);
  
  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && results.length > 0) {
      const selectedElement = resultsRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      selectedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex, results.length]);
  
  if (!isOpen) return <></>;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[10vh]"
        onClick={onClose}
      >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                glassPanel.floating,
                elevation.xl,
                'w-[90%] max-w-3xl overflow-hidden rounded-2xl',
              )}
            >
          {/* Search Input */}
          <div className="relative border-b border-white/10 p-4">
            <Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command or search..."
              className={cn(
                'w-full bg-transparent pl-12 pr-4',
                'text-lg text-foreground placeholder:text-text-disabled',
                'focus:outline-none',
              )}
            />
          </div>
          
          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            {Object.entries(groupedResults).map(([category, commands]) => (
              <div key={category} className="mb-4">
                <h3 className={cn(
                  typographyPresets.labelText,
                  'mb-2 px-3 text-text-secondary',
                )}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                
                <div className="space-y-1">
                  {commands.map((command, index) => {
                    const globalIndex = results.findIndex(r => r.id === command.id);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = command.icon;
                    
                    return (
                      <motion.button
                        key={command.id}
                        data-index={globalIndex}
                        onClick={command.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg px-3 py-2.5',
                          'text-left transition-all',
                          isSelected
                            ? 'bg-primary/20 text-foreground'
                            : 'text-text-secondary hover:bg-white/5 hover:text-foreground',
                        )}
                      >
                        <Icon className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isSelected && 'text-primary',
                        )} />
                        
                        <div className="flex-1">
                          <div className="font-medium">{command.title}</div>
                          {command.description && (
                            <div className="text-xs opacity-70">
                              {command.description}
                            </div>
                          )}
                        </div>
                        
                        {command.shortcut && (
                          <kbd className={cn(
                            'inline-flex h-6 items-center gap-1 px-2',
                            'text-xs font-medium',
                            'rounded border',
                            isSelected
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-white/10 bg-white/5 text-text-secondary',
                          )}>
                            {command.shortcut}
                          </kbd>
                        )}
                        
                        {isSelected && (
                          <ArrowRight className="h-4 w-4 text-primary" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
            
            {results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-text-secondary">No results found</p>
                <p className="mt-1 text-sm text-text-disabled">
                  Try a different search term
                </p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1">esc</kbd>
                  Close
                </span>
              </div>
              
              <span className="flex items-center gap-1">
                <Command className="h-3 w-3" />
                Command Palette
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
