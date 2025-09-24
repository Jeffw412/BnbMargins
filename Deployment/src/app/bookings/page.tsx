"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSettings } from "@/contexts/settings-context"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
    Calendar,
    CalendarDays,
    DollarSign,
    Edit,
    Plus,
    Trash2,
    Users,
    X
} from 'lucide-react'
import { useState } from 'react'

// Mock data for demonstration - in real app this would come from Supabase
const mockBookings = [
  {
    id: '1',
    property_id: '1',
    property_name: 'Downtown Loft',
    guest_name: 'Sarah Johnson',
    guest_email: 'sarah.johnson@email.com',
    guest_phone: '+1 (555) 123-4567',
    check_in_date: '2024-01-15',
    check_out_date: '2024-01-18',
    nights: 3,
    guests: 2,
    total_amount: 480.00,
    custom_rate: null,
    status: 'confirmed' as const,
    booking_source: 'Airbnb',
    notes: 'Early check-in requested',
    created_at: '2024-01-10T00:00:00Z'
  },
  {
    id: '2',
    property_id: '2',
    property_name: 'Beachside Villa',
    guest_name: 'Mike Chen',
    guest_email: 'mike.chen@email.com',
    guest_phone: '+1 (555) 987-6543',
    check_in_date: '2024-01-20',
    check_out_date: '2024-01-25',
    nights: 5,
    guests: 4,
    total_amount: 900.00,
    custom_rate: 180.00,
    status: 'confirmed' as const,
    booking_source: 'Direct',
    notes: 'Anniversary celebration',
    created_at: '2024-01-12T00:00:00Z'
  }
]

const mockProperties = [
  {
    id: '1',
    name: 'Downtown Loft',
    pricing_type: 'weekday_weekend' as const,
    weekday_rate: 120,
    weekend_rate: 150
  },
  {
    id: '2',
    name: 'Beachside Villa',
    pricing_type: 'fixed' as const,
    base_rate: 180
  }
]

interface Booking {
  id: string
  property_id: string
  property_name: string
  guest_name: string
  guest_email: string | null
  guest_phone: string | null
  check_in_date: string
  check_out_date: string
  nights: number
  guests: number
  total_amount: number
  custom_rate: number | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  booking_source: string | null
  notes: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
  refund_amount?: number | null
  cancellation_fee?: number | null
  created_at: string
}

interface BookingFormData {
  property_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in_date: Date | undefined
  check_out_date: Date | undefined
  guests: string
  use_custom_rate: boolean
  custom_rate: string
  booking_source: string
  notes: string
}

export default function BookingsPage() {
  const { currency } = useSettings()
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [cancellationData, setCancellationData] = useState({
    reason: '',
    refund_amount: '',
    cancellation_fee: '0'
  })
  const [formData, setFormData] = useState<BookingFormData>({
    property_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: undefined,
    check_out_date: undefined,
    guests: '',
    use_custom_rate: false,
    custom_rate: '',
    booking_source: '',
    notes: ''
  })

  const resetForm = () => {
    setFormData({
      property_id: '',
      guest_name: '',
      guest_email: '',
      guest_phone: '',
      check_in_date: undefined,
      check_out_date: undefined,
      guests: '',
      use_custom_rate: false,
      custom_rate: '',
      booking_source: '',
      notes: ''
    })
  }

  const calculateNights = (checkIn: Date, checkOut: Date): number => {
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const calculateDefaultRate = (propertyId: string, checkIn: Date, checkOut: Date): number => {
    const property = mockProperties.find(p => p.id === propertyId)
    if (!property) return 0

    if (property.pricing_type === 'fixed') {
      return property.base_rate || 0
    }

    if (property.pricing_type === 'weekday_weekend') {
      const nights = calculateNights(checkIn, checkOut)
      let totalRate = 0
      
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(checkIn)
        currentDate.setDate(currentDate.getDate() + i)
        const dayOfWeek = currentDate.getDay()
        
        // Weekend: Friday (5) and Saturday (6)
        if (dayOfWeek === 5 || dayOfWeek === 6) {
          totalRate += property.weekend_rate || 0
        } else {
          totalRate += property.weekday_rate || 0
        }
      }
      
      return totalRate / nights // Return average rate per night
    }

    return 0
  }

  const calculateTotalAmount = (): number => {
    if (!formData.check_in_date || !formData.check_out_date || !formData.property_id) return 0
    
    const nights = calculateNights(formData.check_in_date, formData.check_out_date)
    
    if (formData.use_custom_rate && formData.custom_rate) {
      return parseFloat(formData.custom_rate) * nights
    }
    
    const defaultRate = calculateDefaultRate(formData.property_id, formData.check_in_date, formData.check_out_date)
    return defaultRate * nights
  }

  const handleAddBooking = () => {
    setEditingBooking(null)
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking)
    setFormData({
      property_id: booking.property_id,
      guest_name: booking.guest_name,
      guest_email: booking.guest_email || '',
      guest_phone: booking.guest_phone || '',
      check_in_date: new Date(booking.check_in_date),
      check_out_date: new Date(booking.check_out_date),
      guests: booking.guests.toString(),
      use_custom_rate: booking.custom_rate !== null,
      custom_rate: booking.custom_rate?.toString() || '',
      booking_source: booking.booking_source || '',
      notes: booking.notes || ''
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveBooking = () => {
    if (!formData.check_in_date || !formData.check_out_date) return

    const nights = calculateNights(formData.check_in_date, formData.check_out_date)
    const totalAmount = calculateTotalAmount()
    const property = mockProperties.find(p => p.id === formData.property_id)

    const bookingData: Booking = {
      id: editingBooking?.id || Date.now().toString(),
      property_id: formData.property_id,
      property_name: property?.name || '',
      guest_name: formData.guest_name,
      guest_email: formData.guest_email || null,
      guest_phone: formData.guest_phone || null,
      check_in_date: formData.check_in_date.toISOString().split('T')[0],
      check_out_date: formData.check_out_date.toISOString().split('T')[0],
      nights,
      guests: parseInt(formData.guests),
      total_amount: totalAmount,
      custom_rate: formData.use_custom_rate ? parseFloat(formData.custom_rate) : null,
      status: 'confirmed',
      booking_source: formData.booking_source || null,
      notes: formData.notes || null,
      created_at: editingBooking?.created_at || new Date().toISOString()
    }

    if (editingBooking) {
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? bookingData : b))
    } else {
      setBookings(prev => [...prev, bookingData])
    }

    setIsAddDialogOpen(false)
    resetForm()
    setEditingBooking(null)
  }

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setCancellingBooking(booking)
      setCancellationData({
        reason: '',
        refund_amount: booking.total_amount.toString(),
        cancellation_fee: '0'
      })
      setIsCancelDialogOpen(true)
    }
  }

  const handleConfirmCancellation = () => {
    if (!cancellingBooking) return

    const refundAmount = parseFloat(cancellationData.refund_amount) || 0
    const cancellationFee = parseFloat(cancellationData.cancellation_fee) || 0

    setBookings(prev => prev.map(b =>
      b.id === cancellingBooking.id ? {
        ...b,
        status: 'cancelled' as const,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: cancellationData.reason,
        refund_amount: refundAmount,
        cancellation_fee: cancellationFee
      } : b
    ))

    setIsCancelDialogOpen(false)
    setCancellingBooking(null)
    setCancellationData({
      reason: '',
      refund_amount: '',
      cancellation_fee: '0'
    })
  }

  const handleDeleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your property reservations and guest bookings
          </p>
        </div>
        <Button onClick={handleAddBooking}>
          <Plus className="mr-2 h-4 w-4" />
          Add Booking
        </Button>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding your first booking to track reservations and automatically generate income.
            </p>
            <Button onClick={handleAddBooking}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Booking
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle className="text-lg">{booking.guest_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{booking.property_name}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditBooking(booking)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{booking.guests} guests • {booking.nights} nights</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatCurrency(booking.total_amount, currency)}
                      </span>
                      {booking.custom_rate && (
                        <Badge variant="outline" className="ml-2">Custom Rate</Badge>
                      )}
                    </div>
                    {booking.booking_source && (
                      <div className="text-sm text-muted-foreground">
                        Source: {booking.booking_source}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {booking.guest_email && (
                      <div className="text-sm text-muted-foreground">
                        {booking.guest_email}
                      </div>
                    )}
                    {booking.guest_phone && (
                      <div className="text-sm text-muted-foreground">
                        {booking.guest_phone}
                      </div>
                    )}
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Booking Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBooking ? 'Edit Booking' : 'Add New Booking'}
            </DialogTitle>
            <DialogDescription>
              {editingBooking
                ? 'Update the booking information and details.'
                : 'Create a new booking and automatically generate income.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property_id">Property *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {mockProperties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Guest Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest_name">Guest Name *</Label>
                  <Input
                    id="guest_name"
                    value={formData.guest_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests *</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest_email">Email</Label>
                  <Input
                    id="guest_email"
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_email: e.target.value }))}
                    placeholder="guest@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest_phone">Phone</Label>
                  <Input
                    id="guest_phone"
                    value={formData.guest_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, guest_phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Booking Dates</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in_date">Check-in Date *</Label>
                  <DatePicker
                    date={formData.check_in_date}
                    onDateChange={(date) => setFormData(prev => ({ ...prev, check_in_date: date }))}
                    placeholder="Select check-in date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check_out_date">Check-out Date *</Label>
                  <DatePicker
                    date={formData.check_out_date}
                    onDateChange={(date) => setFormData(prev => ({ ...prev, check_out_date: date }))}
                    placeholder="Select check-out date"
                  />
                </div>
              </div>

              {formData.check_in_date && formData.check_out_date && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Duration:</strong> {calculateNights(formData.check_in_date, formData.check_out_date)} nights
                  </p>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="use_custom_rate"
                  checked={formData.use_custom_rate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    use_custom_rate: e.target.checked,
                    custom_rate: e.target.checked ? prev.custom_rate : ''
                  }))}
                />
                <Label htmlFor="use_custom_rate">Use custom rate instead of default pricing</Label>
              </div>

              {formData.use_custom_rate ? (
                <div className="space-y-2">
                  <Label htmlFor="custom_rate">Custom Rate per Night ({currency}) *</Label>
                  <Input
                    id="custom_rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.custom_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_rate: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                formData.property_id && formData.check_in_date && formData.check_out_date && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Default Rate:</strong> {formatCurrency(
                        calculateDefaultRate(formData.property_id, formData.check_in_date, formData.check_out_date),
                        currency
                      )}/night
                    </p>
                  </div>
                )
              )}

              {formData.check_in_date && formData.check_out_date && (formData.use_custom_rate ? formData.custom_rate : formData.property_id) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    <strong>Total Amount:</strong> {formatCurrency(calculateTotalAmount(), currency)}
                  </p>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>

              <div className="space-y-2">
                <Label htmlFor="booking_source">Booking Source</Label>
                <Select
                  value={formData.booking_source}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, booking_source: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Airbnb">Airbnb</SelectItem>
                    <SelectItem value="VRBO">VRBO</SelectItem>
                    <SelectItem value="Booking.com">Booking.com</SelectItem>
                    <SelectItem value="Direct">Direct Booking</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special requests, notes, or additional information..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveBooking}
              disabled={
                !formData.property_id ||
                !formData.guest_name ||
                !formData.guests ||
                !formData.check_in_date ||
                !formData.check_out_date ||
                (formData.use_custom_rate && !formData.custom_rate)
              }
            >
              {editingBooking ? 'Update Booking' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Cancel the booking for {cancellingBooking?.guest_name} at {cancellingBooking?.property_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Booking Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span>{cancellingBooking?.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>
                    {cancellingBooking && formatDate(cancellingBooking.check_in_date)} - {cancellingBooking && formatDate(cancellingBooking.check_out_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>{cancellingBooking && formatCurrency(cancellingBooking.total_amount, currency)}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason">Cancellation Reason</Label>
              <Textarea
                id="cancellation_reason"
                value={cancellationData.reason}
                onChange={(e) => setCancellationData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Optional reason for cancellation..."
                rows={3}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="refund_amount">Refund Amount ({currency})</Label>
                <Input
                  id="refund_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={cancellingBooking?.total_amount || 0}
                  value={cancellationData.refund_amount}
                  onChange={(e) => setCancellationData(prev => ({ ...prev, refund_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancellation_fee">Cancellation Fee ({currency})</Label>
                <Input
                  id="cancellation_fee"
                  type="number"
                  step="0.01"
                  min="0"
                  value={cancellationData.cancellation_fee}
                  onChange={(e) => setCancellationData(prev => ({ ...prev, cancellation_fee: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Net Calculation */}
            {cancellationData.refund_amount && (
              <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex justify-between items-center text-sm">
                  <span>Net Refund:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (parseFloat(cancellationData.refund_amount) || 0) - (parseFloat(cancellationData.cancellation_fee) || 0),
                      currency
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancellation}
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
