"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, DollarSign, Calendar, BarChart3, PieChart } from 'lucide-react'

export function PropertyManagementMockup() {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Properties</h3>
        <Badge variant="secondary">4 Active</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Downtown Loft", revenue: "$4,250", occupancy: "92%", status: "Booked" },
          { name: "Beach House", revenue: "$6,800", occupancy: "88%", status: "Available" },
          { name: "Mountain Cabin", revenue: "$3,200", occupancy: "76%", status: "Booked" },
          { name: "City Apartment", revenue: "$2,900", occupancy: "84%", status: "Cleaning" }
        ].map((property, index) => (
          <Card key={index} className="border border-gray-200">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{property.name}</CardTitle>
                <Badge variant={property.status === "Booked" ? "default" : "secondary"} className="text-xs">
                  {property.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Monthly Revenue</span>
                <span className="font-semibold text-green-600">{property.revenue}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Occupancy Rate</span>
                <span className="font-semibold">{property.occupancy}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsMockup() {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
        <Badge variant="secondary">Live Data</Badge>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Revenue", value: "$17,150", change: "+12%", icon: DollarSign },
          { label: "Occupancy", value: "85%", change: "+5%", icon: Calendar },
          { label: "Properties", value: "4", change: "0%", icon: Building2 },
          { label: "Profit Margin", value: "68%", change: "+8%", icon: TrendingUp }
        ].map((kpi, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <kpi.icon className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-green-600 font-medium">{kpi.change}</span>
              </div>
              <div className="mt-2">
                <div className="text-lg font-bold">{kpi.value}</div>
                <div className="text-xs text-gray-600">{kpi.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Chart Mockup */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded flex items-end justify-around p-4">
            {[65, 78, 82, 71, 89, 95].map((height, index) => (
              <div key={index} className="flex flex-col items-center space-y-1">
                <div 
                  className="w-6 bg-blue-600 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-600">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ReportsMockup() {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Reports & Analytics</h3>
        <Badge variant="secondary">Auto-Generated</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "Monthly P&L Report", type: "PDF", date: "Dec 2024", status: "Ready" },
          { name: "Tax Summary", type: "Excel", date: "2024 YTD", status: "Generating" },
          { name: "Property Performance", type: "PDF", date: "Q4 2024", status: "Ready" },
          { name: "Expense Breakdown", type: "CSV", date: "Dec 2024", status: "Ready" }
        ].map((report, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{report.name}</h4>
                <Badge variant={report.status === "Ready" ? "default" : "secondary"} className="text-xs">
                  {report.status}
                </Badge>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>{report.type}</span>
                <span>{report.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="border border-gray-200 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Best Performing Property</span>
            <span className="font-semibold">Beach House (+15%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Highest Expense Category</span>
            <span className="font-semibold">Maintenance (32%)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Recommended Action</span>
            <span className="font-semibold text-blue-600">Increase pricing</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ExpenseTrackingMockup() {
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Expense Tracking</h3>
        <Badge variant="secondary">$2,340 This Month</Badge>
      </div>
      
      <div className="space-y-3">
        {[
          { category: "Maintenance", amount: "$450", date: "Dec 15", property: "Downtown Loft", color: "bg-red-500" },
          { category: "Cleaning", amount: "$120", date: "Dec 14", property: "Beach House", color: "bg-blue-500" },
          { category: "Utilities", amount: "$280", date: "Dec 12", property: "Mountain Cabin", color: "bg-green-500" },
          { category: "Supplies", amount: "$95", date: "Dec 10", property: "City Apartment", color: "bg-yellow-500" }
        ].map((expense, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${expense.color}`}></div>
                  <div>
                    <div className="font-medium text-sm">{expense.category}</div>
                    <div className="text-xs text-gray-600">{expense.property}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm">{expense.amount}</div>
                  <div className="text-xs text-gray-600">{expense.date}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Expense Categories Chart */}
      <Card className="border border-gray-200 mt-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { category: "Maintenance", percentage: 45, color: "bg-red-500" },
              { category: "Utilities", percentage: 25, color: "bg-green-500" },
              { category: "Cleaning", percentage: 20, color: "bg-blue-500" },
              { category: "Supplies", percentage: 10, color: "bg-yellow-500" }
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.category}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
