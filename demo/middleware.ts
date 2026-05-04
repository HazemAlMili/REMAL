import { NextRequest, NextResponse } from 'next/server';
import { AUTH_ROLE_COOKIE, isDemoRole, ROLE_HOME_ROUTES, ROLE_LOGIN_ROUTES, type DemoRole } from './src/lib/auth';

const PROTECTED_ROUTES: Array<{ prefix: string; role: DemoRole }> = [
  { prefix: '/dashboard', role: 'admin' },
  { prefix: '/crm', role: 'admin' },
  { prefix: '/finance', role: 'admin' },
  { prefix: '/units', role: 'admin' },
  { prefix: '/owner-dashboard', role: 'owner' },
  { prefix: '/owner-calendar', role: 'owner' },
  { prefix: '/owner-earnings', role: 'owner' },
  { prefix: '/client-dashboard', role: 'client' },
];

function getMatchedProtectedRole(pathname: string) {
  return PROTECTED_ROUTES.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const roleValue = request.cookies.get(AUTH_ROLE_COOKIE)?.value;

  if (pathname === '/auth' || pathname.startsWith('/auth/')) {
    if (isDemoRole(roleValue)) {
      return NextResponse.redirect(new URL(ROLE_HOME_ROUTES[roleValue], request.url));
    }

    return NextResponse.next();
  }

  const protectedRoute = getMatchedProtectedRole(pathname);
  if (!protectedRoute) {
    return NextResponse.next();
  }

  if (roleValue === protectedRoute.role) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(ROLE_LOGIN_ROUTES[protectedRoute.role], request.url);
  redirectUrl.searchParams.set('returnTo', pathname + request.nextUrl.search);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ['/auth', '/auth/:path*', '/dashboard/:path*', '/crm/:path*', '/finance/:path*', '/units/:path*', '/owner-dashboard/:path*', '/owner-calendar/:path*', '/owner-earnings/:path*', '/client-dashboard/:path*'],
};
