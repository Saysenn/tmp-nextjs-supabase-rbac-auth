import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  ROUTE_ACCESS,
  PROTECTED_ROUTES,
  AUTH_ROUTES,
  LOGIN_REDIRECT,
  DEFAULT_REDIRECT,
  UNAUTHORIZED_REDIRECT,
  DEFAULT_ROLE,
  ROLES,
} from './lib/rbac/config';

// Type for role
type Role = (typeof ROLES)[keyof typeof ROLES];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname;

  // Helper function to create redirect with cookies
  const createRedirect = (path: string) => {
    url.pathname = path;
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // Check if current route is protected (requires authentication)
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  // Check if current route is an auth route (should redirect if authenticated)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // If not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    return createRedirect(LOGIN_REDIRECT);
  }

  // If authenticated and trying to access auth routes, redirect to dashboard
  if (user && isAuthRoute) {
    return createRedirect(DEFAULT_REDIRECT);
  }

  // Role-based access control for authenticated users
  if (user && isProtectedRoute) {
    // Get user's role from metadata
    const userRole = (user.user_metadata?.role as Role) || DEFAULT_ROLE;

    // Check role-based route access
    // Sort routes by specificity (longer paths first)
    const sortedRoutes = Object.keys(ROUTE_ACCESS).sort(
      (a, b) => b.length - a.length
    );

    // Find the most specific matching route
    for (const route of sortedRoutes) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        const allowedRoles = ROUTE_ACCESS[route];

        if (allowedRoles && !allowedRoles.includes(userRole)) {
          // User doesn't have permission - redirect to unauthorized page
          return createRedirect(UNAUTHORIZED_REDIRECT);
        }
        // Found matching route and user has access - break out of loop
        break;
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely.

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
