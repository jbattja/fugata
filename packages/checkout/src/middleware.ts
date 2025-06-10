import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the sessions route
  if (pathname.startsWith('/sessions/')) {
    return NextResponse.next();
  }

  // Redirect all other routes to an error page
  return NextResponse.redirect(new URL('/error', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - error (error page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|error).*)',
  ],
}; 