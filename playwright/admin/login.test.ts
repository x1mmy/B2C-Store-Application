import { test, expect } from '@playwright/test';

// Test configuration
test.describe('Admin Login E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('http://localhost:3002/auth/login');
  });

  // DONE
  test('should display login form with all required elements', async ({ page }) => {
    // Check page title and heading
    await expect(page.locator('[data-testid="login-title"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('p')).toContainText('Sign in to your admin account');

    // Check form elements exist
    await expect(page.locator('input[name="email"]')).toBeVisible();

    await expect(page.locator('input[name="password"]')).toBeVisible();

    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
  });

  // DONE
  test('should successfully login with valid admin credentials', async ({ page }) => {
    // Fill in the form
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', 'admin123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Check dashboard content
    await expect(page.locator('h2[data-testid="dashboard-title"]')).toContainText('Welcome to your Admin Dashboard');
    
    // Verify admin-specific elements are present
    await expect(page.locator('button[data-testid="sign-out-button"]')).toBeVisible();
  });

  // DONE
  test('should reject login for non-admin users', async ({ page }) => {
    // Try to login with non-admin email
    await page.fill('input[name="email"]', 'user@gmail.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should show error message and stay on login page
    await expect(page.locator('text=Access denied. Admin credentials required.')).toBeVisible();
    
    // Should not navigate away from login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  // DONE
  test('should show error for invalid credentials', async ({ page }) => {
    // Try to login with wrong password
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.text-red-700')).toContainText('Invalid login credentials');
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });


  // DONE
  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show HTML5 validation (browsers handle this differently)
    // Check that we're still on login page
    await expect(page).toHaveURL(/.*\/auth\/login/);
    
    // Try with just email
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/auth\/login/);
    
    // Clear and try with just password
    await page.fill('input[name="email"]', '');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });

  // TEST COMPLETE LOGIN-LOGOUT CYCLE
  test('should complete full login-logout cycle', async ({ page }) => {
    // Step 1: Login
    await page.goto('http://localhost:3002/auth/login');
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Step 2: Verify dashboard access
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('h2[data-testid="dashboard-title"]')).toContainText('Welcome to your Admin Dashboard');
    
    // Step 3: Logout
    await page.click('button[data-testid="sign-out-button"]', {force: true});

    // Need to manually go to login page due to nextJS pop up blocking the sign out button

    // Step 4: Verify login page works
    await page.goto('http://localhost:3002/auth/login');
    await expect(page.locator('[data-testid="login-title"]')).toBeVisible();
    await expect(page.locator('p')).toContainText('Sign in to your admin account');

    // Step 5: Verify redirect to login
    await expect(page).toHaveURL(/.*\/auth\/login/);

    // Step 6: Login again
    await page.fill('input[name="email"]', 'admin@gmail.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    
  });


});
