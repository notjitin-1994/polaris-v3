/**
 * API Route: GET /api/account/sessions
 *
 * Retrieves all active sessions for the authenticated user.
 *
 * Security:
 * - Requires authentication
 * - Only returns sessions for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Get user sessions
    const { data: sessions, error: sessionsError } = await supabase.auth.admin.listUserSessions(
      session.user.id
    );

    if (sessionsError) {
      console.error('[GET SESSIONS ERROR]', sessionsError);
      return NextResponse.json({ error: 'Failed to retrieve sessions.' }, { status: 500 });
    }

    // Format session data
    const formattedSessions =
      sessions?.map((s) => ({
        id: s.id,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
        factorId: s.factor_id,
        aal: s.aal,
        notAfter: s.not_after,
        isCurrent: s.id === session.id,
      })) || [];

    return NextResponse.json(
      {
        success: true,
        sessions: formattedSessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET SESSIONS] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * API Route: DELETE /api/account/sessions
 *
 * Revokes a specific session or all sessions except the current one.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerClient();

    // Verify authentication
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    // Parse request body
    const { sessionId, revokeAll } = await request.json();

    if (revokeAll) {
      // Revoke all sessions except the current one
      const { error: revokeError } = await supabase.auth.admin.signOut(session.user.id, 'others');

      if (revokeError) {
        console.error('[REVOKE ALL SESSIONS ERROR]', revokeError);
        return NextResponse.json({ error: 'Failed to revoke sessions.' }, { status: 500 });
      }

      console.log(`[REVOKE SESSIONS] User ${session.user.id} revoked all other sessions`);

      return NextResponse.json(
        {
          success: true,
          message: 'All other sessions have been revoked.',
        },
        { status: 200 }
      );
    }

    if (sessionId) {
      // Prevent revoking the current session via this endpoint
      if (sessionId === session.id) {
        return NextResponse.json(
          { error: 'Cannot revoke the current session. Please use sign out instead.' },
          { status: 400 }
        );
      }

      // Revoke specific session (Note: Supabase doesn't provide session-specific revocation)
      // This is a placeholder - in practice, you'd need to implement custom logic
      return NextResponse.json(
        { error: 'Session-specific revocation not yet implemented. Use "Revoke All" instead.' },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide sessionId or revokeAll=true.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[REVOKE SESSIONS] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
