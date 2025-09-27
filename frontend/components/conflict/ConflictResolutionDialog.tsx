'use client';

import { useState } from 'react';
import { ConflictResolutionStrategy, conflictUIHelpers } from '@/lib/stores/conflictResolution';
import type { ConflictData } from '@/lib/stores/types';

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (strategy: ConflictResolutionStrategy) => void;
  conflict: ConflictData | null;
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
  onResolve,
  conflict,
}: ConflictResolutionDialogProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<ConflictResolutionStrategy | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen || !conflict) return null;

  const description = conflictUIHelpers.getConflictDescription(conflict);
  const options = conflictUIHelpers.getResolutionOptions(conflict);
  const severity = conflictUIHelpers.getConflictSeverity(conflict);

  const handleResolve = async () => {
    if (!selectedStrategy) return;

    setIsResolving(true);
    try {
      onResolve(selectedStrategy);
      onClose();
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-strong rounded-2xl max-w-2xl w-full mx-4 max-h-modal overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                severity === 'high'
                  ? 'bg-red-500'
                  : severity === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
              }`}
            />
            <h2 className="text-2xl font-bold text-foreground">Conflict Resolution</h2>
          </div>
          <p className="text-foreground/70 mt-2">{description}</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Resolution Options</h3>
              <div className="space-y-4">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer glass-hover ${
                      selectedStrategy === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolution-strategy"
                      value={option.value}
                      checked={selectedStrategy === option.value}
                      onChange={(e) =>
                        setSelectedStrategy(e.target.value as ConflictResolutionStrategy)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{option.label}</div>
                      <div className="text-sm text-foreground/70 mt-1">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {conflict.type === 'concurrent_edit' && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-foreground mb-2">Change Comparison</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-foreground/80 mb-2">Local Changes</h5>
                    <div className="glass p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(conflict.localChanges, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground/80 mb-2">Remote Changes</h5>
                    <div className="glass p-3 rounded text-sm">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(conflict.remoteChanges, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isResolving}
            className="px-6 py-2.5 rounded-lg text-foreground hover:glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={!selectedStrategy || isResolving}
            className="glass px-6 py-2.5 rounded-lg text-white bg-secondary hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          >
            {isResolving ? 'Resolving...' : 'Resolve Conflict'}
          </button>
        </div>
      </div>
    </div>
  );
}
