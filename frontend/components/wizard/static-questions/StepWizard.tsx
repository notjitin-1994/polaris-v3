'use client';

import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { useWizardStore } from '@/store/wizardStore';
import {
  staticQuestionsSchema,
  defaultValues,
  wizardSteps,
  type StaticQuestionsFormValues,
} from '@/components/wizard/static-questions/types';
import { LearningObjectiveStep } from '@/components/wizard/static-questions/steps/LearningObjectiveStep';
import { TargetAudienceStep } from '@/components/wizard/static-questions/steps/TargetAudienceStep';
import { DeliveryMethodStep } from '@/components/wizard/static-questions/steps/DeliveryMethodStep';
import { DurationStep } from '@/components/wizard/static-questions/steps/DurationStep';
import { AssessmentTypeStep } from '@/components/wizard/static-questions/steps/AssessmentTypeStep';
import { ProgressIndicator } from '@/components/wizard/static-questions/ProgressIndicator';
import { useSession } from '@/hooks/useSession';
import { useAutoSave } from '@/components/wizard/static-questions/hooks/useAutoSave';

const StepComponents: Record<number, React.FC> = {
  0: LearningObjectiveStep,
  1: TargetAudienceStep,
  2: DeliveryMethodStep,
  3: DurationStep,
  4: AssessmentTypeStep,
};

export function StepWizard(): JSX.Element {
  const { user } = useSession();
  const { currentStepIndex, setStep, values, setValues, saveState, blueprintId, setBlueprintId } = useWizardStore();
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

  // Load existing blueprint data if available
  useEffect(() => {
    const loadExistingBlueprint = async () => {
      if (!user?.id || blueprintId) return; // Only load if no blueprint ID is set yet
      
      setIsLoadingExisting(true);
      try {
        const { blueprintService } = await import('@/lib/db/blueprints');
        const userBlueprints = await blueprintService.getBlueprintsByUser(user.id);
        const draftBlueprint = userBlueprints.find(bp => bp.status === 'draft');
        
        if (draftBlueprint && draftBlueprint.static_answers) {
          const existingAnswers = draftBlueprint.static_answers as Partial<StaticQuestionsFormValues>;
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
  }, [user?.id, blueprintId, setValues, setBlueprintId, methods]);

  // Auto-save on change
  useAutoSave(user?.id ?? null);

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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your existing blueprint...</p>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          void goNext();
        }}
      >
        <ProgressIndicator currentIndex={currentStepIndex} onSelect={goTo} />

        <div className="relative min-h-64">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepIndex}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <Current />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation and Status */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {saveState === 'saving' && (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">Saving...</span>
                  </div>
                )}
                {saveState === 'saved' && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">All changes saved</span>
                  </div>
                )}
                {saveState === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Save error</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStepIndex === 0}
                className="px-6 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {currentStepIndex === wizardSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200"
                >
                  Finish & Continue to Dynamic Questions
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all duration-200"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default StepWizard;
