'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TestDataPage(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createTestBlueprint = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test blueprint');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-display text-foreground mb-4">
            Test Data Generator
          </h1>
          <p className="text-body text-text-secondary max-w-2xl mx-auto">
            Create a test blueprint with pre-filled static and dynamic answers for UX development and testing.
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 space-y-6"
        >
          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-heading text-foreground mb-4">What This Creates:</h2>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl flex-shrink-0">✓</span>
                <span>
                  <strong className="text-foreground">Complete Static Answers</strong> - V2.0 format with role,
                  organization, and learning gap data
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl flex-shrink-0">✓</span>
                <span>
                  <strong className="text-foreground">10 Dynamic Question Sections</strong> - Fully structured with
                  all question types (pills, cards, scales, sliders)
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl flex-shrink-0">✓</span>
                <span>
                  <strong className="text-foreground">Complete Dynamic Answers</strong> - Test responses for all
                  questions demonstrating data structure
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-xl flex-shrink-0">✓</span>
                <span>
                  <strong className="text-foreground">Status: "answering"</strong> - Ready for testing dynamic
                  questionnaire UX
                </span>
              </li>
            </ul>
          </div>

          {/* Test Data Details */}
          <div className="bg-background/50 rounded-lg p-4 space-y-2 text-sm text-text-secondary">
            <h3 className="text-foreground font-semibold mb-2">Test Data Characteristics:</h3>
            <ul className="space-y-1 ml-4">
              <li>• Role: Learning & Development Manager</li>
              <li>• Organization: TechCorp Learning Solutions (Technology sector)</li>
              <li>• Budget: $150,000 USD</li>
              <li>• Learners: 51-200 engineers</li>
              <li>• Topic: Cloud Architecture & Microservices</li>
              <li>• All input types demonstrated (currency $, text limits, scales, sliders)</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={createTestBlueprint}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold text-lg 
                     hover:bg-primary/90 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
                     shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Test Blueprint...
              </span>
            ) : (
              '🧪 Create Test Blueprint'
            )}
          </button>

          {/* Result Display */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="text-heading text-foreground">Test Blueprint Created!</h3>
                  <p className="text-sm text-text-secondary">Blueprint ID: {result.blueprintId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Quick Access:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/dynamic-questionnaire/${result.blueprintId}`)}
                    className="w-full text-left bg-background/50 hover:bg-background/70 px-4 py-3 rounded-lg
                             text-foreground transition-colors border border-white/10"
                  >
                    <div className="font-medium">📝 Dynamic Questionnaire</div>
                    <div className="text-xs text-text-secondary mt-1">
                      View and test the 10-section questionnaire with pre-filled answers
                    </div>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full text-left bg-background/50 hover:bg-background/70 px-4 py-3 rounded-lg
                             text-foreground transition-colors border border-white/10"
                  >
                    <div className="font-medium">📊 Dashboard</div>
                    <div className="text-xs text-text-secondary mt-1">
                      See the test blueprint in your dashboard
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result.blueprintId);
                      alert('Blueprint ID copied to clipboard!');
                    }}
                    className="w-full text-left bg-background/50 hover:bg-background/70 px-4 py-3 rounded-lg
                             text-foreground transition-colors border border-white/10"
                  >
                    <div className="font-medium">📋 Copy Blueprint ID</div>
                    <div className="text-xs text-text-secondary mt-1">
                      {result.blueprintId}
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-error/10 border border-error/20 rounded-lg p-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <h3 className="text-heading text-error">Error</h3>
                  <p className="text-sm text-text-secondary mt-1">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Info Box */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-sm">
            <p className="text-foreground">
              <strong>💡 Note:</strong> This creates a new blueprint each time. The test data is clearly marked
              with <code className="bg-background/50 px-2 py-0.5 rounded">[TEST]</code> prefix for easy identification.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

