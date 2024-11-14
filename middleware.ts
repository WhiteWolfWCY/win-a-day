import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

// Create the locale middleware
const intlMiddleware = createMiddleware({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
});

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  if (isProtectedRoute(req)) {
    auth.protect();
  }
  
  // Handle locales after auth check
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/((?!api|_next|.*\\..*).*)',
  ],
};