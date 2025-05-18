import { NextRequest, NextResponse } from 'next/server';

// Define paths that require authentication
const protectedPaths = [
  '/cart',
  '/account',
  '/orders',
  '/cart/checkout'
];

// Define paths that should redirect to dashboard if user is already logged in
const authPaths = [
  '/auth/login'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path should be protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Check if the path is an auth path (login/register)
  const isAuthPath = authPaths.some(path => 
    pathname.startsWith(path)
  );
  
  // Get the token from the request cookies
  const authState = request.cookies.get('sb-auth-state')?.value;
  const hasAuthCookies = authState === 'authenticated';
  
  // If the user is on a protected path but not authenticated, redirect to login
  if (isProtectedPath && !hasAuthCookies) {
    const url = new URL('/auth/login', request.url);
    // Add the redirect path as a query parameter to redirect after login
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // If the user is already authenticated and trying to access login/register, redirect to products
  if (isAuthPath && hasAuthCookies) {
    return NextResponse.redirect(new URL('/products', request.url));
  }
  
  // For all other routes, continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all routes except static files and api routes
    '/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\.svg$|.*\\.jpg$|.*\\.png$).*)'
  ]
}; 