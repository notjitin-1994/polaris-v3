import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/auth/adminAuth';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/lib/stores/QueryProvider';

export const metadata = {
  title: 'Admin Dashboard | SmartSlate Polaris',
  description: 'Enterprise admin dashboard for SmartSlate Polaris v3',
};

// Force dynamic rendering since we check authentication with cookies
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side admin authentication check
  const adminCheck = await checkAdminAccess();

  if (!adminCheck.isAdmin || !adminCheck.user) {
    redirect('/');
  }

  // Wrap admin pages with AuthProvider and QueryProvider
  // This ensures useAuth hook works in admin pages
  return (
    <AuthProvider>
      <QueryProvider>
        {children}
      </QueryProvider>
    </AuthProvider>
  );
}
