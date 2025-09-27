import { useCallback, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useWizardStore } from '@/store/wizardStore';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

export function useAutoSave(userId: string | null) {
  const supabase = getSupabaseBrowserClient();
  const { blueprintId, values, setBlueprintId, setSaveState } = useWizardStore();

  const latestValues = useRef<StaticQuestionsFormValues>(values);
  useEffect(() => {
    latestValues.current = values;
  }, [values]);

  const save = useCallback(async () => {
    if (!userId) return;
    setSaveState('saving');
    try {
      if (!blueprintId) {
        const { data, error } = await supabase
          .from('blueprint_generator')
          .insert({ user_id: userId, status: 'draft', static_answers: latestValues.current })
          .select()
          .single();
        if (error) throw error;
        setBlueprintId(data.id);
      } else {
        const { error } = await supabase
          .from('blueprint_generator')
          .update({ static_answers: latestValues.current })
          .eq('id', blueprintId);
        if (error) throw error;
      }
      setSaveState('saved');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setSaveState('error', message);
    }
  }, [blueprintId, setBlueprintId, setSaveState, supabase, userId]);

  const debouncedSave = useRef(
    debounce(() => {
      void save();
    }, 2000),
  );

  useEffect(() => {
    debouncedSave.current();
  }, [values]);

  useEffect(() => {
    const currentDebouncedSave = debouncedSave.current;
    return () => {
      currentDebouncedSave.cancel();
    };
  }, []);
}
