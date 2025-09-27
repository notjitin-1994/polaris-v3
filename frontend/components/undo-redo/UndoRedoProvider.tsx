'use client';

import { useEffect } from 'react';
import { useBlueprintStore } from '@/lib/stores/blueprintStore';
import { useUIStore } from '@/lib/stores/uiStore';
import { actionHistory, setupKeyboardShortcuts } from '@/lib/stores/actionHistory';

interface UndoRedoProviderProps {
  children: React.ReactNode;
}

export function UndoRedoProvider({ children }: UndoRedoProviderProps) {
  const blueprintStore = useBlueprintStore();
  const uiStore = useUIStore();

  // Set up keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts(blueprintStore);
    return cleanup;
  }, [blueprintStore]);

  // Set up action history tracking
  useEffect(() => {
    const unsubscribe = blueprintStore.subscribe((state) => {
      // Track blueprint changes
      if (state.currentBlueprint) {
        actionHistory.addAction('blueprint_update', state.currentBlueprint, 'Blueprint updated');
      }
    });

    return unsubscribe;
  }, [blueprintStore]);

  // Set up UI state tracking
  useEffect(() => {
    const unsubscribe = uiStore.subscribe((state) => {
      // Track UI changes
      actionHistory.addAction('ui_update', state, 'UI state updated');
    });

    return unsubscribe;
  }, [uiStore]);

  return <>{children}</>;
}
