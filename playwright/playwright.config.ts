import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'web',
      testDir: './web',
      use: { baseURL: 'http://localhost:3001' },
    },
    {
      name: 'admin',
      testDir: './admin',
      use: { baseURL: 'http://localhost:3002' },
    },
  ],
});
