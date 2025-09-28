'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/contexts/settings-context'
import { db } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ColumnDef } from '@tanstack/react-table'
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
  Upload,
} from 'lucide-react'
import { useEffect, useState } from 'react'

// Database types
type DatabaseTransaction = {
  id: string
  property_id: string
  user_id: string
  booking_id: string | null
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string | null
  date: string
  receipt_url: string | null
  created_at: string
  updated_at: string
}

type DatabaseProperty = {
  id: string
  user_id: string
  name: string
  address: string
  property_type: string
  bedrooms: number | null
  bathrooms: number | null
  max_guests: number | null
  purchase_price: string | null
  purchase_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

const incomeCategories = [
  'Booking Revenue',
  'Cleaning Fees',
  'Security Deposit',
  'Extra Guest Fees',
  'Pet Fees',
  'Other Income',
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
  'Other Expenses',
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
  const { user } = useAuth()
  const { currency } = useSettings()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [properties, setProperties] = useState<DatabaseProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [formData, setFormData] = useState<TransactionFormData>({
    property_id: '',
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: undefined,
  })

  // Load transactions and properties from database
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // Load transactions
        const { data: transactionsData, error: transactionsError } = await db.transactions.getAll(
          user.id
        )
        if (transactionsError) {
          console.error('Error loading transactions:', transactionsError)
        } else {
          // Transform database transactions to component format
          const transformedTransactions: Transaction[] = transactionsData.map(
            (transaction: DatabaseTransaction) => ({
              id: transaction.id,
              property_id: transaction.property_id,
              property_name: '', // Will be filled from properties
              type: transaction.type,
              category: transaction.category,
              amount: transaction.amount,
              description: transaction.description || '',
              date: transaction.date,
              created_at: transaction.created_at,
            })
          )
          setTransactions(transformedTransactions)
        }

        // Load properties
        const { data: propertiesData, error: propertiesError } = await db.properties.getAll(user.id)
        if (propertiesError) {
          console.error('Error loading properties:', propertiesError)
        } else {
          setProperties(propertiesData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  // Update property names in transactions when properties are loaded
  useEffect(() => {
    if (properties.length > 0 && transactions.length > 0) {
      setTransactions(prev =>
        prev.map(transaction => ({
          ...transaction,
          property_name:
            properties.find(p => p.id === transaction.property_id)?.name || 'Unknown Property',
        }))
      )
    }
  }, [properties, transactions.length])

  const resetForm = () => {
    setFormData({
      property_id: '',
      type: 'income',
      category: '',
      amount: '',
      description: '',
      date: undefined,
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
      date: new Date(transaction.date),
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveTransaction = async () => {
    if (!user?.id || !formData.date) return

    try {
      const propertyName = properties.find(p => p.id === formData.property_id)?.name || ''

      const transactionData = {
        user_id: user.id,
        property_id: formData.property_id,
        booking_id: null,
        type: formData.type,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        date: formData.date.toISOString().split('T')[0],
      }

      if (editingTransaction) {
        // Update existing transaction
        const { data, error } = await db.transactions.update(
          editingTransaction.id,
          transactionData,
          user.id
        )
        if (error) {
          console.error('Error updating transaction:', error)
          return
        }
        if (data) {
          const dbTransaction = data as DatabaseTransaction
          const updatedTransaction: Transaction = {
            id: dbTransaction.id,
            property_id: dbTransaction.property_id,
            property_name: propertyName,
            type: dbTransaction.type,
            category: dbTransaction.category,
            amount: dbTransaction.amount,
            description: dbTransaction.description || '',
            date: dbTransaction.date,
            created_at: dbTransaction.created_at,
          }
          setTransactions(prev =>
            prev.map(t => (t.id === editingTransaction.id ? updatedTransaction : t))
          )
        }
      } else {
        // Create new transaction
        const { data, error } = await db.transactions.create(transactionData)
        if (error) {
          console.error('Error creating transaction:', error)
          return
        }
        if (data) {
          const dbTransaction = data as DatabaseTransaction
          const newTransaction: Transaction = {
            id: dbTransaction.id,
            property_id: dbTransaction.property_id,
            property_name: propertyName,
            type: dbTransaction.type,
            category: dbTransaction.category,
            amount: dbTransaction.amount,
            description: dbTransaction.description || '',
            date: dbTransaction.date,
            created_at: dbTransaction.created_at,
          }
          setTransactions(prev => [...prev, newTransaction])
        }
      }

      setIsAddDialogOpen(false)
      resetForm()
      setEditingTransaction(null)
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!user?.id) return

    try {
      const { error } = await db.transactions.delete(transactionId, user.id)
      if (error) {
        console.error('Error deleting transaction:', error)
        return
      }
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
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
          <p className="text-muted-foreground">Track income and expenses for your properties</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={handleAddTransaction}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, currency)}
            </div>
            <p className="text-muted-foreground text-xs">
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
            <p className="text-muted-foreground text-xs">
              From {transactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign
              className={`h-4 w-4 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(netProfit, currency)}
            </div>
            <p className="text-muted-foreground text-xs">
              {netProfit >= 0 ? 'Profit' : 'Loss'} this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View and manage all your property transactions</CardDescription>
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
                <div className="py-12 text-center">
                  <Receipt className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">No transactions yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your property income and expenses
                  </p>
                  <Button onClick={handleAddTransaction}>
                    <Plus className="mr-2 h-4 w-4" />
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
                : 'Record a new income or expense transaction.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Transaction Type *</Label>
              <Tabs
                value={formData.type}
                onValueChange={value =>
                  setFormData(prev => ({
                    ...prev,
                    type: value as 'income' | 'expense',
                    category: '', // Reset category when type changes
                  }))
                }
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income" className="text-green-600">
                    Income
                  </TabsTrigger>
                  <TabsTrigger value="expense" className="text-red-600">
                    Expense
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Property and Category */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="property">Property *</Label>
                <Select
                  value={formData.property_id}
                  onValueChange={value => setFormData(prev => ({ ...prev, property_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
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
                  onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'income' ? incomeCategories : expenseCategories).map(
                      category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ({currency}) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker
                  date={formData.date}
                  onDateChange={date => setFormData(prev => ({ ...prev, date }))}
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
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
              disabled={
                !formData.property_id || !formData.category || !formData.amount || !formData.date
              }
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
      accessorKey: 'date',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => formatDate(row.getValue('date')),
    },
    {
      accessorKey: 'property_name',
      header: 'Property',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Building2 className="text-muted-foreground h-4 w-4" />
          <span>{row.getValue('property_name')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string
        return (
          <Badge variant={type === 'income' ? 'default' : 'destructive'}>
            {type === 'income' ? 'Income' : 'Expense'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        const type = row.original.type
        return (
          <div className={`font-medium ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'income' ? '+' : '-'}
            {formatCurrency(amount, currency)}
          </div>
        )
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.getValue('description') as string
        return (
          <div className="max-w-[200px] truncate" title={description}>
            {description || '-'}
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(transaction)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(transaction.id)}>
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
