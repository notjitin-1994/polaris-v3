import Link from 'next/link';
import Image from 'next/image';
import { AuthProvider } from '@/contexts/AuthContext';
import SignupForm from '@/components/auth/SignupForm';
import SwirlBackground from '@/components/SwirlBackground';
import HeaderSwirlBackground from '@/components/HeaderSwirlBackground';

export default function SignupPage(): JSX.Element {
  return (
    <main className="min-h-dvh bg-background-dark relative overflow-x-hidden w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 flex items-center justify-center">
      <SwirlBackground />
      <div className="relative z-10 max-w-7xl w-full mx-auto">
        <div className="space-y-6 md:space-y-0 md:glass-card md:p-8 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-stretch">
            {/* Info card */}
            <section className="w-full flex justify-center lg:justify-start h-full">
              <div className="p-2 sm:p-3 md:p-4 w-full max-w-xl lg:max-w-none text-left flex flex-col h-full">
                <div className="mb-6">
                  <div className="inline-flex items-start gap-3">
                    <Image
                      src="/logo.png"
                      alt="Smartslate"
                      width={160}
                      height={24}
                      className="select-none h-9 md:h-10 lg:h-12 w-auto"
                    />
                    <h1 className="text-[0.7rem] md:text-[0.8rem] lg:text-[0.9rem] font-bold text-white leading-tight">
                      Create your account
                    </h1>
                  </div>
                  <p className="mt-3 text-white/70 text-base max-w-3xl">
                    Turn customer insight into a clear, prioritized roadmap. Align faster. Build
                    smarter.
                  </p>
                </div>

                {/* Public report mockup */}
                <div className="hidden sm:block mt-6 flex-1 sm:min-h-[var(--size-auth-min-sm)] md:min-h-[var(--size-auth-min-md)] lg:min-h-[var(--size-auth-min-lg)] glass rounded-2xl shadow-2xl overflow-hidden">
                  <div className="relative border-b glass-border-10 glass overflow-hidden min-h-[var(--size-header-min)] md:min-h-[var(--size-header-min-md)]">
                    <HeaderSwirlBackground />
                    <div className="relative px-2 py-1.5 md:px-2.5 md:py-2 z-10 flex items-center justify-between">
                      <div className="flex flex-col items-start">
                        <Image
                          src="/logo.png"
                          alt="Smartslate"
                          width={14}
                          height={14}
                          className="h-[0.9rem] w-auto"
                        />
                        <span className="mt-1 font-['Lato'] font-semibold text-[color:var(--primary-accent)] text-[0.4rem]">
                          Smartslate
                        </span>
                      </div>
                      <div className="hidden md:flex items-center gap-3">
                        <span className="icon-btn icon-btn-primary icon-sm rounded-full" />
                        <span className="icon-btn icon-sm rounded-full" />
                      </div>
                    </div>
                  </div>
                  <div className="block p-4 md:p-6 h-full">
                    <div className="rounded-2xl border glass-border-10 glass-5 backdrop-blur-xl overflow-hidden h-full">
                      <div className="p-4 md:p-6 h-full flex flex-col">
                        <div className="h-3 w-40 rounded-full glass-30 mb-3" />
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="h-8 rounded-lg glass-5 border glass-border-10" />
                          <div className="h-8 rounded-lg glass-5 border glass-border-10" />
                          <div className="h-8 rounded-lg glass-5 border glass-border-10" />
                          <div className="h-8 rounded-lg glass-5 border glass-border-10" />
                        </div>
                        <div className="mb-5">
                          <div className="h-2 glass-10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 w-[72%]" />
                          </div>
                          <div className="mt-1 h-2 w-20 rounded-full glass-15" />
                        </div>
                        <div className="h-3 w-28 rounded-full glass-20 mb-2" />
                        <div className="grid grid-cols-3 gap-3 flex-1 items-stretch">
                          <div className="col-span-2 flex flex-col space-y-2 h-full">
                            <div className="h-2 w-4/5 rounded-full glass-15" />
                            <div className="h-2 w-3/4 rounded-full glass-10" />
                            <div className="flex-1 min-h-[200px] rounded-xl glass-10 backdrop-blur-xl border glass-border-10" />
                            <div className="grid grid-cols-2 gap-2">
                              <div className="h-10 rounded-lg glass-5 border glass-border-10" />
                              <div className="h-10 rounded-lg glass-5 border glass-border-10" />
                            </div>
                          </div>
                          <div className="col-span-1 flex flex-col space-y-2 h-full">
                            <div className="h-2 w-3/4 rounded-full glass-15" />
                            <div className="h-2 w-2/3 rounded-full glass-10" />
                            <div className="flex-1 min-h-content rounded-xl glass-5 border glass-border-10" />
                            <div className="flex-1 min-h-content rounded-xl glass-5 border glass-border-10" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Signup modal */}
            <section className="w-full flex items-stretch justify-center pt-0 sm:pt-1 md:pt-2 pb-0 sm:pb-6 h-full">
              <div className="relative w-full max-w-xl lg:max-w-none h-full glass rounded-2xl shadow-2xl">
                <div
                  className="pointer-events-none absolute -inset-6 rounded-3xl blur-2xl opacity-75"
                  aria-hidden
                  style={{
                    filter: 'saturate(1.05)',
                  }}
                />
                <div className="relative h-full flex flex-col px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
                  <h1 className="text-white text-xl font-semibold">Create account</h1>
                  <AuthProvider>
                    <SignupForm className="[&>div>label]:text-white/80 [&>div>input]:glass-5 [&>div>input]:border [&>div>input]:glass-border-10 [&>div>input]:text-white [&>div>input]:rounded-lg [&>div>input]:p-3 [&>div>input]:w-full [&>div>input:focus]:outline-none [&>div>input:focus]:ring-2 [&>div>input:focus]:ring-[color:var(--primary-accent)]" />
                  </AuthProvider>
                  <p className="mt-2 text-sm text-white/80">
                    Already have an account?{' '}
                    <Link className="underline" href="/login">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
