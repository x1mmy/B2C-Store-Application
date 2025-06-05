import { test, expect } from '@playwright/test';

// npx playwright test playwright/web/product.test.ts --ui

test.describe('Web App - Product Page', () => {

    // should display the product page
    test('should display the product page', async ({ page }) => {
        await page.goto('http://localhost:3001/products');
        await expect(page.locator('h1')).toHaveText('Our Products');
    });

    //should display products
    test('should display products', async ({ page }) => {
        await page.goto('http://localhost:3001/products');
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5);
    });

    // should have a search bar 
    test('should have a search bar', async ({ page }) => {
        await page.goto('http://localhost:3001/products');
        await expect(page.locator('input[data-testid="search-bar"]')).toBeVisible();

        // fill in the search bar with "budo"
        await page.fill('input[data-testid="search-bar"]', 'budo');
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);
    });

    // should have a filter by category by clicking on the category
    test('should have a filter by category by clicking on the category', async ({ page }) => {
        await page.goto('http://localhost:3001/products');
        await expect(page.locator('button[data-testid="category-filter-button-all"]')).toBeVisible();
        //should be 1 button
        await expect(page.locator('button[data-testid="category-filter-button-all"]')).toHaveCount(1);
        //click on the all button
        await page.click('button[data-testid="category-filter-button-all"]');
        //should be 5 products
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(5);

        //click on the bjj button
        await page.click('button[data-testid="category-filter-button-BJJ"]');
        //should be 1 product
        await expect(page.locator('[data-testid="product-card"]')).toHaveCount(1);

        // click on the boxing category
        // await page.click('button[data-testid="category-filter-button"]').first();
        // await expect(page.locator('[data-testid="product-card"]')).toHaveCount(3);
    });

    // click on a product and go to the product detail page
    test('click on a product and go to the product detail page', async ({ page }) => {
        await page.goto('http://localhost:3001/products');
        await page.locator('a[data-testid="product-card-link"]').first().click();
        await expect(page.locator('h1[data-testid="product-name"]')).toHaveText('Budo Snake Rashguard');
        await expect(page.locator('span[data-testid="product-category"]')).toHaveText('BJJ');
        await expect(page.locator('p[data-testid="product-price"]')).toHaveText('$69.95');
        await expect(page.locator('p[data-testid="product-description"]')).toHaveText('The Snake black short sleeve rash guard. Japanese inspired print ');
    });

    // add to cart button should add the product to the cart
    test('add to cart, delete, update quantity, checkout', async ({ page }) => {

        await page.goto('http://localhost:3001/products');
        await page.locator('a[data-testid="product-card-link"]').first().click();
        await page.locator('button[data-testid="add-to-cart-button"]').click();

        //wait 3 secs
        await page.waitForTimeout(3000);

        // go to the cart page
        await page.goto('http://localhost:3001/cart');

        //wait 3 secs
        await page.waitForTimeout(3000);

        // now itll show the login page because we are not logged in
        await expect(page.url()).toContain('/auth/login');
        await expect(page.locator('h2')).toHaveText('Sign in to your account');

        // sign in
        await page.fill('input[data-testid="email-address"]', 'zimraan2012@gmail.com');
        await page.fill('input[data-testid="password"]', 'testing123');
        await page.click('button[data-testid="login-button"]');

        //wait 3 secs so that the login loads
        await page.waitForTimeout(3000);

        // then expect the dashboard
        await expect(page.url()).toContain('/');

        // go back to the cart page
        await page.goto('http://localhost:3001/cart');

        //wait 3 secs so that the cart loads
        await page.waitForTimeout(3000);

        // Now check for the cart item and that the total is correct
        await expect(page.locator('span[data-testid="cart-item-name"]').first()).toHaveText('Budo Snake Rashguard');
        await expect(page.locator('td[data-testid="cart-item-price"]').first()).toHaveText('$69.95');
        await expect(page.locator('span[data-testid="cart-item-quantity"]').first()).toHaveText('1');
        await expect(page.locator('td[data-testid="cart-item-total"]').first()).toHaveText('$69.95');


        // now to show that chnaging quantity updates the total
        await page.locator('button[data-testid="cart-item-quantity-increase"]').click();
        await expect(page.locator('td[data-testid="cart-item-total"]')).toHaveText('$139.90');

        await page.locator('button[data-testid="cart-item-quantity-decrease"]').click();
        await expect(page.locator('td[data-testid="cart-item-total"]')).toHaveText('$69.95');

        // go back to the products page to add another product which we will be removing
        await page.goto('http://localhost:3001/products');
        await page.locator('a[data-testid="product-card-link"]').nth(1).click();
        await page.locator('button[data-testid="add-to-cart-button"]').click();

        //wait 3 secs
        await page.waitForTimeout(3000);

        await page.goto('http://localhost:3001/cart');

        //wait 3 secs
        await page.waitForTimeout(3000);

        // double check the cart has both products
        await expect(page.locator('span[data-testid="cart-item-name"]').first()).toHaveText('Budo Snake Rashguard');
        await expect(page.locator('td[data-testid="cart-item-price"]').first()).toHaveText('$69.95');
        await expect(page.locator('span[data-testid="cart-item-quantity"]').first()).toHaveText('1');
        await expect(page.locator('td[data-testid="cart-item-total"]').first()).toHaveText('$69.95');

        await expect(page.locator('span[data-testid="cart-item-name"]').nth(1)).toHaveText('Strike Series Boxing Gloves - Fluro (Velcro)');
        await expect(page.locator('td[data-testid="cart-item-price"]').nth(1)).toHaveText('$99.95');
        await expect(page.locator('span[data-testid="cart-item-quantity"]').nth(1)).toHaveText('1');
        await expect(page.locator('td[data-testid="cart-item-total"]').nth(1)).toHaveText('$99.95');

        // check the subtotal is correct with both products
        await expect(page.locator('span[data-testid="cart-total"]')).toHaveText('$169.90');

        // now to show that removing the product from the cart updates the total
        await page.locator('button[data-testid="cart-item-remove"]').nth(1).click();
        await expect(page.locator('span[data-testid="cart-item-name"]').first()).toHaveText('Budo Snake Rashguard');
        await expect(page.locator('td[data-testid="cart-item-price"]').first()).toHaveText('$69.95');
        await expect(page.locator('span[data-testid="cart-item-quantity"]').first()).toHaveText('1');
        await expect(page.locator('td[data-testid="cart-item-total"]').first()).toHaveText('$69.95');

        // now to show that removing the product from the cart updates the total
        // check the subtotal is correct with one product
        await expect(page.locator('span[data-testid="cart-total"]')).toHaveText('$69.95');

        // now we go to the checkout page
        await page.locator('button[data-testid="checkout-button"]').click();

        // wait 3 secs
        await page.waitForTimeout(3000);

        // now we should be on the checkout page hosted by str
        await expect(page.url()).toContain('checkout.stripe.com');
        
        // verify the product details on the Stripe checkout page
        await expect(page.locator('text=Budo Snake Rashguard')).toBeVisible();
        await expect(page.locator('text=A$69.95')).toBeVisible();

        // shows that we are on the stripe hosted checkout page
       
    });

    // Test checkout flow by bypassing Stripe and directly creating an order
    // test('bypass stripe checkout and test order creation and viewing', async ({ page }) => {
    //     // First, log in
    //     await page.goto('http://localhost:3001/auth/login');
    //     await page.fill('input[data-testid="email-address"]', 'zimraan2012@gmail.com');
    //     await page.fill('input[data-testid="password"]', 'testing123');
    //     await page.click('button[data-testid="login-button"]');
    //     await page.waitForTimeout(3000);

    //     // Get product information by visiting the product page first
    //     await page.goto('http://localhost:3001/products');
        
    //     // Get the first product details
    //     const firstProductLink = page.locator('a[data-testid="product-card-link"]').first();
    //     await firstProductLink.click();
        
    //     // Extract product information from the product detail page
    //     const productName = await page.locator('h1[data-testid="product-name"]').textContent();
    //     const productPrice = await page.locator('p[data-testid="product-price"]').textContent();
    //     const priceValue = parseFloat(productPrice?.replace('$', '') || '0');
        
    //     console.log('Product details:', { productName, productPrice, priceValue });
        
    //     // Calculate order total properly
    //     const quantity = 10;
    //     const itemTotal = priceValue * quantity;
        
    //     // Create a fake order by directly calling the orders API
    //     const fakeOrderData = {
    //         userId: 'user-id-will-be-validated-server-side', // This will be overridden by server
    //         total: itemTotal, // Fix: total should equal the item total
    //         status: 'completed',
    //         items: [
    //             {
    //                 productId: 'budo-snake-rashguard', // Known product ID from your test data
    //                 quantity: quantity,
    //                 price: priceValue // Individual item price, not total
    //             }
    //         ]
    //     };

    //     console.log('Creating order with data:', fakeOrderData);

    //     // Make API call to create the order using the authenticated session
    //     const orderResponse = await page.evaluate(async (orderData) => {
    //         const response = await fetch('/api/orders', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(orderData)
    //         });
    //         const result = await response.json();
    //         return { status: response.status, data: result };
    //     }, fakeOrderData);

    //     console.log('Order creation response:', orderResponse);

    //     // Verify the order was created successfully
    //     expect(orderResponse.status).toBe(200);
    //     expect(orderResponse.data.success).toBe(true);
    //     expect(orderResponse.data.orderId).toBeDefined();

    //     const createdOrderId = orderResponse.data.orderId;
    //     const createdOrderNumber = orderResponse.data.orderNumber;
        
    //     console.log('Order created successfully:', { orderId: createdOrderId, orderNumber: createdOrderNumber });

    //     // Wait a moment for the order to be processed
    //     await page.waitForTimeout(2000);

    //     // Navigate to orders page to verify the order appears
    //     await page.goto('http://localhost:3001/account/orders');
    //     await page.waitForTimeout(3000);

    //     // Verify the order appears in the orders list
    //     await expect(page.locator('h1')).toHaveText('Your Orders');
        
    //     // Check that we have at least one order displayed
    //     const orderCards = page.locator('div:has-text("Order #")');
    //     await expect(orderCards.first()).toBeVisible();
        
    //     // Look for the specific order total we created ($699.50 for 10 * $69.95)
    //     const expectedTotal = `$${itemTotal.toFixed(2)}`;
    //     console.log('Looking for order total:', expectedTotal);
    //     await expect(page.locator(`text=${expectedTotal}`)).toBeVisible();
        
    //     // Look for the completed status
    //     await expect(page.locator('text=Completed')).toBeVisible();
        
    //     // Check that order items are displayed
    //     await expect(page.locator('h3:has-text("Order Items")')).toBeVisible();
        
    //     // Look for the quantity in the order items
    //     await expect(page.locator(`text=Quantity: ${quantity}`)).toBeVisible();
        
    //     console.log('Order creation test completed successfully');
    // });

    // Test that creates order and then shows success-like flow
    // test('create order and verify it shows in orders list with correct details', async ({ page }) => {
    //     // First, log in
    //     await page.goto('http://localhost:3001/auth/login');
    //     await page.fill('input[data-testid="email-address"]', 'zimraan2012@gmail.com');
    //     await page.fill('input[data-testid="password"]', 'testing123');
    //     await page.click('button[data-testid="login-button"]');
    //     await page.waitForTimeout(3000);

    //     // Create a distinctive order that will be easy to spot
    //     const quantity = 10;
    //     const pricePerItem = 69.95; // Budo Snake Rashguard price
    //     const totalAmount = quantity * pricePerItem; // $699.50
        
    //     const orderData = {
    //         userId: 'user-id-will-be-validated-server-side',
    //         total: totalAmount,
    //         status: 'completed',
    //         items: [
    //             {
    //                 productId: 'budo-snake-rashguard',
    //                 quantity: quantity,
    //                 price: pricePerItem
    //             }
    //         ]
    //     };

    //     console.log('Creating test order:', { total: totalAmount, quantity });

    //     // Create the order via API
    //     const orderResponse = await page.evaluate(async (orderData) => {
    //         const response = await fetch('/api/orders', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(orderData)
    //         });
    //         const result = await response.json();
    //         return { status: response.status, data: result };
    //     }, orderData);

    //     // Verify order creation
    //     expect(orderResponse.status).toBe(200);
    //     expect(orderResponse.data.success).toBe(true);
    //     expect(orderResponse.data.orderId).toBeDefined();
    //     expect(orderResponse.data.orderNumber).toBeDefined();

    //     const orderId = orderResponse.data.orderId;
    //     const orderNumber = orderResponse.data.orderNumber;
    //     const shortOrderNumber = orderNumber.substring(0, 8);

    //     console.log('Order created:', { orderId, orderNumber: shortOrderNumber, total: totalAmount });

    //     // Simulate success page scenario by showing what would happen
    //     // In a real scenario, user would be redirected to /cart/checkout/success?session_id=xxx
    //     // But since we can't mock Stripe session, we'll just show the order was created
        
    //     console.log('Simulating success: Order created successfully');
    //     console.log(`Success message would show: Order Number: #${shortOrderNumber}`);
    //     console.log(`Total: $${totalAmount.toFixed(2)}`);

    //     // Wait a moment for database operations to complete
    //     await page.waitForTimeout(2000);

    //     // Navigate to orders page to verify the order
    //     await page.goto('http://localhost:3001/account/orders');
    //     await page.waitForTimeout(3000);

    //     // Verify we're on the orders page
    //     await expect(page.locator('h1')).toHaveText('Your Orders');

    //     // Look for our specific order - it should be the first one (newest)
    //     const firstOrderCard = page.locator('div.bg-white.rounded-lg.shadow-md').first();
    //     await expect(firstOrderCard).toBeVisible();

    //     // Check for the order number (first 8 characters)
    //     await expect(page.locator(`text=Order #${shortOrderNumber}`)).toBeVisible();

    //     // Check for the total amount
    //     await expect(page.locator(`text=$${totalAmount.toFixed(2)}`)).toBeVisible();

    //     // Check for completed status
    //     await expect(firstOrderCard.locator('text=Completed')).toBeVisible();

    //     // Check that order items section exists
    //     await expect(firstOrderCard.locator('h3:has-text("Order Items")')).toBeVisible();

    //     // Check for the specific quantity in the order items
    //     await expect(firstOrderCard.locator(`text=Quantity: ${quantity}`)).toBeVisible();

    //     // Check for individual item price
    //     await expect(firstOrderCard.locator(`text=$${pricePerItem.toFixed(2)}`)).toBeVisible();

    //     // Verify the "View Orders" link exists (as it would on success page)
    //     await expect(page.locator('a[href="/account/orders"]')).toBeVisible();

    //     console.log('✅ Order verification completed successfully');
    //     console.log(`✅ Found order #${shortOrderNumber} with total $${totalAmount.toFixed(2)}`);
    //     console.log(`✅ Verified quantity: ${quantity} items at $${pricePerItem.toFixed(2)} each`);
    // });

});