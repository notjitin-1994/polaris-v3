import { memo } from 'react';
import Link from 'next/link';

export const Brand = memo(function Brand() {
  return (
    <Link
      href="/"
      className="group hover:bg-foreground/5 focus-visible:ring-secondary/50 relative -mx-2 flex items-center gap-3 rounded-lg px-2 py-1.5 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      {/* Glow effect behind logo */}
      <div
        className="from-primary/10 via-secondary/10 to-primary/10 absolute inset-0 rounded-lg bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Logo with subtle glow */}
      <div className="relative">
        <div
          className="from-primary/30 to-secondary/30 absolute inset-0 rounded-lg bg-gradient-to-br opacity-40 blur-md"
          aria-hidden="true"
        />
        <img
          src="/logo.png"
          alt="SmartSlate"
          className="relative h-7 w-auto drop-shadow-sm transition-all duration-300 select-none group-hover:drop-shadow-md"
        />
      </div>
    </Link>
  );
});
