import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseRouteHandlerClient } from '@/lib/supabase/server';

/**
 * POST /api/blueprints/share/generate
 *
 * Generates or retrieves a share token for a blueprint.
 * Requires authentication - only the blueprint owner can generate share links.
 *
 * Request body:
 * {
 *   "blueprintId": "uuid"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "shareToken": "string",
 *   "shareUrl": "https://domain.com/share/token"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseRouteHandlerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blueprintId } = await req.json();

    if (!blueprintId) {
      return NextResponse.json({ error: 'Blueprint ID is required' }, { status: 400 });
    }

    // Verify user owns this blueprint
    const { data: blueprint, error: fetchError } = await supabase
      .from('blueprint_generator')
      .select('id, share_token, user_id')
      .eq('id', blueprintId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !blueprint) {
      return NextResponse.json({ error: 'Blueprint not found or access denied' }, { status: 404 });
    }

    // If share_token already exists, return it
    if (blueprint.share_token) {
      const shareUrl = `${req.nextUrl.origin}/share/${blueprint.share_token}`;

      return NextResponse.json({
        success: true,
        shareToken: blueprint.share_token,
        shareUrl,
      });
    }

    // Generate new share token using database function
    const { data: tokenData, error: tokenError } = await supabase.rpc('generate_share_token');

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Failed to generate share token' }, { status: 500 });
    }

    const newToken = tokenData as string;

    // Update blueprint with new share token
    const { error: updateError } = await supabase
      .from('blueprint_generator')
      .update({ share_token: newToken })
      .eq('id', blueprintId)
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to save share token' }, { status: 500 });
    }

    const shareUrl = `${req.nextUrl.origin}/share/${newToken}`;

    return NextResponse.json({
      success: true,
      shareToken: newToken,
      shareUrl,
    });
  } catch (error) {
    console.error('Error generating share token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
