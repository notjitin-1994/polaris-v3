import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBlueprintStore } from './blueprintStore';
import { useAuthStore } from './authStore';
import { queryKeys } from './types';

// Integration hook that syncs Zustand stores with React Query
export const useZustandQueryIntegration = () => {
  const queryClient = useQueryClient();
  const blueprintStore = useBlueprintStore();
  const authStore = useAuthStore();

  // Sync blueprint store with React Query cache
  useEffect(() => {
    const unsubscribe = blueprintStore.subscribe((state) => {
      // When blueprint store changes, update React Query cache
      if (state.currentBlueprint) {
        queryClient.setQueryData(
          queryKeys.blueprints.detail(state.currentBlueprint.id),
          state.currentBlueprint,
        );
      }
    });

    return unsubscribe;
  }, [blueprintStore, queryClient]);

  // Sync auth changes with query invalidation
  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      // When user logs out, clear all queries
      if (!state.user && !state.session) {
        queryClient.clear();
      }
    });

    return unsubscribe;
  }, [authStore, queryClient]);

  // Return integration utilities
  return {
    // Sync a blueprint from React Query to Zustand
    syncBlueprintFromQuery: (blueprintId: string) => {
      const cachedBlueprint = queryClient.getQueryData<BlueprintData>(
        queryKeys.blueprints.detail(blueprintId),
      );

      if (cachedBlueprint) {
        blueprintStore.setCurrentBlueprint(cachedBlueprint);
      }
    },

    // Sync all blueprints from React Query to Zustand
    syncBlueprintsFromQuery: () => {
      const cachedBlueprints = queryClient.getQueryData<BlueprintData[]>(
        queryKeys.blueprints.lists(),
      );

      if (cachedBlueprints) {
        blueprintStore.setBlueprints(cachedBlueprints);
      }
    },

    // Clear all data when user logs out
    clearAllData: () => {
      queryClient.clear();
      blueprintStore.reset();
    },
  };
};

// Hook for optimistic updates with rollback
export const useOptimisticBlueprintUpdate = () => {
  const queryClient = useQueryClient();
  const blueprintStore = useBlueprintStore();

  const performOptimisticUpdate = (
    blueprintId: string,
    updates: Partial<BlueprintData>,
    rollbackData?: BlueprintData,
  ) => {
    // Store current state for potential rollback
    const currentBlueprint = blueprintStore.currentBlueprint;

    // Update Zustand store optimistically
    blueprintStore.updateBlueprint(updates);

    // Update React Query cache optimistically
    queryClient.setQueryData(
      queryKeys.blueprints.detail(blueprintId),
      (old: BlueprintData | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      },
    );

    // Return rollback function
    return () => {
      if (rollbackData) {
        blueprintStore.setCurrentBlueprint(rollbackData);
        queryClient.setQueryData(queryKeys.blueprints.detail(blueprintId), rollbackData);
      } else if (currentBlueprint) {
        blueprintStore.setCurrentBlueprint(currentBlueprint);
        queryClient.setQueryData(queryKeys.blueprints.detail(blueprintId), currentBlueprint);
      }
    };
  };

  return { performOptimisticUpdate };
};

// Hook for background sync
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();

  const syncAll = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.blueprints.all });
  };

  const syncBlueprint = (blueprintId: string) => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.blueprints.detail(blueprintId),
    });
  };

  // Set up periodic background sync
  useEffect(() => {
    const interval = setInterval(
      () => {
        // Only sync if user is authenticated
        const authState = useAuthStore.getState();
        if (authState.user && authState.session) {
          syncAll();
        }
      },
      5 * 60 * 1000,
    ); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    syncAll,
    syncBlueprint,
  };
};

// Hook for query state management
export const useQueryStateManagement = () => {
  const queryClient = useQueryClient();
  const blueprintStore = useBlueprintStore();

  const setLoading = (loading: boolean) => {
    blueprintStore.setLoading(loading);
  };

  const setError = (error: string | null) => {
    blueprintStore.setError(error);
  };

  // Monitor query states and update Zustand accordingly
  useEffect(() => {
    const queries = queryClient.getQueryCache().getAll();

    // Check if any blueprint queries are loading
    const isLoading = queries.some(
      (query) => query.queryKey.includes('blueprints') && query.state.status === 'pending',
    );

    // Check if any blueprint queries have errors
    const hasError = queries.some(
      (query) => query.queryKey.includes('blueprints') && query.state.status === 'error',
    );

    setLoading(isLoading);
    setError(hasError ? 'Failed to load blueprint data' : null);
  }, [queryClient, blueprintStore]);

  return {
    setLoading,
    setError,
  };
};
