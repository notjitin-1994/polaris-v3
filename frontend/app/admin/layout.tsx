import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/auth/adminAuth';

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

  // GlobalLayout already provides the sidebar and layout structure
  // Just return children to avoid duplicate sidebars
  return <>{children}</>;
}
