'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  X,
  ChevronDown,
  Bug,
  Lightbulb,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeedbackModal } from './FeedbackModal';
import type { FeedbackFormData } from '@/lib/types/feedback';

interface FeedbackButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  defaultOpen?: boolean;
  onSubmit?: (data: FeedbackFormData) => void;
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Report a Bug', icon: Bug, color: 'text-red-500' },
  { value: 'feature', label: 'Request Feature', icon: Lightbulb, color: 'text-blue-500' },
  { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-gray-500' },
  { value: 'ui_ux', label: 'UI/UX Issue', icon: AlertCircle, color: 'text-purple-500' },
] as const;

export function FeedbackButton({
  position = 'bottom-right',
  className,
  defaultOpen = false,
  onSubmit,
}: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<(typeof FEEDBACK_TYPES)[number] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check for unread responses
  useEffect(() => {
    checkUnreadResponses();
    const interval = setInterval(checkUnreadResponses, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut (Ctrl/Cmd + Shift + F)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const checkUnreadResponses = async () => {
    try {
      const response = await fetch('/api/feedback/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Failed to check unread responses:', error);
    }
  };

  const handleTypeSelect = (type: (typeof FEEDBACK_TYPES)[number]) => {
    setSelectedType(type);
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleFeedbackSubmit = async (data: FeedbackFormData) => {
    if (onSubmit) {
      onSubmit(data);
    }
    handleModalClose();
    // Refresh unread count after submission
    setTimeout(checkUnreadResponses, 1000);
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const menuPositionClasses = {
    'bottom-right': 'bottom-0 right-0 origin-bottom-right',
    'bottom-left': 'bottom-0 left-0 origin-bottom-left',
    'top-right': 'top-0 right-0 origin-top-right',
    'top-left': 'top-0 left-0 origin-top-left',
  };

  return (
    <>
      {/* Floating Button Container */}
      <div
        className={cn(
          'fixed z-50 flex flex-col items-end gap-2',
          positionClasses[position],
          className
        )}
      >
        {/* Quick Menu */}
        {isOpen && !isMinimized && (
          <div
            className={cn(
              'absolute mb-16 w-64 transform rounded-lg border border-gray-200 bg-white shadow-2xl transition-all duration-200 ease-out dark:border-gray-700 dark:bg-gray-900',
              menuPositionClasses[position],
              isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            )}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                How can we help?
              </h3>
              <button
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 transition-colors hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Minimize menu"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Feedback Type Options */}
            <div className="p-2">
              {FEEDBACK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type)}
                  className="group flex w-full items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <type.icon className={cn('h-5 w-5', type.color)} />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-gray-100">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Links */}
            <div className="border-t border-gray-200 p-3 dark:border-gray-700">
              <a
                href="/feedback/history"
                className="text-primary hover:text-primary-dark dark:hover:text-primary-light text-xs transition-colors"
              >
                View your feedback history →
              </a>
            </div>
          </div>
        )}

        {/* Minimized Menu */}
        {isOpen && isMinimized && (
          <div className="absolute right-0 mb-16 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-400 transition-colors hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Expand menu"
            >
              <ChevronDown className="h-4 w-4 rotate-180" />
            </button>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl',
            isOpen
              ? 'bg-gray-800 dark:bg-gray-700'
              : 'bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-primary',
            'focus:ring-primary/20 focus:ring-4 focus:outline-none'
          )}
          aria-label={isOpen ? 'Close feedback menu' : 'Open feedback menu'}
        >
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}

          {/* Icon */}
          <div className="relative">
            {isOpen ? (
              <X className="h-6 w-6 text-white transition-transform duration-200" />
            ) : (
              <MessageSquarePlus className="h-6 w-6 text-white transition-transform duration-200 group-hover:rotate-12" />
            )}
          </div>

          {/* Tooltip */}
          {!isOpen && (
            <span className="pointer-events-none absolute right-full mr-3 rounded-md bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-gray-700">
              Send Feedback (Ctrl+Shift+F)
            </span>
          )}
        </button>
      </div>

      {/* Feedback Modal */}
      {isModalOpen && selectedType && (
        <FeedbackModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          defaultType={selectedType.value as FeedbackFormData['type']}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
}
