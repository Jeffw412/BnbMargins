'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/contexts/settings-context'
import { db } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Calendar, CalendarDays, DollarSign, Edit, Plus, Trash2, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'

// Database types
type DatabaseBooking = {
  id: string
  property_id: string
  user_id: string
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
  cancelled_at: string | null
  cancellation_reason: string | null
  refund_amount: number | null
  cancellation_fee: number | null
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
  const { user } = useAuth()
  const { currency } = useSettings()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<DatabaseProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [cancellationData, setCancellationData] = useState({
    reason: '',
    refund_amount: '',
    cancellation_fee: '0',
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
    notes: '',
  })

  // Load bookings and properties from database
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        // Load bookings
        const { data: bookingsData, error: bookingsError } = await db.bookings.getAll(user.id)
        if (bookingsError) {
          console.error('Error loading bookings:', bookingsError)
        } else {
          // Transform database bookings to component format
          const transformedBookings: Booking[] = bookingsData.map((booking: DatabaseBooking) => ({
            id: booking.id,
            property_id: booking.property_id,
            property_name: '', // Will be filled from properties
            guest_name: booking.guest_name,
            guest_email: booking.guest_email || '',
            guest_phone: booking.guest_phone || '',
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            nights: booking.nights,
            guests: booking.guests,
            total_amount: booking.total_amount,
            custom_rate: booking.custom_rate,
            status: booking.status,
            booking_source: booking.booking_source || '',
            notes: booking.notes || '',
            created_at: booking.created_at,
          }))
          setBookings(transformedBookings)
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
      notes: '',
    })
  }

  const calculateNights = (checkIn: Date, checkOut: Date): number => {
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const calculateDefaultRate = (propertyId: string, _checkIn: Date, _checkOut: Date): number => {
    const property = properties.find(p => p.id === propertyId)
    if (!property) return 150 // Default rate if property not found

    // For now, return a default rate since we don't have pricing info in the database yet
    // TODO: Add pricing information to the properties table
    return 150
  }

  const calculateTotalAmount = (): number => {
    if (!formData.check_in_date || !formData.check_out_date || !formData.property_id) return 0

    const nights = calculateNights(formData.check_in_date, formData.check_out_date)

    if (formData.use_custom_rate && formData.custom_rate) {
      return parseFloat(formData.custom_rate) * nights
    }

    const defaultRate = calculateDefaultRate(
      formData.property_id,
      formData.check_in_date,
      formData.check_out_date
    )
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
      notes: booking.notes || '',
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveBooking = async () => {
    if (!formData.check_in_date || !formData.check_out_date || !user?.id) return

    try {
      const nights = calculateNights(formData.check_in_date, formData.check_out_date)
      const totalAmount = calculateTotalAmount()
      const property = properties.find(p => p.id === formData.property_id)

      const bookingData = {
        user_id: user.id,
        property_id: formData.property_id,
        guest_name: formData.guest_name,
        guest_email: formData.guest_email || null,
        guest_phone: formData.guest_phone || null,
        check_in_date: formData.check_in_date.toISOString().split('T')[0],
        check_out_date: formData.check_out_date.toISOString().split('T')[0],
        nights,
        guests: parseInt(formData.guests),
        total_amount: totalAmount,
        custom_rate: formData.use_custom_rate ? parseFloat(formData.custom_rate) : null,
        status: 'confirmed' as const,
        booking_source: formData.booking_source || null,
        notes: formData.notes || null,
      }

      if (editingBooking) {
        // Update existing booking
        const { data, error } = await db.bookings.update(editingBooking.id, bookingData, user.id)
        if (error) {
          console.error('Error updating booking:', error)
          return
        }
        if (data) {
          const dbBooking = data as DatabaseBooking
          const updatedBooking: Booking = {
            id: dbBooking.id,
            property_id: dbBooking.property_id,
            property_name: property?.name || '',
            guest_name: dbBooking.guest_name,
            guest_email: dbBooking.guest_email || '',
            guest_phone: dbBooking.guest_phone || '',
            check_in_date: dbBooking.check_in_date,
            check_out_date: dbBooking.check_out_date,
            nights: dbBooking.nights,
            guests: dbBooking.guests,
            total_amount: dbBooking.total_amount,
            custom_rate: dbBooking.custom_rate,
            status: dbBooking.status,
            booking_source: dbBooking.booking_source || '',
            notes: dbBooking.notes || '',
            created_at: dbBooking.created_at,
          }
          setBookings(prev => prev.map(b => (b.id === editingBooking.id ? updatedBooking : b)))
        }
      } else {
        // Create new booking
        const { data, error } = await db.bookings.create(bookingData)
        if (error) {
          console.error('Error creating booking:', error)
          return
        }
        if (data) {
          const dbBooking = data as DatabaseBooking
          const newBooking: Booking = {
            id: dbBooking.id,
            property_id: dbBooking.property_id,
            property_name: property?.name || '',
            guest_name: dbBooking.guest_name,
            guest_email: dbBooking.guest_email || '',
            guest_phone: dbBooking.guest_phone || '',
            check_in_date: dbBooking.check_in_date,
            check_out_date: dbBooking.check_out_date,
            nights: dbBooking.nights,
            guests: dbBooking.guests,
            total_amount: dbBooking.total_amount,
            custom_rate: dbBooking.custom_rate,
            status: dbBooking.status,
            booking_source: dbBooking.booking_source || '',
            notes: dbBooking.notes || '',
            created_at: dbBooking.created_at,
          }
          setBookings(prev => [...prev, newBooking])
        }
      }

      setIsAddDialogOpen(false)
      resetForm()
      setEditingBooking(null)
    } catch (error) {
      console.error('Error saving booking:', error)
    }
  }

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setCancellingBooking(booking)
      setCancellationData({
        reason: '',
        refund_amount: booking.total_amount.toString(),
        cancellation_fee: '0',
      })
      setIsCancelDialogOpen(true)
    }
  }

  const handleConfirmCancellation = () => {
    if (!cancellingBooking) return

    const refundAmount = parseFloat(cancellationData.refund_amount) || 0
    const cancellationFee = parseFloat(cancellationData.cancellation_fee) || 0

    setBookings(prev =>
      prev.map(b =>
        b.id === cancellingBooking.id
          ? {
              ...b,
              status: 'cancelled' as const,
              cancelled_at: new Date().toISOString(),
              cancellation_reason: cancellationData.reason,
              refund_amount: refundAmount,
              cancellation_fee: cancellationFee,
            }
          : b
      )
    )

    setIsCancelDialogOpen(false)
    setCancellingBooking(null)
    setCancellationData({
      reason: '',
      refund_amount: '',
      cancellation_fee: '0',
    })
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!user?.id) return

    try {
      const { error } = await db.bookings.delete(bookingId, user.id)
      if (error) {
        console.error('Error deleting booking:', error)
        return
      }
      setBookings(prev => prev.filter(b => b.id !== bookingId))
    } catch (error) {
      console.error('Error deleting booking:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading bookings...</p>
          </CardContent>
        </Card>
      ) : /* Bookings List */
      bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CalendarDays className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Start by adding your first booking to track reservations and automatically generate
              income.
            </p>
            <Button onClick={handleAddBooking}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Booking
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map(booking => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle className="text-lg">{booking.guest_name}</CardTitle>
                      <p className="text-muted-foreground text-sm">{booking.property_name}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Edit</span>
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:ml-2">Cancel</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-2">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="text-muted-foreground mr-2 h-4 w-4" />
                      <span>
                        {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="text-muted-foreground mr-2 h-4 w-4" />
                      <span>
                        {booking.guests} guests • {booking.nights} nights
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="text-muted-foreground mr-2 h-4 w-4" />
                      <span className="font-medium">
                        {formatCurrency(booking.total_amount, currency)}
                      </span>
                      {booking.custom_rate && (
                        <Badge variant="outline" className="ml-2">
                          Custom Rate
                        </Badge>
                      )}
                    </div>
                    {booking.booking_source && (
                      <div className="text-muted-foreground text-sm">
                        Source: {booking.booking_source}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                    {booking.guest_email && (
                      <div className="text-muted-foreground text-sm">{booking.guest_email}</div>
                    )}
                    {booking.guest_phone && (
                      <div className="text-muted-foreground text-sm">{booking.guest_phone}</div>
                    )}
                  </div>
                </div>

                {booking.notes && (
                  <div className="bg-muted mt-4 rounded-lg p-3">
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
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBooking ? 'Edit Booking' : 'Add New Booking'}</DialogTitle>
            <DialogDescription>
              {editingBooking
                ? 'Update the booking information and details.'
                : 'Create a new booking and automatically generate income.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property_id">Property *</Label>
              <Select
                value={formData.property_id}
                onValueChange={value => setFormData(prev => ({ ...prev, property_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
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

            {/* Guest Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Guest Information</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest_name">Guest Name *</Label>
                  <Input
                    id="guest_name"
                    value={formData.guest_name}
                    onChange={e => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
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
                    onChange={e => setFormData(prev => ({ ...prev, guests: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guest_email">Email</Label>
                  <Input
                    id="guest_email"
                    type="email"
                    value={formData.guest_email}
                    onChange={e => setFormData(prev => ({ ...prev, guest_email: e.target.value }))}
                    placeholder="guest@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guest_phone">Phone</Label>
                  <Input
                    id="guest_phone"
                    value={formData.guest_phone}
                    onChange={e => setFormData(prev => ({ ...prev, guest_phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Booking Dates</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check_in_date">Check-in Date *</Label>
                  <DatePicker
                    date={formData.check_in_date}
                    onDateChange={date => setFormData(prev => ({ ...prev, check_in_date: date }))}
                    placeholder="Select check-in date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check_out_date">Check-out Date *</Label>
                  <DatePicker
                    date={formData.check_out_date}
                    onDateChange={date => setFormData(prev => ({ ...prev, check_out_date: date }))}
                    placeholder="Select check-out date"
                  />
                </div>
              </div>

              {formData.check_in_date && formData.check_out_date && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    <strong>Duration:</strong>{' '}
                    {calculateNights(formData.check_in_date, formData.check_out_date)} nights
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
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      use_custom_rate: e.target.checked,
                      custom_rate: e.target.checked ? prev.custom_rate : '',
                    }))
                  }
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
                    onChange={e => setFormData(prev => ({ ...prev, custom_rate: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              ) : (
                formData.property_id &&
                formData.check_in_date &&
                formData.check_out_date && (
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm">
                      <strong>Default Rate:</strong>{' '}
                      {formatCurrency(
                        calculateDefaultRate(
                          formData.property_id,
                          formData.check_in_date,
                          formData.check_out_date
                        ),
                        currency
                      )}
                      /night
                    </p>
                  </div>
                )
              )}

              {formData.check_in_date &&
                formData.check_out_date &&
                (formData.use_custom_rate ? formData.custom_rate : formData.property_id) && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <p className="text-sm font-medium text-green-800">
                      <strong>Total Amount:</strong>{' '}
                      {formatCurrency(calculateTotalAmount(), currency)}
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
                  onValueChange={value => setFormData(prev => ({ ...prev, booking_source: value }))}
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
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
        <DialogContent className="w-[95vw] max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Cancel the booking for {cancellingBooking?.guest_name} at{' '}
              {cancellingBooking?.property_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Booking Summary */}
            <div className="bg-muted/50 rounded-lg border p-4">
              <h4 className="mb-2 font-medium">Booking Details</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span>{cancellingBooking?.guest_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>
                    {cancellingBooking && formatDate(cancellingBooking.check_in_date)} -{' '}
                    {cancellingBooking && formatDate(cancellingBooking.check_out_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span>
                    {cancellingBooking && formatCurrency(cancellingBooking.total_amount, currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cancellation Reason */}
            <div className="space-y-2">
              <Label htmlFor="cancellation_reason">Cancellation Reason</Label>
              <Textarea
                id="cancellation_reason"
                value={cancellationData.reason}
                onChange={e => setCancellationData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Optional reason for cancellation..."
                rows={3}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="refund_amount">Refund Amount ({currency})</Label>
                <Input
                  id="refund_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={cancellingBooking?.total_amount || 0}
                  value={cancellationData.refund_amount}
                  onChange={e =>
                    setCancellationData(prev => ({ ...prev, refund_amount: e.target.value }))
                  }
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
                  onChange={e =>
                    setCancellationData(prev => ({ ...prev, cancellation_fee: e.target.value }))
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Net Calculation */}
            {cancellationData.refund_amount && (
              <div className="rounded-lg border bg-blue-50 p-3 dark:bg-blue-950/20">
                <div className="flex items-center justify-between text-sm">
                  <span>Net Refund:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (parseFloat(cancellationData.refund_amount) || 0) -
                        (parseFloat(cancellationData.cancellation_fee) || 0),
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
            <Button variant="destructive" onClick={handleConfirmCancellation}>
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
