import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants/routes'
import { COOKIE_NAMES } from '@/lib/constants/cookies'

const REFRESH_TOKEN_COOKIE = COOKIE_NAMES.refreshToken

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE)

  // ── Protect admin routes ──
  if (pathname.startsWith('/admin')) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL(ROUTES.auth.adminLogin, request.url))
    }
  }

  // ── Protect owner routes ──
  if (pathname.startsWith('/owner')) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL(ROUTES.auth.ownerLogin, request.url))
    }
  }

  // ── Protect client account routes ──
  if (pathname.startsWith('/account')) {
    if (!hasRefreshToken) {
      return NextResponse.redirect(new URL(ROUTES.auth.clientLogin, request.url))
    }
  }

  // ── Redirect logged-in users away from auth pages ──
  if (pathname.startsWith('/auth') && hasRefreshToken) {
    // Middleware cannot access Zustand (Edge runtime) so we can't determine subjectType.
    // For MVP, redirect to admin dashboard. Each user type knows their own URL in practice.
    return NextResponse.redirect(new URL(ROUTES.admin.dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - api (API routes)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|api|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)).*)',
  ],
}
