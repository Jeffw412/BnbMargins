import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// Types for report data
export interface ReportData {
  type: 'financial' | 'performance' | 'tax' | 'custom'
  title: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  properties: string[]
  format: 'pdf' | 'excel' | 'csv'
  includeCharts?: boolean
  includeTransactions?: boolean
  includeComparisons?: boolean
}

export interface TransactionData {
  id: string
  property_name: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
}

export interface PropertyData {
  id: string
  name: string
  monthly_revenue: number
  monthly_expenses: number
  occupancy_rate: number
  avg_rating: number
  total_reviews: number
}

// Mock data - in real app this would come from Supabase
const mockTransactions: TransactionData[] = [
  {
    id: '1',
    property_name: 'Downtown Loft',
    type: 'income',
    category: 'Booking Revenue',
    amount: 1200,
    description: 'Airbnb booking - 5 nights',
    date: '2024-01-15'
  },
  {
    id: '2',
    property_name: 'Downtown Loft',
    type: 'expense',
    category: 'Cleaning',
    amount: 80,
    description: 'Professional cleaning service',
    date: '2024-01-16'
  },
  {
    id: '3',
    property_name: 'Beachside Villa',
    type: 'income',
    category: 'Booking Revenue',
    amount: 2400,
    description: 'Airbnb booking - 7 nights',
    date: '2024-01-18'
  },
  {
    id: '4',
    property_name: 'Downtown Loft',
    type: 'expense',
    category: 'Maintenance',
    amount: 150,
    description: 'Plumbing repair',
    date: '2024-01-20'
  },
  {
    id: '5',
    property_name: 'Beachside Villa',
    type: 'expense',
    category: 'Utilities',
    amount: 120,
    description: 'Electricity bill',
    date: '2024-01-22'
  }
]

const mockProperties: PropertyData[] = [
  {
    id: '1',
    name: 'Downtown Loft',
    monthly_revenue: 2800,
    monthly_expenses: 1900,
    occupancy_rate: 85,
    avg_rating: 4.9,
    total_reviews: 32
  },
  {
    id: '2',
    name: 'Beachside Villa',
    monthly_revenue: 4200,
    monthly_expenses: 2100,
    occupancy_rate: 92,
    avg_rating: 4.8,
    total_reviews: 45
  },
  {
    id: '3',
    name: 'Mountain Cabin',
    monthly_revenue: 1800,
    monthly_expenses: 1200,
    occupancy_rate: 78,
    avg_rating: 4.7,
    total_reviews: 28
  }
]

export class ReportGenerator {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  private filterDataByDateRange(data: any[], dateRange: ReportData['dateRange'], dateField: string = 'date') {
    if (!dateRange.from && !dateRange.to) return data
    
    return data.filter(item => {
      const itemDate = new Date(item[dateField])
      if (dateRange.from && itemDate < dateRange.from) return false
      if (dateRange.to && itemDate > dateRange.to) return false
      return true
    })
  }

  private filterDataByProperties(data: any[], properties: string[], propertyField: string = 'property_name') {
    if (properties.length === 0) return data
    return data.filter(item => properties.includes(item[propertyField]))
  }

  async generateReport(reportData: ReportData): Promise<void> {
    // Filter data based on criteria
    let transactions = this.filterDataByDateRange(mockTransactions, reportData.dateRange)
    transactions = this.filterDataByProperties(transactions, reportData.properties)

    let properties = this.filterDataByProperties(mockProperties, reportData.properties, 'name')

    switch (reportData.format) {
      case 'pdf':
        await this.generatePDF(reportData, transactions, properties)
        break
      case 'excel':
        await this.generateExcel(reportData, transactions, properties)
        break
      case 'csv':
        await this.generateCSV(reportData, transactions, properties)
        break
    }
  }

  private async generatePDF(reportData: ReportData, transactions: TransactionData[], properties: PropertyData[]): Promise<void> {
    const doc = new jsPDF()
    let yPosition = 20

    // Title
    doc.setFontSize(20)
    doc.text(reportData.title, 20, yPosition)
    yPosition += 20

    // Date range
    if (reportData.dateRange.from || reportData.dateRange.to) {
      doc.setFontSize(12)
      const fromDate = reportData.dateRange.from ? this.formatDate(reportData.dateRange.from.toISOString()) : 'Start'
      const toDate = reportData.dateRange.to ? this.formatDate(reportData.dateRange.to.toISOString()) : 'End'
      doc.text(`Period: ${fromDate} - ${toDate}`, 20, yPosition)
      yPosition += 15
    }

    // Summary section
    if (reportData.type === 'financial') {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      const netProfit = totalIncome - totalExpenses

      doc.setFontSize(14)
      doc.text('Financial Summary', 20, yPosition)
      yPosition += 10

      doc.setFontSize(12)
      doc.text(`Total Income: ${this.formatCurrency(totalIncome)}`, 20, yPosition)
      yPosition += 8
      doc.text(`Total Expenses: ${this.formatCurrency(totalExpenses)}`, 20, yPosition)
      yPosition += 8
      doc.text(`Net Profit: ${this.formatCurrency(netProfit)}`, 20, yPosition)
      yPosition += 15
    }

    // Properties section
    if (properties.length > 0) {
      doc.setFontSize(14)
      doc.text('Property Performance', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      properties.forEach(property => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }
        
        doc.text(`${property.name}:`, 20, yPosition)
        yPosition += 6
        doc.text(`  Revenue: ${this.formatCurrency(property.monthly_revenue)}`, 25, yPosition)
        yPosition += 6
        doc.text(`  Expenses: ${this.formatCurrency(property.monthly_expenses)}`, 25, yPosition)
        yPosition += 6
        doc.text(`  Profit: ${this.formatCurrency(property.monthly_revenue - property.monthly_expenses)}`, 25, yPosition)
        yPosition += 6
        doc.text(`  Occupancy: ${property.occupancy_rate}%`, 25, yPosition)
        yPosition += 10
      })
    }

    // Transactions section
    if (reportData.includeTransactions && transactions.length > 0) {
      if (yPosition > 200) {
        doc.addPage()
        yPosition = 20
      }

      doc.setFontSize(14)
      doc.text('Transaction Details', 20, yPosition)
      yPosition += 10

      doc.setFontSize(8)
      transactions.forEach(transaction => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }
        
        const typeColor = transaction.type === 'income' ? [0, 128, 0] : [128, 0, 0]
        doc.setTextColor(...typeColor)
        doc.text(`${this.formatDate(transaction.date)} - ${transaction.property_name}`, 20, yPosition)
        yPosition += 5
        doc.text(`${transaction.category}: ${this.formatCurrency(transaction.amount)}`, 25, yPosition)
        yPosition += 5
        doc.setTextColor(0, 0, 0)
        doc.text(transaction.description, 25, yPosition)
        yPosition += 8
      })
    }

    // Save the PDF
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  private async generateExcel(reportData: ReportData, transactions: TransactionData[], properties: PropertyData[]): Promise<void> {
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    if (reportData.type === 'financial') {
      const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      
      const summaryData = [
        ['Financial Summary'],
        [''],
        ['Total Income', totalIncome],
        ['Total Expenses', totalExpenses],
        ['Net Profit', totalIncome - totalExpenses]
      ]
      
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    }

    // Properties sheet
    if (properties.length > 0) {
      const propertiesData = [
        ['Property Name', 'Monthly Revenue', 'Monthly Expenses', 'Net Profit', 'Occupancy Rate', 'Avg Rating', 'Reviews'],
        ...properties.map(p => [
          p.name,
          p.monthly_revenue,
          p.monthly_expenses,
          p.monthly_revenue - p.monthly_expenses,
          p.occupancy_rate,
          p.avg_rating,
          p.total_reviews
        ])
      ]
      
      const propertiesSheet = XLSX.utils.aoa_to_sheet(propertiesData)
      XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties')
    }

    // Transactions sheet
    if (transactions.length > 0) {
      const transactionsData = [
        ['Date', 'Property', 'Type', 'Category', 'Amount', 'Description'],
        ...transactions.map(t => [
          t.date,
          t.property_name,
          t.type,
          t.category,
          t.amount,
          t.description
        ])
      ]
      
      const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData)
      XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions')
    }

    // Save the Excel file
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, fileName)
  }

  private async generateCSV(reportData: ReportData, transactions: TransactionData[], properties: PropertyData[]): Promise<void> {
    let csvContent = ''

    // Add title and metadata
    csvContent += `${reportData.title}\n`
    if (reportData.dateRange.from || reportData.dateRange.to) {
      const fromDate = reportData.dateRange.from ? this.formatDate(reportData.dateRange.from.toISOString()) : 'Start'
      const toDate = reportData.dateRange.to ? this.formatDate(reportData.dateRange.to.toISOString()) : 'End'
      csvContent += `Period: ${fromDate} - ${toDate}\n`
    }
    csvContent += '\n'

    // Add transactions data
    if (transactions.length > 0) {
      csvContent += 'TRANSACTIONS\n'
      csvContent += 'Date,Property,Type,Category,Amount,Description\n'
      transactions.forEach(t => {
        csvContent += `${t.date},${t.property_name},${t.type},${t.category},${t.amount},"${t.description}"\n`
      })
      csvContent += '\n'
    }

    // Add properties data
    if (properties.length > 0) {
      csvContent += 'PROPERTIES\n'
      csvContent += 'Property Name,Monthly Revenue,Monthly Expenses,Net Profit,Occupancy Rate,Avg Rating,Reviews\n'
      properties.forEach(p => {
        csvContent += `${p.name},${p.monthly_revenue},${p.monthly_expenses},${p.monthly_revenue - p.monthly_expenses},${p.occupancy_rate},${p.avg_rating},${p.total_reviews}\n`
      })
    }

    // Save the CSV file
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, fileName)
  }

  // Quick report generators
  async generateQuickReport(type: string): Promise<void> {
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    let reportData: ReportData

    switch (type) {
      case 'monthly-pl':
        reportData = {
          type: 'financial',
          title: 'Monthly P&L Statement',
          dateRange: { from: firstDayOfMonth, to: lastDayOfMonth },
          properties: [],
          format: 'pdf',
          includeCharts: true,
          includeTransactions: true,
          includeComparisons: false
        }
        break
      case 'ytd-performance':
        reportData = {
          type: 'performance',
          title: 'Year-to-Date Performance Report',
          dateRange: { from: new Date(currentDate.getFullYear(), 0, 1), to: currentDate },
          properties: [],
          format: 'excel',
          includeCharts: true,
          includeTransactions: false,
          includeComparisons: true
        }
        break
      case 'tax-summary':
        reportData = {
          type: 'tax',
          title: 'Tax Summary Report',
          dateRange: { from: new Date(currentDate.getFullYear(), 0, 1), to: currentDate },
          properties: [],
          format: 'excel',
          includeCharts: false,
          includeTransactions: true,
          includeComparisons: false
        }
        break
      case 'property-comparison':
        reportData = {
          type: 'performance',
          title: 'Property Comparison Report',
          dateRange: { from: firstDayOfMonth, to: lastDayOfMonth },
          properties: [],
          format: 'pdf',
          includeCharts: true,
          includeTransactions: false,
          includeComparisons: true
        }
        break
      case 'occupancy-report':
        reportData = {
          type: 'performance',
          title: 'Occupancy Report',
          dateRange: { from: firstDayOfMonth, to: lastDayOfMonth },
          properties: [],
          format: 'excel',
          includeCharts: true,
          includeTransactions: false,
          includeComparisons: false
        }
        break
      case 'expense-analysis':
        reportData = {
          type: 'financial',
          title: 'Expense Analysis Report',
          dateRange: { from: firstDayOfMonth, to: lastDayOfMonth },
          properties: [],
          format: 'pdf',
          includeCharts: true,
          includeTransactions: true,
          includeComparisons: false
        }
        break
      default:
        throw new Error(`Unknown quick report type: ${type}`)
    }

    await this.generateReport(reportData)
  }
}

export const reportGenerator = new ReportGenerator()
