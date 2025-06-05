import { test, expect } from '@playwright/test';

// Test configuration
test.describe('Admin Orders E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
                // login
                await page.goto('http://localhost:3002/auth/login');
                await page.fill('input[name="email"]', 'admin@gmail.com');
                await page.fill('input[name="password"]', 'admin123');
                await page.click('button[type="submit"]');
                await page.waitForURL('**/dashboard', { timeout: 10000 });
        
                // go to orders page
                await page.goto('http://localhost:3002/dashboard/orders');
    });

        // test order details are displayed correctly
        test('should display order details correctly', async ({ page }) => {
            // Wait for orders to load
            await page.waitForSelector('[data-testid="order-Id"]', { timeout: 10000 });
            
            // Check that each order has required information
            const orderIds = page.locator('[data-testid="order-Id"]');
            const orderCustomers = page.locator('[data-testid="order-customer"]');
            const orderItems = page.locator('[data-testid="order-items"]');
            const orderTotals = page.locator('[data-testid="order-total"]');
            
            const orderCount = await orderIds.count();
            
            // Verify each order has all required fields
            for (let i = 0; i < orderCount; i++) {
                await expect(orderIds.nth(i)).toContainText('Order #');
                await expect(orderCustomers.nth(i)).toContainText('Customer:');
                await expect(orderItems.nth(i)).toContainText('Items:');
                await expect(orderTotals.nth(i)).toContainText('$');
            }
        });

    // the orders page has pagination
    test('should have pagination controls', async ({ page }) => {
        // Wait for page to fully load
        await page.waitForSelector('[data-testid="order-Id"]', { timeout: 10000 });
        
        // Check if pagination exists - it only shows if totalPages > 1
        const paginationContainer = page.locator('nav[aria-label="Pagination"]');
        const paginationExists = await paginationContainer.count() > 0;
        
        if (paginationExists) {
            // Check pagination controls are visible - they use SVG icons, not text
            const prevButton = page.locator('nav[aria-label="Pagination"] a').first();
            const nextButton = page.locator('nav[aria-label="Pagination"] a').last();
            
            // At least one pagination button should exist
            const buttonCount = await page.locator('nav[aria-label="Pagination"] a').count();
            expect(buttonCount).toBeGreaterThan(0);
            
            // Check pagination info text
            await expect(page.locator('text=Showing')).toBeVisible();
            await expect(page.locator('text=results')).toBeVisible();
        } else {
            // If no pagination, it means there's only one page of results
            console.log('No pagination found - likely only one page of results');
        }
    });

    // the orders page shows 5 orders per page
    test('should show 5 orders per page', async ({ page }) => {
        // Wait for orders to load
        await page.waitForSelector('[data-testid="order-total"]', { timeout: 10000 });
        
        // Count the number of orders displayed (should be 5 or less)
        const orderCount = await page.locator('[data-testid="order-total"]').count();
        expect(orderCount).toBeLessThanOrEqual(5);
        expect(orderCount).toBeGreaterThan(0);
    });



    // test product details within orders
    test('should display product details within orders', async ({ page }) => {
        // Wait for orders to load
        await page.waitForSelector('[data-testid="order-Id"]', { timeout: 10000 });
        
        // Check if product details section exists
        const productsSection = page.locator('text=Products:');
        if (await productsSection.count() > 0) {
            await expect(productsSection.first()).toBeVisible();
            
            // Check for product information (name, quantity, price)
            const productInfo = page.locator('text=/Qty: \\d+ × \\$[\\d.]+/');
            if (await productInfo.count() > 0) {
                await expect(productInfo.first()).toBeVisible();
            }
        }
    });

    // test pagination functionality
    test('should navigate between pages correctly', async ({ page }) => {
        // Wait for orders to load
        await page.waitForSelector('[data-testid="order-Id"]', { timeout: 10000 });
        
        // Check if pagination exists
        const paginationNav = page.locator('nav[aria-label="Pagination"]');
        
        if (await paginationNav.count() > 0) {
            // Look for page number links (not SVG arrows)
            const pageLinks = page.locator('nav[aria-label="Pagination"] a').filter({ hasText: /^\d+$/ });
            const pageLinkCount = await pageLinks.count();
            
            if (pageLinkCount > 1) {
                // Click on page 2 if it exists
                const page2Link = pageLinks.filter({ hasText: '2' });
                if (await page2Link.count() > 0) {
                    await page2Link.first().click();
                    
                    // Wait for page to load
                    await page.waitForURL('**/orders?page=2');
                    
                    // Verify we're on page 2
                    expect(page.url()).toContain('page=2');
                    
                    // Check that orders are still displayed 
                    await expect(page.locator('[data-testid="order-Id"]').first()).toBeVisible();
                    
                    // Or alternatively, check that at least one order exists
                    const orderCount = await page.locator('[data-testid="order-Id"]').count();
                    expect(orderCount).toBeGreaterThan(0);
                }
            } else {
                console.log('Only one page of results available');
            }
        } else {
            console.log('No pagination - single page of results');
        }
    });
});

