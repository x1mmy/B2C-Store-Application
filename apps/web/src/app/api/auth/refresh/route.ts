import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import supabase from '../../../configDB/supabaseConnect';

export async function POST(request: NextRequest) {
  try {
    console.log('Attempting to refresh auth session...');
    
    // Get current cookies - await the cookies() function as it returns a Promise
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    const authState = cookieStore.get('sb-auth-state')?.value;
    
    // If no refresh token but auth state is authenticated, this is a partial auth state
    // We'll respond with a special status that the client can handle
    if (!refreshToken && authState === 'authenticated') {
      console.log('Auth state cookie exists but no refresh token found');
      return NextResponse.json({ 
        status: 'partial_auth',
        message: 'Auth state cookie exists but tokens are missing. User may need to login again.' 
      }, { status: 204 });
    }
    
    if (!refreshToken) {
      console.error('No refresh token found');
      return NextResponse.json({ error: 'No refresh token available' }, { status: 401 });
    }
    
    // Attempt to refresh the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    
    if (error || !data.session) {
      console.error('Session refresh failed:', error?.message);
      
      // Clear cookies on refresh failure
      const response = NextResponse.json(
        { error: 'Failed to refresh session', details: error?.message },
        { status: 401 }
      );
      
      response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' });
      response.cookies.set('sb-auth-state', '', { maxAge: 0, path: '/' });
      
      return response;
    }
    
    // Successfully refreshed - set new cookies
    console.log('Session refreshed successfully for user:', data.user?.email);
    
    const response = NextResponse.json(
      { message: 'Session refreshed successfully' },
      { status: 200 }
    );
    
    // Use secure settings but ensure cookies work in development
    const secure = process.env.NODE_ENV === 'production';
    const expirySeconds = data.session.expires_in;
    
    // Set the access token cookie - with longer expiry to avoid quick expiration issues
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: secure,
      sameSite: 'lax',
      path: '/',
      maxAge: expirySeconds
    });
    
    // Set the refresh token cookie with longer expiry
    response.cookies.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days to ensure it doesn't expire too quickly
    });
    
    // Set the auth state cookie - visible to JS for UI state - with longer expiry
    response.cookies.set('sb-auth-state', 'authenticated', {
      httpOnly: false,
      secure: secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days to match refresh token
    });
    
    // Set cache control headers to prevent caching of this response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return NextResponse.json(
      { error: 'Server error while refreshing session' },
      { status: 500 }
    );
  }
} 