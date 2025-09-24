"use client"

import { UserProfile } from "@/components/auth/user-profile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSettings } from "@/contexts/settings-context"
import { calculateAirbnbServiceFee, formatCurrency } from "@/lib/utils"
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
    Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

// Sample data for demonstration
const monthlyData = [
  { name: 'Jan', income: 4200, expenses: 2800, profit: 1400 },
  { name: 'Feb', income: 3800, expenses: 2600, profit: 1200 },
  { name: 'Mar', income: 5200, expenses: 3200, profit: 2000 },
  { name: 'Apr', income: 4800, expenses: 2900, profit: 1900 },
  { name: 'May', income: 6200, expenses: 3800, profit: 2400 },
  { name: 'Jun', income: 7100, expenses: 4200, profit: 2900 },
]

const propertyData = [
  {
    name: 'Downtown Loft',
    value: 2800,
    color: '#3b82f6',
    revenue: 2800,
    expenses: 1900,
    profit: 900,
    rating: 4.9,
    reviews: 32,
    occupancy: 85,
    details: {
      income: { bookings: 2500, cleaning_fees: 300 },
      expenses: { mortgage: 800, cleaning: 200, utilities: 150, maintenance: 100, insurance: 75, marketing: 50, other: 525 }
    }
  },
  {
    name: 'Beach House',
    value: 3200,
    color: '#10b981',
    revenue: 3200,
    expenses: 2100,
    profit: 1100,
    rating: 4.8,
    reviews: 28,
    occupancy: 92,
    details: {
      income: { bookings: 2900, cleaning_fees: 300 },
      expenses: { mortgage: 1000, cleaning: 250, utilities: 200, maintenance: 150, insurance: 100, marketing: 75, other: 325 }
    }
  },
  {
    name: 'Mountain Cabin',
    value: 1800,
    color: '#f59e0b',
    revenue: 1800,
    expenses: 1950,
    profit: -150,
    rating: 4.7,
    reviews: 19,
    occupancy: 78,
    details: {
      income: { bookings: 1600, cleaning_fees: 200 },
      expenses: { mortgage: 900, cleaning: 180, utilities: 120, maintenance: 200, insurance: 80, marketing: 40, other: 430 }
    }
  },
  {
    name: 'City Apartment',
    value: 2200,
    color: '#ef4444',
    revenue: 2200,
    expenses: 1800,
    profit: 400,
    rating: 4.6,
    reviews: 24,
    occupancy: 88,
    details: {
      income: { bookings: 2000, cleaning_fees: 200 },
      expenses: { mortgage: 700, cleaning: 160, utilities: 130, maintenance: 120, insurance: 90, marketing: 60, other: 540 }
    }
  },
]

const expenseCategories = [
  { name: 'Mortgage', value: 1200, color: '#dc2626' },
  { name: 'Cleaning', value: 800, color: '#8b5cf6' },
  { name: 'Maintenance', value: 600, color: '#06b6d4' },
  { name: 'Utilities', value: 400, color: '#84cc16' },
  { name: 'Insurance', value: 300, color: '#f97316' },
  { name: 'Marketing', value: 200, color: '#ec4899' },
]

const recentBookings = [
  { id: 1, property: 'Downtown Loft', guest: 'Sarah Johnson', dates: 'Dec 15-18', amount: 480, status: 'confirmed' },
  { id: 2, property: 'Beach House', guest: 'Mike Chen', dates: 'Dec 20-25', amount: 750, status: 'confirmed' },
  { id: 3, property: 'Mountain Cabin', guest: 'Emily Davis', dates: 'Dec 22-26', amount: 520, status: 'pending' },
  { id: 4, property: 'City Apartment', guest: 'John Smith', dates: 'Dec 28-31', amount: 420, status: 'confirmed' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { airbnbFeeModel, currency } = useSettings()
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set())

  // Helper function to format currency with user's preferred currency
  const formatCurrencyWithSettings = (amount: number) => formatCurrency(amount, currency)

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
  const propertyDataWithFees = propertyData.map(property => {
    const airbnbServiceFee = calculateAirbnbServiceFee(
      property.details.income.bookings,
      property.details.income.cleaning_fees,
      airbnbFeeModel
    )

    const updatedExpenses = {
      ...property.details.expenses,
      airbnb_service_fee: airbnbServiceFee
    }

    const totalExpenses = Object.values(updatedExpenses).reduce((sum, expense) => sum + expense, 0)
    const profit = property.revenue - totalExpenses

    return {
      ...property,
      expenses: totalExpenses,
      profit,
      details: {
        ...property.details,
        expenses: updatedExpenses
      }
    }
  })

  // Calculate total expense categories including Airbnb service fees
  const totalAirbnbServiceFees = propertyDataWithFees.reduce((sum: number, property) =>
    sum + property.details.expenses.airbnb_service_fee, 0
  )

  const expenseCategoriesWithFees = [
    ...expenseCategories,
    { name: 'Airbnb Service Fees', value: Math.round(totalAirbnbServiceFees), color: '#f59e0b' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your Airbnb properties performance
          </p>
        </div>
        <Button onClick={() => router.push('/properties')}>
          <Plus className="h-4 w-4 mr-2" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-16 flex flex-col space-y-1" onClick={() => router.push('/transactions')}>
              <DollarSign className="h-5 w-5" />
              <span className="text-xs">Add Income</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1" onClick={() => router.push('/transactions')}>
              <TrendingDown className="h-5 w-5" />
              <span className="text-xs">Add Expense</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1" onClick={() => router.push('/properties')}>
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Add Property</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1" onClick={() => router.push('/reports')}>
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs">Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(31300)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(11800)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                85% occupancy
              </span>
              this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                127 reviews
              </span>
              this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses</CardTitle>
            <CardDescription>Monthly comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="currentColor" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value as number), name]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)'
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
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} stroke="currentColor" fontSize={12} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value as number), name]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                <Line type="monotone" dataKey="profit" stroke="var(--chart-2)" strokeWidth={3} name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Property</CardTitle>
            <CardDescription>Distribution of revenue across properties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyDataWithFees}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${formatCurrency(value as number)}`}
                >
                  {propertyDataWithFees.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)'
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
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--card-foreground)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* User Profile & Database Connection */}
        <UserProfile />
        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">Revenue Growth</span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">+12.5%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Avg Occupancy</span>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Guest Satisfaction</span>
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
              <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New booking received</p>
                  <p className="text-xs text-muted-foreground">Downtown Loft - 3 nights</p>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Maintenance completed</p>
                  <p className="text-xs text-muted-foreground">Beachside Villa - Pool cleaning</p>
                </div>
                <span className="text-xs text-muted-foreground">1d ago</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Review received</p>
                  <p className="text-xs text-muted-foreground">Mountain Cabin - 5 stars</p>
                </div>
                <span className="text-xs text-muted-foreground">2d ago</span>
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
              <div className="flex items-center space-x-3 p-2 border-l-4 border-red-500 bg-red-50 dark:bg-red-950/20">
                <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">Property tax due</p>
                  <p className="text-xs text-red-700 dark:text-red-300">Due in 5 days</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <Users className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Guest check-in</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">Downtown Loft - Tomorrow</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-2 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Cleaning scheduled</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Beachside Villa - Friday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest reservations and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{booking.property}</div>
                    <div className="text-sm text-muted-foreground">{booking.guest}</div>
                    <div className="text-xs text-muted-foreground">{booking.dates}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(booking.amount)}</div>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
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
              {propertyDataWithFees.map((property) => (
                <div key={property.name} className="border rounded-lg">
                  <div
                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => togglePropertyExpansion(property.name)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: property.color }}
                      />
                      <div>
                        <div className="font-medium">{property.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {property.rating}★ • {property.reviews} reviews • {property.occupancy}% occupancy
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(property.value)}</div>
                        <div className={`text-sm font-medium ${property.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {property.profit >= 0 ? '+' : ''}{formatCurrency(property.profit)} profit
                        </div>
                      </div>
                      {expandedProperties.has(property.name) ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expandedProperties.has(property.name) && (
                    <div className="px-3 pb-3 border-t bg-muted/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2 text-green-600">Income</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Bookings:</span>
                              <span>{formatCurrency(property.details.income.bookings)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cleaning Fees:</span>
                              <span>{formatCurrency(property.details.income.cleaning_fees)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Total Income:</span>
                              <span>{formatCurrency(property.revenue)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm mb-2 text-red-600">Expenses</h4>
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
                              <span>{formatCurrency(property.details.expenses.airbnb_service_fee)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Other:</span>
                              <span>{formatCurrency(property.details.expenses.other)}</span>
                            </div>
                            <div className="flex justify-between font-medium border-t pt-1">
                              <span>Total Expenses:</span>
                              <span>{formatCurrency(property.expenses)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className={`flex justify-between items-center font-medium ${property.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <span>Net Profit/Loss:</span>
                          <span className="text-lg">
                            {property.profit >= 0 ? '+' : ''}{formatCurrency(property.profit)}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/properties')}
            >
              <Plus className="h-6 w-6 mb-2" />
              Add Property
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/transactions?type=income')}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              Record Income
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/transactions?type=expense')}
            >
              <TrendingDown className="h-6 w-6 mb-2" />
              Add Expense
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => router.push('/dashboard#guests')}
            >
              <Users className="h-6 w-6 mb-2" />
              View Guests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
