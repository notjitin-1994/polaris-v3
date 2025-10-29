import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/lib/stores/QueryProvider';
import { GlobalLayout } from '@/components/layout';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <QueryProvider>
        <GlobalLayout>{children}</GlobalLayout>
      </QueryProvider>
    </AuthProvider>
  );
}