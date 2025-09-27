'use client'

import { UserProfile } from '@/components/auth/user-profile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/contexts/settings-context'
import { db } from '@/lib/supabase'
import { calculateAirbnbServiceFee, formatCurrency } from '@/lib/utils'
import { Database } from '@/types/database'
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Plus,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// Database type aliases
type Property = Database['public']['Tables']['properties']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type Booking = Database['public']['Tables']['bookings']['Row']

// Dashboard data types
interface DashboardProperty {
  name: string
  value: number
  color: string
  revenue: number
  expenses: number
  profit: number
  rating: number
  reviews: number
  occupancy: number
  details: {
    income: { bookings: number; cleaning_fees: number }
    expenses: {
      mortgage: number
      cleaning: number
      utilities: number
      maintenance: number
      insurance: number
      marketing: number
      other: number
      airbnb_service_fee: number
    }
  }
  [key: string]: any // For chart compatibility
}

interface MonthlyData {
  name: string
  income: number
  expenses: number
  profit: number
}

interface ExpenseCategory {
  name: string
  value: number
  color: string
  [key: string]: any // For chart compatibility
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { airbnbFeeModel, currency } = useSettings()
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set())

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<{
    properties: Property[]
    transactions: Transaction[]
    bookings: Booking[]
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    activeProperties: number
    avgRating: number
    totalReviews: number
    avgOccupancy: number
    monthlyData: MonthlyData[]
    propertyData: DashboardProperty[]
    expenseCategories: ExpenseCategory[]
    loading: boolean
    error: string | null
  }>({
    properties: [],
    transactions: [],
    bookings: [],
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    activeProperties: 0,
    avgRating: 0,
    totalReviews: 0,
    avgOccupancy: 0,
    monthlyData: [],
    propertyData: [],
    expenseCategories: [],
    loading: true,
    error: null,
  })

  // Helper function to format currency with user's preferred currency
  const formatCurrencyWithSettings = (amount: number) => formatCurrency(amount, currency)

  // Fetch dashboard data from database
  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) {
      setDashboardData(prev => ({ ...prev, loading: false, error: 'No user found' }))
      return
    }

    try {
      // Fetch properties, transactions, and bookings
      const [propertiesResult, transactionsResult, bookingsResult] = await Promise.all([
        db.properties.getAll(user.id),
        db.transactions.getAll(user.id),
        db.bookings.getAll(user.id),
      ])

      if (propertiesResult.error) throw propertiesResult.error
      if (transactionsResult.error) throw transactionsResult.error
      if (bookingsResult.error) throw bookingsResult.error

      const properties: Property[] = propertiesResult.data || []
      const transactions: Transaction[] = transactionsResult.data || []
      const bookings: Booking[] = bookingsResult.data || []

      // Calculate metrics
      const totalRevenue = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const netProfit = totalRevenue - totalExpenses

      // Generate property data for charts
      const propertyDataMap = new Map()
      properties.forEach(property => {
        const propertyTransactions = transactions.filter(t => t.property_id === property.id)
        const revenue = propertyTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
        const expenses = propertyTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)

        propertyDataMap.set(property.id, {
          id: property.id, // Add unique ID for React keys
          name: property.name,
          value: revenue,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][properties.indexOf(property) % 4],
          revenue,
          expenses,
          profit: revenue - expenses,
          rating: 4.5, // Default rating - could be calculated from reviews
          reviews: 0, // Default reviews - could be fetched from booking platform
          occupancy: 85, // Default occupancy - could be calculated from bookings
          details: {
            income: { bookings: revenue * 0.9, cleaning_fees: revenue * 0.1 },
            expenses: {
              mortgage: expenses * 0.4,
              cleaning: expenses * 0.2,
              utilities: expenses * 0.15,
              maintenance: expenses * 0.1,
              insurance: expenses * 0.08,
              marketing: expenses * 0.05,
              other: expenses * 0.02,
            },
          },
        })
      })

      const propertyDataArray = Array.from(propertyDataMap.values())

      // Generate monthly data
      const monthlyDataMap = new Map()
      transactions.forEach(transaction => {
        const date = new Date(transaction.date)
        const monthKey = date.toLocaleString('default', { month: 'short' })

        if (!monthlyDataMap.has(monthKey)) {
          monthlyDataMap.set(monthKey, { name: monthKey, income: 0, expenses: 0, profit: 0 })
        }

        const monthData = monthlyDataMap.get(monthKey)
        if (transaction.type === 'income') {
          monthData.income += transaction.amount
        } else {
          monthData.expenses += transaction.amount
        }
        monthData.profit = monthData.income - monthData.expenses
      })

      const monthlyDataArray = Array.from(monthlyDataMap.values())

      // Generate expense categories
      const expenseCategoriesMap = new Map()
      transactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
          const category = transaction.category || 'Other'
          if (!expenseCategoriesMap.has(category)) {
            expenseCategoriesMap.set(category, {
              name: category,
              value: 0,
              color: ['#dc2626', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'][
                Array.from(expenseCategoriesMap.keys()).length % 6
              ],
            })
          }
          expenseCategoriesMap.get(category).value += transaction.amount
        })

      const expenseCategoriesArray = Array.from(expenseCategoriesMap.values())

      setDashboardData({
        properties,
        transactions,
        bookings,
        totalRevenue,
        totalExpenses,
        netProfit,
        activeProperties: properties.length,
        avgRating:
          propertyDataArray.reduce((sum, p) => sum + p.rating, 0) / propertyDataArray.length || 0,
        totalReviews: propertyDataArray.reduce((sum, p) => sum + p.reviews, 0),
        avgOccupancy:
          propertyDataArray.reduce((sum, p) => sum + p.occupancy, 0) / propertyDataArray.length ||
          0,
        monthlyData: monthlyDataArray,
        propertyData: propertyDataArray,
        expenseCategories: expenseCategoriesArray,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load dashboard data',
      }))
    }
  }, [user?.id])

  // Fetch data on component mount and when user changes
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const togglePropertyExpansion = (propertyName: string) => {
    const newExpanded = new Set(expandedProperties)
    if (newExpanded.has(propertyName)) {
      newExpanded.delete(propertyName)
    } else {
      newExpanded.add(propertyName)
    }
    setExpandedProperties(newExpanded)
  }

  // Calculate Airbnb service fees for each property based on current fee model
  const propertyDataWithFees = dashboardData.propertyData.map(property => {
    const airbnbServiceFee = calculateAirbnbServiceFee(
      property.details.income.bookings,
      property.details.income.cleaning_fees,
      airbnbFeeModel
    )

    const updatedExpenses = {
      ...property.details.expenses,
      airbnb_service_fee: airbnbServiceFee,
    }

    const totalExpenses = Object.values(updatedExpenses).reduce((sum, expense) => sum + expense, 0)
    const profit = property.revenue - totalExpenses

    return {
      ...property,
      expenses: totalExpenses,
      profit,
      details: {
        ...property.details,
        expenses: updatedExpenses,
      },
    }
  })

  // Calculate total expense categories including Airbnb service fees
  const totalAirbnbServiceFees = propertyDataWithFees.reduce(
    (sum: number, property) => sum + property.details.expenses.airbnb_service_fee,
    0
  )

  const expenseCategoriesWithFees = [
    ...dashboardData.expenseCategories,
    { name: 'Airbnb Service Fees', value: Math.round(totalAirbnbServiceFees), color: '#f59e0b' },
  ]

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading dashboard...</div>
          <div className="text-muted-foreground text-sm">Fetching your property data</div>
        </div>
      </div>
    )
  }

  // Show error state
  if (dashboardData.error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-red-600">Error loading dashboard</div>
          <div className="text-muted-foreground text-sm">{dashboardData.error}</div>
          <Button onClick={fetchDashboardData} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your Airbnb properties performance</p>
        </div>
        <Button onClick={() => router.push('/properties')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="flex h-16 flex-col space-y-1"
              onClick={() => router.push('/transactions')}
            >
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Add Income</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-16 flex-col space-y-1"
              onClick={() => router.push('/transactions')}
            >
              <TrendingDown className="h-5 w-5" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-16 flex-col space-y-1"
              onClick={() => router.push('/properties')}
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Add Property</span>
            </Button>
            <Button
              variant="outline"
              className="flex h-16 flex-col space-y-1"
              onClick={() => router.push('/reports')}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalRevenue)}</div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.netProfit)}</div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeProperties}</div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-blue-600">
                <Calendar className="mr-1 h-3 w-3" />
                {Math.round(dashboardData.avgOccupancy)}% occupancy
              </span>
              this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.avgRating.toFixed(1)}</div>
            <p className="text-muted-foreground text-xs">
              <span className="flex items-center text-yellow-600">
                <Star className="mr-1 h-3 w-3" />
                {dashboardData.totalReviews} reviews
              </span>
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis
                  tickFormatter={value => formatCurrency(value)}
                  stroke="currentColor"
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value as number), name]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                <Bar dataKey="income" fill="var(--chart-1)" name="Income" />
                <Bar dataKey="expenses" fill="var(--chart-4)" name="Expenses" />
                <Bar dataKey="profit" fill="var(--chart-2)" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profit Trend</CardTitle>
            <CardDescription>Monthly profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis
                  tickFormatter={value => formatCurrency(value)}
                  stroke="currentColor"
                  fontSize={12}
                />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value as number), name]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Property</CardTitle>
            <CardDescription>Distribution of revenue across properties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.propertyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`}
                >
                  {dashboardData.propertyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={value => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown of monthly expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategoriesWithFees}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`}
                >
                  {expenseCategoriesWithFees.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={value => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)',
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* User Profile & Database Connection */}
        <UserProfile />
        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Revenue Growth
                </span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">+12.5%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Avg Occupancy
                </span>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">85%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-950/20">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Guest Satisfaction
                </span>
              </div>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">4.8/5</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="hover:bg-muted/50 flex items-center space-x-3 rounded p-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New booking received</p>
                  <p className="text-muted-foreground text-xs">Downtown Loft - 3 nights</p>
                </div>
                <span className="text-muted-foreground text-xs">2h ago</span>
              </div>
              <div className="hover:bg-muted/50 flex items-center space-x-3 rounded p-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Maintenance completed</p>
                  <p className="text-muted-foreground text-xs">Beachside Villa - Pool cleaning</p>
                </div>
                <span className="text-muted-foreground text-xs">1d ago</span>
              </div>
              <div className="hover:bg-muted/50 flex items-center space-x-3 rounded p-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Review received</p>
                  <p className="text-muted-foreground text-xs">Mountain Cabin - 5 stars</p>
                </div>
                <span className="text-muted-foreground text-xs">2d ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
            <CardDescription>Important reminders and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 border-l-4 border-red-500 bg-red-50 p-2 dark:bg-red-950/20">
                <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Property tax due
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 border-l-4 border-yellow-500 bg-yellow-50 p-2 dark:bg-yellow-950/20">
                <Users className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Guest check-in
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Downtown Loft - Tomorrow
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 border-l-4 border-blue-500 bg-blue-50 p-2 dark:bg-blue-950/20">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Cleaning scheduled
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Beachside Villa - Friday
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest reservations and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.bookings.slice(0, 4).map(booking => {
                const property = dashboardData.properties.find(p => p.id === booking.property_id)
                const checkInDate = new Date(booking.check_in_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                const checkOutDate = new Date(booking.check_out_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })

                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{property?.name || 'Unknown Property'}</div>
                      <div className="text-muted-foreground text-sm">{booking.guest_name}</div>
                      <div className="text-muted-foreground text-xs">
                        {checkInDate} - {checkOutDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrencyWithSettings(booking.total_amount)}
                      </div>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
            <CardDescription>Key metrics for each property</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.propertyData.map(property => (
                <div key={property.id} className="rounded-lg border">
                  <div
                    className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-3"
                    onClick={() => togglePropertyExpansion(property.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: property.color }}
                      />
                      <div>
                        <div className="font-medium">{property.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {property.rating}★ • {property.reviews} reviews • {property.occupancy}%
                          occupancy
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(property.value)}</div>
                        <div
                          className={`text-sm font-medium ${property.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {property.profit >= 0 ? '+' : ''}
                          {formatCurrency(property.profit)} profit
                        </div>
                      </div>
                      {expandedProperties.has(property.name) ? (
                        <ChevronDown className="text-muted-foreground h-4 w-4" />
                      ) : (
                        <ChevronRight className="text-muted-foreground h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {expandedProperties.has(property.name) && (
                    <div className="bg-muted/20 border-t px-3 pb-3">
                      <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-green-600">Income</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Bookings:</span>
                              <span>{formatCurrency(property.details.income.bookings)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cleaning Fees:</span>
                              <span>{formatCurrency(property.details.income.cleaning_fees)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-medium">
                              <span>Total Income:</span>
                              <span>{formatCurrency(property.revenue)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="mb-2 text-sm font-medium text-red-600">Expenses</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Mortgage:</span>
                              <span>{formatCurrency(property.details.expenses.mortgage)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cleaning:</span>
                              <span>{formatCurrency(property.details.expenses.cleaning)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Utilities:</span>
                              <span>{formatCurrency(property.details.expenses.utilities)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Maintenance:</span>
                              <span>{formatCurrency(property.details.expenses.maintenance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Insurance:</span>
                              <span>{formatCurrency(property.details.expenses.insurance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Marketing:</span>
                              <span>{formatCurrency(property.details.expenses.marketing)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Airbnb Service Fee:</span>
                              <span>
                                {formatCurrency(property.details.expenses.airbnb_service_fee)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Other:</span>
                              <span>{formatCurrency(property.details.expenses.other)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-medium">
                              <span>Total Expenses:</span>
                              <span>{formatCurrency(property.expenses)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 border-t pt-3">
                        <div
                          className={`flex items-center justify-between font-medium ${property.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          <span>Net Profit/Loss:</span>
                          <span className="text-lg">
                            {property.profit >= 0 ? '+' : ''}
                            {formatCurrency(property.profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/properties')}
            >
              <Plus className="mb-2 h-6 w-6" />
              Add Property
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/transactions?type=income')}
            >
              <DollarSign className="mb-2 h-6 w-6" />
              Record Income
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/transactions?type=expense')}
            >
              <TrendingDown className="mb-2 h-6 w-6" />
              Add Expense
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/dashboard#guests')}
            >
              <Users className="mb-2 h-6 w-6" />
              View Guests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
