'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CosmicBackground } from '@/components/pricing/CosmicBackground';
import { PricingCard } from '@/components/pricing/PricingCard';
import { SeatSelector } from '@/components/pricing/SeatSelector';
import { PricingComparison } from '@/components/pricing/PricingComparison';
import { PricingFAQ } from '@/components/pricing/PricingFAQ';
import { ValueProposition } from '@/components/pricing/ValueProposition';

type BillingCycle = 'monthly' | 'annual';

type PersonalPlan = {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  maxConstellationsPerMonth: number;
  maxStarmapGenerations: number | 'unlimited';
  maxStarmaps: number;
  features: string[];
  highlighted?: string[];
  popular?: boolean;
  badge?: string;
};

type TeamPlan = {
  id: string;
  name: string;
  tagline: string;
  pricePerSeatMonthly: number;
  seatRange: string;
  minSeats: number;
  maxSeats: number;
  maxConstellationsPerUserPerMonth: number;
  maxStarmapGenerationsPerUser: number | 'unlimited';
  maxStarmapsPerUser: number;
  features: string[];
  highlighted?: string[];
};

const personalPlans: PersonalPlan[] = [
  {
    id: 'personal-starter',
    name: 'Explorer',
    tagline: 'Perfect for getting started',
    priceMonthly: 19,
    maxConstellationsPerMonth: 15,
    maxStarmapGenerations: 5,
    maxStarmaps: 5,
    features: [
      'AI-powered blueprint generation',
      'Professional templates & formatting',
      'Export to PDF & Word',
      'Community support',
    ],
    highlighted: ['5 generations/month', '5 saved (rolls over 12 months)'],
    badge: 'BEST FOR BEGINNERS',
  },
  {
    id: 'personal-pro',
    name: 'Navigator',
    tagline: 'For professionals & creators',
    priceMonthly: 39,
    maxConstellationsPerMonth: 50,
    maxStarmapGenerations: 20,
    maxStarmaps: 10,
      features: [
        'Everything in Explorer',
        'Save $1.85 per generation (49% cheaper)',
        'Priority support (24h response)',
      ],
    highlighted: ['20 generations/month', '10 saved (rolls over 12 months)'],
    popular: true,
  },
  {
    id: 'personal-power',
    name: 'Voyager',
    tagline: 'For power users & consultants',
    priceMonthly: 79,
    maxConstellationsPerMonth: 120,
    maxStarmapGenerations: 40,
    maxStarmaps: 40,
    features: [
      'Everything in Navigator',
      'Save $1.78 per generation (47% cheaper)',
    ],
    highlighted: ['40 generations/month', '40 saved (rolls over 12 months)'],
    badge: 'PROFESSIONAL',
  },
];

const teamPlans: TeamPlan[] = [
  {
    id: 'team-starter',
    name: 'Crew',
    tagline: 'Small teams, big impact',
    pricePerSeatMonthly: 25,
    seatRange: '2–5 seats',
    minSeats: 2,
    maxSeats: 5,
    maxConstellationsPerUserPerMonth: 40,
    maxStarmapGenerationsPerUser: 5,
    maxStarmapsPerUser: 5,
    features: [
      'Shared team workspace',
      'Real-time collaboration',
      'Role-based permissions',
      'Team analytics dashboard',
      'Bulk export to Word & PDF',
      'Priority email support',
    ],
    highlighted: ['5 generations/user/month', '5 saved (rolls over 12 months)'],
  },
  {
    id: 'team-growth',
    name: 'Fleet',
    tagline: 'Scale your operations',
    pricePerSeatMonthly: 49,
    seatRange: '6–15 seats',
    minSeats: 6,
    maxSeats: 15,
    maxConstellationsPerUserPerMonth: 75,
    maxStarmapGenerationsPerUser: 20,
    maxStarmapsPerUser: 10,
    features: [
      'Everything in Crew',
      'SSO with OAuth/SAML',
      'Advanced user management',
      'Priority support SLA (4h response)',
      'Custom onboarding session',
      'Advanced team analytics',
      'Audit logs',
    ],
    highlighted: ['20 generations/user/month', '10 saved (rolls over 12 months)'],
  },
  {
    id: 'team-scale',
    name: 'Armada',
    tagline: 'Department & organization scale',
    pricePerSeatMonthly: 99,
    seatRange: '16–50 seats',
    minSeats: 16,
    maxSeats: 50,
    maxConstellationsPerUserPerMonth: 150,
    maxStarmapGenerationsPerUser: 50,
    maxStarmapsPerUser: 50,
    features: [
      'Everything in Fleet',
      'Dedicated success manager',
      'Quarterly business reviews',
      'Custom integrations & API',
      'Advanced security controls',
      'Custom usage alerts',
      'SLA with uptime guarantee',
      'Training & workshops',
    ],
    highlighted: ['50 generations/user/month', '50 saved (rolls over 12 months)'],
  },
];

// Animated counter component
function AnimatedCounter({ value, duration = 2000, decimals = 0 }: { value: number; duration?: number; decimals?: number }) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const end = value;
    const increment = end / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [hasStarted, value, duration]);

  const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
  return <span ref={ref}>{displayValue}</span>;
}

export default function PricingPage(): React.JSX.Element {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [teamSeats, setTeamSeats] = useState<number>(5);
  const [viewMode, setViewMode] = useState<'cards' | 'comparison'>('cards');
  const [showComparison, setShowComparison] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  
  const annualMultiplier = 0.8; // 20% discount
  const annualSavings = 0.2; // 20% savings

  // Track active section for navigation
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['personal', 'team', 'enterprise', 'faq'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const section = document.getElementById(sectionId);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 100; // Account for header
      const targetPosition = section.offsetTop - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Improved volume discount logic with clear tiers
  function computePerSeatWithVolume(plan: TeamPlan, seats: number, cycle: BillingCycle) {
    const base = plan.pricePerSeatMonthly;
    let discountPct = 0;

    // Crew: 5% at max seats (encourages commitment)
    if (plan.id === 'team-starter' && seats >= 5) {
      discountPct = 0.05;
    }
    
    // Fleet: Progressive discount 10-12% (rewards growth)
    else if (plan.id === 'team-growth') {
      if (seats >= 15) discountPct = 0.12;
      else if (seats >= 10) discountPct = 0.10;
      else if (seats >= 8) discountPct = 0.05;
    }
    
    // Armada: Strong volume incentive 15-20% (enterprise scale)
    else if (plan.id === 'team-scale') {
      if (seats >= 40) discountPct = 0.20;
      else if (seats >= 30) discountPct = 0.18;
      else if (seats >= 25) discountPct = 0.15;
      else if (seats >= 20) discountPct = 0.10;
    }

    // Penalty for going outside recommended range
    let penaltyMultiplier = 1;
    if (seats < plan.minSeats) penaltyMultiplier = 1.3; // Reduced penalty
    if (seats > plan.maxSeats) penaltyMultiplier = 1.5; // Guide to enterprise

    const monthlyPerSeat = Math.max(1, Math.ceil(base * (1 - discountPct) * penaltyMultiplier));
    const perSeat =
      cycle === 'monthly' ? monthlyPerSeat : Math.ceil(monthlyPerSeat * annualMultiplier);
    return { perSeat, discountPct };
  }

  const personalPriced = useMemo(() => {
    return personalPlans.map((p) => ({
      ...p,
      price: billing === 'monthly' ? p.priceMonthly : Math.ceil(p.priceMonthly * annualMultiplier),
      monthlyPrice: p.priceMonthly,
      savings: billing === 'annual' ? Math.ceil(p.priceMonthly * annualSavings * 12) : 0,
    }));
  }, [billing]);

  function gotoSignup(planId: string): void {
    router.push(`/settings?plan=${planId}&billing=${billing}`);
  }

  // Calculate total annual savings
  const totalAnnualSavings = useMemo(() => {
    if (billing === 'annual') {
      return personalPlans.reduce((sum, plan) => sum + Math.ceil(plan.priceMonthly * annualSavings * 12), 0);
    }
    return 0;
  }, [billing]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Minimal Cosmic Background */}
      <CosmicBackground />

      {/* Minimal Floating Navigation */}
      <motion.nav
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden xl:block"
      >
        <div className="rounded-2xl p-2 bg-background/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl">
          <ul className="space-y-2">
            {[
              { id: 'personal', label: 'Personal' },
              { id: 'team', label: 'Teams' },
              { id: 'enterprise', label: 'Enterprise' },
              { id: 'faq', label: 'FAQ' },
            ].map((section, index) => (
              <motion.li
                key={section.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`
                    relative group flex items-center justify-center w-10 h-10 rounded-lg
                    transition-all duration-200
                    ${activeSection === section.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-foreground/5'
                    }
                  `}
                  aria-label={`Navigate to ${section.label}`}
                >
                  <div className={`w-2 h-2 rounded-full transition-all ${
                    activeSection === section.id ? 'bg-primary scale-100' : 'bg-text-disabled scale-75 group-hover:scale-100'
                  }`} />
                  
                  {/* Tooltip */}
                  <div className="absolute right-full mr-3 pointer-events-none">
                    <div className={`
                      px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
                      bg-background/90 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800
                      opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg
                      ${activeSection === section.id ? 'text-primary' : 'text-foreground'}
                    `}>
                      {section.label}
                    </div>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.nav>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Refined Hero Section */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20 sm:mb-24 lg:mb-32 text-center"
        >
          {/* Rollover value badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
          >
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-foreground">Your Starmaps Roll Over — Build Your Library</span>
          </motion.div>

          {/* Refined headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight"
          >
            <span className="text-foreground">Choose Your Journey</span>
            <br />
            <span className="gradient-text-cosmic">Through the Stars</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-text-secondary mx-auto max-w-2xl mb-4"
          >
            Transform your thoughts into powerful{' '}
            <span className="text-primary font-medium">Starmaps</span> with AI-powered intelligence
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-text-disabled mb-12"
          >
            Join <AnimatedCounter value={10000} />+ creators exploring new frontiers
          </motion.p>

          {/* Refined billing toggle */}
          <motion.div
            className="relative inline-flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative inline-flex items-center p-1.5 rounded-2xl bg-gradient-to-r from-surface/80 to-surface/60 backdrop-blur-lg border border-neutral-200/30 dark:border-neutral-700/30 shadow-2xl shadow-black/10">
              {/* Enhanced discount badge */}
              <motion.div
                className="absolute -top-2.5 right-2 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-success to-success-dark border border-success/30 rounded-full text-xs font-bold text-white shadow-lg"
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{
                  scale: billing === 'annual' ? 1.05 : 0.9,
                  opacity: billing === 'annual' ? 1 : 0.7
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <motion.svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  animate={{ rotate: billing === 'annual' ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </motion.svg>
                <span className="bg-gradient-to-r from-white to-success-light bg-clip-text text-transparent">
                  SAVE 20%
                </span>
              </motion.div>

              {/* Improved sliding background with gradient */}
              <motion.div
                className="absolute inset-1 rounded-xl bg-gradient-to-r from-primary/20 via-primary/15 to-secondary/20 border border-primary/30 shadow-inner"
                initial={false}
                animate={{
                  x: billing === 'monthly' ? '2px' : 'calc(50% - 2px)',
                  width: 'calc(50% - 4px)',
                  scale: billing === 'annual' ? [1, 1.02, 1] : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  scale: { duration: 0.3 }
                }}
              />

              <motion.button
                type="button"
                className={`relative z-10 px-6 py-3 text-sm font-semibold transition-all duration-300 rounded-lg ${
                  billing === 'monthly'
                    ? 'text-foreground bg-white/10 shadow-lg backdrop-blur-sm'
                    : 'text-text-secondary hover:text-foreground hover:bg-white/5'
                }`}
                onClick={() => setBilling('monthly')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  animate={{
                    color: billing === 'monthly' ? 'var(--foreground)' : 'var(--text-secondary)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Monthly
                </motion.span>
              </motion.button>

              <motion.button
                type="button"
                className={`relative z-10 px-6 py-3 text-sm font-semibold transition-all duration-300 rounded-lg ${
                  billing === 'annual'
                    ? 'text-foreground bg-white/10 shadow-lg backdrop-blur-sm'
                    : 'text-text-secondary hover:text-foreground hover:bg-white/5'
                }`}
                onClick={() => setBilling('annual')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  animate={{
                    color: billing === 'annual' ? 'var(--foreground)' : 'var(--text-secondary)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  Annual
                </motion.span>
              </motion.button>
            </div>

            {/* Enhanced savings display */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: billing === 'annual' ? 1 : 0, y: billing === 'annual' ? 0 : 5 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-success/10 border border-success/20 rounded-full">
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-success">
                  Save up to ${Math.ceil(personalPlans[2].priceMonthly * annualSavings * 12).toLocaleString()} annually
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Refined trust signals */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm"
          >
            {[
              { icon: 'check', text: 'No credit card required' },
              { icon: 'refresh', text: 'Cancel anytime' },
              { icon: 'star', text: '14-day free trial' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  {item.icon === 'check' && (
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {item.icon === 'refresh' && (
                    <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {item.icon === 'star' && (
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  )}
                </div>
                <span className="text-text-secondary font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.header>

        {/* Rollover Key Benefits Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-24 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Never Lose Another Starmap',
                text: 'Unused generations roll over monthly'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: 'Build a Growing Library',
                text: 'Accumulate up to 12 months of value'
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Work on Your Schedule',
                text: 'No pressure, no artificial deadlines'
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{benefit.title}</h3>
                <p className="text-xs text-text-secondary">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Personal plans section with comparison toggle */}
        <section id="personal" className="scroll-mt-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              For Individual Creators
            </h2>
            <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
              Start your journey through the cosmos of creativity
            </p>
            
            {/* Minimal view mode toggle */}
            <div className="inline-flex items-center p-1 rounded-lg bg-background/60 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowComparison(false)}
                className={`relative px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  !showComparison 
                    ? 'text-foreground bg-primary/10 border border-primary/20' 
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setShowComparison(true)}
                className={`relative px-5 py-2 rounded-md text-sm font-medium transition-all ${
                  showComparison 
                    ? 'text-foreground bg-primary/10 border border-primary/20' 
                    : 'text-text-secondary hover:text-foreground'
                }`}
              >
                Compare
              </button>
            </div>
          </motion.div>

        {/* Personal plans cards - center-focused layout */}
        <AnimatePresence mode="wait">
          {!showComparison ? (
            <motion.div
              key="cards"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                {personalPriced.map((plan, index) => (
                  <PricingCard
                    key={plan.id}
                    plan={plan}
                    billing={billing}
                    savings={plan.savings}
                    isCenter={plan.popular}
                    delay={index * 0.1}
                    onSelect={gotoSignup}
                  >
                    {/* Custom content for limits */}
                    <div className="space-y-5">
                      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/15">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shadow-sm" aria-hidden="true">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-foreground font-black text-2xl">
                                {plan.maxStarmapGenerations === 'unlimited'
                                  ? '∞'
                                  : (billing === 'annual'
                                      ? (plan.maxStarmapGenerations as number) * 12
                                      : plan.maxStarmapGenerations)}
                              </span>
                              <span className="text-text-secondary font-semibold text-base">
                                generations/{billing === 'annual' ? 'year' : 'month'}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary font-medium">AI-powered blueprint generation</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative p-5 rounded-2xl bg-gradient-to-br from-secondary/8 to-secondary/4 border border-secondary/15">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center shadow-sm" aria-hidden="true">
                            <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-foreground font-black text-2xl">
                                {plan.maxStarmaps === 'unlimited' ? '∞' : (billing === 'annual' ? plan.maxStarmaps * 12 : plan.maxStarmaps)}
                              </span>
                              <span className="text-text-secondary font-semibold text-base">
                                Saved/{billing === 'annual' ? 'year' : 'month'}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary font-bold">
                              Rolls over for 12 months
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PricingCard>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="comparison"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <PricingComparison 
                  plans={personalPriced}
                  planType="personal"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Value Proposition Section */}
        <section className="mt-24 sm:mt-32 lg:mt-40">
          <ValueProposition />
        </section>

        {/* Team plans section */}
        <section id="team" className="mt-24 sm:mt-32 lg:mt-40 scroll-mt-24">
          {/* Refined section header */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-3">
              <span className="text-foreground">For Teams &</span>{' '}
              <span className="gradient-text-cosmic">Organizations</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto mb-12">
              Collaborative exploration with unified mission control
            </p>
          </motion.div>

          {/* Seat selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <SeatSelector
              value={teamSeats}
              onChange={setTeamSeats}
              min={1}
              max={20}
              recommendedRange={{ min: 5, max: 8 }}
              className="max-w-2xl mx-auto"
            />
          </motion.div>

          {/* Team plans cards */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {teamPlans.map((plan, index) => {
              const active = teamSeats >= plan.minSeats && teamSeats <= plan.maxSeats;
              const { perSeat, discountPct } = computePerSeatWithVolume(plan, teamSeats, billing);
              const total = Math.ceil(perSeat * teamSeats);
              const savings = billing === 'annual' ? Math.ceil(total * 0.2 * 12) : 0;

              return (
                <PricingCard
                  key={plan.id}
                  plan={{
                    ...plan,
                    price: perSeat,
                    monthlyPrice: plan.pricePerSeatMonthly,
                    badge: discountPct > 0 ? `${Math.round(discountPct * 100)}% VOLUME DISCOUNT` : undefined,
                  }}
                  billing={billing}
                  savings={savings}
                  isTeam={true}
                  isActive={active}
                  delay={index * 0.1}
                  onSelect={gotoSignup}
                >
                  {/* Custom content for team pricing */}
                  <div className="space-y-5">
                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-surface/60 to-surface/40 border border-neutral-200/40">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-text-secondary font-semibold">
                          Total for {teamSeats} seats{billing === 'annual' ? ' (yearly)' : ''}:
                        </span>
                        <span className="text-xl font-black text-foreground">
                          ${billing === 'annual' ? total * 12 : total}/{billing === 'annual' ? 'yr' : 'mo'}
                        </span>
                      </div>
                      {billing === 'annual' && savings > 0 && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
                          <svg className="w-3.5 h-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-bold text-success">
                            Save ${savings.toLocaleString()} annually
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/4 border border-primary/15">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shadow-sm" aria-hidden="true">
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-foreground font-black text-2xl">
                              {plan.maxStarmapGenerationsPerUser === 'unlimited'
                                ? '∞'
                                : (billing === 'annual'
                                    ? (plan.maxStarmapGenerationsPerUser as number) * 12
                                    : plan.maxStarmapGenerationsPerUser)}
                            </span>
                            <span className="text-text-secondary font-semibold text-base">
                              generations/user{plan.maxStarmapGenerationsPerUser === 'unlimited' ? ' (fair usage)' : ''}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary font-medium">Per user per {billing === 'annual' ? 'year' : 'month'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-secondary/8 to-secondary/4 border border-secondary/15">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center shadow-sm" aria-hidden="true">
                          <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-foreground font-black text-2xl">
                              {plan.maxStarmapsPerUser === 'unlimited' ? '∞' : (billing === 'annual' ? plan.maxStarmapsPerUser * 12 : plan.maxStarmapsPerUser)}
                            </span>
                            <span className="text-text-secondary font-semibold text-base">
                              Saved/user
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary font-bold">
                            Rolls over for 12 months
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </PricingCard>
              );
            })}
          </motion.div>
        </section>

        {/* Enterprise section */}
        <section id="enterprise" className="mt-24 sm:mt-32 lg:mt-40 scroll-mt-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Minimal background accent */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, var(--primary-accent) 1px, transparent 1px)`,
                  backgroundSize: '48px 48px',
                  opacity: 0.05,
                }}
              />
            </div>

            <div className="relative rounded-3xl p-12 lg:p-16 bg-background/40 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50">
              {/* Refined title section */}
              <div className="text-center mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-primary/5 border border-primary/10"
                >
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-foreground">Enterprise</span>
                </motion.div>

                <h2 className="text-4xl sm:text-5xl font-heading font-bold mb-4">
                  <span className="gradient-text-cosmic">Infinite Horizons</span>
                </h2>
                <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                  Mission-critical infrastructure for organizations at scale
                </p>
              </div>

              {/* 3-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                {/* Features column - refined icons */}
                <div className="space-y-5">
                  <h3 className="text-xl font-heading font-semibold mb-8 text-foreground">Enterprise Features</h3>
                  
                    {[
                      {
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                        title: 'Unlimited Everything',
                        description: 'Unlimited starmap generations and storage'
                      },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ),
                      title: 'Advanced Security',
                      description: 'SSO/SAML, SCIM, audit logs, compliance'
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ),
                      title: 'Dedicated Support',
                      description: '24/7 priority with 99.9% uptime SLA'
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                        </svg>
                      ),
                      title: 'Custom Infrastructure',
                      description: 'Dedicated servers and white-label options'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1 text-sm">{feature.title}</h4>
                        <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Benefits column - minimal checkmarks */}
                <div className="space-y-4">
                  <h3 className="text-xl font-heading font-semibold mb-8 text-foreground">What's Included</h3>
                  
                  <div className="space-y-3">
                    {[
                      'Volume discounts for 20+ seats',
                      'Custom contract terms',
                      'Dedicated success manager',
                      'Quarterly business reviews',
                      'Custom integrations & API',
                      'Advanced analytics',
                      'Multi-region data residency',
                      'Team training & onboarding'
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-2.5 text-sm text-text-secondary"
                      >
                        <svg className="w-4 h-4 text-primary/60 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Contact column - minimal and clean */}
                <div className="lg:pl-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-2xl p-8 text-center h-full flex flex-col justify-center bg-background/60 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50"
                  >
                    <div className="mb-8">
                      <span className="text-text-disabled text-sm font-medium">Starting at</span>
                      <div className="mt-3 flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-foreground">$49</span>
                        <span className="text-text-secondary text-sm">/seat/month</span>
                      </div>
                      <p className="text-text-disabled mt-2 text-sm">Custom limits & volume discounts</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      <a
                        href="mailto:sales@smartslate.io"
                        className="block w-full px-6 py-3.5 rounded-xl 
                                 bg-secondary text-white font-medium text-sm
                                 shadow-sm hover:shadow-lg hover:shadow-secondary/25 
                                 hover:-translate-y-0.5 transition-all duration-200
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2"
                      >
                        Contact Sales
                      </a>

                      <button
                        type="button"
                        className="w-full px-6 py-3.5 rounded-xl 
                                 bg-background/60 text-foreground border border-neutral-200 dark:border-neutral-800 
                                 hover:border-primary/30 hover:bg-background/80
                                 transition-all duration-200 font-medium text-sm
                                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
                      >
                        Schedule Demo
                      </button>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-sm text-success">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="font-medium">Avg response: 2h</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mt-24 sm:mt-32 lg:mt-40 scroll-mt-24">
          <PricingFAQ />
        </section>

        {/* Refined Social Proof Section */}
        <section className="mt-24 sm:mt-32 lg:mt-40">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Trusted by Creators Worldwide
            </h2>
            <p className="text-text-secondary">
              Join thousands transforming ideas into reality
            </p>
          </motion.div>

          {/* Minimal Statistics Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {[
              { value: 10000, label: 'Active Creators', suffix: '+' },
              { value: 50000, label: 'Starmaps Created', suffix: '+' },
              { value: 4.9, label: 'Average Rating', suffix: '/5', decimals: 1 },
              { value: 97, label: 'Satisfaction Rate', suffix: '%' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-foreground mb-2">
                  <AnimatedCounter 
                    value={stat.value} 
                    duration={2000} 
                    decimals={stat.decimals}
                  />
                  <span className="gradient-text-cosmic">{stat.suffix}</span>
                </div>
                <div className="text-text-secondary text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonials subsection */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
              Loved by Creators
            </h3>
            <p className="text-text-secondary text-sm">
              Real feedback from people using SmartSlate every day
            </p>
          </motion.div>

          {/* Minimal Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {[
              {
                quote: "SmartSlate transformed how I create content. The AI understands context perfectly and saves me hours every week.",
                author: "Sarah Chen",
                role: "EdTech Founder",
                rating: 5,
              },
              {
                quote: "The advanced research features are game-changing. I can create comprehensive reports in minutes.",
                author: "Michael Rodriguez",
                role: "Research Analyst",
                rating: 5,
              },
              {
                quote: "Team collaboration features have revolutionized our workflow. Worth every penny!",
                author: "Emma Thompson",
                role: "Content Team Lead",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-8 h-full flex flex-col bg-background/40 backdrop-blur-sm border border-neutral-200/50 dark:border-neutral-800/50 hover:border-primary/20 transition-all"
              >
                {/* Minimal rating */}
                <div className="flex gap-0.5 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-primary"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="flex-1 mb-6">
                  <p className="text-text-secondary leading-relaxed">"{testimonial.quote}"</p>
                </blockquote>

                {/* Author - minimal design */}
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-200/50 dark:border-neutral-800/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-foreground text-sm">{testimonial.author}</div>
                    <div className="text-xs text-text-secondary">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="mt-24 sm:mt-32 lg:mt-40 pt-12 border-t border-neutral-200/50 dark:border-neutral-800/50">
          <div className="space-y-6 text-center max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                Terms of Service
              </a>
              <span className="text-text-disabled">•</span>
              <a href="#" className="text-text-secondary hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <span className="text-text-disabled">•</span>
              <a
                href="mailto:support@smartslate.io"
                className="text-text-secondary hover:text-primary transition-colors"
              >
                Support
              </a>
            </div>
            <p className="text-text-disabled text-xs leading-relaxed mb-4">
              Prices shown in USD. Taxes may apply based on your location. Annual billing includes 20% savings.
              All plans include a 14-day free trial with 3 Starmap generations that roll over when you subscribe.
            </p>
            <p className="text-text-disabled text-xs leading-relaxed border-t border-neutral-200/50 dark:border-neutral-800/50 pt-4">
              <strong className="text-foreground">Rollover Policy:</strong> Starmap accumulation is available on all paid plans while subscription is active. Monthly allocations per user: Explorer/Crew (5 gen/5 saved), Navigator/Fleet (20 gen/10 saved), Voyager/Armada (40 gen/40 saved). Saved starmaps roll over monthly for up to 12 months, then reset to 0. Upon cancellation, users have 30 days to access saved Starmaps. See Terms of Service for full details.
            </p>
            <div className="flex items-center justify-center gap-2 pt-6 pb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              <p className="text-xs text-text-disabled">
                Made with care by SmartSlate
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}