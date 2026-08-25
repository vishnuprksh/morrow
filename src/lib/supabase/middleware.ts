import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';
import { getSupabaseEnv } from './env';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth');
  const isPublicAsset = request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname.includes('.');

  if (!user && !isAuthRoute && !isPublicAsset) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
  }

  if (user && isAuthRoute && request.nextUrl.pathname !== '/auth/update-password') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}