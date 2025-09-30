import { create } from 'zustand';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

type WizardState = {
  currentStepIndex: number;
  blueprintId: string | null;
  values: StaticQuestionsFormValues;
  saveState: SaveState;
  errorMessage: string | null;
  setStep: (index: number) => void;
  setBlueprintId: (id: string | null) => void;
  setValues: (values: Partial<StaticQuestionsFormValues>) => void;
  setSaveState: (state: SaveState, errorMessage?: string | null) => void;
  reset: () => void;
};

export const useWizardStore = create<WizardState>((set) => ({
  currentStepIndex: 0,
  blueprintId: null,
  values: {
    role: '',
    organization: '',
    learningGap: '',
    resources: '',
    constraints: [],
  },
  saveState: 'idle',
  errorMessage: null,
  setStep: (index) => set({ currentStepIndex: index }),
  setBlueprintId: (id) => set({ blueprintId: id }),
  setValues: (values) => set((s) => ({ values: { ...s.values, ...values } })),
  setSaveState: (state, errorMessage = null) => set({ saveState: state, errorMessage }),
  reset: () =>
    set({
      currentStepIndex: 0,
      blueprintId: null,
      values: {
        role: '',
        organization: '',
        learningGap: '',
        resources: '',
        constraints: [],
      },
      saveState: 'idle',
      errorMessage: null,
    }),
}));
