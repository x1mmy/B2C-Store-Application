"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../configDB/supabaseConnect';

/**
 * User interface defines the user object structure received from Supabase Auth
 */
interface User {
  id: string;
  email?: string;
  created_at?: string;
}

/**
 * AuthContextType defines the authentication state and operations
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  checkAuthStatus: async () => false,
});

/**
 * Custom hook to use the auth context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * AuthProvider component to wrap the application with authentication functionality
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Function to refresh the session from the API
  const refreshSession = async (): Promise<boolean> => {
    // Prevent concurrent refresh attempts
    if (isRefreshing) {
      console.log("Refresh already in progress, skipping...");
      return false;
    }

    try {
      setIsRefreshing(true);
      console.log("Refreshing session from API...");
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        console.error("Session refresh failed:", response.status);
        return false;
      }
      
      // Update the last refresh time
      setLastRefreshTime(Date.now());
      return true;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Memoize checkAuthStatus to avoid recreation on each render
  const checkAuthStatus = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking auth status...");
      
      // Check client-side first - if we know we're already authenticated
      if (isAuthenticated && user) {
        console.log("Already authenticated in state:", user.email);
        return true;
      }
      
      // Get the current session directly from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // If there's an error getting the session, log and return false
      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
      
      // If there's an active session with a user, they're authenticated
      if (sessionData?.session?.user) {
        console.log("User is authenticated via session:", sessionData.session.user.email);
        
        // Set user data from session
        setUser({
          id: sessionData.session.user.id,
          email: sessionData.session.user.email,
          created_at: sessionData.session.user.created_at,
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      }
      
      // Fallback to cookie check - for additional reliability
      const authCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-auth-state='));
      
      const accessTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-access-token='));
      
      const refreshTokenCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sb-refresh-token='));
      
      console.log("Auth cookie check:", authCookie);
      console.log("Access token cookie exists:", !!accessTokenCookie);
      console.log("Refresh token cookie exists:", !!refreshTokenCookie);

      // If no auth cookies, user is definitely not authenticated
      if (!authCookie || !authCookie.includes('authenticated') || !refreshTokenCookie) {
        console.log("No auth cookies found or not authenticated");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      // Try to refresh the session if needed
      const currentTime = Date.now();
      const timeSinceLastRefresh = currentTime - lastRefreshTime;
      const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

      if (!accessTokenCookie || timeSinceLastRefresh > REFRESH_INTERVAL) {
        console.log("Session needs refresh - access token missing or refresh interval passed");
        
        // Try to refresh the session
        const refreshed = await refreshSession();
        if (!refreshed) {
          console.log("Session refresh failed, clearing auth state");
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Clear cookies on the client side
          document.cookie = 'sb-access-token=; max-age=0; path=/;';
          document.cookie = 'sb-refresh-token=; max-age=0; path=/;';
          document.cookie = 'sb-auth-state=; max-age=0; path=/;';
          
          return false;
        }
      }
        
      // Get user data after potential refresh
      const { data, error } = await supabase.auth.getUser();
      
      console.log("GetUser after status check:", data?.user?.email, error);
      
      if (error || !data.user) {
        console.log("Error getting user or no user found");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        
        // Clear cookies on the client side
        document.cookie = 'sb-access-token=; max-age=0; path=/;';
        document.cookie = 'sb-refresh-token=; max-age=0; path=/;';
        document.cookie = 'sb-auth-state=; max-age=0; path=/;';
        
        return false;
      }

      // User is authenticated
      console.log("User is authenticated:", data.user.email);
      setUser({
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
      });
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, [isAuthenticated, user, lastRefreshTime]);

  // Listen for storage events to keep auth state in sync across tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sb-auth-state') {
        console.log("Auth state changed in another tab, refreshing...");
        checkAuthStatus();
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [checkAuthStatus]);

  /**
   * Initialize auth state when component mounts
   */
  useEffect(() => {
    // Create a function to be our listener
    const handleAuthChange = async (event: string, session: any) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT') {
        // Clear all auth state on sign out
        setUser(null);
        setIsAuthenticated(false);
        
        // Clear cookies on the client side too
        document.cookie = 'sb-access-token=; max-age=0; path=/;';
        document.cookie = 'sb-refresh-token=; max-age=0; path=/;';
        document.cookie = 'sb-auth-state=; max-age=0; path=/;';
        
        // Also update localStorage for cross-tab sync
        localStorage.removeItem('sb-auth-state');
      } else if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          created_at: session.user.created_at,
        });
        setIsAuthenticated(true);
        setLastRefreshTime(Date.now());
        
        // Update localStorage for cross-tab sync
        localStorage.setItem('sb-auth-state', 'authenticated');
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No initial session, but check if we have cookies
        await checkAuthStatus();
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('sb-auth-state');
      }
      setIsLoading(false);
    };

    // Initial auth check
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session from Supabase client but cookies exist, try refreshing
      if (!session) {
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('sb-auth-state='));
        
        const refreshTokenCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('sb-refresh-token='));
          
        if (authCookie?.includes('authenticated') && refreshTokenCookie) {
          console.log("No session but auth cookies found, trying to refresh");
          await refreshSession();
          const refreshedSession = await supabase.auth.getSession();
          handleAuthChange('INITIAL_SESSION', refreshedSession.data.session);
          return;
        }
      }
      
      handleAuthChange('INITIAL_SESSION', session);
    };
    
    initAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Set up a periodic auth check every 5 minutes
    const checkInterval = setInterval(() => {
      if (isAuthenticated) {
        refreshSession();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(checkInterval);
    };
  }, [isAuthenticated, checkAuthStatus]);

  /**
   * Login function to authenticate users with Supabase Auth
   */
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting login for:", email);
      
      // wait for a request from the server to login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      // error checking 
      if (!response.ok) {
        console.error("Login failed:", data.error);
        setIsLoading(false);
        return {
          success: false,
          error: data.error || 'Login failed',
        };
      }

      // Immediately check auth status to ensure cookies are properly set
      await checkAuthStatus();
      
      // Set refresh time
      setLastRefreshTime(Date.now());
      
      // Update localStorage for cross-tab sync
      localStorage.setItem('sb-auth-state', 'authenticated');
      
      // Force a page refresh to ensure all components recognize the auth state
      router.refresh();
      
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  };

  /**
   * Logout function to sign users out
   */
  const logout = async () => {
    try {
      console.log("Attempting to log out");
      
      // First clear client-side state
      setUser(null);
      setIsAuthenticated(false);
      
      // Update localStorage for cross-tab sync
      localStorage.removeItem('sb-auth-state');
      
      // Then call the API to handle server-side logout
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Also sign out directly with Supabase client
      await supabase.auth.signOut();
      
      // Clear cookies on the client side too
      document.cookie = 'sb-access-token=; max-age=0; path=/;';
      document.cookie = 'sb-refresh-token=; max-age=0; path=/;';
      document.cookie = 'sb-auth-state=; max-age=0; path=/;';
      
      console.log("Logout process completed");
      
      // Redirect to login page
      router.push('/auth/login');
      // Force a refresh to clear client-side state
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 