'use client';

import { useState, useEffect } from 'react';
import { useUIStore, uiSelectors } from '@/lib/stores/uiStore';
import { useBlueprintStore } from '@/lib/stores/blueprintStore';
import { ResumeWorkflowManager, resumeUIHelpers } from '@/lib/stores/resumeWorkflow';
import type { ResumeData } from '@/lib/stores/types';

interface ResumeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResume: (blueprintId: string) => void;
  onStartFresh: (blueprintId: string) => void;
}

export function ResumeDialog({ isOpen, onClose, onResume, onStartFresh }: ResumeDialogProps) {
  const [resumeData, setResumeData] = useState<ResumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const incompleteBlueprints = ResumeWorkflowManager.detectIncompleteBlueprints();
      setResumeData(incompleteBlueprints);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const promptData = resumeUIHelpers.getResumePromptData(resumeData);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-strong rounded-2xl max-w-2xl w-full mx-4 max-h-modal overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-foreground">Resume Your Work</h2>
          <p className="text-foreground/70 mt-2">
            You have {promptData.count} incomplete blueprint{promptData.count !== 1 ? 's' : ''} that
            you can resume.
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-foreground/60">Loading...</span>
            </div>
          ) : promptData.items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground/50">No incomplete blueprints found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {promptData.items.map((item) => (
                <ResumeItem
                  key={item.blueprintId}
                  item={item}
                  onResume={() => onResume(item.blueprintId)}
                  onStartFresh={() => onStartFresh(item.blueprintId)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-foreground hover:glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface ResumeItemProps {
  item: {
    blueprintId: string;
    progress: number;
    lastSaved: Date;
    timeAgo: string;
    canResume: boolean;
  };
  onResume: () => void;
  onStartFresh: () => void;
}

function ResumeItem({ item, onResume, onStartFresh }: ResumeItemProps) {
  const progressColor = resumeUIHelpers.getProgressColor(item.progress);
  const progressDescription = resumeUIHelpers.getProgressDescription(item.progress);

  return (
    <div className="glass rounded-2xl p-4 transition-all duration-300 hover:glass-strong hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Blueprint {item.blueprintId}</h3>
          <p className="text-sm text-foreground/70 mt-1">
            {progressDescription} • Last saved {item.timeAgo}
          </p>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-foreground/60 mb-1">
              <span>Progress</span>
              <span>{item.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-${progressColor}-500 transition-all duration-300`}
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex space-x-2">
          {item.canResume && (
            <button
              onClick={onResume}
              className="px-4 py-1.5 bg-secondary text-white text-sm rounded-lg hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 transition-all duration-200"
            >
              Resume
            </button>
          )}
          <button
            onClick={onStartFresh}
            className="px-4 py-1.5 rounded-lg text-foreground hover:glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
