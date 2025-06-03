# E2E Testing with Playwright

This directory contains end-to-end tests for the B2C Store Application using Playwright.

## Setup

### 1. Environment Variables

Create a `.env` file in the `playwright` directory with:

```bash
# Supabase Configuration for E2E Tests
NEXT_PUBLIC_SUPABASE_URL=https://cyihruftnrlpdcjhochq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application URLs (default values)
ADMIN_BASE_URL=http://localhost:3002
WEB_BASE_URL=http://localhost:3001
```

### 2. Test Database (Recommended)

For production safety, create a separate Supabase project for testing:
1. Create a new Supabase project specifically for E2E tests
2. Use the test project's URL and keys in your `.env` file
3. This prevents tests from affecting your production data

### 3. Install Dependencies

```bash
# From the root directory
npm install @playwright/test
npx playwright install
```

## Running Tests

### From Admin App Directory

```bash
cd apps/admin

# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

### From Root Directory

```bash
# Run admin E2E tests
npx playwright test --project=admin

# Run all E2E tests (web + admin)
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test playwright/admin/login.spec.ts
```

## Test Structure

### Admin Tests (`playwright/admin/`)

- `login.spec.ts` - Complete login flow testing
- `setup.ts` - Test data management and utilities

### Test Categories

1. **UI Tests** - Form rendering, element visibility
2. **Authentication Tests** - Login/logout flows
3. **Validation Tests** - Error handling, field validation
4. **Navigation Tests** - Route protection, redirects
5. **Integration Tests** - Full user workflows

## Test Data Management

### User Accounts

Tests use these predefined accounts:
- **Admin**: `admin@gmail.com` / `admin123`
- **Regular User**: `user@gmail.com` / `user123`

### Data Cleanup

Tests automatically handle:
- Session cleanup between tests
- Error state resets
- Form state management

## Best Practices

### 1. Test Independence
Each test should:
- Start from a clean state
- Not depend on other tests
- Clean up after itself

### 2. Reliable Selectors
Use in order of preference:
1. `data-testid` attributes
2. `role` attributes
3. Text content
4. CSS selectors (last resort)

### 3. Wait Strategies
```typescript
// Wait for navigation
await page.waitForURL('**/dashboard');

// Wait for element
await expect(page.locator('text=Dashboard')).toBeVisible();

// Wait for network
await page.waitForResponse(url => url.includes('/api/'));
```

### 4. Error Handling
```typescript
// Handle expected errors gracefully
const errorMessage = page.locator('.error-message');
await expect(errorMessage).toBeVisible({ timeout: 5000 }).catch(() => {
  // Error message might not appear if request is too fast
});
```

## Configuration

### Playwright Config (`playwright.config.ts`)

- **Parallel execution**: Tests run in parallel for speed
- **Retries**: Failed tests retry automatically in CI
- **Base URLs**: Configured for both admin and web apps
- **Browser support**: Chromium, Firefox, Safari

### Project Structure
```
playwright/
├── admin/           # Admin app E2E tests
│   ├── login.spec.ts
│   └── setup.ts
├── web/            # Web app E2E tests (future)
├── playwright.config.ts
└── README.md
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in test config
   - Check if app is running on correct port
   - Verify network connectivity

2. **Authentication errors**
   - Check environment variables
   - Verify Supabase credentials
   - Ensure test users exist

3. **Element not found**
   - Check if app has loaded completely
   - Verify selector accuracy
   - Add explicit waits

### Debugging

```bash
# Run with debug mode
npm run test:e2e:debug

# Run with headed browser
npm run test:e2e:headed

# Generate trace for failed tests
npx playwright test --trace on
```

### CI/CD Integration

Tests can be integrated into your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    npm run build
    npm start &
    npm run test:e2e
```

## Test Coverage

Current E2E test coverage includes:

### ✅ Implemented
- Login form rendering
- Admin authentication flow
- Non-admin user rejection
- Invalid credential handling
- Form validation
- Loading states
- Complete login-logout cycle

### 🚧 Future Tests
- Dashboard functionality
- Product management
- Order management
- User role management
- API error handling
- Cross-browser testing

## Performance

### Test Execution Times
- Single test: ~2-5 seconds
- Full login suite: ~30-60 seconds
- Parallel execution: ~10-20 seconds

### Optimization Tips
- Use `page.goto()` sparingly
- Reuse authentication state when possible
- Mock external APIs when appropriate
- Run critical path tests first 