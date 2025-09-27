'use client';

import { AuthProvider } from '@/contexts/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}
