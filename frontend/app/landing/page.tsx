'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, CheckCircle, FileText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[rgb(2,12,27)] text-[rgb(224,224,224)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-block rounded-full border border-[rgb(167,218,219)] bg-[rgba(167,218,219,0.1)] px-4 py-2"
            >
              <span className="text-sm font-semibold text-[rgb(167,218,219)]">
                Learning Blueprint: Powered by{' '}
                <span
                  className="text-[rgb(255,215,0)]"
                  style={{
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
                  }}
                >
                  Solara
                </span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading mb-6 text-4xl leading-tight font-bold sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Transform Ideas into{' '}
              <span className="text-[rgb(167,218,219)]">Launch-Ready Blueprints</span> in Hours
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-[rgb(176,197,198)] sm:text-xl"
            >
              Polaris eliminates weeks of planning with AI-driven blueprint generation. From
              stakeholder interviews to production-ready documentation, we automate the entire
              learning design process.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[rgb(79,70,229)] px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-[rgb(67,56,202)]"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[rgb(79,70,229)] px-8 py-3 text-base font-semibold text-[rgb(79,70,229)] transition-colors hover:bg-[rgba(79,70,229,0.1)]"
              >
                View Pricing
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap justify-center gap-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(167,218,219,0.15)]">
                  <Clock className="h-6 w-6 text-[rgb(167,218,219)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[rgb(167,218,219)]">15x</div>
                  <div className="text-sm text-[rgb(176,197,198)]">Faster Launch</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(167,218,219,0.15)]">
                  <CheckCircle className="h-6 w-6 text-[rgb(167,218,219)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[rgb(167,218,219)]">Zero</div>
                  <div className="text-sm text-[rgb(176,197,198)]">Revisions</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(167,218,219,0.15)]">
                  <Sparkles className="h-6 w-6 text-[rgb(167,218,219)]" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-[rgb(167,218,219)]">100%</div>
                  <div className="text-sm text-[rgb(176,197,198)]">Accurate</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[rgb(79,70,229)] opacity-10 blur-3xl" />
          <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-[rgb(167,218,219)] opacity-10 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="font-heading mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to Launch Learning Programs
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-[rgb(176,197,198)]">
              From stakeholder interviews to production-ready documentation, we handle the entire
              learning design process.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: 'Stakeholder Interviews',
                description: 'AI-powered question generation captures every requirement perfectly.',
              },
              {
                icon: Sparkles,
                title: 'Smart Analysis',
                description:
                  'Automated gap detection identifies missing requirements before they become problems.',
              },
              {
                icon: CheckCircle,
                title: 'Production Ready',
                description: 'Comprehensive blueprints ready to present to leadership on day one.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(167,218,219,0.15)]">
                  <feature.icon className="h-6 w-6 text-[rgb(167,218,219)]" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-[rgb(224,224,224)]">{feature.title}</h3>
                <p className="text-[rgb(176,197,198)]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading mb-4 text-3xl font-bold sm:text-4xl"
          >
            Ready to Transform Your Learning Design Process?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 text-lg text-[rgb(176,197,198)]"
          >
            Join thousands of learning professionals who are launching programs 15x faster with
            Polaris.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[rgb(79,70,229)] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[rgb(67,56,202)]"
            >
              Start Your Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
