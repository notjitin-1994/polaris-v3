import { useCallback, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useWizardStore } from '@/store/wizardStore';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function useAutoSave(userId: string | null) {
  const supabase = getSupabaseBrowserClient();
  const { values, setSaveState } = useWizardStore();

  const latestValues = useRef<StaticQuestionsFormValues>(values);
  useEffect(() => {
    latestValues.current = values;
  }, [values]);

  const save = useCallback(async () => {
    if (!userId) return;
    setSaveState('saving');
    try {
      // Always read the latest store state to avoid stale closures
      const { blueprintId: currentBlueprintId, setBlueprintId } = useWizardStore.getState();
      let workingBlueprintId = currentBlueprintId;

      // If we don't have a blueprint ID yet, try to find an existing draft for this user first
      if (!workingBlueprintId) {
        const { data: existingDraftRows, error: findError } = await supabase
          .from('blueprint_generator')
          .select('id')
          .eq('user_id', userId)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .limit(1);
        if (findError) throw findError;
        const existingDraft = existingDraftRows?.[0] ?? null;
        if (existingDraft) {
          workingBlueprintId = existingDraft.id as string;
          setBlueprintId(workingBlueprintId);
        }
      }

      if (!workingBlueprintId) {
        // No draft found; create a new row
        const { data, error } = await supabase
          .from('blueprint_generator')
          .insert({ user_id: userId, status: 'draft', static_answers: latestValues.current })
          .select()
          .single();
        if (error) throw error;
        workingBlueprintId = data.id as string;
        setBlueprintId(workingBlueprintId);
      } else {
        // Update the existing draft row
        const { error } = await supabase
          .from('blueprint_generator')
          .update({ static_answers: latestValues.current })
          .eq('id', workingBlueprintId);
        if (error) throw error;
      }

      setSaveState('saved');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveState('error', message);
    }
  }, [setSaveState, supabase, userId]);

  // Debounce and always call the latest save implementation
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        void save();
      }, 2000),
    [save]
  );

  useEffect(() => {
    debouncedSave();
  }, [values, debouncedSave]);

  // When user signs in or becomes available, perform an immediate save to
  // ensure a draft row is created/linked promptly for subsequent updates.
  useEffect(() => {
    if (userId) {
      void save();
    }
  }, [userId, save]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);
}
