import { expect, test } from '@playwright/test'

test.describe('Report Generation Fixes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
  })

  test('should generate reports with charts without errors', async ({ page }) => {
    // Click on Financial Report Generate button
    await page
      .locator('text=Financial Reports')
      .locator('..')
      .locator('..')
      .locator('button:has-text("Generate")')
      .click()

    // Wait for generate dialog to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Select format
    await page.click('text=PDF')

    // Select properties (test the fixed property selection)
    await page.click('text=Select properties to include')
    await page.click('text=Downtown Loft')

    // Select date range (test the improved date picker)
    await page.click('text=Select date range for report')

    // Click on a date to start range selection
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // Select first day of current month
    await page.click(`[data-day="${firstDay.getDate()}"]`)
    // Select last day of current month
    await page.click(`[data-day="${lastDay.getDate()}"]`)

    // Ensure charts are enabled (this was causing the jsPDF.rect error)
    await expect(page.locator('text=Include charts and visualizations')).toBeVisible()
    const chartsSwitch = page.locator('input[type="checkbox"]').first()
    if (!(await chartsSwitch.isChecked())) {
      await chartsSwitch.click()
    }

    // Enable transactions
    const transactionsSwitch = page.locator('input[type="checkbox"]').nth(1)
    if (!(await transactionsSwitch.isChecked())) {
      await transactionsSwitch.click()
    }

    // Enable comparisons
    const comparisonsSwitch = page.locator('input[type="checkbox"]').nth(2)
    if (!(await comparisonsSwitch.isChecked())) {
      await comparisonsSwitch.click()
    }

    // Listen for console errors (should not have jsPDF.rect errors)
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Generate report
    await page.click('text=Generate Report')

    // Wait for generation to complete (should not throw errors)
    await page.waitForTimeout(3000)

    // Check that no jsPDF.rect errors occurred
    const rectErrors = consoleErrors.filter(
      error => error.includes('jsPDF.rect') || error.includes('Invalid arguments')
    )
    expect(rectErrors).toHaveLength(0)

    // Dialog should close after successful generation
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('should show proper date range selection in calendar', async ({ page }) => {
    // Click on Performance Report Generate button
    await page
      .locator('text=Performance Reports')
      .locator('..')
      .locator('..')
      .locator('button:has-text("Generate")')
      .click()

    // Open date picker
    await page.click('text=Select date range for report')

    // Calendar should be visible
    await expect(page.locator('.rdp')).toBeVisible()

    // Day headers should be properly aligned
    await expect(page.locator('.rdp-head_cell')).toHaveCount(7)

    // Click on two dates to create a range
    const dates = page.locator('[data-day]')
    await dates.first().click()
    await dates.nth(5).click()

    // Range should be visually indicated (CSS classes applied)
    await expect(page.locator('.rdp-day_range_start, .rdp-day_selected')).toBeVisible()
    await expect(page.locator('.rdp-day_range_end, .rdp-day_selected')).toBeVisible()
  })

  test('should calculate non-zero financial figures', async ({ page }) => {
    // Click on Financial Report Generate button
    await page
      .locator('text=Financial Reports')
      .locator('..')
      .locator('..')
      .locator('button:has-text("Generate")')
      .click()

    // Select "All Properties" to ensure we get data
    await page.click('text=Select properties to include')
    await page.click('text=All Properties')

    // Disable date filtering to get all transactions
    // (Don't select a date range)

    // Generate report
    await page.click('text=Generate Report')

    // Wait for generation
    await page.waitForTimeout(2000)

    // Check console for warnings about empty data
    const consoleMessages: string[] = []
    page.on('console', msg => {
      consoleMessages.push(msg.text())
    })

    // Should not have warnings about no transactions or properties
    await page.waitForTimeout(1000)
    const emptyDataWarnings = consoleMessages.filter(
      msg => msg.includes('No transactions found') || msg.includes('No properties found')
    )

    // With "All Properties" selected, we should have data
    expect(emptyDataWarnings).toHaveLength(0)
  })

  test('should handle property selection correctly', async ({ page }) => {
    // Click on Custom Report Generate button
    await page
      .locator('text=Custom Reports')
      .locator('..')
      .locator('..')
      .locator('button:has-text("Generate")')
      .click()

    // Test property selection dropdown
    await page.click('text=Select properties to include')

    // Should show all property options
    await expect(page.locator('text=All Properties')).toBeVisible()
    await expect(page.locator('text=Downtown Loft')).toBeVisible()
    await expect(page.locator('text=Beachside Villa')).toBeVisible()
    await expect(page.locator('text=Mountain Cabin')).toBeVisible()

    // Select a specific property
    await page.click('text=Downtown Loft')

    // Dropdown should close and show selection
    await expect(page.locator('text=Select properties to include')).not.toBeVisible()

    // Generate report with specific property
    await page.click('text=Generate Report')

    // Should complete without errors
    await page.waitForTimeout(2000)
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })
})
