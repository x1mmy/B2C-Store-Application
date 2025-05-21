import supabase from '../configDB/supabaseConnect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Gets the current user session if it exists
 * This should be used in server components to retrieve the user
 */
export async function getSession() {
  try {
    console.log('Getting server-side session...');
    
    // Check for the auth state cookie first
    const cookieStore = await cookies();

    // get the auth state cookie
    const authState = cookieStore.get('sb-auth-state')?.value; 
    
    console.log('Auth state cookie:', authState);
    
    // Get the access token cookie
    const accessToken = cookieStore.get('sb-access-token')?.value;
    const refreshToken = cookieStore.get('sb-refresh-token')?.value;
    
    // if no auth cookies, return null immediately
    if (!authState || authState !== 'authenticated' || (!accessToken && !refreshToken)) {
      console.log('No valid auth cookies found');
      return null;
    }
    
    // Try using access token first if available
    if (accessToken) {
      try {
        // Create a custom client with the session from cookies
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        // Get the current user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!error && user) {
          console.log('User authenticated with access token:', user.email);
          return {
            user,
            isAuthenticated: true,
          };
        }
      } catch (accessError) {
        console.log('Error with access token, trying refresh token:', accessError);
        // Continue to refresh token flow
      }
    }
    
    // If we got here, we need to try refreshing with the refresh token
    if (refreshToken) {
      try {
        console.log('Attempting to refresh token...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });
        
        if (refreshError || !refreshData.session) {
          console.error('Failed to refresh session:', refreshError?.message);
          
          // Clear cookies on refresh failure
          cookieStore.delete('sb-access-token');
          cookieStore.delete('sb-refresh-token');
          cookieStore.delete('sb-auth-state');
          
          return null;
        }
        
        // Session refreshed successfully, set new cookies
        cookieStore.set('sb-access-token', refreshData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: refreshData.session.expires_in
        });
        
        cookieStore.set('sb-refresh-token', refreshData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        
        // Return the refreshed user data
        return {
          user: refreshData.user,
          isAuthenticated: true,
        };
      } catch (refreshErr) {
        console.error('Error during token refresh:', refreshErr);
        
        // Clear all cookies
        cookieStore.delete('sb-access-token');
        cookieStore.delete('sb-refresh-token');
        cookieStore.delete('sb-auth-state');
        
        return null;
      }
    }
    
    // No valid session could be established
    console.log('No valid session could be established');
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Logs out the current user and removes all session cookies
 */
export async function logout() {
  try {
    console.log('Logging out user...');
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Remove cookies
    const cookieStore = await cookies();
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    cookieStore.delete('sb-auth-state');
    
    console.log('User logged out successfully');
    
    // Redirect to login page
    redirect('/auth/login');
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

/**
 * Refreshes the session token if it's expired
 * Can be used to ensure fresh tokens before making authenticated API calls
 */
export async function refreshSession() {
  try {
    console.log('Refreshing session token...');
    
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error('Session refresh failed:', error?.message);
      return false;
    }
    
    console.log('Session refreshed successfully');
    
    // Update cookies with new tokens
    const cookieStore = await cookies();
    
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true, // protects against XSS attacks
      secure: process.env.NODE_ENV === 'production', // only send the cookie over HTTPS in production
      sameSite: 'lax', // only send the cookie over HTTPS in production
      path: '/',   
      maxAge: data.session.expires_in
    });
    
    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true, // protects against XSS attacks
      secure: process.env.NODE_ENV === 'production', // only send the cookie over HTTPS in production
      sameSite: 'lax', // only send the cookie over HTTPS in production
      path: '/', // the path of the cookie which is the root of the domain
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

// Checks if the user is authenticated and redirects to login if not
// This is useful for protecting routes in Server Components
export async function requireAuth() {
  console.log('Requiring authentication...');
  
  // Try to get the session
  const session = await getSession();
  
  // If no session, redirect to login
  if (!session) {
    console.log('No session found, redirecting to login');
    redirect('/auth/login');
  }
  
  console.log('User is authenticated, proceeding to protected route');
  return session;
}

//  Gets the user ID from the session
export async function getUserId() {
  const session = await getSession();
  return session?.user?.id;
}

// Gets the current user session with access token for authenticated requests
export async function getSessionWithToken() {
  const session = await getSession();
  if (!session || !session.user) {
    return null;
  }
  
  // Get cookies to extract access token
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  
  return {
    user: session.user,
    accessToken
  };
} 