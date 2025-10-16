/**
 * AI Assistant Section for Blueprint Sidebar
 * Collapsible AI chat and quick actions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronDown,
  Send,
  Wand2,
  Brain,
  FileText,
  Loader2,
} from 'lucide-react';
import { cn, glassCard, microInteractions, componentStyles } from '@/lib/design-system';

interface AIAssistantSectionProps {
  currentSection?: string;
  blueprintId: string;
  isPublicView?: boolean;
}

export function AIAssistantSection({
  currentSection,
  blueprintId,
  isPublicView = false,
}: AIAssistantSectionProps): React.JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isPublicView) return <></>;

  const quickActions = [
    {
      icon: Wand2,
      label: 'Summarize',
      action: () => console.log('Summarize'),
    },
    {
      icon: Brain,
      label: 'Insights',
      action: () => console.log('Extract insights'),
    },
    {
      icon: FileText,
      label: 'Report',
      action: () => console.log('Generate report'),
    },
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Integrate with AI API
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant' as const,
        content: 'AI response will appear here.',
        timestamp: new Date(),
      }]);
      setIsLoading(false);
    }, 1000);
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
          'bg-primary/20',
        )}>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <span className="flex-1 text-left">AI Assistant</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180',
          )}
        />
      </button>

      {/* Quick Actions - Always Visible */}
      <div className="mt-3 grid grid-cols-3 gap-2 px-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              {...microInteractions.buttonPress}
              onClick={action.action}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg p-2',
                'bg-white/5 hover:bg-white/10',
                'text-text-secondary hover:text-foreground',
                'transition-all duration-200',
              )}
              title={action.label}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] font-medium">{action.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Expandable Chat Interface */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 overflow-hidden"
          >
            <div className={cn(
              glassCard.base,
              'mx-3 p-3',
            )}>
              {/* Context Display */}
              {currentSection && (
                <div className="mb-3 rounded-lg bg-primary/10 px-3 py-2">
                  <p className="text-xs text-primary">
                    Analyzing: <span className="font-medium">{currentSection}</span>
                  </p>
                </div>
              )}

              {/* Chat Messages */}
              <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
                {messages.length === 0 ? (
                  <p className="py-8 text-center text-xs text-text-disabled">
                    Ask me anything about this blueprint
                  </p>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        'rounded-lg px-3 py-2 text-xs',
                        message.role === 'user'
                          ? 'bg-primary/20 text-foreground ml-4'
                          : 'bg-white/5 text-text-secondary mr-4',
                      )}
                    >
                      {message.content}
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs text-text-secondary">Thinking...</span>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask AI..."
                  maxLength={500}
                  className={cn(
                    componentStyles.input.base,
                    componentStyles.input.variants.glass,
                    componentStyles.input.sizes.sm,
                    'flex-1',
                  )}
                />
                <motion.button
                  {...microInteractions.buttonPress}
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    'bg-primary/20 text-primary',
                    'hover:bg-primary/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-colors',
                  )}
                >
                  <Send className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Character count */}
              <div className="mt-2 text-right">
                <span className="text-[10px] text-text-disabled">
                  {input.length}/500
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

