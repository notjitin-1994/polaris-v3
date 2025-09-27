'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { StaticQuestionsFormValues } from '@/components/wizard/static-questions/types';
import { deliveryMethods } from '@/components/wizard/static-questions/types';

export function DeliveryMethodStep(): JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<StaticQuestionsFormValues>();

  const getDeliveryMethodInfo = (method: string) => {
    switch (method) {
      case 'online':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          ),
          description: 'Self-paced learning with digital materials',
        };
      case 'hybrid':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V9a2 2 0 012-2h4a2 2 0 012 2v2m-6 0h6m6 0v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2m6 0v2"
              />
            </svg>
          ),
          description: 'Combination of online and in-person sessions',
        };
      case 'in-person':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          description: 'Traditional classroom or workshop setting',
        };
      default:
        return { icon: null, description: '' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-lg font-semibold text-slate-900 dark:text-slate-100">
          How will this content be delivered?
        </label>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose the primary delivery method that best fits your learners&apos; needs and constraints.
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="sr-only">Delivery method options</legend>
        <div className="space-y-4">
          {deliveryMethods.map((method) => {
            const info = getDeliveryMethodInfo(method);
            return (
              <label
                key={method}
                className={`
                  relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${
                    errors.deliveryMethod
                      ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }
                `}
              >
                <input
                  type="radio"
                  value={method}
                  {...register('deliveryMethod')}
                  className="mt-1 h-4 w-4 text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background border-slate-300"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-600 dark:text-blue-400">{info.icon}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {method.replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{info.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      {errors.deliveryMethod && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errors.deliveryMethod.message}
        </p>
      )}

      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-purple-800 dark:text-purple-200">
            <p className="font-medium mb-1">Considerations:</p>
            <p>
              This choice affects content format, interaction level, and technical requirements. You
              can always adjust based on feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
