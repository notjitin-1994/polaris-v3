import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

type BillingCycle = 'monthly' | 'annual';

type PersonalPlan = {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  maxConstellationsPerMonth: number;
  maxStarmaps: number;
  features: string[];
  highlighted?: string[];
  popular?: boolean;
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
  maxStarmapsPerUser: number;
  features: string[];
  highlighted?: string[];
};

const personalPlans: PersonalPlan[] = [
  {
    id: 'personal-starter',
    name: 'Explorer',
    tagline: 'Begin your cosmic journey',
    priceMonthly: 9,
    maxConstellationsPerMonth: 10,
    maxStarmaps: 5,
    features: [
      'AI-powered report creation',
      'Solara Lodestar AI Editor',
      'Standard processing speed',
      'Community support',
    ],
    highlighted: ['10 Starmaps/month'],
  },
  {
    id: 'personal-pro',
    name: 'Navigator',
    tagline: 'Chart deeper territories',
    priceMonthly: 19,
    maxConstellationsPerMonth: 30,
    maxStarmaps: 20,
    features: [
      'Everything in Explorer',
      '5x faster AI processing',
      'Export to Word & PDF',
      'Priority support response',
      'Version history (30 days)',
      'Custom templates',
    ],
    highlighted: ['30 Starmaps/month', '5x faster processing'],
    popular: true,
  },
  {
    id: 'personal-power',
    name: 'Voyager',
    tagline: 'Unlimited exploration',
    priceMonthly: 49,
    maxConstellationsPerMonth: 500,
    maxStarmaps: 75,
    features: [
      'Everything in Navigator',
      'Advanced research suite',
      'Custom style presets',
      'API access (coming soon)',
      'White-glove onboarding',
      'Unlimited version history',
    ],
    highlighted: ['Unlimited Starmaps/month (fair usage)', 'Advanced research'],
  },
];

const teamPlans: TeamPlan[] = [
  {
    id: 'team-starter',
    name: 'Crew',
    tagline: 'Collaborate across the cosmos',
    pricePerSeatMonthly: 12,
    seatRange: '2–5 seats',
    minSeats: 2,
    maxSeats: 5,
    maxConstellationsPerUserPerMonth: 50,
    maxStarmapsPerUser: 20,
    features: [
      'Shared team workspace',
      'Real-time collaboration',
      'Role-based permissions',
      'Team analytics dashboard',
      'Bulk export options',
    ],
    highlighted: ['Perfect for small teams'],
  },
  {
    id: 'team-growth',
    name: 'Fleet',
    tagline: 'Scale your operations',
    pricePerSeatMonthly: 19,
    seatRange: '6–10 seats',
    minSeats: 6,
    maxSeats: 10,
    maxConstellationsPerUserPerMonth: 100,
    maxStarmapsPerUser: 50,
    features: [
      'Everything in Crew',
      'SSO with OAuth/SAML',
      'Advanced user management',
      'Priority support SLA',
      'Custom onboarding',
    ],
    highlighted: ['Best value for growing teams'],
  },
  {
    id: 'team-scale',
    name: 'Armada',
    tagline: 'Enterprise-grade exploration',
    pricePerSeatMonthly: 29,
    seatRange: '11–20 seats',
    minSeats: 11,
    maxSeats: 20,
    maxConstellationsPerUserPerMonth: 500,
    maxStarmapsPerUser: 200,
    features: [
      'Everything in Fleet',
      'Custom usage alerts',
      'Dedicated success manager',
      'Quarterly business reviews',
      'Custom integrations',
    ],
    highlighted: ['Volume pricing advantage'],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  useDocumentTitle('Smartslate | Pricing');
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [teamSeats, setTeamSeats] = useState<number>(5);
  const annualMultiplier = 0.8; // 20% discount
  const annualSavings = 0.2; // 20% savings

  // Volume discount logic to encourage 5 seats (Crew), 10 seats (Fleet), and >10 (Armada)
  function computePerSeatWithVolume(plan: TeamPlan, seats: number, cycle: BillingCycle) {
    const base = plan.pricePerSeatMonthly;
    let discountPct = 0;

    if (plan.id === 'team-starter') {
      // Peak discount at 5 seats (max of range)
      const maxDiscount = 0.12;
      const span = Math.max(1, plan.maxSeats - plan.minSeats); // avoid div by 0
      const normalized = Math.max(0, Math.min(plan.maxSeats, seats) - plan.minSeats) / span;
      discountPct = normalized * maxDiscount;
    } else if (plan.id === 'team-growth') {
      // Peak discount at 6 seats (min of range)
      const maxDiscount = 0.15;
      const span = Math.max(1, plan.maxSeats - plan.minSeats);
      const normalized = Math.max(0, Math.min(plan.maxSeats, seats) - plan.minSeats) / span;
      discountPct = (1 - normalized) * maxDiscount;
    } else if (plan.id === 'team-scale') {
      // Peak discount at 11 seats (min of range)
      const maxDiscount = 0.2;
      const span = Math.max(1, plan.maxSeats - plan.minSeats);
      const normalized = Math.max(0, Math.min(plan.maxSeats, seats) - plan.minSeats) / span;
      discountPct = (1 - normalized) * maxDiscount;
    }

    // Apply out-of-range penalty so off-range plans are less favorable
    let penaltyMultiplier = 1;
    if (seats < plan.minSeats) penaltyMultiplier = 1.5;
    if (seats > plan.maxSeats) penaltyMultiplier = 2.5;

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

  // Compute per-seat price lazily inside render per tier; no top-level const needed

  function gotoSignup(planId: string) {
    navigate(`/settings?plan=${planId}&billing=${billing}`);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#020C1B] via-[#0A1628] to-[#0F1B2E] text-white">
      {/* Subtle cosmic background effect */}
      <div className="absolute inset-0 opacity-30">
        <div className="bg-primary-500/20 animate-pulse-subtle absolute top-20 left-10 h-96 w-96 rounded-full blur-3xl" />
        <div
          className="bg-secondary-500/20 animate-pulse-subtle absolute right-10 bottom-20 h-96 w-96 rounded-full blur-3xl"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16">
        {/* Hero Section */}
        <header className="animate-fade-in-up mb-12 text-center">
          <div className="from-primary-600/20 to-primary-500/20 mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r px-3 py-1">
            <span className="text-primary-400 text-xs font-medium">✨ Limited Time</span>
            <span className="text-xs text-white/80">Save 20% with annual billing</span>
          </div>
          <h1 className="font-heading from-primary-400 to-primary-600 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent md:text-5xl lg:text-6xl">
            Launch Your Ideas Into Orbit
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
            Transform your thoughts into powerful{' '}
            <span className="text-primary-400 font-medium">Starmaps</span> with AI-powered
            intelligence
          </p>

          {/* Billing Toggle - Material Design Inspired */}
          <div className="relative mt-8 inline-flex items-center rounded-2xl border border-white/10 bg-white/5 p-1 shadow-xl backdrop-blur-xl">
            <button
              type="button"
              className={`relative rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                billing === 'monthly'
                  ? 'bg-white/10 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`relative rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 ${
                billing === 'annual'
                  ? 'border border-white/10 bg-[rgb(var(--primary))] text-[#0A1628] shadow-lg'
                  : 'text-white/60 hover:text-white/80'
              }`}
              onClick={() => setBilling('annual')}
            >
              Annual
            </button>
            <span className="pointer-events-none absolute -top-3 right-2 rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-bold text-[#0A1628] shadow-lg shadow-emerald-500/25">
              SAVE 20%
            </span>
          </div>

          {/* Trust Signals */}
          <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Instant access
            </span>
          </div>
        </header>

        {/* Personal plans */}
        <section id="personal" className="mt-16">
          <div className="mb-10 text-center">
            <h2 className="font-heading mb-3 text-3xl font-bold md:text-4xl">
              For Individual Creators
            </h2>
            <p className="text-white/70">Start your journey through the cosmos of creativity</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {personalPriced.map((p, index) => (
              <div
                key={p.id}
                className={`group animate-fade-in-up relative transition-all duration-300 hover:scale-[1.02]`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Popular Badge */}
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
                    <div className="from-primary-600 to-primary-500 rounded-full bg-gradient-to-r px-4 py-1 text-xs font-bold text-[#0A1628] shadow-lg">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div
                  className={`glass-card relative h-full border p-6 ${
                    p.popular
                      ? 'border-primary-400/40 from-primary-500/[0.08] to-primary-500/[0.04] bg-gradient-to-br shadow-2xl'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="font-heading mb-2 text-2xl font-bold">{p.name}</h3>
                    <p className="text-sm text-white/60">{p.tagline}</p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${p.price}</span>
                      <span className="text-sm text-white/60">/month</span>
                    </div>
                    {billing === 'annual' && (
                      <div className="text-primary-400 mt-1 text-xs">
                        Save ${p.savings} per year
                      </div>
                    )}
                    {billing === 'annual' && (
                      <div className="mt-1 text-xs text-white/80">
                        Total for the year: ${p.price * 12}/yr
                      </div>
                    )}
                  </div>

                  {/* Highlighted Features */}
                  {p.highlighted && (
                    <div className="mb-6 border-b border-white/10 pb-6">
                      {p.highlighted.map((h, i) => (
                        <div key={i} className="mb-2 flex items-center gap-2">
                          <svg
                            className="text-primary-400 h-5 w-5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm font-medium text-white/90">{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Core Limits */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary-500/10 flex h-8 w-8 items-center justify-center rounded-lg">
                        <svg
                          className="text-primary-400 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-white">
                          {p.id === 'personal-power' ? 'Unlimited' : p.maxConstellationsPerMonth}
                        </span>
                        <span className="text-white/70">
                          {' '}
                          Starmaps/mo{p.id === 'personal-power' ? ' (fair usage)' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-secondary-500/10 flex h-8 w-8 items-center justify-center rounded-lg">
                        <svg
                          className="text-secondary-400 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-white">{p.maxStarmaps}</span>
                        <span className="text-white/70"> Saved Starmaps</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="mb-8 space-y-3">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <svg
                          className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/40"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-white/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    type="button"
                    onClick={() => gotoSignup(p.id)}
                    className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                      p.popular
                        ? 'from-secondary-600 to-secondary-500 hover:shadow-secondary-500/25 transform bg-gradient-to-r text-white hover:-translate-y-0.5 hover:shadow-lg'
                        : 'border border-white/10 bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    {p.popular ? 'Start Free Trial' : `Choose ${p.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team plans */}
        <section id="team" className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="font-heading mb-3 text-3xl font-bold md:text-4xl">
              For Teams & Organizations
            </h2>
            <p className="mb-6 text-white/70">
              Collaborative exploration with unified mission control
            </p>

            {/* Interactive Seat Selector */}
            <div className="inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
              <label className="text-sm font-medium text-white/80">Team Size:</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTeamSeats(Math.max(1, teamSeats - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/15"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  min={1}
                  value={teamSeats}
                  onChange={(e) => setTeamSeats(Math.max(1, Number(e.target.value) || 1))}
                  className="input-no-spinner focus:ring-primary-400/50 w-16 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-center text-base font-bold focus:ring-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setTeamSeats(teamSeats + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/15"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
              <span className="text-sm text-white/60">seats (2–20)</span>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {teamPlans.map((t, index) => {
              const active = teamSeats >= t.minSeats && teamSeats <= t.maxSeats;
              const { perSeat, discountPct } = computePerSeatWithVolume(t, teamSeats, billing);
              const total = Math.ceil(perSeat * teamSeats);
              const savings = billing === 'annual' ? Math.ceil(total * 0.2 * 12) : 0;

              return (
                <div
                  key={t.id}
                  className={`group animate-fade-in-up relative transition-all duration-300 ${
                    active ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Active Indicator */}
                  {active && (
                    <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
                      <div className="from-primary-600 to-primary-500 rounded-full bg-gradient-to-r px-4 py-1 text-xs font-bold text-[#0A1628] shadow-lg">
                        RECOMMENDED FOR {teamSeats} SEATS
                      </div>
                    </div>
                  )}

                  <div
                    className={`glass-card relative h-full border p-6 transition-all duration-300 ${
                      active
                        ? 'border-primary-400/40 from-primary-600/[0.05] bg-gradient-to-br to-transparent shadow-2xl'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Plan Header */}
                    <div className="mb-6">
                      <h3 className="font-heading mb-2 text-2xl font-bold">{t.name}</h3>
                      <p className="mb-2 text-sm text-white/60">{t.tagline}</p>
                      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 px-3 py-1">
                        <span className="text-xs font-medium text-white/80">{t.seatRange}</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-6 border-b border-white/10 pb-6">
                      <div className="mb-1 flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${perSeat}</span>
                        <span className="text-sm text-white/60">/seat/month</span>
                      </div>
                      {discountPct > 0 && (
                        <div className="text-xs text-green-400">
                          -{Math.round(discountPct * 100)}% volume discount
                        </div>
                      )}

                      <div className="mt-3 rounded-lg bg-white/5 p-3">
                        {billing === 'annual' ? (
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-white/70">
                              Total for {teamSeats} seats (year):
                            </span>
                            <span className="text-lg font-bold text-white">${total * 12}/yr</span>
                          </div>
                        ) : (
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-white/70">
                              Total for {teamSeats} seats:
                            </span>
                            <span className="text-lg font-bold text-white">${total}/mo</span>
                          </div>
                        )}
                        {billing === 'annual' && savings > 0 && (
                          <div className="text-right text-xs text-green-400">
                            Save ${savings} annually
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Highlighted Features */}
                    {t.highlighted && (
                      <div className="mb-4">
                        {t.highlighted.map((h, i) => (
                          <div key={i} className="mb-2 flex items-center gap-2">
                            <svg
                              className="h-5 w-5 flex-shrink-0 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium text-white/90">{h}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Core Limits */}
                    <div className="mb-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <svg
                          className="text-primary-400 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                        <span className="text-white/80">
                          {t.id === 'team-scale'
                            ? 'Unlimited Starmaps/user/mo (fair usage)'
                            : `${t.maxConstellationsPerUserPerMonth} Starmaps/user/mo`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg
                          className="text-secondary-400 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                          />
                        </svg>
                        <span className="text-white/80">
                          {t.maxStarmapsPerUser} Saved starmaps/user
                        </span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="mb-6 space-y-2">
                      {t.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <svg
                            className="mt-0.5 h-4 w-4 flex-shrink-0 text-white/40"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-white/80">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      type="button"
                      onClick={() => gotoSignup(t.id)}
                      className={`w-full rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                        active
                          ? 'from-secondary-600 to-secondary-500 hover:shadow-secondary-500/25 transform bg-gradient-to-r text-white hover:-translate-y-0.5 hover:shadow-lg'
                          : 'border border-white/10 bg-white/10 text-white hover:bg-white/15'
                      }`}
                    >
                      {active ? `Deploy ${t.name} →` : 'View Details'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Enterprise */}
        <section id="enterprise" className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="font-heading mb-3 text-3xl font-bold md:text-4xl">Enterprise Galaxy</h2>
            <p className="text-white/70">
              Mission-critical infrastructure for interstellar operations
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 shadow-2xl">
            {/* Premium gradient background */}
            <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5" />

            <div className="relative p-8 md:p-10">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Left Content */}
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/20 px-3 py-1">
                    <svg
                      className="h-4 w-4 text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold text-purple-400">ENTERPRISE GRADE</span>
                  </div>

                  <h3 className="font-heading mb-3 text-3xl font-bold">Infinite Horizons</h3>
                  <p className="mb-6 text-white/80">
                    Built for organizations that demand unlimited scale, uncompromising security,
                    and white-glove support.
                  </p>

                  {/* Enterprise Features Grid */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <svg
                          className="h-5 w-5 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-white">Unlimited Everything</h4>
                        <p className="text-sm text-white/70">
                          No limits on starmaps or team members
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <svg
                          className="h-5 w-5 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-white">Advanced Security</h4>
                        <p className="text-sm text-white/70">
                          SSO/SAML, SCIM provisioning, audit logs, and compliance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                        <svg
                          className="h-5 w-5 text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="mb-1 font-semibold text-white">Dedicated Support</h4>
                        <p className="text-sm text-white/70">
                          24/7 priority support with 99.9% uptime SLA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Pricing */}
                <div className="flex flex-col justify-center">
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 p-8 text-center">
                    <div className="mb-4">
                      <span className="text-sm text-white/60">Starting at</span>
                      <div className="mt-2 flex items-baseline justify-center gap-1">
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-5xl font-bold text-transparent">
                          $199/year
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/60">Tailored to your needs</p>
                    </div>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                        <svg
                          className="h-4 w-4 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Volume discounts available
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                        <svg
                          className="h-4 w-4 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Custom contract terms
                      </div>
                      <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                        <svg
                          className="h-4 w-4 text-green-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Dedicated success team
                      </div>
                    </div>

                    <a
                      href="mailto:sales@smartslate.io"
                      className="from-secondary-600 to-secondary-500 hover:shadow-secondary-500/25 inline-flex w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Contact Sales Team
                    </a>

                    <p className="mt-3 text-xs text-white/50">Response within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-24 mb-16">
          <div className="mb-10 text-center">
            <h2 className="font-heading mb-3 text-3xl font-bold md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-white/70">Everything you need to know about our pricing</p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-4">
            <details className="group glass-card cursor-pointer border border-white/10 p-6">
              <summary className="flex list-none items-center justify-between font-medium text-white">
                What is a Starmap?
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm text-white/70">
                A Starmap is a completed AI-powered report or document creation. Each time you
                generate a new report, analysis, or document using our AI tools, it counts as one
                Starmap. Think of it as connecting the dots between your ideas to form a complete
                picture.
              </p>
            </details>

            <details className="group glass-card cursor-pointer border border-white/10 p-6">
              <summary className="flex list-none items-center justify-between font-medium text-white">
                Can I change plans anytime?
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm text-white/70">
                Yes! You can upgrade or downgrade your plan at any time. When upgrading, you'll get
                immediate access to new features. When downgrading, changes take effect at the next
                billing cycle.
              </p>
            </details>

            <details className="group glass-card cursor-pointer border border-white/10 p-6">
              <summary className="flex list-none items-center justify-between font-medium text-white">
                What happens if I exceed my limits?
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm text-white/70">
                We'll notify you when you're approaching your monthly limits. You can either upgrade
                to a higher plan or purchase additional Starmaps as needed. Your saved Starmaps are
                always accessible.
              </p>
            </details>

            <details className="group glass-card cursor-pointer border border-white/10 p-6">
              <summary className="flex list-none items-center justify-between font-medium text-white">
                Is there a free trial?
                <svg
                  className="h-5 w-5 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <p className="mt-4 text-sm text-white/70">
                Yes! All plans come with a 14-day free trial. No credit card required to start.
                You'll have full access to all features during your trial period.
              </p>
            </details>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-8">
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-6 text-sm">
              <a href="#" className="text-white/60 transition-colors hover:text-white">
                Terms of Service
              </a>
              <span className="text-white/20">•</span>
              <a href="#" className="text-white/60 transition-colors hover:text-white">
                Privacy Policy
              </a>
              <span className="text-white/20">•</span>
              <a
                href="mailto:support@smartslate.io"
                className="text-white/60 transition-colors hover:text-white"
              >
                Support
              </a>
            </div>
            <p className="mx-auto max-w-2xl text-xs text-white/40">
              Prices shown in USD. Taxes may apply based on your location. Annual billing saves 20%.
              Feature limits will be enforced once billing is activated. All plans include 14-day
              free trial.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
