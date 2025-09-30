import { memo } from 'react';
import Link from 'next/link';

export const Brand = memo(function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <img src="/logo.png" alt="SmartSlate" className="logo-glow h-8 w-auto select-none" />
    </Link>
  );
});
