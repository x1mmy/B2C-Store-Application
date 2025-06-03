import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
// import LoginPage from '../src/app/auth/login/page';
import LoginPage from '../src/app/auth/login/page';
import { mockSupabase } from '../vitest.setup';
import { useRouter } from 'next/navigation';
import Dashboard from '../src/app/dashboard/page';
import DashboardLayout from '../src/app/dashboard/layout';

// Mock the router
const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
    replace: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Test Suite
describe('Login Page', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  // Test suite for rendering

    it('should render login form with all required fields', () => {
      render(<LoginPage />);
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should allow admin only to login', async () => {
      // Mock successful login
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { email: 'admin@gmail.com' } },
        error: null
      });

      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'admin@gmail.com');
      await userEvent.type(passwordInput, 'admin123');
      await userEvent.click(submitButton);

      // Wait for the login process
      await waitFor(() => {
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'admin@gmail.com',
          password: 'admin123'
        });
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should not allow non-admin users to login', async () => {
      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'user@gmail.com');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.click(submitButton);

      // Should show access denied message
      await waitFor(() => {
        expect(screen.getByText(/Access denied. Admin credentials required./i)).toBeInTheDocument();
      });

      // Should not call Supabase auth
      expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should show error message for invalid credentials', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Authentication failed' }
      });

      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'admin@gmail.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard after successful login', async () => {
      // Mock successful login
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { email: 'admin@gmail.com' } },
        error: null
      });

      render(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'admin@gmail.com');
      await userEvent.type(passwordInput, 'admin123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('dashboard should have sign out functionality', async () => {
      // Mock sign out
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      render(<DashboardLayout><Dashboard /></DashboardLayout>);

      // Find the sign out button
      const signOutButton = screen.getByText('Sign out');
      expect(signOutButton).toBeInTheDocument();

      // Click the sign out button
      await userEvent.click(signOutButton);

      // Verify sign out was called and navigation happened
      await waitFor(() => {
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/auth/login');
      });
    });
});



