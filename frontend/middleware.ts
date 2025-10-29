import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Public routes do not require authentication
const PUBLIC_PATHS = new Set([
  '/login',
  '/signup',
  '/auth/callback',
  '/favicon.ico',
  '/demo-loading',
  '/pricing',
]);
// Auth pages that should redirect to home if user is logged in
const AUTH_PATHS = new Set(['/login', '/signup']);

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);

  // Skip middleware for static files and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next({ request: { headers: req.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If user is logged in and trying to access auth pages, redirect to home
  if (session && AUTH_PATHS.has(url.pathname)) {
    return NextResponse.redirect(new URL('/', url.origin));
  }

  // If user is not logged in and trying to access protected pages, redirect to login
  if (!session && !PUBLIC_PATHS.has(url.pathname)) {
    const redirectUrl = new URL('/login', url.origin);
    redirectUrl.searchParams.set('redirect', url.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
