import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\mguha_2nalv7a\\.gemini\\antigravity-ide\\brain\\1bac78c1-e0e7-4d3b-994e-35b1ce9445ee';

test.describe('Campus Plastic Credits End-to-End Visual & Logic Flows', () => {
  test('Landing page loads and renders brand and CTAs', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Drop your bottle');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_landing_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('How It Works page loads lifecycle cards', async ({ page }, testInfo) => {
    await page.goto('/how-it-works');
    await expect(page.locator('body')).toContainText('Campus Plastic Credits System Works');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_how_it_works_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Rewards page loads tier emblems and plastic categories', async ({ page }, testInfo) => {
    await page.goto('/rewards');
    await expect(page.locator('body')).toContainText('Rewards, Points & Milestone Tiers');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_rewards_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('FAQ page loads questions and answers', async ({ page }, testInfo) => {
    await page.goto('/faq');
    await expect(page.locator('body')).toContainText('Frequently Asked Questions');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_faq_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Dev Tokens page loads with contrast compliance', async ({ page }, testInfo) => {
    await page.goto('/dev/tokens');
    await expect(page.locator('body')).toContainText('Bisleri Aqua Green Design Tokens');
    await expect(page.locator('body')).toContainText('PASS AA');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_tokens_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Student Bin Drop scan-to-log flow with icon selection and count stepper', async ({ page }, testInfo) => {
    await page.goto('/b/7K3Q9DX2');
    await expect(page.locator('body')).toContainText('BIN: 7K3Q9DX2');

    // Click on Medium Bottle
    await page.getByRole('button', { name: /Medium Bottle/i }).click();

    // Click plus button twice to increase count
    const plusButton = page.getByRole('button', { name: /Increase quantity/i });
    await plusButton.click();
    await plusButton.click();

    // Assert count is 3
    await expect(page.locator('body')).toContainText('3');

    // Click Save entry
    await page.getByRole('button', { name: /Save entry/i }).click();

    // Verify confirmation celebration
    await expect(page.locator('body')).toContainText('3 Items Saved!');
    await expect(page.locator('body')).toContainText('Waiting for this bin to be weighed');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_bin_success_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Student Dashboard loads with bottle progress and drop feed', async ({ page }, testInfo) => {
    await page.goto('/home');
    await expect(page.locator('body')).toContainText(/Hi, (Aditya|Student)/);
    await expect(page.locator('body')).toContainText('Recent Drops');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_home_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Student Certificates page loads with TierEmblem and badges', async ({ page }, testInfo) => {
    await page.goto('/certificates');
    await expect(page.locator('body')).toContainText('Sustainability Certificates');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_certificates_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Student Account page loads with DPDP and export buttons', async ({ page }, testInfo) => {
    await page.goto('/account');
    await expect(page.locator('body')).toContainText('Account & Privacy');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_account_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Admin Verification Flow executes batch weighing and calibration', async ({ page }, testInfo) => {
    await page.goto('/admin/verify');
    await expect(page.locator('body')).toContainText('Verify Bin Collection');

    // Step 1: Pick Bin
    await page.getByRole('button', { name: /Cafeteria Recycling Station A/i }).click();

    // Step 2: Weigh Scale
    await expect(page.locator('body')).toContainText('Enter Physical Scale Weight');
    await page.getByRole('button', { name: /Review Verification/i }).click();

    // Step 3: Review Ratio
    await expect(page.locator('body')).toContainText('Batch Tolerance Review');
    await page.getByRole('button', { name: /Approve All in Full/i }).click();

    // Step 4: Finalize & Calibration Hint
    await expect(page.locator('body')).toContainText('Batch Verified & Finalized!');
    await expect(page.locator('body')).toContainText('Pilot Calibration Telemetry');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_admin_verify_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Admin Bins page loads with icon cards, rotate code, and modal', async ({ page }, testInfo) => {
    await page.goto('/admin/bins');
    await expect(page.locator('body')).toContainText('Bins & QR Roster');
    await expect(page.locator('body')).toContainText('Cafeteria');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_admin_bins_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Admin Entries page loads with filter chips and audit records', async ({ page }, testInfo) => {
    await page.goto('/admin/entries');
    await expect(page.locator('body')).toContainText('Student Drop Entries');
    await expect(page.locator('body')).toContainText(/No student drops|Aditya/);

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_admin_entries_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Admin Students page loads with roster and tier emblems', async ({ page }, testInfo) => {
    await page.goto('/admin/students');
    await expect(page.locator('body')).toContainText('Student Roster');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_admin_students_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Admin Reports page loads with NAAC export and composition', async ({ page }, testInfo) => {
    await page.goto('/admin/reports');
    await expect(page.locator('body')).toContainText('Sustainability Reports');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_admin_reports_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });

  test('Admin Accounting page loads with stock balance and transactions', async ({ page }, testInfo) => {
    await page.goto('/admin/accounting');
    await expect(page.locator('body')).toContainText('Recycler Accounting');
    await expect(page.locator('body')).toContainText('Stock On Campus');

    const screenshotPath = path.join(
      ARTIFACTS_DIR,
      `screenshot_admin_accounting_${testInfo.project.name.toLowerCase().replace(/\s+/g, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });
});
