'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useWizardStore } from '@/store/wizardStore';
import {
  staticQuestionsSchema,
  defaultValues,
  wizardSteps,
  type StaticQuestionsFormValues,
} from '@/components/wizard/static-questions/types';
import { RoleStep } from '@/components/wizard/static-questions/steps/RoleStep';
import { OrganizationStep } from '@/components/wizard/static-questions/steps/OrganizationStep';
import { LearningGapStep } from '@/components/wizard/static-questions/steps/LearningGapStep';
import { ResourcesStep } from '@/components/wizard/static-questions/steps/ResourcesStep';
import { ConstraintsStep } from '@/components/wizard/static-questions/steps/ConstraintsStep';
import { QuestionnaireLayout } from '@/components/wizard/static-questions/QuestionnaireLayout';
import { QuestionnaireCard } from '@/components/wizard/static-questions/QuestionnaireCard';
import { QuestionnaireProgress } from '@/components/wizard/static-questions/QuestionnaireProgress';
import { QuestionnaireButton } from '@/components/wizard/static-questions/QuestionnaireButton';
import { useSession } from '@/hooks/useSession';
import { useAutoSave } from '@/components/wizard/static-questions/hooks/useAutoSave';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// Order these to match wizardSteps in types.ts: role → organization → learningGap → resources → constraints
const StepComponents: Record<number, React.FC> = {
  0: RoleStep,
  1: OrganizationStep,
  2: LearningGapStep,
  3: ResourcesStep,
  4: ConstraintsStep,
};

export function StepWizard(): JSX.Element {
  const { user } = useSession();
  const searchParams = useSearchParams();
  const { currentStepIndex, setStep, values, setValues, saveState, blueprintId, setBlueprintId } =
    useWizardStore();
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const methods = useForm<StaticQuestionsFormValues>({
    resolver: zodResolver(staticQuestionsSchema),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: values ?? defaultValues,
  });

  // Keep Zustand in sync with RHF
  React.useEffect(() => {
    const subscription = methods.watch((val) => {
      setValues(val as Partial<StaticQuestionsFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [methods, setValues]);

  // Load existing blueprint data if available, and bind to bid if provided
  useEffect(() => {
    const loadExistingBlueprint = async () => {
      if (!user?.id || blueprintId) return; // Only load if no blueprint ID is set yet

      setIsLoadingExisting(true);
      try {
        const { BlueprintService } = await import('@/lib/db/blueprints');
        const supabase = getSupabaseBrowserClient();
        const blueprintService = new BlueprintService(supabase);

        const forcedId = searchParams.get('bid');
        if (forcedId) {
          const bp = await blueprintService.getBlueprint(forcedId);
          if (bp && bp.user_id === user.id) {
            if (bp.static_answers) {
              const existingAnswers = bp.static_answers as Partial<StaticQuestionsFormValues>;
              setValues(existingAnswers);
              methods.reset(existingAnswers);
            }
            setBlueprintId(bp.id);
            return;
          }
        }
        const userBlueprints = await blueprintService.getBlueprintsByUser(user.id);
        const draftBlueprint = userBlueprints.find((bp) => bp.status === 'draft');

        if (draftBlueprint && draftBlueprint.static_answers) {
          const existingAnswers =
            draftBlueprint.static_answers as Partial<StaticQuestionsFormValues>;
          setValues(existingAnswers);
          setBlueprintId(draftBlueprint.id);
          methods.reset(existingAnswers);
        }
      } catch (error) {
        console.error('Error loading existing blueprint:', error);
      } finally {
        setIsLoadingExisting(false);
      }
    };

    loadExistingBlueprint();
  }, [user?.id, blueprintId, setValues, setBlueprintId, methods, searchParams]);

  // Auto-save on change
  useAutoSave(user?.id ?? null);

  // Auto-rename blueprint when enough static info is present
  useEffect(() => {
    const maybeRename = async () => {
      if (!user?.id || !blueprintId) return;
      const firstName = (user.user_metadata?.name as string | undefined)?.split(' ')[0] || 'Your';
      // Prefer canonical fields
      const org = (values as any).organization || '';
      if (!org || org.trim().length < 2) return;
      const desired = `${firstName}'s Polaris Starmap for ${org}`;
      try {
        const supabase = getSupabaseBrowserClient();
        // Only set if different
        await supabase
          .from('blueprint_generator')
          .update({ title: desired })
          .eq('id', blueprintId)
          .eq('user_id', user.id);
      } catch (_e) {
        // ignore non-fatal rename errors
      }
    };
    void maybeRename();
    // run when blueprintId or org changes
  }, [user?.id, blueprintId, (values as any).organization]);

  const goNext = async () => {
    const step = wizardSteps[currentStepIndex];
    const ok = await methods.trigger(step.fields);
    if (!ok) return;
    setStep(Math.min(currentStepIndex + 1, wizardSteps.length - 1));
  };

  const goPrev = () => {
    setStep(Math.max(currentStepIndex - 1, 0));
  };

  const goTo = async (index: number) => {
    if (index <= currentStepIndex) return setStep(index);
    // Require current step to be valid before skipping forward
    const step = wizardSteps[currentStepIndex];
    const ok = await methods.trigger(step.fields);
    if (ok) setStep(index);
  };

  const handleFinish = async () => {
    const step = wizardSteps[currentStepIndex];
    const ok = await methods.trigger(step.fields);
    if (!ok) return;

    // Save final state and redirect to loading screen
    if (blueprintId) {
      window.location.href = `/loading/${blueprintId}`;
    } else {
      // If no blueprint ID (shouldn't happen due to auto-save), redirect to dashboard
      window.location.href = '/';
    }
  };

  const Current = StepComponents[currentStepIndex];

  if (isLoadingExisting) {
    return (
      <div className="glass-card p-6 md:p-8">
        <div className="animate-fade-in flex flex-col items-center justify-center py-12">
          <div
            className="mb-4 h-12 w-12 animate-spin rounded-full border-2"
            style={{
              borderColor: 'rgba(167, 218, 219, 0.3)',
              borderTopColor: '#a7dadb',
            }}
          />
          <p className="text-sm text-white/70">Loading your existing blueprint...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card animate-scale-in p-6 md:p-8">
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void goNext();
          }}
          className="w-full space-y-6"
        >
          <QuestionnaireProgress
            currentStep={currentStepIndex}
            totalSteps={wizardSteps.length}
            steps={wizardSteps}
          />

          <div className="relative min-h-[280px]">
            <Current />
          </div>

          {/* Save Status */}
          <div className="flex items-center justify-start py-2">
            {saveState === 'saving' && (
              <div className="animate-fade-in flex items-center gap-2" style={{ color: '#d0edf0' }}>
                <div
                  className="h-3 w-3 animate-spin rounded-full border-2"
                  style={{
                    borderColor: 'rgba(167, 218, 219, 0.3)',
                    borderTopColor: '#a7dadb',
                  }}
                />
                <span className="text-xs font-medium">Saving...</span>
              </div>
            )}
            {saveState === 'saved' && (
              <div className="animate-fade-in flex items-center gap-2 text-green-400">
                <div className="flex h-3 w-3 items-center justify-center rounded-full bg-green-500">
                  <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium">All changes saved</span>
              </div>
            )}
            {saveState === 'error' && (
              <div className="animate-fade-in flex items-center gap-2 text-red-400">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium">Save error</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <QuestionnaireButton
              type="button"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
              variant="ghost"
            >
              Previous
            </QuestionnaireButton>

            <QuestionnaireButton
              type={currentStepIndex === wizardSteps.length - 1 ? 'button' : 'submit'}
              onClick={currentStepIndex === wizardSteps.length - 1 ? handleFinish : undefined}
              disabled={currentStepIndex === wizardSteps.length - 1 && !blueprintId}
              variant="primary"
              fullWidth
            >
              {currentStepIndex === wizardSteps.length - 1
                ? 'Finish & Continue to Dynamic Questions'
                : 'Next'}
            </QuestionnaireButton>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

export default StepWizard;
