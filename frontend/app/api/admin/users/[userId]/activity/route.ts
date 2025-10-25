import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Admin API: Get user activity log
 * GET /api/admin/users/[userId]/activity
 *
 * Returns a timeline of user activities including:
 * - Login events
 * - Blueprint creation/saving
 * - Profile updates
 * - Tier changes
 */
export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Verify admin access
    await requireAdmin();

    const { userId } = params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Get user's basic info
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build activity timeline from various sources
    const activities = [];

    // 1. User creation event
    activities.push({
      id: `created-${userId}`,
      type: 'profile_updated',
      title: 'Account Created',
      description: `User account was created`,
      timestamp: user.created_at,
      metadata: {
        action: 'account_created',
      },
    });

    // 2. Get blueprint creation events
    const { data: blueprints } = await supabase
      .from('blueprint_generator')
      .select('id, created_at, status')
      .eq('user_id', userId)
      .order('created_at', { descending: true })
      .limit(50);

    if (blueprints) {
      blueprints.forEach((blueprint) => {
        activities.push({
          id: `blueprint-${blueprint.id}`,
          type: 'blueprint_created',
          title: 'Blueprint Created',
          description: `Created a new blueprint (${blueprint.status})`,
          timestamp: blueprint.created_at,
          metadata: {
            blueprint_id: blueprint.id,
            status: blueprint.status,
          },
        });
      });
    }

    // 3. Login events (from auth.users last_sign_in_at)
    if (user.last_sign_in_at) {
      activities.push({
        id: `login-${userId}`,
        type: 'login',
        title: 'User Login',
        description: 'User signed into their account',
        timestamp: user.last_sign_in_at,
        metadata: {
          action: 'login',
        },
      });
    }

    // 4. Profile update event (if updated_at differs from created_at)
    if (user.updated_at && user.updated_at !== user.created_at) {
      activities.push({
        id: `updated-${userId}`,
        type: 'profile_updated',
        title: 'Profile Updated',
        description: 'User profile information was modified',
        timestamp: user.updated_at,
        metadata: {
          action: 'profile_update',
        },
      });
    }

    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA;
    });

    // Limit to most recent 100 activities
    const recentActivities = activities.slice(0, 100);

    return NextResponse.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
      },
      activities: recentActivities,
      total: activities.length,
      showing: recentActivities.length,
    });
  } catch (error) {
    console.error('Admin user activity API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized or internal error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

/**
 * Admin API: Add activity event manually
 * POST /api/admin/users/[userId]/activity
 *
 * Body:
 * - type: Activity type
 * - title: Activity title
 * - description: Activity description
 * - metadata: Additional metadata (optional)
 */
export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Verify admin access
    await requireAdmin();

    const { userId } = params;
    const body = await request.json();

    const { type, title, description, metadata } = body;

    if (!type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, description' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: In production, store activity logs in a dedicated table
    // For now, return success with the activity event details
    const activity = {
      id: `manual-${Date.now()}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    return NextResponse.json({
      success: true,
      activity,
      message: 'Activity event recorded (note: implement persistent storage in production)',
    });
  } catch (error) {
    console.error('Admin add activity API error:', error);
    return NextResponse.json(
      { error: 'Unauthorized or internal error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
