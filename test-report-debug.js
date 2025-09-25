// Quick test to debug report generation
import { ReportGenerator } from './src/lib/report-generator.ts'

const reportGenerator = new ReportGenerator()

async function testReport() {
  console.log('Testing report generation...')
  
  try {
    await reportGenerator.generateReport({
      type: 'financial',
      title: 'Test Financial Report',
      dateRange: { from: undefined, to: undefined }, // No date filter
      properties: [], // All properties
      format: 'pdf',
      includeCharts: true,
      includeTransactions: true,
      includeComparisons: false,
    })
    
    console.log('Report generated successfully!')
  } catch (error) {
    console.error('Error generating report:', error)
  }
}

testReport()
