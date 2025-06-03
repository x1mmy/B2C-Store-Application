import { createClient } from '@supabase/supabase-js';

// Test environment Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for E2E tests');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export const testUsers = {
  admin: {
    email: 'admin@gmail.com',
    password: 'admin123'
  },
  regularUser: {
    email: 'user@gmail.com', 
    password: 'user123'
  }
};

export async function setupTestUsers() {
  try {
    // Create admin user if it doesn't exist
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: testUsers.admin.email,
      password: testUsers.admin.password,
      email_confirm: true
    });

    if (adminError && !adminError.message.includes('already exists')) {
      console.error('Error creating admin user:', adminError);
    }

    // Create regular user for negative testing
    const { data: regularUser, error: userError } = await supabase.auth.admin.createUser({
      email: testUsers.regularUser.email,
      password: testUsers.regularUser.password,
      email_confirm: true
    });

    if (userError && !userError.message.includes('already exists')) {
      console.error('Error creating regular user:', userError);
    }

    console.log('Test users setup completed');
  } catch (error) {
    console.error('Error setting up test users:', error);
  }
}

export async function cleanupTestUsers() {
  try {
    // Note: In production, you might want to avoid deleting users
    // Instead, you could disable them or use a test-specific database
    console.log('E2E test cleanup completed');
  } catch (error) {
    console.error('Error cleaning up test users:', error);
  }
}

// Helper function to reset user state between tests
export async function resetUserState() {
  try {
    // Sign out any existing sessions
    await supabase.auth.signOut();
  } catch (error) {
    // Ignore errors as user might not be signed in
  }
} 