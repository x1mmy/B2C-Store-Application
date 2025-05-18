import supabase from '../configDB/supabaseConnect';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Gets the current user session if it exists
 * This should be used in server components to retrieve the user
 */
export async function getSession() {
  try {
    // Check for the auth state cookie first
    const cookieStore = await cookies();
    const authState = cookieStore.get('sb-auth-state')?.value;
    
    if (authState !== 'authenticated') {
      return null;
    }
    
    // Get the current user from Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }
    
    return {
      user,
      isAuthenticated: true,
    };
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
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Remove cookies
    const cookieStore = await cookies();
    cookieStore.delete('sb-access-token');
    cookieStore.delete('sb-refresh-token');
    cookieStore.delete('sb-auth-state');
    
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
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      return false;
    }
    
    // Update cookies with new tokens
    const cookieStore = await cookies();
    
    cookieStore.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: data.session.expires_in
    });
    
    cookieStore.set('sb-refresh-token', data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    return true;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}

/**
 * Checks if the user is authenticated and redirects to login if not
 * This is useful for protecting routes in Server Components
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return session;
}

/**
 * Gets the user ID from the session
 * Useful when you only need the ID and not the full user object
 */
export async function getUserId() {
  const session = await getSession();
  return session?.user?.id;
} 