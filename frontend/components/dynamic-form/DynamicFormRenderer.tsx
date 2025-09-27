'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider, FieldValues, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSchema, DynamicFormRendererProps, DynamicFormRef } from '@/lib/dynamic-form';
import { validateFormData } from '@/lib/dynamic-form/validation';
import { getInputComponent } from './inputs';
import { cn } from '@/lib/utils';

// Error boundary component
class FormErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error: Error }>;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
    <h3 className="text-lg font-semibold text-red-800">Form Error</h3>
    <p className="text-red-600">
      There was an error rendering the form. Please try refreshing the page.
    </p>
    <details className="mt-2">
      <summary className="cursor-pointer text-sm text-red-500">Error Details</summary>
      <pre className="mt-1 text-xs text-red-400 overflow-auto">{error.message}</pre>
    </details>
  </div>
);

// Create Zod schema from form schema
const createZodSchema = (formSchema: FormSchema): z.ZodSchema => {
  // Add defensive programming to handle undefined sections
  if (!formSchema.sections || !Array.isArray(formSchema.sections)) {
    console.warn('Form schema sections are not properly defined:', formSchema.sections);
    return z.object({});
  }

  const questionSchemas = formSchema.sections.flatMap((section) => {
    // Skip undefined sections
    if (!section || !section.questions || !Array.isArray(section.questions)) {
      console.warn('Section or questions are not properly defined:', section);
      return [];
    }

    return section.questions.map((question) => {
      // Skip undefined questions
      if (!question || !question.id) {
        console.warn('Question is not properly defined:', question);
        return null;
      }

      let fieldSchema: z.ZodTypeAny;
      const questionLabel = question.label || question.question || question.id || 'This field';

      switch (question.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'url':
          if (question.required) {
            fieldSchema = z.string().min(1, `${questionLabel} is required`);
          } else {
            fieldSchema = z.string().optional();
          }
          break;

        case 'number':
          if (question.required) {
            fieldSchema = z.number().min(0, `${questionLabel} is required`);
          } else {
            fieldSchema = z.number().optional();
          }
          break;

        case 'select':
          if (question.required) {
            fieldSchema = z.string().min(1, `${questionLabel} is required`);
          } else {
            fieldSchema = z.string().optional();
          }
          break;

        case 'multiselect':
          if (question.required) {
            fieldSchema = z.array(z.string()).min(1, `${questionLabel} is required`);
          } else {
            fieldSchema = z.array(z.string()).optional();
          }
          break;

        case 'scale':
          if (question.required) {
            fieldSchema = z
              .number()
              .min(question.scaleConfig?.min || 1, `${questionLabel} is required`);
          } else {
            fieldSchema = z.number().optional();
          }
          break;

        case 'date':
          if (question.required) {
            fieldSchema = z.string().min(1, `${questionLabel} is required`);
          } else {
            fieldSchema = z.string().optional();
          }
          break;

        default:
          fieldSchema = z.any().optional();
      }

      return [question.id, fieldSchema] as const;
    }).filter(Boolean); // Remove null entries
  });

  return z.object(Object.fromEntries(questionSchemas));
};

// Main DynamicFormRenderer component
export const DynamicFormRenderer = React.forwardRef<DynamicFormRef, DynamicFormRendererProps>(
  (
    {
      formSchema,
      initialData = {},
      onSubmit,
      onSave,
      onValidationChange,
      className,
      disabled = false,
      showProgress = true,
      autoSave = true,
    },
    ref,
  ) => {
    // State management
    const [currentSection, setCurrentSection] = useState<string>(formSchema.sections[0]?.id || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Debug: Log current section
    console.log('Current section:', currentSection);
    console.log(
      'Form schema sections:',
      formSchema.sections.map((s) => s.id),
    );

    // Create Zod schema for validation
    const zodSchema = useMemo(() => createZodSchema(formSchema), [formSchema]);

    // Prepare default values with proper initialization
    const defaultValues = useMemo(() => {
      const values: FieldValues = { ...initialData };

      // Initialize all required fields with empty strings to avoid undefined
      formSchema.sections.forEach((section) => {
        section.questions.forEach((question) => {
          if (question.required && !(question.id in values)) {
            switch (question.type) {
              case 'text':
              case 'textarea':
              case 'email':
              case 'url':
              case 'select':
              case 'date':
                values[question.id] = '';
                break;
              case 'number':
              case 'scale':
                values[question.id] = 0;
                break;
              case 'multiselect':
                values[question.id] = [];
                break;
              default:
                values[question.id] = '';
            }
          }
        });
      });

      return values;
    }, [initialData, formSchema]);

    // Initialize React Hook Form
    const methods = useForm<FieldValues>({
      resolver: zodResolver(zodSchema),
      defaultValues,
      mode: 'onChange',
    });

    const {
      handleSubmit,
      watch,
      formState: { isValid },
      setValue,
      reset,
      trigger,
    } = methods;

    // Validation engine
    // const validationEngine = useMemo(() => createValidationEngine(formSchema), [formSchema]);

    // Watch form data for changes
    const formData = watch();

    // Handle form data changes
    useEffect(() => {
      setHasUnsavedChanges(true);

      // Validate form and notify parent
      if (onValidationChange) {
        const validationResult = validateFormData(formSchema, formData);
        onValidationChange(validationResult.isValid, validationResult.errors);
      }
    }, [formData, formSchema, onValidationChange]);

    // Trigger validation on mount
    useEffect(() => {
      trigger();
    }, [trigger]);

    // Auto-save functionality
    useEffect(() => {
      if (!autoSave || !hasUnsavedChanges) return;

      const timeoutId = setTimeout(async () => {
        if (onSave) {
          try {
            setIsSaving(true);
            await onSave(formData);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
          } catch (error) {
            console.error('Auto-save failed:', error);
          } finally {
            setIsSaving(false);
          }
        }
      }, formSchema.settings?.autoSaveInterval || 2000);

      return () => clearTimeout(timeoutId);
    }, [formData, autoSave, hasUnsavedChanges, onSave, formSchema.settings?.autoSaveInterval]);

    // Handle form submission
    const handleFormSubmit = useCallback(
      async (data: FieldValues) => {
        if (isSubmitting) return;

        try {
          setIsSubmitting(true);
          // Validate the form before submission
          const isValid = await trigger();
          if (isValid && onSubmit) {
            await onSubmit(data);
          }
        } catch (error) {
          console.error('Form submission failed:', error);
        } finally {
          setIsSubmitting(false);
        }
      },
      [onSubmit, isSubmitting, trigger],
    );

    // Handle manual save
    const handleManualSave = useCallback(async () => {
      if (!onSave || isSaving) return;

      try {
        setIsSaving(true);
        await onSave(formData);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Manual save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, [onSave, formData, isSaving]);

    // Handle section navigation
    const goToSection = useCallback(
      (sectionId: string) => {
        const section = formSchema.sections.find((s) => s.id === sectionId);
        if (section) {
          setCurrentSection(sectionId);
        }
      },
      [formSchema.sections],
    );

    const nextSection = useCallback(() => {
      const currentIndex = formSchema.sections.findIndex((s) => s.id === currentSection);
      if (currentIndex < formSchema.sections.length - 1) {
        setCurrentSection(formSchema.sections[currentIndex + 1].id);
      }
    }, [currentSection, formSchema.sections]);

    const previousSection = useCallback(() => {
      const currentIndex = formSchema.sections.findIndex((s) => s.id === currentSection);
      if (currentIndex > 0) {
        setCurrentSection(formSchema.sections[currentIndex - 1].id);
      }
    }, [currentSection, formSchema.sections]);

    // Calculate progress
    const progress = useMemo(() => {
      const totalQuestions = formSchema.sections.reduce(
        (acc, section) => acc + section.questions.length,
        0,
      );
      const answeredQuestions = Object.keys(formData).filter((key) => {
        const value = formData[key];
        return value !== undefined && value !== null && value !== '';
      }).length;

      return {
        current: answeredQuestions,
        total: totalQuestions,
        percentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
      };
    }, [formData, formSchema.sections]);

    // Expose methods via ref
    React.useImperativeHandle(
      ref,
      () => ({
        submit: handleFormSubmit,
        save: handleManualSave,
        reset: () => {
          reset();
          setCurrentSection(formSchema.sections[0]?.id || '');
          setHasUnsavedChanges(false);
        },
        validate: () => validateFormData(formSchema, formData),
        getData: () => formData,
        setData: (data: Record<string, unknown>) => {
          Object.entries(data).forEach(([key, value]) => {
            setValue(key, value);
          });
        },
        goToSection,
        nextSection,
        previousSection,
      }),
      [
        handleFormSubmit,
        handleManualSave,
        reset,
        formSchema,
        formData,
        setValue,
        goToSection,
        nextSection,
        previousSection,
      ],
    );

    return (
      <FormErrorBoundary>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-6', className)}>
            {/* Form title and description */}
            {formSchema.title && (
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formSchema.title}
                </h1>
                {formSchema.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {formSchema.description}
                  </p>
                )}
              </div>
            )}

            {/* Progress indicator */}
            {showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress</span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Form sections */}
            {formSchema.sections && Array.isArray(formSchema.sections) ? (
              formSchema.sections.map((section, sectionIndex) => {
                // Skip undefined sections
                if (!section || !section.id) {
                  console.warn('Skipping undefined section at index:', sectionIndex);
                  return null;
                }

                const isHidden = currentSection !== section.id;
                const className = cn('space-y-6', isHidden && 'hidden');

                // Debug: Log section visibility
                console.log(`Section ${section.id}: isHidden=${isHidden}, className=${className}`);

                return (
                  <div
                    key={`section-${sectionIndex}-${section.id}`}
                    className={className}
                    // One-off: Dynamic visibility based on condition logic - must use display property for proper hiding
                    style={{ display: isHidden ? 'none' : 'block' }}
                  >
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {section.title || `Section ${sectionIndex + 1}`}
                      </h2>
                      {section.description && (
                        <p className="text-gray-600 dark:text-gray-300">{section.description}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {section.questions && Array.isArray(section.questions) ? (
                        section.questions.map((question, questionIndex) => {
                          // Skip undefined questions
                          if (!question || !question.id) {
                            console.warn('Skipping undefined question at index:', questionIndex);
                            return null;
                          }

                          return (
                            <div key={`question-${sectionIndex}-${questionIndex}-${question.id}`} className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {question.label || question.question || `Question ${questionIndex + 1}`}
                                {question.required && <span className="text-red-500 ml-1">*</span>}
                              </label>

                              {question.helpText && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {question.helpText}
                                </p>
                              )}

                              {/* Render actual input components based on question type */}
                              <Controller
                                name={question.id}
                                control={methods.control}
                                render={({ field, fieldState }) => {
                                  const InputComponent = getInputComponent(question.type);
                                  return (
                                    <InputComponent
                                      key={`input-${sectionIndex}-${questionIndex}-${question.id}`}
                                      question={question}
                                      value={field.value}
                                      onChange={(value) => {
                                        field.onChange(value);
                                        trigger(question.id);
                                      }}
                                      onBlur={() => {
                                        field.onBlur();
                                        trigger(question.id);
                                      }}
                                      error={fieldState.error?.message}
                                      disabled={disabled}
                                    />
                                  );
                                }}
                              />
                            </div>
                          );
                        }).filter(Boolean) // Remove null entries
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No questions available in this section.</p>
                      )}
                    </div>
                  </div>
                );
              }).filter(Boolean) // Remove null entries
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No sections available. Please try refreshing the page.</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                {currentSection !== formSchema.sections[0]?.id && (
                  <button
                    type="button"
                    onClick={previousSection}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    disabled={disabled}
                  >
                    Previous
                  </button>
                )}

                {currentSection !== formSchema.sections[formSchema.sections.length - 1]?.id && (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    disabled={disabled}
                  >
                    Next
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                {onSave && (
                  <button
                    type="button"
                    onClick={handleManualSave}
                    disabled={disabled || isSaving}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving
                      ? 'Saving...'
                      : formSchema.settings?.saveButtonText || 'Save Progress'}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={disabled || isSubmitting || !isValid}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : formSchema.settings?.submitButtonText || 'Submit Form'}
                </button>
              </div>
            </div>

            {/* Save status */}
            {lastSaved && (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </form>
        </FormProvider>
      </FormErrorBoundary>
    );
  },
);

DynamicFormRenderer.displayName = 'DynamicFormRenderer';

export default DynamicFormRenderer;
