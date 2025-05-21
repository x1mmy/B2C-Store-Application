"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '../../context/cartContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Header component displays the navigation bar with site links and cart status
 * It shows a badge with the number of items in the cart pulled from Supabase products
 * It also shows different navigation links based on authentication status
 */
export default function Header() {
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  
  // For avoiding hydration errors with cart data from localStorage
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  
  // Access the function to get total cart items from cart context
  const { getTotalItems } = useCart();
  
  // Access authentication state from auth context
  const { isAuthenticated, user, logout, isLoading, checkAuthStatus } = useAuth();
  
  // Force UI to update when auth state changes
  const [authState, setAuthState] = useState(isAuthenticated);
  // Add a direct cookie check as a backup
  const [cookieAuthState, setCookieAuthState] = useState(false);
  
  // Function to check if auth cookie exists directly
  const checkAuthStateCookie = () => {
    if (typeof document !== 'undefined') {
      const hasAuthCookie = document.cookie.includes('sb-auth-state=authenticated');
      console.log("Direct cookie check result:", hasAuthCookie);
      setCookieAuthState(hasAuthCookie);
      return hasAuthCookie;
    }
    return false;
  };
  
  // Handle client-side rendering to access localStorage safely
  useEffect(() => {
    setIsClient(true);
    
    // Check auth status on component mount
    const checkAuth = async () => {
      try {
        // First check direct cookie
        const hasCookie = checkAuthStateCookie();
        
        // Then try the full auth check
        const authResult = await checkAuthStatus();
        console.log("Auth check complete:", authResult);
        
        // If either is true, we'll show authenticated UI
        setAuthState(authResult || hasCookie);
      } catch (error) {
        console.error("Error checking auth in header:", error);
        // Fall back to cookie if auth check fails
        setAuthState(cookieAuthState);
      }
    };
    
    checkAuth();
  }, []);
  
  // Force auth check on every route change
  useEffect(() => {
    const syncAuthState = async () => {
      console.log("Path changed, re-syncing auth state...");
      // First check cookie directly
      const hasCookie = checkAuthStateCookie();
      
      // Then attempt full auth check
      try {
        const isAuth = await checkAuthStatus();
        console.log("Auth check result:", isAuth);
        // Use either result - if protected page loaded, we must be authenticated
        setAuthState(isAuth || hasCookie);
      } catch (error) {
        console.error("Auth check failed:", error);
        // Fall back to cookie check
        setAuthState(hasCookie);
      }
    };
    
    syncAuthState();
  }, [pathname, checkAuthStatus]);
  
  // Monitor auth state changes and update the component
  useEffect(() => {
    // Log auth state for debugging
    console.log('Header auth state changed:', isAuthenticated, user?.email);
    checkAuthStateCookie();
    setAuthState(isAuthenticated || cookieAuthState);
  }, [isAuthenticated, user, cookieAuthState]);

  // Use an interval to periodically check auth state
  useEffect(() => {
    // Check auth every minute to ensure UI is in sync
    const interval = setInterval(() => {
      checkAuthStateCookie();
      if (!isAuthenticated && cookieAuthState) {
        checkAuthStatus();
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [checkAuthStatus, isAuthenticated, cookieAuthState]);
  
  // Get the total number of items in the cart (based on Supabase products)
  // Only calculate on client-side to avoid hydration mismatch
  const cartItemCount = isClient ? getTotalItems() : 0;
  
  /**
   * Handles the search form submission
   * Navigates to search results page with query parameter
   * 
   * @param e - The form submission event
   */
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/?search=${encodeURIComponent(searchQuery)}`);
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    console.log("Header: Logging out user...");
    // First clear our direct cookie state
    setCookieAuthState(false);
    setAuthState(false);
    
    // Then call the real logout
    await logout();
    
    // Redirect to home page
    router.push('/');
  };

  // Determine if user should be treated as authenticated for UI purposes
  const isUserAuthenticated = authState || cookieAuthState;

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-red-600">ShopMMA</span>
            </Link>
          </div>
          
          {/* Main Navigation */}
          <nav className="flex space-x-8 items-center">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              Home
            </Link>
            <Link 
              href="/products" 
              className="text-gray-600 hover:text-red-600 font-medium"
            >
              Products
            </Link>
            {/* Cart link with item count badge */}
            <Link 
              href="/cart" 
              className="relative text-gray-600 hover:text-red-600"
            >
              Cart
              {/* Show the number of cart items from Supabase products if > 0 */}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {/* Always show Account for debugging, but it's still protected by middleware */}
            <Link 
              href="/account" 
              className={`text-gray-600 hover:text-red-600 font-medium ${!isUserAuthenticated ? 'text-opacity-50' : ''}`}
            >
              Account
              {!isUserAuthenticated && <span className="text-xs ml-1 text-red-600">*</span>}
            </Link>
            
            {/* Authentication links - show different options based on auth state */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : isUserAuthenticated ? (
                <>
                  {/* <span className="text-sm text-gray-600 truncate max-w-[120px]" title={user?.email || ""}>
                    {"Logged in"}
                  </span> */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : ( // if the user is not authenticated, show the login and register links
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-gray-600 hover:text-red-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-emerald-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}