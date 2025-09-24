import { expect, test } from '@playwright/test'

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
  })

  test('should display reports page', async ({ page }) => {
    // Check page title (use exact match for the main h1)
    await expect(page.getByRole('heading', { name: 'Reports', exact: true })).toBeVisible()

    // Check that tabs are present
    await expect(page.getByRole('tab', { name: 'Generate Reports' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Scheduled Reports' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Report History' })).toBeVisible()
  })

  test('should have report type cards', async ({ page }) => {
    // Check that report type cards are visible using more specific selectors
    await expect(page.getByRole('heading', { name: 'Financial Report' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Performance Report' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Tax Report' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Custom Report' })).toBeVisible()
  })

  test('should open generate dialog', async ({ page }) => {
    // Click the main Generate Report button
    await page.getByRole('button', { name: 'Generate Report' }).click()

    // Check that dialog opens
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Configure and generate a custom report')).toBeVisible()
  })
})
