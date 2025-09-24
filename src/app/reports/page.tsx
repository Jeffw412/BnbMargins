"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettings } from "@/contexts/settings-context"
import { formatDate } from "@/lib/utils"
import {
    Building2,
    Calendar,
    Clock,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileText,
    Filter,
    Mail,
    Plus,
    RefreshCw,
    Settings,
    Trash2,
    TrendingDown,
    TrendingUp
} from 'lucide-react'
import { useState } from 'react'

// Mock data for reports
const mockReportTemplates = [
  {
    id: '1',
    name: 'Monthly P&L Statement',
    description: 'Comprehensive profit and loss statement for all properties',
    type: 'financial',
    frequency: 'monthly',
    lastGenerated: '2024-01-31',
    isActive: true,
    recipients: ['owner@example.com']
  },
  {
    id: '2',
    name: 'Property Performance Summary',
    description: 'Individual property performance metrics and KPIs',
    type: 'performance',
    frequency: 'weekly',
    lastGenerated: '2024-01-28',
    isActive: true,
    recipients: ['manager@example.com']
  },
  {
    id: '3',
    name: 'Tax Preparation Report',
    description: 'Annual tax report with all deductible expenses',
    type: 'tax',
    frequency: 'yearly',
    lastGenerated: '2023-12-31',
    isActive: false,
    recipients: ['accountant@example.com']
  },
  {
    id: '4',
    name: 'Cash Flow Analysis',
    description: 'Monthly cash flow analysis and projections',
    type: 'financial',
    frequency: 'monthly',
    lastGenerated: '2024-01-31',
    isActive: true,
    recipients: ['owner@example.com', 'advisor@example.com']
  }
]

const reportTypes = [
  { value: 'financial', label: 'Financial Reports', icon: DollarSign },
  { value: 'performance', label: 'Performance Reports', icon: TrendingUp },
  { value: 'tax', label: 'Tax Reports', icon: FileText },
  { value: 'custom', label: 'Custom Reports', icon: Settings }
]

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
]

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  frequency: string
  lastGenerated: string
  isActive: boolean
  recipients: string[]
}

export default function ReportsPage() {
  const { currency } = useSettings()
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(mockReportTemplates)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [selectedProperties, setSelectedProperties] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('generate')

  const handleGenerateReport = () => {
    // In real app, this would generate and download the report
    console.log('Generating report...', {
      type: selectedReportType,
      dateRange,
      properties: selectedProperties
    })
    setIsGenerateDialogOpen(false)
  }

  const handleScheduleReport = () => {
    // In real app, this would schedule the report
    console.log('Scheduling report...')
    setIsScheduleDialogOpen(false)
  }

  const toggleReportStatus = (reportId: string) => {
    setReportTemplates(prev =>
      prev.map(report =>
        report.id === reportId
          ? { ...report, isActive: !report.isActive }
          : report
      )
    )
  }

  const getReportTypeIcon = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type)
    return reportType ? reportType.icon : FileText
  }

  const getFrequencyBadgeColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'bg-blue-100 text-blue-800'
      case 'weekly': return 'bg-green-100 text-green-800'
      case 'monthly': return 'bg-purple-100 text-purple-800'
      case 'quarterly': return 'bg-orange-100 text-orange-800'
      case 'yearly': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage comprehensive financial reports
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsGenerateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        {/* Generate Reports Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <Card key={type.value} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="text-center">
                    <Icon className="h-12 w-12 mx-auto mb-2 text-primary" />
                    <CardTitle className="text-lg">{type.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedReportType(type.value)
                        setIsGenerateDialogOpen(true)
                      }}
                    >
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>Generate common reports instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>This Month P&L</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>YTD Performance</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <DollarSign className="h-6 w-6" />
                  <span>Tax Summary</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Building2 className="h-6 w-6" />
                  <span>Property Comparison</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span>Occupancy Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <TrendingDown className="h-6 w-6" />
                  <span>Expense Analysis</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Scheduled Reports</h2>
            <Button onClick={() => setIsScheduleDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule New Report
            </Button>
          </div>

          <div className="grid gap-4">
            {reportTemplates.map((template) => {
              const Icon = getReportTypeIcon(template.type)
              return (
                <Card key={template.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Icon className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getFrequencyBadgeColor(template.frequency)}>
                              {template.frequency}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Last generated: {formatDate(template.lastGenerated)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={template.isActive}
                          onCheckedChange={() => toggleReportStatus(template.id)}
                        />
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {template.recipients.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Recipients: {template.recipients.join(', ')}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Report History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report History</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {[
                  { name: 'Monthly P&L Statement - January 2024', type: 'financial', date: '2024-01-31', size: '2.4 MB', status: 'completed' },
                  { name: 'Property Performance Summary - Week 4', type: 'performance', date: '2024-01-28', size: '1.8 MB', status: 'completed' },
                  { name: 'Cash Flow Analysis - January 2024', type: 'financial', date: '2024-01-31', size: '1.2 MB', status: 'completed' },
                  { name: 'Tax Preparation Report - 2023', type: 'tax', date: '2023-12-31', size: '5.6 MB', status: 'completed' },
                  { name: 'Quarterly Performance Review - Q4 2023', type: 'performance', date: '2023-12-31', size: '3.1 MB', status: 'completed' }
                ].map((report, index) => (
                  <div key={index} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <h4 className="font-medium">{report.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{formatDate(report.date)}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {report.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        {report.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Report Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>
              Configure and generate a custom report for your properties
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select defaultValue="pdf">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Select date range for report"
              />
            </div>

            <div className="space-y-2">
              <Label>Properties</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select properties to include" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="1">Downtown Loft</SelectItem>
                  <SelectItem value="2">Beachside Villa</SelectItem>
                  <SelectItem value="3">Mountain Cabin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Additional Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="include-charts" />
                  <Label htmlFor="include-charts">Include charts and visualizations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-transactions" />
                  <Label htmlFor="include-transactions">Include detailed transaction list</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-comparisons" />
                  <Label htmlFor="include-comparisons">Include period comparisons</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateReport} disabled={!selectedReportType}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Set up automated report generation and delivery
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Report Name</Label>
              <Input placeholder="Enter report name" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Recipients</Label>
              <Input placeholder="Enter email addresses separated by commas" />
            </div>

            <div className="space-y-2">
              <Label>Report Settings</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-send" defaultChecked />
                  <Label htmlFor="auto-send">Automatically send via email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="save-copy" defaultChecked />
                  <Label htmlFor="save-copy">Save copy to report history</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleReport}>
              <Clock className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
