import { Database } from '@/types/database'
import { saveAs } from 'file-saver'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import { db } from './supabase'

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
  userId?: string // Add userId to fetch user-specific data
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

// Database types for report generation

// Additional data structures for enhanced reporting
export interface MonthlyPerformanceData {
  month: string
  property_name: string
  revenue: number
  expenses: number
  profit: number
  occupancy_rate: number
  bookings: number
}

export interface TaxCategoryData {
  category: string
  amount: number
  description: string
  deductible: boolean
}

export interface ComparisonData {
  current_period: {
    revenue: number
    expenses: number
    profit: number
    occupancy: number
  }
  previous_period: {
    revenue: number
    expenses: number
    profit: number
    occupancy: number
  }
  change_percentage: {
    revenue: number
    expenses: number
    profit: number
    occupancy: number
  }
}

export class ReportGenerator {
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  private async fetchDataFromDatabase(userId: string, reportData: ReportData) {
    console.log('Fetching data from database for user:', userId)

    // Fetch properties
    const { data: dbProperties, error: propertiesError } = await db.properties.getAll(userId)
    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }

    // Fetch transactions
    const { data: dbTransactions, error: transactionsError } = await db.transactions.getAll(userId)
    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      throw transactionsError
    }

    // Type the database results properly
    const typedProperties = dbProperties as
      | Database['public']['Tables']['properties']['Row'][]
      | null
    const typedTransactions = dbTransactions as
      | Database['public']['Tables']['transactions']['Row'][]
      | null

    // Transform database data to match our interfaces
    const properties: PropertyData[] = (typedProperties || []).map(prop => ({
      id: prop.id,
      name: prop.name,
      monthly_revenue: 0, // Will be calculated from transactions
      monthly_expenses: 0, // Will be calculated from transactions
      occupancy_rate: 85, // Default value - could be calculated from bookings
      avg_rating: 4.5, // Default value - could come from reviews
      total_reviews: 10, // Default value - could come from reviews
    }))

    // Transform transactions and calculate property metrics
    const transactions: TransactionData[] = (typedTransactions || []).map(trans => {
      const property = typedProperties?.find(p => p.id === trans.property_id)
      return {
        id: trans.id,
        property_name: property?.name || 'Unknown Property',
        type: trans.type,
        category: trans.category,
        amount: trans.amount,
        description: trans.description || '',
        date: trans.date,
      }
    })

    // Calculate monthly revenue and expenses for each property
    properties.forEach(property => {
      const propertyTransactions = transactions.filter(t => t.property_name === property.name)
      const income = propertyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expenses = propertyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      property.monthly_revenue = income
      property.monthly_expenses = expenses
    })

    // Generate monthly performance data from transactions
    const monthlyPerformance: MonthlyPerformanceData[] = []
    const monthlyData = new Map<
      string,
      { revenue: number; expenses: number; property_name: string }
    >()

    transactions.forEach(trans => {
      const date = new Date(trans.date)
      const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`

      if (!monthlyData.has(monthKey + trans.property_name)) {
        monthlyData.set(monthKey + trans.property_name, {
          revenue: 0,
          expenses: 0,
          property_name: trans.property_name,
        })
      }

      const monthData = monthlyData.get(monthKey + trans.property_name)!
      if (trans.type === 'income') {
        monthData.revenue += trans.amount
      } else {
        monthData.expenses += trans.amount
      }
    })

    monthlyData.forEach((data, key) => {
      const monthKey = key.replace(data.property_name, '').trim()
      monthlyPerformance.push({
        month: monthKey,
        property_name: data.property_name,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
        occupancy_rate: 85, // Default value
        bookings: Math.floor(data.revenue / 1000) || 1, // Estimate based on revenue
      })
    })

    return {
      transactions,
      properties,
      monthlyPerformance,
    }
  }

  private filterDataByDateRange(
    data: any[],
    dateRange: ReportData['dateRange'],
    dateField: string = 'date'
  ) {
    // If no date range specified, return all data
    if (!dateRange.from && !dateRange.to) return data

    return data.filter(item => {
      let itemDate: Date

      try {
        // Handle different date formats
        if (dateField === 'month') {
          // Handle "Jan 2024" format
          const monthStr = item[dateField]
          const [month, year] = monthStr.split(' ')
          const monthIndex = new Date(Date.parse(month + ' 1, 2012')).getMonth()
          itemDate = new Date(parseInt(year), monthIndex, 1)
        } else {
          // Handle standard date format
          itemDate = new Date(item[dateField])
        }

        // Check if date is valid
        if (isNaN(itemDate.getTime())) {
          console.warn(`Invalid date found: ${item[dateField]}`)
          return false
        }

        // More flexible date range checking
        if (dateRange.from && itemDate < dateRange.from) return false
        if (dateRange.to) {
          // Add one day to the end date to include the entire end date
          const endDate = new Date(dateRange.to)
          endDate.setDate(endDate.getDate() + 1)
          if (itemDate >= endDate) return false
        }
        return true
      } catch (error) {
        console.warn(`Error parsing date ${item[dateField]}:`, error)
        return false
      }
    })
  }

  private filterDataByProperties(
    data: any[],
    properties: string[],
    propertyField: string = 'property_name'
  ) {
    if (properties.length === 0) return data
    return data.filter(item => properties.includes(item[propertyField]))
  }

  async generateReport(reportData: ReportData): Promise<void> {
    let transactions: TransactionData[] = []
    let properties: PropertyData[] = []
    let monthlyPerformance: MonthlyPerformanceData[] = []

    // Try to fetch data from database if userId is provided
    if (reportData.userId) {
      try {
        const dbData = await this.fetchDataFromDatabase(reportData.userId, reportData)
        transactions = dbData.transactions
        properties = dbData.properties
        monthlyPerformance = dbData.monthlyPerformance
      } catch (error) {
        console.warn('Failed to fetch data from database, using fallback data:', error)
      }
    }

    // Ensure we have a userId to fetch data
    if (!reportData.userId) {
      throw new Error('User ID is required to generate reports')
    }

    // If no data from database, show appropriate message
    if (transactions.length === 0 && properties.length === 0) {
      throw new Error(
        'No data available to generate report. Please add properties and transactions first.'
      )
    }

    // Prepare report-specific data based on type
    const reportContext = this.prepareReportContext(
      reportData,
      transactions,
      properties,
      monthlyPerformance
    )

    switch (reportData.format) {
      case 'pdf':
        await this.generatePDF(reportData, reportContext)
        break
      case 'excel':
        await this.generateExcel(reportData, reportContext)
        break
      case 'csv':
        await this.generateCSV(reportData, reportContext)
        break
    }
  }

  private prepareReportContext(
    reportData: ReportData,
    transactions: TransactionData[],
    properties: PropertyData[],
    monthlyPerformance: MonthlyPerformanceData[]
  ) {
    const context = {
      transactions,
      properties,
      monthlyPerformance,
      summary: this.calculateSummary(transactions, properties),
      taxCategories: reportData.type === 'tax' ? this.generateTaxCategories(transactions) : [],
      comparisons: reportData.includeComparisons
        ? this.calculateComparisons(monthlyPerformance)
        : null,
    }

    return context
  }

  private calculateSummary(transactions: TransactionData[], properties: PropertyData[]) {
    const incomeTransactions = transactions.filter(t => t.type === 'income')
    const expenseTransactions = transactions.filter(t => t.type === 'expense')

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const netProfit = totalIncome - totalExpenses

    const totalMonthlyRevenue = properties.reduce((sum, p) => sum + p.monthly_revenue, 0)
    const totalMonthlyExpenses = properties.reduce((sum, p) => sum + p.monthly_expenses, 0)
    const avgOccupancyRate =
      properties.length > 0
        ? properties.reduce((sum, p) => sum + p.occupancy_rate, 0) / properties.length
        : 0

    return {
      totalIncome,
      totalExpenses,
      netProfit,
      totalMonthlyRevenue,
      totalMonthlyExpenses,
      avgOccupancyRate,
      profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
    }
  }

  private calculateComparisons(
    monthlyPerformance: MonthlyPerformanceData[]
  ): ComparisonData | null {
    if (monthlyPerformance.length < 2) return null

    // Get current and previous period data (simplified)
    const currentPeriod = monthlyPerformance.slice(-3) // Last 3 months
    const previousPeriod = monthlyPerformance.slice(-6, -3) // Previous 3 months

    const currentTotals = currentPeriod.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        expenses: acc.expenses + item.expenses,
        profit: acc.profit + item.profit,
        occupancy: acc.occupancy + item.occupancy_rate,
      }),
      { revenue: 0, expenses: 0, profit: 0, occupancy: 0 }
    )

    const previousTotals = previousPeriod.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        expenses: acc.expenses + item.expenses,
        profit: acc.profit + item.profit,
        occupancy: acc.occupancy + item.occupancy_rate,
      }),
      { revenue: 0, expenses: 0, profit: 0, occupancy: 0 }
    )

    // Calculate averages for occupancy
    currentTotals.occupancy =
      currentPeriod.length > 0 ? currentTotals.occupancy / currentPeriod.length : 0
    previousTotals.occupancy =
      previousPeriod.length > 0 ? previousTotals.occupancy / previousPeriod.length : 0

    // Calculate percentage changes
    const changePercentage = {
      revenue:
        previousTotals.revenue > 0
          ? ((currentTotals.revenue - previousTotals.revenue) / previousTotals.revenue) * 100
          : 0,
      expenses:
        previousTotals.expenses > 0
          ? ((currentTotals.expenses - previousTotals.expenses) / previousTotals.expenses) * 100
          : 0,
      profit:
        previousTotals.profit > 0
          ? ((currentTotals.profit - previousTotals.profit) / previousTotals.profit) * 100
          : 0,
      occupancy:
        previousTotals.occupancy > 0
          ? ((currentTotals.occupancy - previousTotals.occupancy) / previousTotals.occupancy) * 100
          : 0,
    }

    return {
      current_period: currentTotals,
      previous_period: previousTotals,
      change_percentage: changePercentage,
    }
  }

  private generateTaxCategories(transactions: TransactionData[]): TaxCategoryData[] {
    const categoryMap = new Map<string, { amount: number; description: string }>()

    // Group expenses by category
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const existing = categoryMap.get(transaction.category) || { amount: 0, description: '' }
        categoryMap.set(transaction.category, {
          amount: existing.amount + transaction.amount,
          description: transaction.description || transaction.category,
        })
      })

    // Convert to TaxCategoryData format
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      description: data.description,
      deductible: true, // Most rental property expenses are deductible
    }))
  }

  private async generatePDF(reportData: ReportData, context: any): Promise<void> {
    const doc = new jsPDF()
    let yPosition = 20

    // Add modern header with branding
    yPosition = this.addModernHeader(doc, reportData, yPosition)

    // Add executive summary box
    yPosition = this.addExecutiveSummary(doc, context, yPosition)

    // Generate report content based on type
    yPosition = await this.generateReportTypeContent(doc, reportData, context, yPosition)

    // Add charts if requested
    if (reportData.includeCharts) {
      yPosition = this.addChartsSection(doc, reportData, context, yPosition)
    }

    // Add transactions section if requested
    if (reportData.includeTransactions && context.transactions.length > 0) {
      yPosition = this.addTransactionsSection(doc, context.transactions, yPosition)
    }

    // Add period comparisons if requested
    if (reportData.includeComparisons && context.comparisons) {
      yPosition = this.addComparisonsSection(doc, context.comparisons, yPosition)
    }

    // Save the PDF
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  private async generateReportTypeContent(
    doc: any,
    reportData: ReportData,
    context: any,
    yPosition: number
  ): Promise<number> {
    switch (reportData.type) {
      case 'financial':
        return this.generateFinancialContent(doc, context, yPosition)
      case 'performance':
        return this.generatePerformanceContent(doc, context, yPosition)
      case 'tax':
        return this.generateTaxContent(doc, context, yPosition)
      case 'custom':
        return this.generateCustomContent(doc, context, yPosition)
      default:
        return this.generateFinancialContent(doc, context, yPosition)
    }
  }

  private generateFinancialContent(doc: any, context: any, yPosition: number): number {
    // Section header with modern styling
    yPosition = this.addSectionHeader(doc, 'Financial Analysis', yPosition)

    // P&L Statement Card
    doc.setFillColor(255, 255, 255) // White background
    doc.setDrawColor(226, 232, 240) // Border
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition, 170, 60, 'FD')

    // P&L Title
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Profit & Loss Statement', 25, yPosition + 12)

    // Income section
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Revenue', 25, yPosition + 22)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(16, 185, 129)
    doc.text(this.formatCurrency(context.summary.totalIncome), 140, yPosition + 22)

    // Expenses section
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Operating Expenses', 25, yPosition + 32)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(239, 68, 68)
    doc.text(`(${this.formatCurrency(context.summary.totalExpenses)})`, 140, yPosition + 32)

    // Divider line
    doc.setDrawColor(226, 232, 240)
    doc.line(25, yPosition + 38, 185, yPosition + 38)

    // Net profit
    doc.setFont(undefined, 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Net Profit', 25, yPosition + 48)
    const profitColor = context.summary.netProfit >= 0 ? [16, 185, 129] : [239, 68, 68]
    doc.setTextColor(...profitColor)
    doc.text(this.formatCurrency(context.summary.netProfit), 140, yPosition + 48)

    // Profit margin
    doc.setTextColor(100, 116, 139)
    doc.setFont(undefined, 'normal')
    doc.text(`Margin: ${context.summary.profitMargin.toFixed(1)}%`, 25, yPosition + 56)

    yPosition += 75

    // Property Performance Cards
    if (context.properties.length > 0) {
      yPosition = this.addSectionHeader(doc, 'Property Portfolio', yPosition)

      context.properties.forEach((property: PropertyData, index: number) => {
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }

        // Property card
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(226, 232, 240)
        doc.setLineWidth(0.5)
        doc.rect(20, yPosition, 170, 35, 'FD')

        // Property name with colored indicator
        const indicatorColor = this.getChartColor(index)
        doc.setFillColor(...indicatorColor)
        doc.rect(22, yPosition + 2, 3, 31, 'F')

        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(15, 23, 42)
        doc.text(property.name, 30, yPosition + 10)

        // Metrics in grid
        doc.setFontSize(8)
        doc.setFont(undefined, 'normal')
        doc.setTextColor(100, 116, 139)

        // Left column
        doc.text('Revenue:', 30, yPosition + 18)
        doc.setTextColor(16, 185, 129)
        doc.text(this.formatCurrency(property.monthly_revenue), 30, yPosition + 25)

        doc.setTextColor(100, 116, 139)
        doc.text('Expenses:', 30, yPosition + 32)
        doc.setTextColor(239, 68, 68)
        doc.text(this.formatCurrency(property.monthly_expenses), 30, yPosition + 39)

        // Right column
        doc.setTextColor(100, 116, 139)
        doc.text('Net Profit:', 110, yPosition + 18)
        const profit = property.monthly_revenue - property.monthly_expenses
        doc.setTextColor(profit >= 0 ? 16 : 239, profit >= 0 ? 185 : 68, profit >= 0 ? 129 : 68)
        doc.text(this.formatCurrency(profit), 110, yPosition + 25)

        doc.setTextColor(100, 116, 139)
        doc.text('Occupancy:', 110, yPosition + 32)
        doc.setTextColor(37, 99, 235)
        doc.text(`${property.occupancy_rate}%`, 110, yPosition + 39)

        yPosition += 45
      })
    }

    return yPosition
  }

  private generatePerformanceContent(doc: any, context: any, yPosition: number): number {
    // Section header
    yPosition = this.addSectionHeader(doc, 'Performance Analytics', yPosition)

    // KPI Dashboard
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition, 170, 50, 'FD')

    // KPI Title
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Key Performance Indicators', 25, yPosition + 12)

    // KPI Grid
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')

    // Left column
    doc.setTextColor(100, 116, 139)
    doc.text('Portfolio Size:', 25, yPosition + 22)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(37, 99, 235)
    doc.text(`${context.properties.length} Properties`, 25, yPosition + 30)

    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Avg. Occupancy:', 25, yPosition + 38)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(16, 185, 129)
    doc.text(`${context.summary.avgOccupancyRate.toFixed(1)}%`, 25, yPosition + 46)

    // Right column
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Revenue per Property:', 110, yPosition + 22)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(16, 185, 129)
    const revenuePerProperty =
      context.summary.totalMonthlyRevenue / Math.max(context.properties.length, 1)
    doc.text(this.formatCurrency(revenuePerProperty), 110, yPosition + 30)

    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Total Revenue:', 110, yPosition + 38)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(16, 185, 129)
    doc.text(this.formatCurrency(context.summary.totalMonthlyRevenue), 110, yPosition + 46)

    yPosition += 65

    // Property Comparison
    if (context.properties.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(46, 204, 113)
      doc.text('Property Comparison', 20, yPosition)
      yPosition += 12

      // Sort properties by revenue for better comparison
      const sortedProperties = [...context.properties].sort(
        (a, b) => b.monthly_revenue - a.monthly_revenue
      )

      sortedProperties.forEach((property: PropertyData, index: number) => {
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(11)
        doc.setFont(undefined, 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`#${index + 1} ${property.name}`, 25, yPosition)
        yPosition += 8

        doc.setFont(undefined, 'normal')
        doc.setFontSize(9)
        doc.text(
          `Revenue: ${this.formatCurrency(property.monthly_revenue)} | Occupancy: ${property.occupancy_rate}% | Rating: ${property.avg_rating}/5 (${property.total_reviews} reviews)`,
          30,
          yPosition
        )
        yPosition += 10
      })
    }

    return yPosition
  }

  private generateTaxContent(doc: any, context: any, yPosition: number): number {
    // Section header
    yPosition = this.addSectionHeader(doc, 'Tax Documentation', yPosition)

    // Tax Summary Card
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition, 170, 40, 'FD')

    // Tax Summary Title
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text('Rental Income Summary', 25, yPosition + 12)

    // Income details
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Gross Rental Income:', 25, yPosition + 22)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(16, 185, 129)
    doc.text(this.formatCurrency(context.summary.totalIncome), 140, yPosition + 22)

    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Net Rental Income:', 25, yPosition + 32)
    doc.setFont(undefined, 'bold')
    const netColor = context.summary.netProfit >= 0 ? [16, 185, 129] : [239, 68, 68]
    doc.setTextColor(...netColor)
    doc.text(this.formatCurrency(context.summary.netProfit), 140, yPosition + 32)

    yPosition += 55

    // Deductible Expenses
    if (context.taxCategories.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(231, 76, 60)
      doc.text('Deductible Expenses', 20, yPosition)
      yPosition += 12

      const deductibleExpenses = context.taxCategories.filter(
        (cat: TaxCategoryData) => cat.deductible
      )
      const totalDeductible = deductibleExpenses.reduce(
        (sum: number, cat: TaxCategoryData) => sum + cat.amount,
        0
      )

      doc.setFontSize(10)
      deductibleExpenses.forEach((category: TaxCategoryData) => {
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.text(`${category.category}: ${this.formatCurrency(category.amount)}`, 25, yPosition)
        yPosition += 6
        doc.setFontSize(8)
        doc.setTextColor(100, 100, 100)
        doc.text(`${category.description}`, 30, yPosition)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        yPosition += 8
      })

      yPosition += 5
      doc.setFont(undefined, 'bold')
      doc.text(`Total Deductible Expenses: ${this.formatCurrency(totalDeductible)}`, 25, yPosition)
      doc.setFont(undefined, 'normal')
      yPosition += 15
    }

    return yPosition
  }

  private generateCustomContent(doc: any, context: any, yPosition: number): number {
    // Custom Report - show all available data
    doc.setFontSize(16)
    doc.setTextColor(155, 89, 182) // Purple color
    doc.text('Custom Report', 20, yPosition)
    yPosition += 15

    // Summary section
    yPosition = this.generateFinancialContent(doc, context, yPosition)

    // Add spacing
    yPosition += 10

    return yPosition
  }

  private addTransactionsSection(
    doc: any,
    transactions: TransactionData[],
    yPosition: number
  ): number {
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(52, 73, 94)
    doc.text('Transaction Details', 20, yPosition)
    yPosition += 12

    doc.setFontSize(8)
    transactions.forEach(transaction => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 20
      }

      const typeColor = transaction.type === 'income' ? [46, 204, 113] : [231, 76, 60]
      doc.setTextColor(...typeColor)
      doc.text(`${this.formatDate(transaction.date)} - ${transaction.property_name}`, 20, yPosition)
      yPosition += 5
      doc.text(`${transaction.category}: ${this.formatCurrency(transaction.amount)}`, 25, yPosition)
      yPosition += 5
      doc.setTextColor(0, 0, 0)
      doc.text(transaction.description, 25, yPosition)
      yPosition += 8
    })

    return yPosition + 10
  }

  private addComparisonsSection(doc: any, comparisons: ComparisonData, yPosition: number): number {
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(142, 68, 173)
    doc.text('Period Comparison', 20, yPosition)
    yPosition += 15

    // Comparison table
    doc.setFillColor(248, 249, 250)
    doc.rect(20, yPosition, 170, 60, 'F')
    doc.setTextColor(0, 0, 0)

    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Metric', 25, yPosition + 10)
    doc.text('Current Period', 70, yPosition + 10)
    doc.text('Previous Period', 120, yPosition + 10)
    doc.text('Change', 165, yPosition + 10)

    doc.setFont(undefined, 'normal')
    yPosition += 18

    // Revenue comparison
    doc.text('Revenue', 25, yPosition)
    doc.text(this.formatCurrency(comparisons.current_period.revenue), 70, yPosition)
    doc.text(this.formatCurrency(comparisons.previous_period.revenue), 120, yPosition)
    const revenueChangeColor =
      comparisons.change_percentage.revenue >= 0 ? [46, 204, 113] : [231, 76, 60]
    doc.setTextColor(...revenueChangeColor)
    doc.text(
      `${comparisons.change_percentage.revenue >= 0 ? '+' : ''}${comparisons.change_percentage.revenue.toFixed(1)}%`,
      165,
      yPosition
    )
    doc.setTextColor(0, 0, 0)
    yPosition += 8

    // Expenses comparison
    doc.text('Expenses', 25, yPosition)
    doc.text(this.formatCurrency(comparisons.current_period.expenses), 70, yPosition)
    doc.text(this.formatCurrency(comparisons.previous_period.expenses), 120, yPosition)
    const expenseChangeColor =
      comparisons.change_percentage.expenses <= 0 ? [46, 204, 113] : [231, 76, 60]
    doc.setTextColor(...expenseChangeColor)
    doc.text(
      `${comparisons.change_percentage.expenses >= 0 ? '+' : ''}${comparisons.change_percentage.expenses.toFixed(1)}%`,
      165,
      yPosition
    )
    doc.setTextColor(0, 0, 0)
    yPosition += 8

    // Profit comparison
    doc.text('Profit', 25, yPosition)
    doc.text(this.formatCurrency(comparisons.current_period.profit), 70, yPosition)
    doc.text(this.formatCurrency(comparisons.previous_period.profit), 120, yPosition)
    const profitChangeColor =
      comparisons.change_percentage.profit >= 0 ? [46, 204, 113] : [231, 76, 60]
    doc.setTextColor(...profitChangeColor)
    doc.text(
      `${comparisons.change_percentage.profit >= 0 ? '+' : ''}${comparisons.change_percentage.profit.toFixed(1)}%`,
      165,
      yPosition
    )
    doc.setTextColor(0, 0, 0)
    yPosition += 8

    // Occupancy comparison
    doc.text('Occupancy', 25, yPosition)
    doc.text(`${comparisons.current_period.occupancy.toFixed(1)}%`, 70, yPosition)
    doc.text(`${comparisons.previous_period.occupancy.toFixed(1)}%`, 120, yPosition)
    const occupancyChangeColor =
      comparisons.change_percentage.occupancy >= 0 ? [46, 204, 113] : [231, 76, 60]
    doc.setTextColor(...occupancyChangeColor)
    doc.text(
      `${comparisons.change_percentage.occupancy >= 0 ? '+' : ''}${comparisons.change_percentage.occupancy.toFixed(1)}%`,
      165,
      yPosition
    )
    doc.setTextColor(0, 0, 0)

    return yPosition + 20
  }

  private addChartsSection(
    doc: any,
    reportData: ReportData,
    context: any,
    yPosition: number
  ): number {
    // Check if we need a new page for charts (more conservative to prevent cutoff)
    if (yPosition > 100) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(52, 152, 219)
    doc.text('Charts & Visualizations', 20, yPosition)
    yPosition += 20

    // Generate different charts based on report type
    switch (reportData.type) {
      case 'financial':
        yPosition = this.addFinancialCharts(doc, context, yPosition)
        break
      case 'performance':
        yPosition = this.addPerformanceCharts(doc, context, yPosition)
        break
      case 'tax':
        yPosition = this.addTaxCharts(doc, context, yPosition)
        break
      default:
        yPosition = this.addFinancialCharts(doc, context, yPosition)
        break
    }

    return yPosition + 10
  }

  private addFinancialCharts(doc: any, context: any, yPosition: number): number {
    // Check if we need a new page before adding charts
    if (yPosition > 180) {
      doc.addPage()
      yPosition = 20
    }

    // Income vs Expenses Bar Chart
    yPosition = this.drawBarChart(doc, {
      title: 'Income vs Expenses',
      data: [
        { name: 'Income', value: context.summary.totalIncome, color: [46, 204, 113] },
        { name: 'Expenses', value: context.summary.totalExpenses, color: [231, 76, 60] },
      ],
      x: 20,
      y: yPosition,
      width: 170,
      height: 70, // Reduced height to fit better
    })
    yPosition += 10 // Reduced spacing

    // Check if we need a new page for the pie chart
    if (yPosition > 200) {
      doc.addPage()
      yPosition = 20
    }

    // Property Revenue Pie Chart
    if (context.properties.length > 0) {
      const propertyData = context.properties.map((p: PropertyData, index: number) => ({
        name: p.name,
        value: p.monthly_revenue,
        color: this.getChartColor(index),
      }))

      yPosition = this.drawPieChart(doc, {
        title: 'Revenue by Property',
        data: propertyData,
        x: 20,
        y: yPosition,
        radius: 35, // Reduced radius to fit better
      })
      yPosition += 10 // Reduced spacing
    }

    return yPosition
  }

  private addPerformanceCharts(doc: any, context: any, yPosition: number): number {
    // Occupancy Rate Bar Chart
    if (context.properties.length > 0) {
      const occupancyData = context.properties.map((p: PropertyData, index: number) => ({
        name: p.name.substring(0, 10) + (p.name.length > 10 ? '...' : ''),
        value: p.occupancy_rate,
        color: this.getChartColor(index),
      }))

      yPosition = this.drawBarChart(doc, {
        title: 'Occupancy Rate by Property (%)',
        data: occupancyData,
        x: 20,
        y: yPosition,
        width: 170,
        height: 80,
        maxValue: 100,
      })
      yPosition += 100
    }

    // Monthly Performance Line Chart
    if (context.monthlyPerformance.length > 0) {
      const monthlyData = context.monthlyPerformance.reduce(
        (acc: any[], item: MonthlyPerformanceData) => {
          const existing = acc.find(a => a.name === item.month)
          if (existing) {
            existing.value += item.revenue
          } else {
            acc.push({ name: item.month, value: item.revenue, color: [52, 152, 219] })
          }
          return acc
        },
        []
      )

      yPosition = this.drawLineChart(doc, {
        title: 'Monthly Revenue Trend',
        data: monthlyData,
        x: 20,
        y: yPosition,
        width: 170,
        height: 80,
      })
      yPosition += 100
    }

    return yPosition
  }

  private addTaxCharts(doc: any, context: any, yPosition: number): number {
    // Deductible Expenses Pie Chart
    if (context.taxCategories.length > 0) {
      const deductibleExpenses = context.taxCategories
        .filter((cat: TaxCategoryData) => cat.deductible)
        .map((cat: TaxCategoryData, index: number) => ({
          name: cat.category,
          value: cat.amount,
          color: this.getChartColor(index),
        }))

      if (deductibleExpenses.length > 0) {
        yPosition = this.drawPieChart(doc, {
          title: 'Deductible Expenses Breakdown',
          data: deductibleExpenses,
          x: 20,
          y: yPosition,
          radius: 40,
        })
        yPosition += 100
      }
    }

    return yPosition
  }

  private drawBarChart(
    doc: any,
    options: {
      title: string
      data: Array<{ name: string; value: number; color: number[] }>
      x: number
      y: number
      width: number
      height: number
      maxValue?: number
    }
  ): number {
    const { title, data, x, y, width, height, maxValue } = options

    // Validate inputs
    if (!data || data.length === 0) {
      return y + 20
    }

    // Title
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(title, x, y)

    const chartY = y + 10
    const chartHeight = Math.max(height - 20, 20) // Ensure minimum height
    const barWidth = Math.max((width / data.length) * 0.8, 5) // Ensure minimum width
    const barSpacing = (width / data.length) * 0.2

    const max = maxValue || Math.max(...data.map(d => d.value), 1) // Ensure max is at least 1

    data.forEach((item, index) => {
      // Ensure valid values
      const value = isNaN(item.value) ? 0 : Math.max(item.value, 0)
      const barHeight = max > 0 ? Math.max((value / max) * chartHeight, 0) : 0
      const barX = x + index * (barWidth + barSpacing)
      const barY = chartY + chartHeight - barHeight

      // Validate rectangle parameters before drawing
      if (barWidth > 0 && barHeight > 0 && !isNaN(barX) && !isNaN(barY)) {
        // Draw bar
        doc.setFillColor(...item.color)
        doc.rect(barX, barY, barWidth, barHeight, 'F')
      }

      // Draw value label
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      const valueText = maxValue ? `${value}%` : `$${value.toLocaleString()}`
      doc.text(valueText, barX + barWidth / 2, barY - 2, { align: 'center' })

      // Draw name label
      doc.text(item.name, barX + barWidth / 2, chartY + chartHeight + 8, { align: 'center' })
    })

    return y + height + 20
  }

  private drawPieChart(
    doc: any,
    options: {
      title: string
      data: Array<{ name: string; value: number; color: number[] }>
      x: number
      y: number
      radius: number
    }
  ): number {
    const { title, data, x, y, radius } = options

    // Validate inputs
    if (!data || data.length === 0) {
      return y + 20
    }

    // Title
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(title, x, y)

    const centerX = x + radius + 20
    const centerY = y + radius + 20
    const total = data.reduce((sum, item) => sum + Math.max(item.value, 0), 0)

    // If total is 0, don't draw the chart
    if (total === 0) {
      return y + 40
    }

    let currentAngle = 0

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI

      // Draw pie slice using triangular segments
      doc.setFillColor(...item.color)

      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle

      // Calculate points for the pie slice
      const x1 = centerX + radius * Math.cos(startAngle)
      const y1 = centerY + radius * Math.sin(startAngle)
      const x2 = centerX + radius * Math.cos(endAngle)
      const y2 = centerY + radius * Math.sin(endAngle)

      // Draw pie slice as a triangle from center to arc
      if (sliceAngle > 0.1) {
        // Only draw if slice is large enough
        doc.triangle(centerX, centerY, x1, y1, x2, y2, 'F')
      }

      // Draw legend
      const legendY = y + 20 + index * 12
      const legendX = x + radius * 2 + 30

      // Validate rectangle parameters
      if (legendX > 0 && legendY > 0 && !isNaN(legendX) && !isNaN(legendY)) {
        doc.rect(legendX, legendY, 8, 8, 'F')
      }

      // Legend text
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      const percentage = ((item.value / total) * 100).toFixed(1)
      doc.text(`${item.name}: ${percentage}%`, x + radius * 2 + 45, legendY + 6)

      currentAngle += sliceAngle
    })

    // Draw circle outline for pie chart
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(1)
    doc.circle(centerX, centerY, radius, 'S')

    return y + Math.max(radius * 2 + 40, data.length * 12 + 40)
  }

  private drawLineChart(
    doc: any,
    options: {
      title: string
      data: Array<{ name: string; value: number; color: number[] }>
      x: number
      y: number
      width: number
      height: number
    }
  ): number {
    const { title, data, x, y, width, height } = options

    // Title
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(title, x, y)

    const chartY = y + 10
    const chartHeight = height - 20
    const pointSpacing = width / (data.length - 1)

    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1

    // Draw axes
    doc.setDrawColor(100, 100, 100)
    doc.line(x, chartY + chartHeight, x + width, chartY + chartHeight) // X-axis
    doc.line(x, chartY, x, chartY + chartHeight) // Y-axis

    // Draw line and points
    doc.setDrawColor(52, 152, 219)
    doc.setLineWidth(2)

    data.forEach((item, index) => {
      const pointX = x + index * pointSpacing
      const pointY = chartY + chartHeight - ((item.value - min) / range) * chartHeight

      // Draw point
      doc.setFillColor(52, 152, 219)
      doc.circle(pointX, pointY, 2, 'F')

      // Draw line to next point
      if (index < data.length - 1) {
        const nextPointX = x + (index + 1) * pointSpacing
        const nextPointY =
          chartY + chartHeight - ((data[index + 1].value - min) / range) * chartHeight
        doc.line(pointX, pointY, nextPointX, nextPointY)
      }

      // Draw label
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text(item.name, pointX, chartY + chartHeight + 8, { align: 'center' })
    })

    return y + height + 20
  }

  private getChartColor(index: number): number[] {
    const colors = [
      [52, 152, 219], // Blue
      [46, 204, 113], // Green
      [231, 76, 60], // Red
      [155, 89, 182], // Purple
      [241, 196, 15], // Yellow
      [230, 126, 34], // Orange
      [149, 165, 166], // Gray
      [26, 188, 156], // Teal
    ]
    return colors[index % colors.length]
  }

  private addModernHeader(doc: any, reportData: ReportData, yPosition: number): number {
    // Header background with gradient effect (simulated with rectangles)
    doc.setFillColor(37, 99, 235) // Primary blue
    doc.rect(0, 0, 210, 40, 'F')

    // Add subtle gradient effect with lighter blue
    doc.setFillColor(59, 130, 246) // Lighter blue
    doc.rect(0, 0, 210, 20, 'F')

    // Company/App name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('BnB Margins', 20, 15)

    // Report title
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text(reportData.title, 20, 32)

    // Date range in header
    if (reportData.dateRange.from || reportData.dateRange.to) {
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      const fromDate = reportData.dateRange.from
        ? this.formatDate(reportData.dateRange.from.toISOString())
        : 'Start'
      const toDate = reportData.dateRange.to
        ? this.formatDate(reportData.dateRange.to.toISOString())
        : 'End'
      doc.text(`Period: ${fromDate} - ${toDate}`, 20, 38)
    }

    // Generated date
    doc.setFontSize(8)
    doc.setTextColor(200, 200, 200)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 150, 15)

    // Reset text color
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')

    return 55 // Return position after header
  }

  private addExecutiveSummary(doc: any, context: any, yPosition: number): number {
    // Executive Summary Card
    doc.setFillColor(248, 250, 252) // Light gray background
    doc.setDrawColor(226, 232, 240) // Border color
    doc.setLineWidth(0.5)
    doc.rect(20, yPosition, 170, 45, 'FD')

    // Summary title
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(15, 23, 42) // Dark text
    doc.text('Executive Summary', 25, yPosition + 10)

    // Key metrics in a grid layout
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139) // Muted text

    // Left column
    doc.text('Total Revenue:', 25, yPosition + 20)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(16, 185, 129) // Success green
    doc.text(this.formatCurrency(context.summary.totalIncome), 25, yPosition + 28)

    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Total Expenses:', 25, yPosition + 36)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(239, 68, 68) // Destructive red
    doc.text(this.formatCurrency(context.summary.totalExpenses), 25, yPosition + 44)

    // Right column
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Net Profit:', 110, yPosition + 20)
    doc.setFont(undefined, 'bold')
    const profitColor = context.summary.netProfit >= 0 ? [16, 185, 129] : [239, 68, 68]
    doc.setTextColor(...profitColor)
    doc.text(this.formatCurrency(context.summary.netProfit), 110, yPosition + 28)

    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text('Profit Margin:', 110, yPosition + 36)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(...profitColor)
    doc.text(`${context.summary.profitMargin.toFixed(1)}%`, 110, yPosition + 44)

    // Reset formatting
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')

    return yPosition + 60
  }

  private addSectionHeader(doc: any, title: string, yPosition: number): number {
    // Section header with accent line
    doc.setFillColor(37, 99, 235) // Primary blue
    doc.rect(20, yPosition, 4, 12, 'F')

    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(title, 30, yPosition + 8)

    // Subtle underline
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.5)
    doc.line(30, yPosition + 12, 190, yPosition + 12)

    // Reset formatting
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')

    return yPosition + 20
  }

  private async generateExcel(reportData: ReportData, context: any): Promise<void> {
    const workbook = XLSX.utils.book_new()

    // 1. Executive Summary Sheet
    this.createExecutiveSummarySheet(workbook, reportData, context)

    // 2. Properties Sheet
    if (context.properties.length > 0) {
      this.createPropertiesSheet(workbook, context)
    }

    // 3. Monthly Performance Sheet
    if (context.monthlyPerformance.length > 0) {
      this.createMonthlyPerformanceSheet(workbook, context)
    }

    // 4. Transactions Sheet
    if (reportData.includeTransactions && context.transactions.length > 0) {
      this.createTransactionsSheet(workbook, context)
    }

    // 5. Tax Categories Sheet (for tax reports)
    if (reportData.type === 'tax' && context.taxCategories.length > 0) {
      this.createTaxCategoriesSheet(workbook, context)
    }

    // 6. Comparisons Sheet (if comparisons are included)
    if (reportData.includeComparisons && context.comparisons) {
      this.createComparisonsSheet(workbook, context)
    }

    // Save the Excel file
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, fileName)
  }

  private createExecutiveSummarySheet(workbook: any, reportData: ReportData, context: any): void {
    const summaryData: any[][] = []

    // Header
    summaryData.push([reportData.title])
    summaryData.push([`Generated on ${new Date().toLocaleDateString()}`])
    summaryData.push(['']) // Empty row

    // Period information
    if (reportData.dateRange.from || reportData.dateRange.to) {
      const fromDate = reportData.dateRange.from
        ? this.formatDate(reportData.dateRange.from.toISOString())
        : 'Start'
      const toDate = reportData.dateRange.to
        ? this.formatDate(reportData.dateRange.to.toISOString())
        : 'End'
      summaryData.push(['Report Period:', `${fromDate} - ${toDate}`])
      summaryData.push(['']) // Empty row
    }

    // Key Metrics based on report type
    const typeSpecificData = this.generateExcelSummaryData(reportData, context)
    summaryData.push(...typeSpecificData)

    // Additional insights
    summaryData.push(['']) // Empty row
    summaryData.push(['Key Insights:'])
    summaryData.push(['Properties in Portfolio:', context.properties.length])
    summaryData.push(['Total Transactions:', context.transactions.length])

    if (context.summary.profitMargin > 20) {
      summaryData.push(['Status:', 'Excellent profit margins'])
    } else if (context.summary.profitMargin > 10) {
      summaryData.push(['Status:', 'Good profit margins'])
    } else if (context.summary.profitMargin > 0) {
      summaryData.push(['Status:', 'Positive but low margins'])
    } else {
      summaryData.push(['Status:', 'Operating at a loss'])
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)

    // Apply formatting
    this.formatExcelSheet(summarySheet, {
      headerRow: 0,
      titleStyle: true,
      columnWidths: [25, 20],
    })

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Executive Summary')
  }

  private createPropertiesSheet(workbook: any, context: any): void {
    const propertiesData = [
      [
        'Property Name',
        'Monthly Revenue',
        'Monthly Expenses',
        'Net Profit',
        'Profit Margin %',
        'Occupancy Rate %',
        'Avg Rating',
        'Total Reviews',
        'Performance Score',
      ],
      ...context.properties.map((p: PropertyData) => {
        const netProfit = p.monthly_revenue - p.monthly_expenses
        const profitMargin = p.monthly_revenue > 0 ? (netProfit / p.monthly_revenue) * 100 : 0
        const performanceScore =
          p.occupancy_rate * 0.4 + p.avg_rating * 20 * 0.3 + profitMargin * 0.3

        return [
          p.name,
          p.monthly_revenue,
          p.monthly_expenses,
          netProfit,
          profitMargin / 100, // Convert to decimal for Excel percentage formatting
          p.occupancy_rate / 100, // Convert to decimal for Excel percentage formatting
          p.avg_rating,
          p.total_reviews,
          performanceScore.toFixed(1),
        ]
      }),
    ]

    const propertiesSheet = XLSX.utils.aoa_to_sheet(propertiesData)

    // Apply formatting
    this.formatExcelSheet(propertiesSheet, {
      headerRow: 0,
      currencyColumns: [1, 2, 3], // Revenue, Expenses, Net Profit
      percentColumns: [4, 5], // Profit Margin, Occupancy Rate
      columnWidths: [20, 15, 15, 15, 12, 12, 10, 12, 15],
    })

    XLSX.utils.book_append_sheet(workbook, propertiesSheet, 'Properties')
  }

  private generateExcelSummaryData(reportData: ReportData, context: any): any[][] {
    const summaryData: any[][] = []

    switch (reportData.type) {
      case 'financial':
        summaryData.push(['Financial Summary'])
        summaryData.push([''])
        summaryData.push(['Total Income', context.summary.totalIncome])
        summaryData.push(['Total Expenses', context.summary.totalExpenses])
        summaryData.push(['Net Profit', context.summary.netProfit])
        summaryData.push(['Profit Margin (%)', context.summary.profitMargin.toFixed(2)])
        break

      case 'performance':
        summaryData.push(['Performance Summary'])
        summaryData.push([''])
        summaryData.push(['Total Properties', context.properties.length])
        summaryData.push([
          'Average Occupancy Rate (%)',
          context.summary.avgOccupancyRate.toFixed(2),
        ])
        summaryData.push(['Total Monthly Revenue', context.summary.totalMonthlyRevenue])
        summaryData.push([
          'Revenue per Property',
          (context.summary.totalMonthlyRevenue / Math.max(context.properties.length, 1)).toFixed(2),
        ])
        break

      case 'tax':
        summaryData.push(['Tax Summary'])
        summaryData.push([''])
        summaryData.push(['Total Rental Income', context.summary.totalIncome])
        summaryData.push(['Net Rental Income', context.summary.netProfit])
        if (context.taxCategories.length > 0) {
          const totalDeductible = context.taxCategories
            .filter((cat: TaxCategoryData) => cat.deductible)
            .reduce((sum: number, cat: TaxCategoryData) => sum + cat.amount, 0)
          summaryData.push(['Total Deductible Expenses', totalDeductible])
        }
        break

      default:
        summaryData.push(['Custom Report Summary'])
        summaryData.push([''])
        summaryData.push(['Total Income', context.summary.totalIncome])
        summaryData.push(['Total Expenses', context.summary.totalExpenses])
        summaryData.push(['Net Profit', context.summary.netProfit])
        break
    }

    return summaryData
  }

  private createMonthlyPerformanceSheet(workbook: any, context: any): void {
    const monthlyData = [
      ['Month', 'Property', 'Revenue', 'Expenses', 'Profit', 'Occupancy %', 'Bookings'],
      ...context.monthlyPerformance.map((m: MonthlyPerformanceData) => [
        m.month,
        m.property_name,
        m.revenue,
        m.expenses,
        m.profit,
        m.occupancy_rate / 100, // Convert to decimal for Excel percentage formatting
        m.bookings,
      ]),
    ]

    const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData)

    this.formatExcelSheet(monthlySheet, {
      headerRow: 0,
      currencyColumns: [2, 3, 4], // Revenue, Expenses, Profit
      percentColumns: [5], // Occupancy
      columnWidths: [12, 20, 15, 15, 15, 12, 10],
    })

    XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Performance')
  }

  private createTransactionsSheet(workbook: any, context: any): void {
    const transactionsData = [
      ['Date', 'Property', 'Type', 'Category', 'Amount', 'Description'],
      ...context.transactions.map((t: TransactionData) => [
        t.date,
        t.property_name,
        t.type,
        t.category,
        t.amount,
        t.description,
      ]),
    ]

    const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData)

    this.formatExcelSheet(transactionsSheet, {
      headerRow: 0,
      currencyColumns: [4], // Amount
      columnWidths: [12, 20, 10, 15, 15, 30],
    })

    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions')
  }

  private createTaxCategoriesSheet(workbook: any, context: any): void {
    const taxData = [
      ['Category', 'Amount', 'Description', 'Deductible'],
      ...context.taxCategories.map((cat: TaxCategoryData) => [
        cat.category,
        cat.amount,
        cat.description,
        cat.deductible ? 'Yes' : 'No',
      ]),
    ]

    // Add summary at the bottom
    const totalDeductible = context.taxCategories
      .filter((cat: TaxCategoryData) => cat.deductible)
      .reduce((sum: number, cat: TaxCategoryData) => sum + cat.amount, 0)

    taxData.push(['']) // Empty row
    taxData.push(['Total Deductible Expenses:', totalDeductible, '', ''])

    const taxSheet = XLSX.utils.aoa_to_sheet(taxData)

    this.formatExcelSheet(taxSheet, {
      headerRow: 0,
      currencyColumns: [1], // Amount
      columnWidths: [20, 15, 40, 12],
    })

    XLSX.utils.book_append_sheet(workbook, taxSheet, 'Tax Categories')
  }

  private createComparisonsSheet(workbook: any, context: any): void {
    const comparisons = context.comparisons
    const comparisonData = [
      ['Metric', 'Current Period', 'Previous Period', 'Change Amount', 'Change %'],
      [
        'Revenue',
        comparisons.current_period.revenue,
        comparisons.previous_period.revenue,
        comparisons.current_period.revenue - comparisons.previous_period.revenue,
        comparisons.change_percentage.revenue.toFixed(2) + '%',
      ],
      [
        'Expenses',
        comparisons.current_period.expenses,
        comparisons.previous_period.expenses,
        comparisons.current_period.expenses - comparisons.previous_period.expenses,
        comparisons.change_percentage.expenses.toFixed(2) + '%',
      ],
      [
        'Profit',
        comparisons.current_period.profit,
        comparisons.previous_period.profit,
        comparisons.current_period.profit - comparisons.previous_period.profit,
        comparisons.change_percentage.profit.toFixed(2) + '%',
      ],
      [
        'Occupancy',
        comparisons.current_period.occupancy.toFixed(1) + '%',
        comparisons.previous_period.occupancy.toFixed(1) + '%',
        (comparisons.current_period.occupancy - comparisons.previous_period.occupancy).toFixed(1) +
          '%',
        comparisons.change_percentage.occupancy.toFixed(2) + '%',
      ],
    ]

    const comparisonSheet = XLSX.utils.aoa_to_sheet(comparisonData)

    this.formatExcelSheet(comparisonSheet, {
      headerRow: 0,
      currencyColumns: [1, 2, 3], // Current, Previous, Change Amount
      columnWidths: [15, 18, 18, 18, 12],
    })

    XLSX.utils.book_append_sheet(workbook, comparisonSheet, 'Period Comparison')
  }

  private formatExcelSheet(
    sheet: any,
    options: {
      headerRow?: number
      titleStyle?: boolean
      currencyColumns?: number[]
      percentColumns?: number[]
      columnWidths?: number[]
    }
  ): void {
    // Set column widths
    if (options.columnWidths) {
      const cols = options.columnWidths.map(width => ({ wch: width }))
      sheet['!cols'] = cols
    }

    // Get the range of the sheet
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1')

    // Format header row
    if (options.headerRow !== undefined) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: options.headerRow, c: col })
        if (sheet[cellAddress]) {
          sheet[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '2563EB' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
          }
        }
      }
    }

    // Format currency columns
    if (options.currencyColumns) {
      options.currencyColumns.forEach(colIndex => {
        for (let row = (options.headerRow || 0) + 1; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex })
          if (sheet[cellAddress] && typeof sheet[cellAddress].v === 'number') {
            sheet[cellAddress].z = '"$"#,##0.00'
            sheet[cellAddress].s = {
              alignment: { horizontal: 'right' },
              border: {
                top: { style: 'thin', color: { rgb: 'E5E7EB' } },
                bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                left: { style: 'thin', color: { rgb: 'E5E7EB' } },
                right: { style: 'thin', color: { rgb: 'E5E7EB' } },
              },
            }
          }
        }
      })
    }

    // Format percentage columns
    if (options.percentColumns) {
      options.percentColumns.forEach(colIndex => {
        for (let row = (options.headerRow || 0) + 1; row <= range.e.r; row++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: colIndex })
          if (sheet[cellAddress] && typeof sheet[cellAddress].v === 'number') {
            sheet[cellAddress].z = '0.00%'
            sheet[cellAddress].s = {
              alignment: { horizontal: 'center' },
              border: {
                top: { style: 'thin', color: { rgb: 'E5E7EB' } },
                bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
                left: { style: 'thin', color: { rgb: 'E5E7EB' } },
                right: { style: 'thin', color: { rgb: 'E5E7EB' } },
              },
            }
          }
        }
      })
    }

    // Add borders to all data cells
    for (let row = (options.headerRow || 0) + 1; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
        if (sheet[cellAddress] && !sheet[cellAddress].s) {
          sheet[cellAddress].s = {
            border: {
              top: { style: 'thin', color: { rgb: 'E5E7EB' } },
              bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
              left: { style: 'thin', color: { rgb: 'E5E7EB' } },
              right: { style: 'thin', color: { rgb: 'E5E7EB' } },
            },
          }
        }
      }
    }
  }

  private async generateCSV(reportData: ReportData, context: any): Promise<void> {
    let csvContent = ''

    // Add title and metadata with proper formatting
    csvContent += `"${reportData.title}"\n`
    csvContent += `"Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}"\n`

    if (reportData.dateRange.from || reportData.dateRange.to) {
      const fromDate = reportData.dateRange.from
        ? this.formatDate(reportData.dateRange.from.toISOString())
        : 'Start'
      const toDate = reportData.dateRange.to
        ? this.formatDate(reportData.dateRange.to.toISOString())
        : 'End'
      csvContent += `"Report Period: ${fromDate} - ${toDate}"\n`
    }
    csvContent += '\n'

    // Add executive summary
    csvContent += '"EXECUTIVE SUMMARY"\n'
    csvContent += '"Metric","Value"\n'
    csvContent += `"Total Income","${this.formatCurrency(context.summary.totalIncome)}"\n`
    csvContent += `"Total Expenses","${this.formatCurrency(context.summary.totalExpenses)}"\n`
    csvContent += `"Net Profit","${this.formatCurrency(context.summary.netProfit)}"\n`
    csvContent += `"Profit Margin","${context.summary.profitMargin.toFixed(2)}%"\n`
    csvContent += '\n'

    // Add properties data with better formatting
    if (context.properties.length > 0) {
      csvContent += '"PROPERTY PERFORMANCE"\n'
      csvContent +=
        '"Property Name","Monthly Revenue","Monthly Expenses","Net Profit","Profit Margin","Occupancy Rate","Avg Rating","Total Reviews","Performance Score"\n'

      context.properties.forEach((p: PropertyData) => {
        const netProfit = p.monthly_revenue - p.monthly_expenses
        const profitMargin = p.monthly_revenue > 0 ? (netProfit / p.monthly_revenue) * 100 : 0
        const performanceScore =
          p.occupancy_rate * 0.4 + p.avg_rating * 20 * 0.3 + profitMargin * 0.3

        csvContent += `"${p.name}","${this.formatCurrency(p.monthly_revenue)}","${this.formatCurrency(p.monthly_expenses)}","${this.formatCurrency(netProfit)}","${profitMargin.toFixed(2)}%","${p.occupancy_rate.toFixed(1)}%","${p.avg_rating.toFixed(1)}","${p.total_reviews}","${performanceScore.toFixed(1)}"\n`
      })
      csvContent += '\n'
    }

    // Add monthly performance data
    if (context.monthlyPerformance.length > 0) {
      csvContent += '"MONTHLY PERFORMANCE"\n'
      csvContent += '"Month","Property","Revenue","Expenses","Profit","Occupancy Rate","Bookings"\n'

      context.monthlyPerformance.forEach((m: MonthlyPerformanceData) => {
        csvContent += `"${m.month}","${m.property_name}","${this.formatCurrency(m.revenue)}","${this.formatCurrency(m.expenses)}","${this.formatCurrency(m.profit)}","${m.occupancy_rate.toFixed(1)}%","${m.bookings}"\n`
      })
      csvContent += '\n'
    }

    // Add transactions data with better formatting
    if (reportData.includeTransactions && context.transactions.length > 0) {
      csvContent += '"TRANSACTION DETAILS"\n'
      csvContent += '"Date","Property","Type","Category","Amount","Description"\n'

      context.transactions.forEach((t: TransactionData) => {
        const formattedDate = this.formatDate(t.date)
        const formattedAmount = this.formatCurrency(t.amount)
        const cleanDescription = t.description.replace(/"/g, '""') // Escape quotes in description

        csvContent += `"${formattedDate}","${t.property_name}","${t.type}","${t.category}","${formattedAmount}","${cleanDescription}"\n`
      })
      csvContent += '\n'
    }

    // Add comparisons if available
    if (reportData.includeComparisons && context.comparisons) {
      csvContent += '"PERIOD COMPARISON"\n'
      csvContent +=
        '"Metric","Current Period","Previous Period","Change Amount","Change Percentage"\n'

      const comp = context.comparisons
      csvContent += `"Revenue","${this.formatCurrency(comp.current_period.revenue)}","${this.formatCurrency(comp.previous_period.revenue)}","${this.formatCurrency(comp.current_period.revenue - comp.previous_period.revenue)}","${comp.change_percentage.revenue.toFixed(2)}%"\n`
      csvContent += `"Expenses","${this.formatCurrency(comp.current_period.expenses)}","${this.formatCurrency(comp.previous_period.expenses)}","${this.formatCurrency(comp.current_period.expenses - comp.previous_period.expenses)}","${comp.change_percentage.expenses.toFixed(2)}%"\n`
      csvContent += `"Profit","${this.formatCurrency(comp.current_period.profit)}","${this.formatCurrency(comp.previous_period.profit)}","${this.formatCurrency(comp.current_period.profit - comp.previous_period.profit)}","${comp.change_percentage.profit.toFixed(2)}%"\n`
      csvContent += `"Occupancy","${comp.current_period.occupancy.toFixed(1)}%","${comp.previous_period.occupancy.toFixed(1)}%","${(comp.current_period.occupancy - comp.previous_period.occupancy).toFixed(1)}%","${comp.change_percentage.occupancy.toFixed(2)}%"\n`
    }

    // Save the CSV file
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, fileName)
  }

  // Quick report generators
  async generateQuickReport(type: string, userId?: string): Promise<void> {
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
          includeComparisons: false,
          userId,
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
          includeComparisons: true,
          userId,
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
          includeComparisons: false,
          userId,
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
          includeComparisons: true,
          userId,
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
          includeComparisons: false,
          userId,
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
          includeComparisons: false,
          userId,
        }
        break
      default:
        throw new Error(`Unknown quick report type: ${type}`)
    }

    await this.generateReport(reportData)
  }
}

export const reportGenerator = new ReportGenerator()
