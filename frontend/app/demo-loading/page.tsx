/**
 * Loading Screens Demo Page
 * Preview both dynamic questions and blueprint generation loading screens
 */

'use client';

import { useState } from 'react';
import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

type LoadingType = 'dynamic-questions' | 'blueprint-generation';

function DemoContent(): React.JSX.Element {
  const { user } = useAuth();
  const [activeDemo, setActiveDemo] = useState<LoadingType>('dynamic-questions');
  const [progress, setProgress] = useState(45); // Demo progress
  const [currentStep, setCurrentStep] = useState(2);

  // Toggle between demos
  const switchDemo = (type: LoadingType) => {
    setActiveDemo(type);
    setProgress(45);
    setCurrentStep(2);
  };

  // Demo configurations
  const demos = {
    'dynamic-questions': {
      title: 'Generating Dynamic Questions',
      subtitle:
        'Our AI is analyzing your responses and creating personalized questions. This typically takes 5-15 seconds.',
      statusMessage: 'Crafting personalized questions...',
      steps: [
        'Analyzing your static questionnaire responses',
        'Researching industry-specific best practices',
        'Creating personalized questions',
        'Generating comprehensive questionnaire',
      ],
      stepCount: 5,
      badge: 'Perplexity Research',
      infoTitle: "What's happening?",
    },
    'blueprint-generation': {
      title: 'Generating Your Learning Blueprint',
      subtitle:
        'Our AI is analyzing your responses and creating a comprehensive, personalized learning blueprint. This typically takes 30-60 seconds.',
      statusMessage: 'Designing instructional strategy...',
      steps: [
        'Analyzing your questionnaire responses',
        'Creating personalized learning objectives',
        'Designing instructional strategies',
        'Generating comprehensive blueprint',
      ],
      stepCount: 6,
      badge: 'Claude Sonnet 4',
      infoTitle: "What's happening?",
    },
  };

  const config = demos[activeDemo];

  return (
    <div className="min-h-screen bg-[#020C1B]">
      {/* Header */}
      <StandardHeader
        title="Loading Screens Demo"
        subtitle="Preview the beautiful loading experiences for dynamic questions and blueprint generation"
        backHref="/"
        backLabel="Back to Dashboard"
        user={user}
      />

      {/* Demo Selector */}
      <div className="w-full border-b border-white/10 px-4 py-4">
        <div className="mx-auto flex max-w-3xl justify-center gap-4">
          <button
            onClick={() => switchDemo('dynamic-questions')}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
              activeDemo === 'dynamic-questions'
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'glass-strong text-text-secondary hover:text-foreground'
            } `}
          >
            <Sparkles className="h-4 w-4" />
            <span>Dynamic Questions Loading</span>
          </button>
          <button
            onClick={() => switchDemo('blueprint-generation')}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all ${
              activeDemo === 'blueprint-generation'
                ? 'bg-secondary text-secondary-foreground shadow-lg'
                : 'glass-strong text-text-secondary hover:text-foreground'
            } `}
          >
            <Sparkles className="h-4 w-4" />
            <span>Blueprint Generation Loading</span>
          </button>
        </div>
      </div>

      {/* Main Content - Loading Screen Preview */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDemo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-3xl"
          >
            <div className="glass rounded-2xl p-8 md:p-12">
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="bg-primary/10 flex h-20 w-20 items-center justify-center rounded-full"
                >
                  <Sparkles className="text-primary h-10 w-10" />
                </motion.div>
              </div>

              {/* Status Message */}
              <h2 className="text-title text-foreground mb-3 text-center">
                {activeDemo === 'dynamic-questions'
                  ? 'Generating Questions'
                  : 'Generating Blueprint'}
              </h2>

              <p className="text-body text-text-secondary mb-8 text-center">
                {config.statusMessage}
              </p>

              {/* Progress Bar */}
              <div className="mx-auto mb-6 max-w-md">
                <div className="text-text-secondary mb-2 flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="bg-surface h-2 overflow-hidden rounded-full">
                  <motion.div
                    className="bg-primary h-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Powered by Solara Badge */}
              <div className="mt-6 flex justify-center">
                <div className="glass-strong rounded-full px-4 py-2 text-xs">
                  <span className="text-text-secondary">Powered by </span>
                  <span
                    className="font-semibold text-[#FFD700]"
                    style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}
                  >
                    Solara
                  </span>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: config.stepCount }).map((_, index) => {
                  const step = index + 1;
                  return (
                    <motion.div
                      key={step}
                      className={`h-2 w-2 rounded-full ${
                        step === currentStep
                          ? 'bg-primary'
                          : step < currentStep
                            ? 'bg-secondary'
                            : 'bg-surface'
                      }`}
                      animate={
                        step === currentStep
                          ? {
                              scale: [1, 1.3, 1],
                              opacity: [0.7, 1, 0.7],
                            }
                          : {}
                      }
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-strong mt-6 rounded-xl p-6"
            >
              <h3 className="text-foreground mb-3 text-sm font-semibold">{config.infoTitle}</h3>
              <ul className="text-text-secondary space-y-2 text-sm">
                {config.steps.map((step, index) => (
                  <li key={step} className="flex items-start gap-2">
                    {index < currentStep - 1 ? (
                      <CheckCircle className="text-success mt-0.5 h-4 w-4 flex-shrink-0" />
                    ) : index === currentStep - 1 ? (
                      <div className="border-primary mt-0.5 h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
                    ) : (
                      <div className="border-surface mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border-2" />
                    )}
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Demo Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-strong mt-6 rounded-xl p-6"
            >
              <h3 className="text-foreground mb-4 text-sm font-semibold">Demo Controls</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary mb-2 block text-xs">Progress</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => setProgress(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-primary mt-1 text-center text-xs">
                    {Math.round(progress)}%
                  </div>
                </div>

                <div>
                  <label className="text-text-secondary mb-2 block text-xs">Current Step</label>
                  <input
                    type="range"
                    min="1"
                    max={config.stepCount}
                    value={currentStep}
                    onChange={(e) => setCurrentStep(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-primary mt-1 text-center text-xs">
                    Step {currentStep} of {config.stepCount}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-300 pt-4">
                <div className="text-text-secondary space-y-1 text-xs">
                  <div>
                    <span className="font-semibold">Route:</span>{' '}
                    {activeDemo === 'dynamic-questions' ? '/loading/[id]' : '/generating/[id]'}
                  </div>
                  <div>
                    <span className="font-semibold">API:</span>{' '}
                    {activeDemo === 'dynamic-questions'
                      ? '/api/dynamic-questions'
                      : '/api/blueprints/generate'}
                  </div>
                  <div>
                    <span className="font-semibold">Redirect:</span>{' '}
                    {activeDemo === 'dynamic-questions'
                      ? '/dynamic-wizard/[id]'
                      : '/blueprint/[id]'}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function DemoLoadingPage(): React.JSX.Element {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DemoContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
