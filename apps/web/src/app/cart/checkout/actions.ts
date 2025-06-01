'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

/**
 * Server action to clear authentication cookies
 * This should be called during checkout when needed
 */
export async function clearAuthCookies() {
  const cookieStore = cookies();
  
  // Delete all authentication cookies
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
  cookieStore.delete('sb-auth-state');
  
  // Revalidate the checkout path
  revalidatePath('/cart/checkout/success');
  
  return { success: true };
}

/**
 * Server action to set authentication cookies 
 * during the checkout process
 */
export async function setAuthCookie(name: string, value: string, options: any = {}) {
  const cookieStore = cookies();
  
  cookieStore.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...options
  });
  
  // Revalidate the checkout path
  revalidatePath('/cart/checkout/success');
  
  return { success: true };
}

/**
 * Server action to refresh the session during checkout
 */
export async function refreshCheckoutSession(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();
  
  // Set authentication cookies
  cookieStore.set('sb-access-token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 3600 // 1 hour
  });
  
  if (refreshToken) {
    cookieStore.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }
  
  cookieStore.set('sb-auth-state', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
  
  // Revalidate the checkout path
  revalidatePath('/cart/checkout/success');
  
  return { success: true };
} 