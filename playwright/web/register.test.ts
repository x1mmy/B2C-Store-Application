import { test, expect } from '@playwright/test';

test.describe('Web App - Register Page', () => {

    // REGISTER WORKFLOW FIRST

    // should display the register page
    test('should display the register page', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/register');
        await expect(page.locator('h2')).toHaveText('Create your account');
    });

    // create a new user but the password and confirm password are not the same
    test('create a new user but the password and confirm password are not the same', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/register');
        await page.fill('input[data-testid="email-address"]', 'zimraananjum@gmail.com');
        await page.fill('input[data-testid="password"]', 'testing123');
        await page.fill('input[data-testid="confirm-password"]', 'testing1234');
        await page.click('button[data-testid="register-button"]');
        await expect(page.locator('p.text-red-700')).toHaveText('Passwords do not match');
    });

    //create a new user but the password is less than 6 characters
    test('create a new user but the password is less than 6 characters', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/register');
        await page.fill('input[data-testid="email-address"]', 'zimraananjum@gmail.com');
        await page.fill('input[data-testid="password"]', '123');
        await page.fill('input[data-testid="confirm-password"]', '123');
        await page.click('button[data-testid="register-button"]');
        await expect(page.locator('p.text-red-700')).toHaveText('Password must be at least 6 characters long');
    });

    // create a new user - and successfull 
    test('create a new user', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/register');
        await page.fill('input[data-testid="email-address"]', 'zimraananjum@gmail.com');
        await page.fill('input[data-testid="password"]', 'testing123');
        await page.fill('input[data-testid="confirm-password"]', 'testing123');
        await page.click('button[data-testid="register-button"]');
        await expect(page.locator('p.text-green-700')).toHaveText('Registration successful! Please check your email (zimraananjum@gmail.com) to verify your account.');
    });
    

    // create a user that will be used fo rlogin test for user who isnt verified by email yet 
    test('create a user that will be used for login test for user who isnt verified by email yet', async ({ page }) => {
        await page.goto('http://localhost:3001/auth/register');
        await page.fill('input[data-testid="email-address"]', 'zimraana@allinit.com.au');
        await page.fill('input[data-testid="password"]', 'zimraan123');
        await page.fill('input[data-testid="confirm-password"]', 'zimraan123');
        await page.click('button[data-testid="register-button"]');
    });
    // should display the login page
    // test('should display the login page', async ({ page }) => {
    //     await page.goto('http://localhost:3001/auth/login');
    //     await expect(page.locator('h2')).toHaveText('Sign in to your account');
    // });



});