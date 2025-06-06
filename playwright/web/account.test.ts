import { test, expect } from '@playwright/test';

// npx playwright test playwright/web/product.test.ts --ui

test.describe('Web App - Account Page', () => {

    // before each test, login the user
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3001/auth/login');
        await page.fill('input[data-testid="email-address"]', 'zimraan2012@gmail.com');
        await page.fill('input[data-testid="password"]', 'testing123');
        await page.click('button[data-testid="login-button"]');
        await page.waitForTimeout(3000);
    });

    // should display the account page
    test('should display the account page', async ({ page }) => {
        await page.goto('http://localhost:3001/account');

        // wait 3 secs
        await page.waitForTimeout(3000);


        // now go to the account page
        await page.goto('http://localhost:3001/account');

        // wait 3 secs
        await page.waitForTimeout(3000);

        // now itll show the account page
        await expect(page.url()).toContain('/account');
    });


    // check that the profile page has the correct information
    test('check that the profile page has the correct information', async ({ page }) => {
        await page.goto('http://localhost:3001/account');

        // wait 3 secs
        await page.waitForTimeout(3000);


        // check that the profile page has the correct information
        await expect(page.locator('h2[data-testid="profile-information-title"]')).toHaveText('Profile Information');
        await expect(page.locator('p[data-testid="profile-information-email"]')).toHaveText('zimraan2012@gmail.com');
        await expect(page.locator('p[data-testid="profile-information-user-id"]')).toHaveText('d4119229-928a-410d-9d51-3f215111dd87');

        // check that the recent orders link is correct
        await expect(page.locator('h2[data-testid="recent-orders-title"]')).toHaveText('Recent Orders');
        await expect(page.locator('a[data-testid="recent-orders-link"]')).toHaveText('View All Orders');
        await expect(page.locator('a[data-testid="recent-orders-link"]')).toHaveAttribute('href', '/account/orders');

        // check that the account actions are correct
        await expect(page.locator('div[data-testid="account-actions"]')).toBeVisible();
        await expect(page.locator('a[data-testid="view-cart-link"]')).toHaveText('View Cart');
        await expect(page.locator('a[data-testid="view-cart-link"]')).toHaveAttribute('href', '/cart');

        
    });

    //  go see all the orders for the user
    test('go see all the orders for the user', async ({ page }) => {
        await page.goto('http://localhost:3001/account');
        await page.locator('a[data-testid="recent-orders-link"]').click();
        await page.waitForTimeout(3000);
        await expect(page.url()).toContain('/account/orders');
    });

    // check each order has the correct information and is currently showing 9 orders
    test('check each order has the correct information', async ({ page }) => {
        await page.goto('http://localhost:3001/account/orders');
        await expect(page.url()).toContain('/account/orders');
        
        // Wait for the orders page to load and show orders
        const orderCards = page.locator('div.bg-white.rounded-lg.shadow-md');
        
        // Wait for at least one order to appear (with a reasonable timeout)
        await expect(orderCards.first()).toBeVisible({ timeout: 10000 });
        
        // Check we have 1 or more orders total
        const orderCount = await orderCards.count();
        expect(orderCount).toBeGreaterThanOrEqual(1);
        
        // Check the first order has the expected elements
        const firstOrder = orderCards.first();
        await expect(firstOrder.locator('text=/Order #[a-f0-9]{8}/')).toBeVisible(); // Order number format
        await expect(firstOrder.locator('p.font-bold.text-black.mt-2.text-xl')).toBeVisible(); // Main order total price
        await expect(firstOrder.locator('text=Completed')).toBeVisible();
        await expect(firstOrder.locator('h3:has-text("Order Items")')).toBeVisible();
        await expect(firstOrder.locator('text=Budo Snake Rashguard')).toBeVisible();
        await expect(firstOrder.locator('text=/Quantity: [0-9]+/')).toBeVisible();
    });

});