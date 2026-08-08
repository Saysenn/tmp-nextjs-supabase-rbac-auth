import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  ROUTE_ACCESS,
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  LOGIN_REDIRECT,
  UNAUTHORIZED_REDIRECT,
  DEFAULT_ROLE,
  ROLES,
} from './lib/rbac/config';

type RoleName = keyof typeof ROLES;

/**
 * Get user's roles from metadata.
 * Normalizes to uppercase and validates against ROLES config.
 */
function getUserRoles(user: { user_metadata?: { role?: string | string[] } } | null): RoleName[] {
  if (!user) return [];

  const roleData = user.user_metadata?.role;

  // No role set - return default role
  if (!roleData) {
    return [DEFAULT_ROLE as RoleName];
  }

  // Handle both single role (string) and multiple roles (array)
  const roles = Array.isArray(roleData) ? roleData : [roleData];

  // Normalize to uppercase and filter to valid roles
  const validRoles = roles
    .map((role) => String(role).toUpperCase())
    .filter((role): role is RoleName => role in ROLES);

  // If no valid roles found, return default
  return validRoles.length > 0 ? validRoles : [DEFAULT_ROLE as RoleName];
}

/**
 * Check if user has access to a route based on their roles.
 */
function canAccessRoute(userRoles: RoleName[], pathname: string): boolean {
  // Sort routes by specificity (longer paths first)
  const sortedRoutes = Object.keys(ROUTE_ACCESS).sort((a, b) => b.length - a.length);

  // Find matching route config
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      const allowedRoles = ROUTE_ACCESS[route];
      // Check if user has any of the allowed roles
      return allowedRoles.some((role) => userRoles.includes(role as RoleName));
    }
  }

  // No specific route config - allow access (route just requires auth)
  return true;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Helper to create redirect response
  const createRedirect = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    const response = NextResponse.redirect(url);
    // Copy cookies to maintain session
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, cookie);
    });
    return response;
  };

  // Check route types
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // 1. Unauthenticated user trying to access protected route -> login
  if (!user && isProtectedRoute) {
    return createRedirect(LOGIN_REDIRECT);
  }

  // 2. Authenticated user on auth page -> redirect based on role
  if (user && isAuthRoute) {
    const userRoles = getUserRoles(user);
    // Admins go to admin dashboard, others go to user dashboard
    const redirectPath = userRoles.includes('ADMIN') ? '/admin' : '/dashboard';
    return createRedirect(redirectPath);
  }

  // 3. Role-based access check for protected routes
  if (user && isProtectedRoute) {
    const userRoles = getUserRoles(user);

    // Redirect admins from /dashboard to /admin
    if (userRoles.includes('ADMIN') && pathname.startsWith('/dashboard')) {
      return createRedirect('/admin');
    }

    if (!canAccessRoute(userRoles, pathname)) {
      return createRedirect(UNAUTHORIZED_REDIRECT);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
