import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page, context }) => {
  // Log all requests and responses for debugging
  page.on('request', request => console.log('>>', request.method(), request.url()));
  page.on('response', response => console.log('<<', response.status(), response.url()));

  // Navigate to the login page using baseURL
  await page.goto('/login');

  // Fill in login credentials
  await page.fill('[data-testid="login-emailinput"]', 'test@test.nl');
  await page.fill('[data-testid="login-passwordinput"]', 'test');
  await page.click('[data-testid="login-button"]');

  // Wait for navigation to the home page
  await page.waitForURL('/');

  // Preserve cookies for authenticated sessions
  const cookies = await context.cookies();
  await context.addCookies(cookies); 
});

test('[Login] Test if page loads', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Login/);

  await expect(page.getByTestId('login-logo')).toBeVisible();
  await expect(page.getByTestId('login-header')).toBeVisible();
  await expect(page.getByTestId('login-form')).toBeDefined();
  await expect(page.getByTestId('login-emailinput')).toBeVisible();
  await expect(page.getByTestId('login-passwordinput')).toBeVisible();
  await expect(page.getByTestId('login-button')).toBeVisible();
  await expect(page.getByTestId('register-button-onloginscreen')).toBeVisible();
});

test('[Login] Test if login fails with invalid creds', async ({ page, context }) => {
  // Override response handler for this specific test
  page.on('response', (response) => {
    if (response.url().includes('/api/login')) {
      expect(response.status()).toBe(401); 
    }
  });

  await page.goto('/login');

  await page.fill('[data-testid="login-emailinput"]', 'invalid@example.com');
  await page.fill('[data-testid="login-passwordinput"]', 'wrongpassword');

  await page.click('[data-testid="login-button"]');

  await expect(page.getByTestId('login-error-message')).toBeVisible();
  await expect(page.getByTestId('login-error-message')).toHaveText(/Invalid Credentials./i);
});

test('[Login] Test if login succeeds with valid creds', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Login/);

  await page.fill('[data-testid="login-emailinput"]', 'test@test.nl');
  await page.fill('[data-testid="login-passwordinput"]', 'test');

  await page.click('[data-testid="login-button"]');

  await expect(page).toHaveURL('/'); 
});

test('[Login] Test if we are redirected to register page', async ({ page }) => {
  await page.goto('/login');

  await expect(page).toHaveTitle(/DeepDrunkTalks - Login/);

  await page.click('[data-testid="register-button-onloginscreen"]');

  await expect(page).toHaveURL('/register');  
});
