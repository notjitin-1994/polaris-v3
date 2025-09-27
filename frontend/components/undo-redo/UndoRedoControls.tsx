'use client';

import { useState, useEffect } from 'react';
import { actionHistory } from '@/lib/stores/actionHistory';
import { useBlueprintStore } from '@/lib/stores/blueprintStore';
import { useUIStore } from '@/lib/stores/uiStore';

interface UndoRedoControlsProps {
  className?: string;
}

export function UndoRedoControls({ className = '' }: UndoRedoControlsProps) {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [historyInfo, setHistoryInfo] = useState({
    pastCount: 0,
    futureCount: 0,
    totalCount: 0,
    currentAction: undefined as string | undefined,
  });

  const blueprintStore = useBlueprintStore();
  const uiStore = useUIStore();

  // Update undo/redo state
  useEffect(() => {
    const updateState = () => {
      setCanUndo(actionHistory.canUndo());
      setCanRedo(actionHistory.canRedo());
      setHistoryInfo(actionHistory.getHistoryInfo());
    };

    // Update state initially
    updateState();

    // Update state when blueprint changes
    const unsubscribeBlueprint = blueprintStore.subscribe(updateState);
    const unsubscribeUI = uiStore.subscribe(updateState);

    return () => {
      unsubscribeBlueprint();
      unsubscribeUI();
    };
  }, [blueprintStore, uiStore]);

  const handleUndo = () => {
    if (canUndo) {
      const previousState = actionHistory.undo();
      if (previousState) {
        // Restore blueprint state
        if (previousState.action === 'blueprint_update') {
          blueprintStore.setCurrentBlueprint(previousState.state);
        }
        // Restore UI state
        else if (previousState.action === 'ui_update') {
          // This would need to be implemented based on UI store structure
          console.log('Restoring UI state:', previousState.state);
        }
      }
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      const nextState = actionHistory.redo();
      if (nextState) {
        // Restore blueprint state
        if (nextState.action === 'blueprint_update') {
          blueprintStore.setCurrentBlueprint(nextState.state);
        }
        // Restore UI state
        else if (nextState.action === 'ui_update') {
          // This would need to be implemented based on UI store structure
          console.log('Restoring UI state:', nextState.state);
        }
      }
    }
  };

  const handleClearHistory = () => {
    actionHistory.clear();
    setCanUndo(false);
    setCanRedo(false);
    setHistoryInfo({
      pastCount: 0,
      futureCount: 0,
      totalCount: 0,
      currentAction: undefined,
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleUndo}
        disabled={!canUndo}
        className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Undo (Ctrl+Z)"
      >
        Undo
      </button>

      <button
        onClick={handleRedo}
        disabled={!canRedo}
        className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Redo (Ctrl+Y)"
      >
        Redo
      </button>

      {(canUndo || canRedo) && (
        <button
          onClick={handleClearHistory}
          className="px-3 py-1.5 text-sm bg-red-200 text-red-700 rounded-md hover:bg-red-300 transition-colors"
          title="Clear History"
        >
          Clear
        </button>
      )}

      {/* History info tooltip */}
      {historyInfo.totalCount > 0 && (
        <div className="text-xs text-gray-500">
          {historyInfo.pastCount} undo • {historyInfo.futureCount} redo
        </div>
      )}
    </div>
  );
}
