import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthPage } from '@/features/auth/AuthPage';
import SwirlBackground from '@/components/SwirlBackground';
import HeaderSwirlBackground from '@/components/HeaderSwirlBackground';
import { getSupabase } from '@/services/supabase';
import { PolarisPerks } from '@/components/PolarisPerks';
import { paths } from '@/routes/paths';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AuthLanding() {
  const navigate = useNavigate();
  useDocumentTitle('Login to Smartslate');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const mq = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener?.('change', onChange);
    getSupabase()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted && session) navigate(paths.home, { replace: true });
      });
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((_event, session) => {
      if (session) navigate(paths.home, { replace: true });
    });
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      mq.removeEventListener?.('change', onChange);
    };
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-gradient-to-br from-[#020C1B] to-[#0A1628] px-2 py-8 md:px-6 lg:px-8 lg:py-12">
      <SwirlBackground />
      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {/* Master container wrapping both sections */}
        <div
          className={isMobile ? '' : 'glass-card overflow-hidden border border-white/10 p-5 md:p-8'}
        >
          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
            {/* Info card (top) */}
            <section className="flex h-full w-full justify-center lg:justify-start">
              <div
                className={`flex h-full w-full max-w-xl flex-col p-2 text-left sm:p-3 md:p-4 lg:max-w-none`}
              >
                <div className="mb-6">
                  <div className="inline-flex items-start gap-3">
                    <img
                      src="/images/logos/logo.png"
                      alt="Smartslate"
                      className="h-9 w-auto select-none md:h-10 lg:h-12"
                    />
                    <h1 className="font-heading text-[0.525rem] leading-tight font-bold text-white md:text-[0.6125rem] lg:text-[0.7rem]">
                      Polaris
                    </h1>
                  </div>
                  <p className="mt-3 max-w-2xl text-base text-white/70">
                    Turn customer insight into a clear, prioritized roadmap. Align faster. Build
                    smarter.
                  </p>
                </div>

                {/* Value chips removed */}

                {/* Public report mockup (moved up to occupy chips space) */}
                <div className="mt-6 hidden min-h-[460px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:block md:min-h-[520px] lg:min-h-[600px]">
                  {/* Mock header */}
                  <div className="relative min-h-[34px] overflow-hidden border-b border-white/10 bg-[rgb(var(--bg))]/60 backdrop-blur-xl md:min-h-[40px]">
                    <HeaderSwirlBackground />
                    <div className="relative z-10 flex items-center justify-between px-[0.5rem] py-[0.4rem] md:px-[0.6rem] md:py-[0.5rem]">
                      <div className="flex flex-col items-start">
                        <img
                          src="/images/logos/logo.png"
                          alt="SmartSlate"
                          className="h-[0.8rem] w-auto md:h-[0.9rem]"
                        />
                        <span className="text-primary-400 mt-1 font-['Lato'] text-[0.35rem] font-semibold md:text-[0.4rem]">
                          Polaris Starmaps
                        </span>
                      </div>
                      <div className="hidden items-center gap-3 md:flex">
                        <span className="icon-btn icon-btn-primary h-[14px] w-[14px] rounded-full" />
                        <span className="icon-btn h-[14px] w-[14px] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Mock report card (visible on mobile as well) */}
                  <div className="block h-full p-4 md:p-6">
                    <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                      <div className="flex h-full flex-col p-4 md:p-6">
                        {/* Mock report title */}
                        <div className="mb-3 h-3 w-40 rounded-full bg-white/30" />

                        {/* Quick stats row (4 small cards) */}
                        <div className="mb-3 grid grid-cols-4 gap-2">
                          <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                          <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                          <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                          <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                        </div>

                        {/* Confidence level bar */}
                        <div className="mb-5">
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full w-[72%] bg-gradient-to-r from-emerald-400 to-teal-400" />
                          </div>
                          <div className="mt-1 h-2 w-20 rounded-full bg-white/15" />
                        </div>

                        {/* Section header */}
                        <div className="mb-2 h-3 w-28 rounded-full bg-white/20" />

                        {/* Main content skeleton */}
                        <div className="grid flex-1 grid-cols-3 items-stretch gap-3">
                          <div className="col-span-2 flex h-full flex-col space-y-2">
                            <div className="h-2 w-4/5 rounded-full bg-white/15" />
                            <div className="h-2 w-3/4 rounded-full bg-white/10" />
                            <div className="from-primary-400/15 to-secondary-500/15 min-h-[160px] flex-1 rounded-xl border border-white/10 bg-gradient-to-br md:min-h-[200px] lg:min-h-[240px]" />
                            <div className="grid grid-cols-2 gap-2">
                              <div className="h-10 rounded-lg border border-white/10 bg-white/5" />
                              <div className="h-10 rounded-lg border border-white/10 bg-white/5" />
                            </div>
                          </div>
                          <div className="col-span-1 flex h-full flex-col space-y-2">
                            <div className="h-2 w-3/4 rounded-full bg-white/15" />
                            <div className="h-2 w-2/3 rounded-full bg-white/10" />
                            <div className="min-h-[120px] flex-1 rounded-xl border border-white/10 bg-white/5" />
                            <div className="min-h-[120px] flex-1 rounded-xl border border-white/10 bg-white/5" />
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
                    background:
                      'radial-gradient(360px 260px at 0% -10%, rgba(167,218,219,0.38), transparent 60%),\\\n                   radial-gradient(420px 300px at 120% 0%, rgba(167,218,219,0.26), transparent 70%)',
                    filter: 'saturate(1.05)',
                  }}
                />
                <div className="relative flex h-full flex-col space-y-3 px-4 py-3 sm:space-y-4 sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-7">
                  <AuthPage />
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
