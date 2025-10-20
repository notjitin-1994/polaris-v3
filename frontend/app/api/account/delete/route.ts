/**
 * API Route: DELETE /api/account/delete
 *
 * Permanently deletes a user's account and all associated data.
 * This is a destructive operation that cannot be undone.
 *
 * Security:
 * - Requires authentication
 * - Validates confirmation token
 * - Deletes all user data via cascade
 * - Revokes all sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

interface DeleteAccountRequest {
  confirmationText: string;
}

export async function POST(request: NextRequest) {
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

    const userId = session.user.id;

    // Parse and validate request body
    const body: DeleteAccountRequest = await request.json();

    if (body.confirmationText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Invalid confirmation text. Please type DELETE to confirm.' },
        { status: 400 }
      );
    }

    // Log the deletion attempt (before deleting the user)
    console.log(
      `[ACCOUNT DELETION] User ${userId} (${session.user.email}) requested account deletion`
    );

    // Delete user profile (cascades will delete all related data)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (profileError) {
      console.error('[ACCOUNT DELETION ERROR]', profileError);
      return NextResponse.json(
        { error: 'Failed to delete user profile. Please contact support.' },
        { status: 500 }
      );
    }

    // Delete all blueprints (should cascade from profile, but ensure cleanup)
    const { error: blueprintError } = await supabase
      .from('blueprint_generator')
      .delete()
      .eq('user_id', userId);

    if (blueprintError) {
      console.error('[BLUEPRINT DELETION ERROR]', blueprintError);
      // Continue deletion even if blueprint cleanup fails
    }

    // Delete auth user (Supabase Admin API)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('[USER DELETION ERROR]', deleteUserError);
      return NextResponse.json(
        { error: 'Failed to delete user account. Please contact support.' },
        { status: 500 }
      );
    }

    // Sign out the user
    await supabase.auth.signOut();

    console.log(`[ACCOUNT DELETION] Successfully deleted user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Account successfully deleted. You will be redirected to the home page.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ACCOUNT DELETION] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
