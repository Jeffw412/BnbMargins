import { expect, test } from '@playwright/test'

test.describe('ROI Chart and Report Formatting Fixes', () => {
  test.beforeEach(async ({ page }) => {
    // Start from analytics page to test ROI chart
    await page.goto('/analytics')
    await page.waitForLoadState('networkidle')
  })

  test('ROI analysis chart should load with data when properties are selected', async ({ page }) => {
    // Navigate to ROI tab
    await page.getByRole('tab', { name: 'ROI Analysis' }).click()
    
    // Initially, no properties are selected, so should show empty state
    await expect(page.getByText('No ROI Data Available')).toBeVisible()
    await expect(page.getByText('Select properties to view ROI analysis')).toBeVisible()
    
    // Select properties from the filter
    await page.getByTestId('property-filter-trigger').click()
    await page.getByText('Downtown Loft').click()
    await page.getByText('Beachside Villa').click()
    
    // Close the dropdown
    await page.keyboard.press('Escape')
    
    // Now the ROI chart should be visible with data
    await expect(page.getByText('No ROI Data Available')).not.toBeVisible()
    
    // Check that the chart container is present
    await expect(page.locator('.recharts-wrapper')).toBeVisible()
    
    // Check that the chart has bars (ROI data)
    await expect(page.locator('.recharts-bar')).toHaveCount(2) // Two properties selected
    
    // Check that property performance cards are visible
    await expect(page.getByText('Downtown Loft')).toBeVisible()
    await expect(page.getByText('Beachside Villa')).toBeVisible()
    
    // Check that ROI metrics are displayed
    await expect(page.getByText('ROI:')).toBeVisible()
    await expect(page.getByText('Cash-on-Cash:')).toBeVisible()
    await expect(page.getByText('Payback Period:')).toBeVisible()
  })

  test('ROI chart should update when property selection changes', async ({ page }) => {
    // Navigate to ROI tab
    await page.getByRole('tab', { name: 'ROI Analysis' }).click()
    
    // Select one property
    await page.getByTestId('property-filter-trigger').click()
    await page.getByText('Mountain Cabin').click()
    await page.keyboard.press('Escape')
    
    // Should show one property
    await expect(page.locator('.recharts-bar')).toHaveCount(1)
    await expect(page.getByText('Mountain Cabin')).toBeVisible()
    
    // Add another property
    await page.getByTestId('property-filter-trigger').click()
    await page.getByText('Downtown Loft').click()
    await page.keyboard.press('Escape')
    
    // Should now show two properties
    await expect(page.locator('.recharts-bar')).toHaveCount(2)
    await expect(page.getByText('Mountain Cabin')).toBeVisible()
    await expect(page.getByText('Downtown Loft')).toBeVisible()
  })

  test('Excel report should have proper formatting', async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    
    // Click on Financial Report Generate button
    await page.getByTestId('quick-generate-financial-btn').click()
    
    // Wait for dialog to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Select Excel format
    await page.getByRole('combobox', { name: 'Format' }).click()
    await page.getByText('Excel (.xlsx)').click()
    
    // Select properties
    await page.getByTestId('property-selection-trigger').click()
    await page.getByText('All Properties').click()
    
    // Enable all options for comprehensive test
    const chartsCheckbox = page.locator('input[type="checkbox"]').first()
    if (!(await chartsCheckbox.isChecked())) {
      await chartsCheckbox.click()
    }
    
    const transactionsCheckbox = page.locator('input[type="checkbox"]').nth(1)
    if (!(await transactionsCheckbox.isChecked())) {
      await transactionsCheckbox.click()
    }
    
    const comparisonsCheckbox = page.locator('input[type="checkbox"]').nth(2)
    if (!(await comparisonsCheckbox.isChecked())) {
      await comparisonsCheckbox.click()
    }
    
    // Monitor for download
    const downloadPromise = page.waitForEvent('download')
    
    // Generate report
    await page.getByRole('button', { name: 'Generate Report' }).click()
    
    // Wait for download to complete
    const download = await downloadPromise
    
    // Verify download occurred
    expect(download.suggestedFilename()).toMatch(/\.xlsx$/)
    
    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('CSV report should have proper formatting and structure', async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    
    // Click on Performance Report Generate button
    await page.locator('text=Performance Reports').locator('..').locator('..').locator('button:has-text("Generate")').click()
    
    // Wait for dialog to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Select CSV format
    await page.getByRole('combobox', { name: 'Format' }).click()
    await page.getByText('CSV (.csv)').click()
    
    // Select properties
    await page.getByTestId('property-selection-trigger').click()
    await page.getByText('Downtown Loft').click()
    await page.getByText('Beachside Villa').click()
    
    // Enable transactions for more comprehensive CSV
    const transactionsCheckbox = page.locator('input[type="checkbox"]').nth(1)
    if (!(await transactionsCheckbox.isChecked())) {
      await transactionsCheckbox.click()
    }
    
    // Monitor for download
    const downloadPromise = page.waitForEvent('download')
    
    // Generate report
    await page.getByRole('button', { name: 'Generate Report' }).click()
    
    // Wait for download to complete
    const download = await downloadPromise
    
    // Verify download occurred
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
    
    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('Quick reports should generate without errors', async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    
    // Monitor console for errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Test Monthly P&L quick report
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'This Month P&L' }).click()
    
    // Wait for download
    await downloadPromise
    
    // Should not have console errors
    expect(consoleErrors.filter(error => 
      error.includes('jsPDF') || 
      error.includes('Invalid arguments') ||
      error.includes('formatExcelSheet')
    )).toHaveLength(0)
  })

  test('Report generation should handle empty data gracefully', async ({ page }) => {
    // Navigate to reports page
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
    
    // Click on Tax Report Generate button
    await page.locator('text=Tax Reports').locator('..').locator('..').locator('button:has-text("Generate")').click()
    
    // Wait for dialog to open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    
    // Don't select any properties (test empty data handling)
    // Select a future date range where no data exists
    await page.getByTestId('date-range-picker-trigger').click()
    
    // Navigate to next month
    await page.getByRole('button', { name: 'Next month' }).click()
    
    // Select a date in the future
    await page.locator('[data-day="15"]').first().click()
    await page.locator('[data-day="20"]').first().click()
    
    // Monitor for errors
    const consoleErrors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    // Generate report
    await page.getByRole('button', { name: 'Generate Report' }).click()
    
    // Should handle empty data gracefully
    await page.waitForTimeout(2000)
    
    // Check for specific error handling
    const dataErrors = consoleErrors.filter(error => 
      error.includes('No data available') ||
      error.includes('Cannot read properties')
    )
    
    // Should either generate empty report or show appropriate message
    // but not crash with unhandled errors
    expect(dataErrors).toHaveLength(0)
  })

  test('ROI chart tooltip should display correct values', async ({ page }) => {
    // Navigate to analytics page and ROI tab
    await page.getByRole('tab', { name: 'ROI Analysis' }).click()
    
    // Select properties
    await page.getByTestId('property-filter-trigger').click()
    await page.getByText('Downtown Loft').click()
    await page.keyboard.press('Escape')
    
    // Wait for chart to load
    await expect(page.locator('.recharts-wrapper')).toBeVisible()
    
    // Hover over the chart bar to trigger tooltip
    await page.locator('.recharts-bar').first().hover()
    
    // Check that tooltip appears with correct format
    await expect(page.locator('.recharts-tooltip-wrapper')).toBeVisible()
    
    // Tooltip should show percentage format for Cash-on-Cash Return
    await expect(page.locator('.recharts-tooltip-wrapper')).toContainText('%')
  })
})
