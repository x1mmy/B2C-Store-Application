import { test, expect } from '@playwright/test';

// Test configuration
test.describe('Admin Products E2E Tests', () => {

    test.beforeEach(async ({ page }) => {
        // login
        await page.goto('http://localhost:3002/auth/login');
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/dashboard', { timeout: 10000 });

        // go to products page
        await page.goto('http://localhost:3002/dashboard/products');
        
        // Wait for the products to load
        await page.waitForSelector('[data-testid="products-title"]', { timeout: 10000 });
    });

    // the products page should display all the products - 3 products
    test('should display product page with exactly 5 products and all required elements', async ({ page }) => {
        // Check main page elements
        await expect(page.locator('[data-testid="products-title"]')).toBeVisible();
        await expect(page.locator('[data-testid="add-product-button"]')).toBeVisible();
        
        // Verify there are exactly 3 products
        const productNames = page.locator('[data-testid="product-name"]');
        await expect(productNames).toHaveCount(5);
        
        const productCategories = page.locator('[data-testid="product-category"]');
        await expect(productCategories).toHaveCount(5);
        
        const productPrices = page.locator('[data-testid="product-price"]');
        await expect(productPrices).toHaveCount(5);
        
        const productStocks = page.locator('[data-testid="product-stock"]');
        await expect(productStocks).toHaveCount(5);
        
        const productEditButtons = page.locator('[data-testid="product-edit-button"]');
        await expect(productEditButtons).toHaveCount(5);
        
        // Verify specific product content - the first 3
        await expect(productNames.nth(0)).toContainText('180" BOXRAW Hand Wraps');
        await expect(productNames.nth(1)).toContainText('Budo Snake Rashguard');
        await expect(productNames.nth(2)).toContainText('Engage 16oz Boxing Gloves');
    });

    //the products page should have a function to search for a product by name
    test('should have a search bar', async ({ page }) => {
        await expect(page.locator('input[name="search"]')).toBeVisible();

        // now if we search for "Engage" we should only see the Engage product
        await page.fill('input[name="search"]', 'Engage');
        // Wait for the search to take effect
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="product-name"]')).toHaveCount(1);
        await expect(page.locator('[data-testid="product-name"]').nth(0)).toContainText('Engage 16oz Boxing Gloves');


        // now if we search for "Budo" we should only see the Budo product
        await page.fill('input[name="search"]', 'Budo');
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="product-name"]')).toHaveCount(1);
        await expect(page.locator('[data-testid="product-name"]').nth(0)).toContainText('Budo Snake Rashguard');

        // now if we search for "BOXRAW" we should only see the BOXRAW product
        await page.fill('input[name="search"]', 'BOXRAW');
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="product-name"]')).toHaveCount(1);
        await expect(page.locator('[data-testid="product-name"]').nth(0)).toContainText('180" BOXRAW Hand Wraps');

        // now if we search for "180" we should only see the 180" product
        await page.fill('input[name="search"]', '180');
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="product-name"]')).toHaveCount(1);
        await expect(page.locator('[data-testid="product-name"]').nth(0)).toContainText('180" BOXRAW Hand Wraps');
    });

    //the products page should have a function to filter by category
    test('should have a filter by category dropdown', async ({ page }) => {
        await expect(page.locator('select[name="category"]')).toBeVisible();

        // now if we filter by "Boxing" we should only see boxing tagged products
        await page.selectOption('select[name="category"]', 'Boxing');
        await page.waitForTimeout(1000);
        await expect(page.locator('[data-testid="product-name"]')).toHaveCount(3);
        await expect(page.locator('[data-testid="product-name"]').nth(0)).toContainText('180" BOXRAW Hand Wraps');
        await expect(page.locator('[data-testid="product-name"]').nth(1)).toContainText('Engage 16oz Boxing Gloves');


        
    });

    //the products page when clicked on a products  edit button
    // should redirect to the edit product page
    test('should redirect to the edit product page when the edit button is clicked', async ({ page }) => {
        // Use 'a' selector since the edit button is actually a Link element
        await page.click('a[data-testid="product-edit-button"]:first-of-type');
        await expect(page).toHaveURL(/^http:\/\/localhost:3002\/dashboard\/products\/[0-9a-f-]+$/);
    });

    //now test that if we edit a product, it will update the product in the products page
    test('should update the product in the products page when the edit button is clicked', async ({ page }) => {
        // Use 'a' selector since the edit button is actually a Link element
        await page.locator('a[data-testid="product-edit-button"]').first().click();
        await expect(page).toHaveURL(/^http:\/\/localhost:3002\/dashboard\/products\/[0-9a-f-]+$/);
        
        // edit the product name
        await page.fill('input[data-testid="product-name"]', '180" BOXRAW Hand Wraps 2.0');
        await page.click('button[data-testid="save-changes-button"]');

        // goes back to the products page
        await expect(page).toHaveURL(/^http:\/\/localhost:3002\/dashboard\/products/, { timeout: 10000 });
        // check that the product name has been updated
        await expect(page.locator('[data-testid="product-name"]').nth(0)).toContainText('180" BOXRAW Hand Wraps 2.0');
    });


    test('create a new product and then delete it', async ({ page }) => {
        await page.click('a[data-testid="add-product-button"]');
        await expect(page).toHaveURL(/^http:\/\/localhost:3002\/dashboard\/products\/new$/);

        // now fill in the form
        await page.fill('input[data-testid="product-name"]', 'Test Product');
        await page.fill('input[data-testid="product-price"]', '100');
        await page.fill('input[data-testid="product-stock"]', '10');
        await page.selectOption('select[data-testid="product-category"]', 'Boxing');
        await page.fill('input[data-testid="product-imageURL"]', 'https://example.com/image.jpg');

        // now click the save changes button
        await page.click('button[data-testid="save-changes-button"]');

        // goes back to the products page
        await expect(page).toHaveURL(/^http:\/\/localhost:3002\/dashboard\/products/, { timeout: 10000 });
        // check that the product name has been updated
        await expect(page.locator('[data-testid="product-name"]').nth(4)).toContainText('Test Product');

        // DELETE THE PRODUCT
        // go to the test product (4th product, index 3)
        await page.locator('a[data-testid="product-edit-button"]').nth(4).click();
        // check that we are on the test product
        await expect(page).toHaveURL(/^http:\/\/localhost:3002\/dashboard\/products\/[0-9a-f-]+$/, { timeout: 10000 });
        await expect(page.locator('input[data-testid="product-name"]')).toHaveValue('Test Product');
        
        // Handle the confirmation dialog (set up before clicking delete)
        page.on('dialog', async (dialog) => {
            await dialog.accept();
        });
        
        // now click the delete button
        await page.click('button[data-testid="delete-product-button"]');
        
        // Wait for the deletion to complete and redirect to happen
        // The deletion should trigger a redirect to the products page
        await page.waitForURL('http://localhost:3002/dashboard/products', { timeout: 15000 });
        
        // check that the product name, test product is not there, meaning it has been deleted
        await expect(page.locator('[data-testid="product-name"]').filter({ hasText: 'Test Product' })).not.toBeVisible();
    });

    //the products button should be able to delete a product
    /// once they clicked on the edit button
    // now we delete the test product
    // test('delete a product', async ({ page }) => {
        


});