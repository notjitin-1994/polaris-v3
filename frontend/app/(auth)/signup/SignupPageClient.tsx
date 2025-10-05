/* eslint-disable no-restricted-syntax */
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SwirlBackground from '@/components/SwirlBackground';
import HeaderSwirlBackground from '@/components/HeaderSwirlBackground';
import { PolarisPerks } from '@/components/auth/PolarisPerks';
import { SignupFormContent } from '@/components/auth/SignupFormContent';

export default function SignupPageClient(): React.JSX.Element {
  const [isMobile, setIsMobile] = useState(false);

  // Only handle mobile detection, not auth - that's handled server-side
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = (): void => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#020C1B] px-2 py-8 md:px-6 lg:px-8 lg:py-12">
      <SwirlBackground />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Master container wrapping both sections */}
        <div
          className={isMobile ? '' : 'glass-card overflow-hidden border border-white/10 p-5 md:p-8'}
        >
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Info card (top) */}
            <section className="flex h-full w-full justify-center lg:justify-start">
              <div className="flex h-full w-full max-w-xl flex-col p-2 text-left sm:p-3 md:p-4 lg:max-w-none">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2">
                    <div className="relative">
                      <Image
                        src="/logo.png"
                        alt="Smartslate"
                        width={180}
                        height={38}
                        className="h-9 w-auto select-none md:h-10 lg:h-12"
                        priority
                      />
                      <span className="font-heading absolute -top-1 -right-8 text-xs font-medium text-white md:-right-10 md:text-sm">
                        Polaris
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 max-w-2xl text-base text-white/70">
                    Turn customer insight into a clear, prioritized roadmap. Align faster. Build
                    smarter.
                  </p>
                </div>

                {/* Public report mockup */}
                <div className="mt-6 hidden min-h-[460px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:block md:min-h-[520px] lg:min-h-[600px]">
                  {/* Mock header */}
                  <div className="relative min-h-[34px] overflow-hidden border-b border-white/10 bg-[rgb(2,12,27)]/60 backdrop-blur-xl md:min-h-[40px]">
                    <HeaderSwirlBackground />
                    <div className="relative z-10 flex items-center justify-between px-[0.5rem] py-[0.4rem] md:px-[0.6rem] md:py-[0.5rem]">
                      <div className="flex flex-col items-start">
                        <Image
                          src="/logo.png"
                          alt="SmartSlate"
                          width={128}
                          height={128}
                          className="h-4 w-auto md:h-5 lg:h-6"
                          quality={100}
                          priority
                          unoptimized
                        />
                        <span className="mt-1 font-['Lato'] text-xs text-white md:text-sm">
                          Polaris Starmaps
                        </span>
                      </div>
                      <div className="hidden items-center gap-3 md:flex">
                        <span className="bg-primary h-[14px] w-[14px] rounded-full border border-white/10" />
                        <span className="bg-primary/30 h-[14px] w-[14px] rounded-full border border-white/10" />
                      </div>
                    </div>
                  </div>

                  {/* Mock blueprint sections */}
                  <div className="block h-full p-4 md:p-6">
                    <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                      <div className="flex h-full flex-col p-4 md:p-6">
                        {/* Blueprint sections skeleton - matching new blueprint structure */}

                        {/* Executive Summary Section */}
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 h-4 w-32 rounded-full bg-white/30" />
                          <div className="space-y-2">
                            <div className="h-2 w-full rounded-full bg-white/15" />
                            <div className="h-2 w-4/5 rounded-full bg-white/10" />
                            <div className="h-2 w-3/4 rounded-full bg-white/10" />
                          </div>
                        </div>

                        {/* Learning Objectives Section */}
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 h-4 w-40 rounded-full bg-white/30" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="h-2 w-3/4 rounded-full bg-white/15" />
                              <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-2/3 rounded-full bg-white/15" />
                              <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                            </div>
                          </div>
                        </div>

                        {/* Target Audience Section */}
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 h-4 w-36 rounded-full bg-white/30" />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="h-12 rounded-lg border border-white/10 bg-white/5" />
                            <div className="h-12 rounded-lg border border-white/10 bg-white/5" />
                            <div className="h-12 rounded-lg border border-white/10 bg-white/5" />
                          </div>
                        </div>

                        {/* Content Outline Section (Timeline) */}
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 h-4 w-32 rounded-full bg-white/30" />
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="bg-primary h-3 w-3 rounded-full" />
                              <div className="h-2 flex-1 rounded-full bg-white/15" />
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 rounded-full bg-white/20" />
                              <div className="h-2 flex-1 rounded-full bg-white/10" />
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-3 rounded-full bg-white/20" />
                              <div className="h-2 flex-1 rounded-full bg-white/10" />
                            </div>
                          </div>
                        </div>

                        {/* Assessment Strategy Section */}
                        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 h-4 w-40 rounded-full bg-white/30" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <div className="h-2 w-3/4 rounded-full bg-white/15" />
                              <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 w-2/3 rounded-full bg-white/15" />
                              <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                            </div>
                          </div>
                        </div>

                        {/* Resources Section (Table-like) */}
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <div className="mb-3 h-4 w-24 rounded-full bg-white/30" />
                          <div className="space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="h-6 rounded border border-white/10 bg-white/5" />
                              <div className="h-6 rounded border border-white/10 bg-white/5" />
                              <div className="h-6 rounded border border-white/10 bg-white/5" />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="h-6 rounded border border-white/10 bg-white/5" />
                              <div className="h-6 rounded border border-white/10 bg-white/5" />
                              <div className="h-6 rounded border border-white/10 bg-white/5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Login modal (bottom) */}
            <section className="flex h-full w-full items-stretch justify-center pt-0 pb-6 sm:pt-1 md:pt-2">
              {/* Unified glow wrapper */}
              <div className="relative h-full w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(167,218,219,0.18),0_12px_60px_rgba(167,218,219,0.28),0_8px_24px_rgba(167,218,219,0.18)] backdrop-blur-xl lg:max-w-none">
                {/* Opulent brand teal/indigo glow */}
                <div
                  className="pointer-events-none absolute -inset-6 rounded-3xl opacity-75 blur-2xl"
                  aria-hidden="true"
                  style={{
                    background: 'rgba(167,218,219,0.15)',
                  }}
                />
                <div className="relative flex h-full flex-col space-y-3 px-4 py-3 sm:space-y-4 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-7">
                  {/* Auth Page Content */}
                  <div className="relative z-10 mx-auto h-full w-full max-w-sm md:max-w-sm lg:max-w-md">
                    <div className="animate-scale-in flex h-full flex-col rounded-2xl px-0 pt-0.5 pb-2 sm:pt-1 sm:pb-3 md:pt-2 md:pb-4 lg:pb-4">
                      {/* Soft halo for mobile to lift the card */}
                      <div
                        className="bg-primary/10 pointer-events-none absolute -inset-0.5 rounded-2xl opacity-70 blur-xl"
                        aria-hidden="true"
                      />
                      <div className="relative flex flex-1 flex-col">
                        <div className="animate-fade-in mb-3 select-none sm:mb-4">
                          {/* Hide logo on medium+ since it's now in the left hero pill; keep on mobile */}
                          <Image
                            src="/logo.png"
                            alt="Smartslate"
                            width={180}
                            height={38}
                            className="logo-glow h-7 w-auto sm:h-8 md:hidden"
                          />
                          <h2 className="font-heading mt-1.5 text-base font-semibold text-white sm:mt-2 sm:text-lg">
                            Create your account
                          </h2>
                          <p className="mt-1 text-xs text-white/60 sm:text-sm">
                            Get started with Polaris Starmaps.
                          </p>
                        </div>

                        <div className="animate-fade-in-up">
                          <SignupFormContent />
                        </div>

                        {/* Keep footer content at the bottom on mobile; not needed on large screens */}
                        <div className="flex-1 lg:hidden" />

                        <p className="mt-4 text-left text-[11px] text-white/60 sm:mt-5 sm:text-xs">
                          Already have an account?{' '}
                          <Link
                            href="/login"
                            className="text-secondary hover:text-secondary/80 underline underline-offset-4"
                          >
                            Sign In
                          </Link>
                        </p>
                        <p className="mt-2 text-left text-[10px] text-white/50 sm:mt-3 sm:text-[11px]">
                          By continuing, you agree to our{' '}
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline underline-offset-4"
                          >
                            Terms
                          </a>{' '}
                          and{' '}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline underline-offset-4"
                          >
                            Privacy Policy
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  <PolarisPerks />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
