import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import supabase from '../configDB/supabaseConnect';

export async function loginAdmin(email: string, password: string) {
  if (email !== 'admin@gmail.com') {
    return { error: 'Access denied. Admin credentials required.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getAdminSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    return null;
  }
  
  // Only return session if it belongs to admin@gmail.com
  if (data.session.user.email === 'admin@gmail.com') {
    return data.session;
  }
  
  return null;
}

export async function requireAuth() {
  const session = await getAdminSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return session;
} 