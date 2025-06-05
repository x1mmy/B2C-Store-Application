import { test, expect } from '@playwright/test';   

test.describe('Web App - Login Page', () => {

    // should display the login page
    test('should display the login page', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/login');
        await expect(page.locator('h2')).toHaveText('Sign in to your account');
    });

    // if a user is not logged in the header should display the login and register buttons
    test('if a user is not logged in the header should display the login and register buttons', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/login');
        await expect(page.locator('a[data-testid="header-login-button"]')).toBeVisible();
        await expect(page.locator('a[data-testid="header-register-button"]')).toBeVisible();
        await expect(page.locator('button[data-testid="header-logout-button"]')).not.toBeVisible();
    });

    // login with invalid credentials
    test('login with invalid credentials', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/login');
        await page.fill('input[data-testid="email-address"]', 'zimraananjum@gmail.com');
        await page.fill('input[data-testid="password"]', 'testing1234');
        await page.click('button[data-testid="login-button"]');
        await expect(page.locator('p.text-red-700')).toHaveText('Invalid email or password');
    });

    //login with a user who isnt verified by email yet 
    test('login with a user who isnt verified by email yet - should not let it login', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/login');
        await page.fill('input[data-testid="email-address"]', 'zimraana@allinit.com.au');
        await page.fill('input[data-testid="password"]', 'zimraan123');
        await page.click('button[data-testid="login-button"]');
        // Check for the first error message paragraph
        await expect(page.locator('p.text-red-700').first()).toHaveText('Please verify your email address before logging in');
        // Check for the second error message paragraph  
        await expect(page.locator('p.text-red-700').nth(1)).toHaveText('Please check your email inbox and click the verification link to activate your account.');
    });

    //login with a user who is verified by email 
    test('login with a user who is verified by email', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/login');
        await page.fill('input[data-testid="email-address"]', 'zimraan2012@gmail.com');
        await page.fill('input[data-testid="password"]', 'testing123');
        await page.click('button[data-testid="login-button"]');

        //wait for 10 seconds
        await page.waitForTimeout(10000);

        //expect to be at dashboard page
        await expect(page.url()).toContain('/');
        // and then see if the header has the logout button and login/register isnt showing
        await expect(page.locator('button[data-testid="header-logout-button"]')).toBeVisible();
        await expect(page.locator('a[data-testid="header-login-button"]')).not.toBeVisible();
        await expect(page.locator('a[data-testid="header-register-button"]')).not.toBeVisible();

        //logout
        await page.click('button[data-testid="header-logout-button"]', { force: true });
        await page.waitForTimeout(1000);
        await expect(page.locator('a[data-testid="header-login-button"]')).toBeVisible();
        await expect(page.locator('a[data-testid="header-register-button"]')).toBeVisible();
    });




    

});