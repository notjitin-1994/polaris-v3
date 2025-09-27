'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function setupSessionAutoRefresh() {
  const supabase = getSupabaseBrowserClient();
  // Supabase JS handles refresh automatically when using the client.
  // Hook provided for future custom logic (warnings, analytics, etc.).
  return supabase;
}
