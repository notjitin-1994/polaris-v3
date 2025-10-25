import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('feedback');

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn('api.auth.failure', 'Unauthorized access attempt to unread count', {
        error: authError?.message || 'Authentication failed',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count unread responses
    const { count, error } = await supabase
      .from('feedback_responses')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      logger.error('database.query.failure', 'Failed to fetch unread count', {
        error: error.message || 'Database query failed',
        userId: user.id,
      });
      return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
    }

    logger.info('database.query.success', 'Unread count fetched', { userId: user.id, count });

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    logger.error('api.error', 'Unexpected error in unread count', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
