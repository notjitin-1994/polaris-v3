import { LoginForm } from '@/features/auth/components/LoginForm';

export function AuthPage() {
  return (
    <div className="relative z-10 mx-auto h-full w-full max-w-sm md:max-w-sm lg:max-w-md">
      <div className="animate-scale-in flex h-full flex-col rounded-2xl px-0 pt-0.5 pb-2 sm:pt-1 sm:pb-3 md:pt-2 md:pb-4 lg:pb-4">
        {/* Soft halo for mobile to lift the card */}
        <div
          className="from-primary-400/10 to-secondary-500/10 pointer-events-none absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-70 blur-xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-1 flex-col">
          <div className="animate-fade-in mb-3 select-none sm:mb-4">
            {/* Hide logo on medium+ since it's now in the left hero pill; keep on mobile */}
            <img
              src="/images/logos/logo.png"
              alt="Smartslate"
              className="logo-glow h-7 w-auto sm:h-8 md:hidden"
            />
            <h2 className="font-heading mt-1.5 text-base font-semibold text-white sm:mt-2 sm:text-lg">
              Sign in to Smartslate
            </h2>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">
              Access Polaris Starmaps and your reports.
            </p>
          </div>

          <div className="animate-fade-in-up">
            <LoginForm />
          </div>

          {/* Keep footer content at the bottom on mobile; not needed on large screens */}
          <div className="flex-1 lg:hidden" />

          <p className="mt-4 text-left text-[11px] text-white/60 sm:mt-5 sm:text-xs">
            Don't have an account?{' '}
            <a
              href="https://app.smartslate.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 hover:text-secondary-300 underline underline-offset-4"
            >
              Sign Up
            </a>
          </p>
          <p className="mt-2 text-left text-[10px] text-white/50 sm:mt-3 sm:text-[11px]">
            By continuing, you agree to our{' '}
            <a
              href="https://app.smartslate.io/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:text-primary-400 underline underline-offset-4"
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              href="https://app.smartslate.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent hover:text-primary-400 underline underline-offset-4"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
