import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { checkAdminAccess } from '@/lib/auth/adminAuth';

/**
 * GET /api/admin/metrics
 * Fetch system-wide metrics for admin dashboard
 * Requires admin/developer role
 */
export async function GET() {
  try {
    // Check admin access
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const supabase = await getSupabaseServerClient();

    // Fetch user statistics
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Fetch blueprint statistics
    const { count: totalBlueprints } = await supabase
      .from('blueprint_generator')
      .select('*', { count: 'exact', head: true });

    const { count: blueprintsToday } = await supabase
      .from('blueprint_generator')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalBlueprints: totalBlueprints || 0,
      blueprintsToday: blueprintsToday || 0,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
