'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSettings } from '@/contexts/settings-context'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  BarChart3,
  Building2,
  DollarSign,
  Download,
  Filter,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
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

// Mock data for analytics
const mockProperties = [
  { id: '1', name: 'Downtown Loft' },
  { id: '2', name: 'Beachside Villa' },
  { id: '3', name: 'Mountain Cabin' },
]

const mockAnalyticsData = {
  monthlyPerformance: [
    {
      month: 'Jan',
      downtown_loft: 2800,
      beachside_villa: 4200,
      mountain_cabin: 1800,
      expenses_downtown: 1900,
      expenses_beachside: 2800,
      expenses_mountain: 1200,
    },
    {
      month: 'Feb',
      downtown_loft: 2600,
      beachside_villa: 3800,
      mountain_cabin: 1600,
      expenses_downtown: 1800,
      expenses_beachside: 2600,
      expenses_mountain: 1100,
    },
    {
      month: 'Mar',
      downtown_loft: 3200,
      beachside_villa: 4800,
      mountain_cabin: 2200,
      expenses_downtown: 2100,
      expenses_beachside: 3200,
      expenses_mountain: 1400,
    },
    {
      month: 'Apr',
      downtown_loft: 2900,
      beachside_villa: 4400,
      mountain_cabin: 2000,
      expenses_downtown: 1950,
      expenses_beachside: 2900,
      expenses_mountain: 1300,
    },
    {
      month: 'May',
      downtown_loft: 3400,
      beachside_villa: 5200,
      mountain_cabin: 2400,
      expenses_downtown: 2200,
      expenses_beachside: 3400,
      expenses_mountain: 1500,
    },
    {
      month: 'Jun',
      downtown_loft: 3800,
      beachside_villa: 5800,
      mountain_cabin: 2800,
      expenses_downtown: 2400,
      expenses_beachside: 3800,
      expenses_mountain: 1700,
    },
  ],
  propertyComparison: [
    {
      property: 'Downtown Loft',
      revenue: 18800,
      expenses: 12350,
      profit: 6450,
      occupancy: 85,
      avg_rating: 4.9,
    },
    {
      property: 'Beachside Villa',
      revenue: 28200,
      expenses: 18700,
      profit: 9500,
      occupancy: 78,
      avg_rating: 4.7,
    },
    {
      property: 'Mountain Cabin',
      revenue: 12800,
      expenses: 8200,
      profit: 4600,
      occupancy: 72,
      avg_rating: 4.8,
    },
  ],
  categoryBreakdown: {
    income: [
      { name: 'Booking Revenue', value: 52800, color: '#3b82f6' },
      { name: 'Cleaning Fees', value: 4200, color: '#10b981' },
      { name: 'Extra Fees', value: 2800, color: '#f59e0b' },
    ],
    expenses: [
      { name: 'Cleaning', value: 8400, color: '#ef4444' },
      { name: 'Utilities', value: 6200, color: '#f97316' },
      { name: 'Maintenance', value: 4800, color: '#eab308' },
      { name: 'Insurance', value: 3600, color: '#84cc16' },
      { name: 'Marketing', value: 2400, color: '#06b6d4' },
      { name: 'Other', value: 3850, color: '#8b5cf6' },
    ],
  },
  occupancyTrends: [
    { month: 'Jan', downtown_loft: 85, beachside_villa: 78, mountain_cabin: 72 },
    { month: 'Feb', downtown_loft: 82, beachside_villa: 75, mountain_cabin: 68 },
    { month: 'Mar', downtown_loft: 88, beachside_villa: 82, mountain_cabin: 75 },
    { month: 'Apr', downtown_loft: 86, beachside_villa: 80, mountain_cabin: 73 },
    { month: 'May', downtown_loft: 90, beachside_villa: 85, mountain_cabin: 78 },
    { month: 'Jun', downtown_loft: 92, beachside_villa: 88, mountain_cabin: 82 },
  ],
  // New analytics data
  adrRevparTrends: [
    { month: 'Jan', adr: 145, revpar: 123, occupancy: 85 },
    { month: 'Feb', adr: 142, revpar: 117, occupancy: 82 },
    { month: 'Mar', adr: 158, revpar: 139, occupancy: 88 },
    { month: 'Apr', adr: 152, revpar: 131, occupancy: 86 },
    { month: 'May', adr: 165, revpar: 149, occupancy: 90 },
    { month: 'Jun', adr: 172, revpar: 158, occupancy: 92 },
  ],
  lengthOfStayDistribution: [
    { nights: '1', count: 12, percentage: 8.5 },
    { nights: '2', count: 28, percentage: 19.7 },
    { nights: '3', count: 35, percentage: 24.6 },
    { nights: '4', count: 22, percentage: 15.5 },
    { nights: '5', count: 18, percentage: 12.7 },
    { nights: '6', count: 12, percentage: 8.5 },
    { nights: '7+', count: 15, percentage: 10.6 },
  ],
  utilizationHeatmap: [
    { date: '2024-01-01', occupancy: 85, revenue: 245 },
    { date: '2024-01-02', occupancy: 92, revenue: 280 },
    { date: '2024-01-03', occupancy: 78, revenue: 220 },
    { date: '2024-01-04', occupancy: 95, revenue: 295 },
    { date: '2024-01-05', occupancy: 88, revenue: 260 },
    { date: '2024-01-06', occupancy: 82, revenue: 235 },
    { date: '2024-01-07', occupancy: 90, revenue: 270 },
  ],
  roiAnalysis: [
    {
      property: 'Downtown Loft',
      purchasePrice: 450000,
      totalRevenue: 18800,
      totalExpenses: 12350,
      netProfit: 6450,
      roi: 1.43,
      cashOnCash: 8.2,
      paybackPeriod: 12.2,
    },
    {
      property: 'Beachside Villa',
      purchasePrice: 680000,
      totalRevenue: 28200,
      totalExpenses: 18700,
      netProfit: 9500,
      roi: 1.4,
      cashOnCash: 7.8,
      paybackPeriod: 12.8,
    },
    {
      property: 'Mountain Cabin',
      purchasePrice: 320000,
      totalRevenue: 12800,
      totalExpenses: 8200,
      netProfit: 4600,
      roi: 1.44,
      cashOnCash: 8.6,
      paybackPeriod: 11.6,
    },
  ],
  forecastingData: [
    { month: 'Jul', actual: 4200, predicted: 4150, confidence_low: 3950, confidence_high: 4350 },
    { month: 'Aug', actual: 4800, predicted: 4750, confidence_low: 4500, confidence_high: 5000 },
    { month: 'Sep', actual: null, predicted: 4200, confidence_low: 3900, confidence_high: 4500 },
    { month: 'Oct', actual: null, predicted: 3800, confidence_low: 3500, confidence_high: 4100 },
    { month: 'Nov', actual: null, predicted: 3200, confidence_low: 2900, confidence_high: 3500 },
    { month: 'Dec', actual: null, predicted: 3600, confidence_low: 3300, confidence_high: 3900 },
  ],
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export default function AnalyticsPage() {
  const { currency } = useSettings()
  const [selectedProperties, setSelectedProperties] = useState<string[]>(['1', '2'])
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [comparisonDateRange, setComparisonDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate summary metrics
  const totalRevenue = mockAnalyticsData.propertyComparison.reduce((sum, p) => sum + p.revenue, 0)
  const totalExpenses = mockAnalyticsData.propertyComparison.reduce((sum, p) => sum + p.expenses, 0)
  const totalProfit = totalRevenue - totalExpenses
  const avgOccupancy =
    mockAnalyticsData.propertyComparison.reduce((sum, p) => sum + p.occupancy, 0) /
    mockAnalyticsData.propertyComparison.length
  const avgRating =
    mockAnalyticsData.propertyComparison.reduce((sum, p) => sum + p.avg_rating, 0) /
    mockAnalyticsData.propertyComparison.length

  // Filter data based on selected properties
  const filteredData = useMemo(() => {
    return {
      monthlyPerformance: mockAnalyticsData.monthlyPerformance,
      propertyComparison: mockAnalyticsData.propertyComparison.filter(p =>
        selectedProperties.includes(mockProperties.find(mp => mp.name === p.property)?.id || '')
      ),
      occupancyTrends: mockAnalyticsData.occupancyTrends,
      roiAnalysis: mockAnalyticsData.roiAnalysis.filter(p =>
        selectedProperties.includes(mockProperties.find(mp => mp.name === p.property)?.id || '')
      ),
    }
  }, [selectedProperties])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Advanced analytics and insights for your properties
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Comparisons</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Properties</label>
              <Select
                value={selectedProperties.join(',')}
                onValueChange={value => setSelectedProperties(value.split(',').filter(Boolean))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1,2,3">All Properties</SelectItem>
                  <SelectItem value="1">Downtown Loft</SelectItem>
                  <SelectItem value="2">Beachside Villa</SelectItem>
                  <SelectItem value="3">Mountain Cabin</SelectItem>
                  <SelectItem value="1,2">Downtown + Beachside</SelectItem>
                  <SelectItem value="2,3">Beachside + Mountain</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Period</label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Select date range"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comparison Period</label>
              <DateRangePicker
                dateRange={comparisonDateRange}
                onDateRangeChange={setComparisonDateRange}
                placeholder="Compare with period"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">View Type</label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue, currency)}
            </div>
            <p className="text-muted-foreground text-xs">+12.5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses, currency)}
            </div>
            <p className="text-muted-foreground text-xs">+8.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalProfit, currency)}
            </div>
            <p className="text-muted-foreground text-xs">+18.7% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPercentage(avgOccupancy)}</div>
            <p className="text-muted-foreground text-xs">+3.2% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</div>
            <p className="text-muted-foreground text-xs">+0.1 from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Property Comparison</TabsTrigger>
          <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="pricing">ADR & RevPAR</TabsTrigger>
          <TabsTrigger value="stays">Length of Stay</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Revenue vs Expenses Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Revenue vs Expenses</span>
                </CardTitle>
                <CardDescription>Monthly performance across all properties</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={filteredData.monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={value => formatCurrency(Number(value), currency)} />
                    <Legend />
                    <Bar
                      dataKey="downtown_loft"
                      stackId="revenue"
                      fill="#3b82f6"
                      name="Downtown Loft"
                    />
                    <Bar
                      dataKey="beachside_villa"
                      stackId="revenue"
                      fill="#10b981"
                      name="Beachside Villa"
                    />
                    <Bar
                      dataKey="mountain_cabin"
                      stackId="revenue"
                      fill="#f59e0b"
                      name="Mountain Cabin"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses_downtown"
                      stroke="#ef4444"
                      strokeWidth={2}
                      name="Downtown Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses_beachside"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Beachside Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses_mountain"
                      stroke="#eab308"
                      strokeWidth={2}
                      name="Mountain Expenses"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Occupancy Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChartIcon className="h-5 w-5" />
                  <span>Occupancy Trends</span>
                </CardTitle>
                <CardDescription>Occupancy rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredData.occupancyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={value => `${value}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="downtown_loft"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Downtown Loft"
                    />
                    <Line
                      type="monotone"
                      dataKey="beachside_villa"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Beachside Villa"
                    />
                    <Line
                      type="monotone"
                      dataKey="mountain_cabin"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      name="Mountain Cabin"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Property Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Performance Comparison</CardTitle>
              <CardDescription>Side-by-side comparison of selected properties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Property Comparison Chart */}
                <div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={
                        filteredData.propertyComparison.length > 0
                          ? filteredData.propertyComparison
                          : mockAnalyticsData.propertyComparison
                      }
                      layout="horizontal"
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} />
                      <XAxis
                        type="number"
                        stroke="currentColor"
                        fontSize={12}
                        tickFormatter={value => formatCurrency(Number(value), currency)}
                      />
                      <YAxis
                        dataKey="property"
                        type="category"
                        width={120}
                        stroke="currentColor"
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={value => formatCurrency(Number(value), currency)}
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Legend wrapperStyle={{ color: 'var(--foreground)' }} />
                      <Bar dataKey="revenue" fill="var(--chart-1)" name="Revenue" />
                      <Bar dataKey="expenses" fill="var(--chart-4)" name="Expenses" />
                      <Bar dataKey="profit" fill="var(--chart-2)" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Property Metrics Table */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Performance Metrics</h3>
                  <div className="space-y-3">
                    {filteredData.propertyComparison.map(property => (
                      <Card key={property.property} className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-semibold">{property.property}</h4>
                          <Badge variant="outline">
                            ROI: {formatPercentage((property.profit / property.revenue) * 100)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Revenue:</span>
                            <div className="font-medium text-green-600">
                              {formatCurrency(property.revenue, currency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expenses:</span>
                            <div className="font-medium text-red-600">
                              {formatCurrency(property.expenses, currency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Profit:</span>
                            <div className="font-medium text-green-600">
                              {formatCurrency(property.profit, currency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Occupancy:</span>
                            <div className="font-medium">
                              {formatPercentage(property.occupancy)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends & Patterns Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Profit Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Profit Trends</CardTitle>
                <CardDescription>Monthly profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={filteredData.monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={value => formatCurrency(Number(value), currency)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="downtown_loft"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Downtown Loft"
                    />
                    <Area
                      type="monotone"
                      dataKey="beachside_villa"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Beachside Villa"
                    />
                    <Area
                      type="monotone"
                      dataKey="mountain_cabin"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Mountain Cabin"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Analysis</CardTitle>
                <CardDescription>Performance patterns by season</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">Q1</div>
                      <div className="text-muted-foreground text-sm">Winter</div>
                      <div className="text-lg font-semibold">{formatCurrency(28600, currency)}</div>
                      <div className="text-xs text-green-600">+5.2%</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">Q2</div>
                      <div className="text-muted-foreground text-sm">Spring</div>
                      <div className="text-lg font-semibold">{formatCurrency(31000, currency)}</div>
                      <div className="text-xs text-green-600">+8.4%</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="mb-2 font-semibold">Peak Performance Insights</h4>
                    <ul className="text-muted-foreground space-y-1 text-sm">
                      <li>• Beachside Villa peaks in summer months</li>
                      <li>• Mountain Cabin performs best in winter</li>
                      <li>• Downtown Loft maintains steady year-round performance</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Category Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Income Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5 text-green-600" />
                  <span>Income Breakdown</span>
                </CardTitle>
                <CardDescription>Revenue sources distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.categoryBreakdown.income}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockAnalyticsData.categoryBreakdown.income.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => formatCurrency(Number(value), currency)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {mockAnalyticsData.categoryBreakdown.income.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium text-green-600">
                        {formatCurrency(item.value, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChartIcon className="h-5 w-5 text-red-600" />
                  <span>Expense Breakdown</span>
                </CardTitle>
                <CardDescription>Cost categories distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.categoryBreakdown.expenses}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {mockAnalyticsData.categoryBreakdown.expenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={value => formatCurrency(Number(value), currency)} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {mockAnalyticsData.categoryBreakdown.expenses.map(item => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium text-red-600">
                        {formatCurrency(item.value, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cost Efficiency Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Efficiency Analysis</CardTitle>
              <CardDescription>Expense optimization opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">28%</div>
                  <div className="text-muted-foreground text-sm">Cleaning Costs</div>
                  <div className="text-xs text-yellow-600">Above industry average</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">15%</div>
                  <div className="text-muted-foreground text-sm">Utility Costs</div>
                  <div className="text-xs text-green-600">Below industry average</div>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">22%</div>
                  <div className="text-muted-foreground text-sm">Maintenance</div>
                  <div className="text-xs text-blue-600">Industry average</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ADR & RevPAR Tab */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>ADR & RevPAR Trends</span>
              </CardTitle>
              <CardDescription>Average Daily Rate and Revenue per Available Room</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={mockAnalyticsData.adrRevparTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'occupancy' ? `${value}%` : formatCurrency(Number(value), currency),
                      name === 'adr' ? 'ADR' : name === 'revpar' ? 'RevPAR' : 'Occupancy',
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="adr" fill="#3b82f6" name="ADR" />
                  <Bar yAxisId="left" dataKey="revpar" fill="#10b981" name="RevPAR" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Occupancy %"
                  />
                </ComposedChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(
                      mockAnalyticsData.adrRevparTrends[
                        mockAnalyticsData.adrRevparTrends.length - 1
                      ].adr,
                      currency
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">Current ADR</div>
                  <div className="text-xs text-blue-600">+12.4% vs last month</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      mockAnalyticsData.adrRevparTrends[
                        mockAnalyticsData.adrRevparTrends.length - 1
                      ].revpar,
                      currency
                    )}
                  </div>
                  <div className="text-muted-foreground text-sm">Current RevPAR</div>
                  <div className="text-xs text-green-600">+15.8% vs last month</div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      mockAnalyticsData.adrRevparTrends[
                        mockAnalyticsData.adrRevparTrends.length - 1
                      ].occupancy
                    }
                    %
                  </div>
                  <div className="text-muted-foreground text-sm">Current Occupancy</div>
                  <div className="text-xs text-yellow-600">+2.2% vs last month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Length of Stay Tab */}
        <TabsContent value="stays" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChartIcon className="h-5 w-5" />
                <span>Length of Stay Distribution</span>
              </CardTitle>
              <CardDescription>Guest booking duration patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockAnalyticsData.lengthOfStayDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nights" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name === 'count' ? 'Bookings' : 'Percentage',
                      ]}
                    />
                    <Bar dataKey="count" fill="#3b82f6" name="Number of Bookings" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Stay Duration Insights</h3>
                  {mockAnalyticsData.lengthOfStayDistribution.map(item => (
                    <div
                      key={item.nights}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-semibold">{item.nights} nights</div>
                        <div className="text-muted-foreground text-sm">{item.count} bookings</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.percentage}%</div>
                        <div className="h-2 w-16 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${item.percentage * 4}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 rounded-lg bg-blue-50 p-4">
                    <h4 className="font-semibold text-blue-800">Key Insights</h4>
                    <ul className="mt-2 text-sm text-blue-700">
                      <li>• Most popular stay duration: 3 nights (24.6%)</li>
                      <li>• Average stay length: 3.8 nights</li>
                      <li>• Weekend stays (2-3 nights): 44.3% of bookings</li>
                      <li>• Extended stays (7+ nights): 10.6% of bookings</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Property Utilization Tab */}
        <TabsContent value="utilization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Property Utilization Heatmap</span>
              </CardTitle>
              <CardDescription>Daily occupancy and revenue patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockAnalyticsData.utilizationHeatmap}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={value =>
                        new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'occupancy'
                          ? `${value}%`
                          : formatCurrency(Number(value), currency),
                        name === 'occupancy' ? 'Occupancy' : 'Revenue',
                      ]}
                      labelFormatter={value =>
                        new Date(value).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="occupancy"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Occupancy %"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stackId="2"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Utilization Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">87%</div>
                      <div className="text-muted-foreground text-sm">Avg Occupancy</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(252, currency)}
                      </div>
                      <div className="text-muted-foreground text-sm">Avg Daily Revenue</div>
                    </div>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-4">
                    <h4 className="font-semibold text-yellow-800">Peak Performance Days</h4>
                    <ul className="mt-2 text-sm text-yellow-700">
                      <li>• Highest occupancy: 95% (Jan 4th)</li>
                      <li>• Highest revenue: {formatCurrency(295, currency)} (Jan 4th)</li>
                      <li>• Best revenue/occupancy ratio: Weekends</li>
                      <li>• Lowest utilization: Weekday check-ins</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ROI Analysis Tab */}
        <TabsContent value="roi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>ROI & Profitability Analysis</span>
              </CardTitle>
              <CardDescription>
                Return on investment and financial performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredData.roiAnalysis.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredData.roiAnalysis} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={value => `${value.toFixed(1)}%`} />
                      <YAxis dataKey="property" type="category" width={120} />
                      <Tooltip
                        formatter={value => [`${Number(value).toFixed(1)}%`, 'Cash-on-Cash Return']}
                      />
                      <Bar dataKey="cashOnCash" fill="#10b981" name="Cash-on-Cash Return %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="border-muted-foreground/25 flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed">
                    <div className="text-muted-foreground text-center">
                      <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                      <p className="text-lg font-medium">No ROI Data Available</p>
                      <p className="text-sm">Select properties to view ROI analysis</p>
                    </div>
                  </div>
                )}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Investment Performance</h3>
                  {filteredData.roiAnalysis.length > 0 ? (
                    filteredData.roiAnalysis.map(property => (
                      <Card key={property.property} className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <h4 className="font-semibold">{property.property}</h4>
                          <Badge variant="outline">ROI: {property.roi.toFixed(2)}x</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Purchase Price:</span>
                            <div className="font-medium">
                              {formatCurrency(property.purchasePrice, currency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net Profit:</span>
                            <div className="font-medium text-green-600">
                              {formatCurrency(property.netProfit, currency)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cash-on-Cash:</span>
                            <div className="font-medium text-blue-600">
                              {property.cashOnCash.toFixed(1)}%
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Payback Period:</span>
                            <div className="font-medium">
                              {property.paybackPeriod.toFixed(1)} years
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-muted-foreground py-8 text-center">
                      <p>No properties selected for ROI analysis.</p>
                      <p className="text-sm">Please select properties from the filters above.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Revenue Forecasting</span>
              </CardTitle>
              <CardDescription>Predictive analytics and future revenue projections</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={mockAnalyticsData.forecastingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={value => [
                      value ? formatCurrency(Number(value), currency) : 'N/A',
                      '',
                    ]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="confidence_low"
                    stackId="1"
                    stroke="none"
                    fill="#e5e7eb"
                    fillOpacity={0.4}
                    name="Confidence Range"
                  />
                  <Area
                    type="monotone"
                    dataKey="confidence_high"
                    stackId="1"
                    stroke="none"
                    fill="#e5e7eb"
                    fillOpacity={0.4}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(22800, currency)}
                  </div>
                  <div className="text-muted-foreground text-sm">Projected H2 Revenue</div>
                  <div className="text-xs text-blue-600">+8.5% vs H1</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">94%</div>
                  <div className="text-muted-foreground text-sm">Forecast Accuracy</div>
                  <div className="text-xs text-green-600">Based on 6-month history</div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(3800, currency)}
                  </div>
                  <div className="text-muted-foreground text-sm">Peak Month (Oct)</div>
                  <div className="text-xs text-yellow-600">Seasonal high</div>
                </div>
              </div>
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-800">Forecasting Insights</h4>
                <ul className="mt-2 text-sm text-gray-700">
                  <li>• Revenue expected to decline in fall/winter months</li>
                  <li>• Strong performance predicted for October (peak season)</li>
                  <li>• 95% confidence interval: ±10% of predicted values</li>
                  <li>• Model accounts for seasonal trends and booking patterns</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
