"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useSettings } from "@/contexts/settings-context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
    ArrowUpDown,
    Building2,
    DollarSign,
    Download,
    Edit,
    Plus,
    Receipt,
    Trash2,
    TrendingDown,
    TrendingUp,
    Upload
} from 'lucide-react'
import { useState } from 'react'

// Mock data for demonstration
const mockTransactions = [
  {
    id: '1',
    property_id: '1',
    property_name: 'Downtown Loft',
    type: 'income' as const,
    category: 'Booking Revenue',
    amount: 1200,
    description: 'Airbnb booking - 5 nights',
    date: '2024-01-15',
    created_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    property_id: '1',
    property_name: 'Downtown Loft',
    type: 'expense' as const,
    category: 'Cleaning',
    amount: 80,
    description: 'Professional cleaning service',
    date: '2024-01-16',
    created_at: '2024-01-16T00:00:00Z'
  },
  {
    id: '3',
    property_id: '2',
    property_name: 'Beachside Villa',
    type: 'income' as const,
    category: 'Booking Revenue',
    amount: 2400,
    description: 'Airbnb booking - 7 nights',
    date: '2024-01-18',
    created_at: '2024-01-18T00:00:00Z'
  },
  {
    id: '4',
    property_id: '1',
    property_name: 'Downtown Loft',
    type: 'expense' as const,
    category: 'Utilities',
    amount: 120,
    description: 'Electricity bill',
    date: '2024-01-20',
    created_at: '2024-01-20T00:00:00Z'
  },
  {
    id: '5',
    property_id: '2',
    property_name: 'Beachside Villa',
    type: 'expense' as const,
    category: 'Maintenance',
    amount: 350,
    description: 'Pool maintenance and repair',
    date: '2024-01-22',
    created_at: '2024-01-22T00:00:00Z'
  }
]

const mockProperties = [
  { id: '1', name: 'Downtown Loft' },
  { id: '2', name: 'Beachside Villa' }
]

const incomeCategories = [
  'Booking Revenue',
  'Cleaning Fees',
  'Security Deposit',
  'Extra Guest Fees',
  'Pet Fees',
  'Other Income'
]

const expenseCategories = [
  'Cleaning',
  'Utilities',
  'Maintenance',
  'Insurance',
  'Property Tax',
  'Mortgage/Rent',
  'Marketing',
  'Supplies',
  'Professional Services',
  'Other Expenses'
]

interface Transaction {
  id: string
  property_id: string
  property_name: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  date: string
  created_at: string
}

interface TransactionFormData {
  property_id: string
  type: 'income' | 'expense'
  category: string
  amount: string
  description: string
  date: Date | undefined
}

export default function TransactionsPage() {
  const { currency } = useSettings()
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [properties] = useState(mockProperties)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [formData, setFormData] = useState<TransactionFormData>({
    property_id: '',
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: undefined
  })

  const resetForm = () => {
    setFormData({
      property_id: '',
      type: 'income',
      category: '',
      amount: '',
      description: '',
      date: undefined
    })
  }

  const handleAddTransaction = () => {
    setEditingTransaction(null)
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      property_id: transaction.property_id,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description,
      date: new Date(transaction.date)
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveTransaction = () => {
    const propertyName = properties.find(p => p.id === formData.property_id)?.name || ''

    const transactionData = {
      id: editingTransaction?.id || Date.now().toString(),
      property_id: formData.property_id,
      property_name: propertyName,
      type: formData.type,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date ? formData.date.toISOString().split('T')[0] : '',
      created_at: editingTransaction?.created_at || new Date().toISOString()
    }

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? transactionData : t))
    } else {
      setTransactions(prev => [...prev, transactionData])
    }

    setIsAddDialogOpen(false)
    resetForm()
    setEditingTransaction(null)
  }

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
  }

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true
    return transaction.type === activeTab
  })

  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Track income and expenses for your properties
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleAddTransaction}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {transactions.filter(t => t.type === 'income').length} transactions
            </p>
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
            <p className="text-xs text-muted-foreground">
              From {transactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit, currency)}
            </div>
            <p className="text-xs text-muted-foreground">
              {netProfit >= 0 ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View and manage all your property transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your property income and expenses
                  </p>
                  <Button onClick={handleAddTransaction}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Transaction
                  </Button>
                </div>
              ) : (
                <TransactionTable
                  transactions={filteredTransactions}
                  currency={currency}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? 'Update transaction details.'
                : 'Record a new income or expense transaction.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <Tabs
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({
                  ...prev,
                  type: value as 'income' | 'expense',
                  category: '' // Reset category when type changes
                }))}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income" className="text-green-600">Income</TabsTrigger>
                  <TabsTrigger value="expense" className="text-red-600">Expense</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Property and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency}) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker
                  date={formData.date}
                  onDateChange={(date) => setFormData(prev => ({ ...prev, date }))}
                  placeholder="Select transaction date"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the transaction..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveTransaction}
              disabled={!formData.property_id || !formData.category || !formData.amount || !formData.date}
            >
              {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Transaction Table Component
interface TransactionTableProps {
  transactions: Transaction[]
  currency: string
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

function TransactionTable({ transactions, currency, onEdit, onDelete }: TransactionTableProps) {
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue("date")),
    },
    {
      accessorKey: "property_name",
      header: "Property",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue("property_name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return (
          <Badge variant={type === 'income' ? 'default' : 'destructive'}>
            {type === 'income' ? 'Income' : 'Expense'}
          </Badge>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const type = row.original.type
        return (
          <div className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'income' ? '+' : '-'}{formatCurrency(amount, currency)}
          </div>
        )
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string
        return (
          <div className="max-w-[200px] truncate" title={description}>
            {description || '-'}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(transaction)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={transactions}
      searchKey="description"
      searchPlaceholder="Search transactions..."
    />
  )
}
