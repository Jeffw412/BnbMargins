"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSettings } from "@/contexts/settings-context"
import { formatCurrency } from "@/lib/utils"
import {
    Bath,
    Bed,
    Building2,
    Edit,
    MapPin,
    Plus,
    Star,
    Trash2,
    Users
} from 'lucide-react'
import { useState } from 'react'

// Mock data for demonstration - in real app this would come from Supabase
const mockProperties = [
  {
    id: '1',
    name: 'Downtown Loft',
    address: '123 Main St, Downtown, NY 10001',
    property_type: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    notes: 'Modern loft with city views',
    created_at: '2023-01-15T00:00:00Z',
    // Performance metrics
    monthly_revenue: 2800,
    monthly_expenses: 1900,
    occupancy_rate: 85,
    avg_rating: 4.9,
    total_reviews: 32,
    // Pricing information
    pricing_type: 'weekday_weekend' as const,
    weekday_rate: 120,
    weekend_rate: 150
  },
  {
    id: '2',
    name: 'Beachside Villa',
    address: '456 Ocean Ave, Miami Beach, FL 33139',
    property_type: 'house',
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    notes: 'Luxury villa steps from the beach',
    created_at: '2022-08-20T00:00:00Z',
    // Performance metrics
    monthly_revenue: 4200,
    monthly_expenses: 2800,
    occupancy_rate: 78,
    avg_rating: 4.7,
    total_reviews: 28,
    // Pricing information
    pricing_type: 'fixed' as const,
    base_rate: 180
  }
]

interface Property {
  id: string
  name: string
  address: string
  property_type: string
  bedrooms: number | null
  bathrooms: number | null
  max_guests: number | null
  notes: string | null
  created_at: string
  monthly_revenue?: number
  monthly_expenses?: number
  occupancy_rate?: number
  avg_rating?: number
  total_reviews?: number
  // Pricing information
  pricing_type?: 'fixed' | 'weekday_weekend' | 'seasonal' | 'seasonal_weekday_weekend'
  base_rate?: number
  weekday_rate?: number
  weekend_rate?: number
  seasonal_rates?: any
  seasonal_weekday_rates?: any
}

interface PropertyFormData {
  name: string
  address: string
  property_type: string
  bedrooms: string
  bathrooms: string
  max_guests: string
  notes: string
  // Pricing fields
  pricing_type: 'fixed' | 'weekday_weekend' | 'seasonal' | 'seasonal_weekday_weekend'
  base_rate: string
  weekday_rate: string
  weekend_rate: string
  // Seasonal pricing fields
  seasons: Array<{
    name: string
    start_date: string
    end_date: string
    weekday_rate: string
    weekend_rate: string
  }>
}

export default function PropertiesPage() {
  const { currency } = useSettings()
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [formData, setFormData] = useState<PropertyFormData>({
    name: '',
    address: '',
    property_type: '',
    bedrooms: '',
    bathrooms: '',
    max_guests: '',
    notes: '',
    pricing_type: 'fixed',
    base_rate: '',
    weekday_rate: '',
    weekend_rate: '',
    seasons: []
  })

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      property_type: '',
      bedrooms: '',
      bathrooms: '',
      max_guests: '',
      notes: '',
      pricing_type: 'fixed',
      base_rate: '',
      weekday_rate: '',
      weekend_rate: '',
      seasons: []
    })
  }

  const handleAddProperty = () => {
    setEditingProperty(null)
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property)
    setFormData({
      name: property.name,
      address: property.address,
      property_type: property.property_type,
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      max_guests: property.max_guests?.toString() || '',
      notes: property.notes || '',
      pricing_type: property.pricing_type || 'fixed',
      base_rate: property.base_rate?.toString() || '',
      weekday_rate: property.weekday_rate?.toString() || '',
      weekend_rate: property.weekend_rate?.toString() || ''
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveProperty = () => {
    // In real app, this would save to Supabase
    const propertyData = {
      id: editingProperty?.id || Date.now().toString(),
      name: formData.name,
      address: formData.address,
      property_type: formData.property_type,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
      max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
      notes: formData.notes,
      created_at: editingProperty?.created_at || new Date().toISOString(),
      // Pricing information
      pricing_type: formData.pricing_type,
      base_rate: formData.base_rate ? parseFloat(formData.base_rate) : undefined,
      weekday_rate: formData.weekday_rate ? parseFloat(formData.weekday_rate) : undefined,
      weekend_rate: formData.weekend_rate ? parseFloat(formData.weekend_rate) : undefined,
      // Keep existing metrics for edited properties
      ...(editingProperty && {
        monthly_revenue: editingProperty.monthly_revenue,
        monthly_expenses: editingProperty.monthly_expenses,
        occupancy_rate: editingProperty.occupancy_rate,
        avg_rating: editingProperty.avg_rating,
        total_reviews: editingProperty.total_reviews
      })
    }

    if (editingProperty) {
      setProperties(prev => prev.map(p => p.id === editingProperty.id ? propertyData : p))
    } else {
      setProperties(prev => [...prev, propertyData])
    }

    setIsAddDialogOpen(false)
    resetForm()
    setEditingProperty(null)
  }

  const handleDeleteProperty = (propertyId: string) => {
    // In real app, this would delete from Supabase
    setProperties(prev => prev.filter(p => p.id !== propertyId))
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment': return '🏢'
      case 'house': return '🏠'
      case 'condo': return '🏘️'
      case 'townhouse': return '🏘️'
      default: return '🏠'
    }
  }

  const getPropertyTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground">
            Manage your Airbnb properties and track their performance
          </p>
        </div>
        <Button onClick={handleAddProperty}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
          <p className="text-muted-foreground mb-4">
            Add your first Airbnb property to start tracking its performance
          </p>
          <Button onClick={handleAddProperty}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getPropertyTypeIcon(property.property_type)}</span>
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {getPropertyTypeLabel(property.property_type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{property.address}</span>
                </div>

                {/* Property Details */}
                <div className="flex items-center space-x-4 text-sm">
                  {property.bedrooms && (
                    <div className="flex items-center space-x-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center space-x-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.max_guests && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{property.max_guests}</span>
                    </div>
                  )}
                </div>

                {/* Performance Metrics */}
                {property.monthly_revenue && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(property.monthly_revenue, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Profit</span>
                      <span className="font-medium">
                        {formatCurrency((property.monthly_revenue || 0) - (property.monthly_expenses || 0), currency)}
                      </span>
                    </div>
                    {property.occupancy_rate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Occupancy</span>
                        <span className="font-medium">{property.occupancy_rate}%</span>
                      </div>
                    )}
                    {property.avg_rating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{property.avg_rating}</span>
                          <span className="text-muted-foreground">({property.total_reviews})</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pricing Info */}
                {(property.base_rate || property.weekday_rate || property.weekend_rate) && (
                  <div className="pt-2 border-t space-y-1">
                    {property.pricing_type === 'fixed' && property.base_rate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Daily Rate</span>
                        <span className="font-medium">
                          {formatCurrency(property.base_rate, currency)}/night
                        </span>
                      </div>
                    )}
                    {property.pricing_type === 'weekday_weekend' && (
                      <>
                        {property.weekday_rate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weekday Rate</span>
                            <span className="font-medium">
                              {formatCurrency(property.weekday_rate, currency)}/night
                            </span>
                          </div>
                        )}
                        {property.weekend_rate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Weekend Rate</span>
                            <span className="font-medium">
                              {formatCurrency(property.weekend_rate, currency)}/night
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Property Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProperty ? 'Edit Property' : 'Add New Property'}
            </DialogTitle>
            <DialogDescription>
              {editingProperty
                ? 'Update your property information and details.'
                : 'Add a new Airbnb property to track its performance.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Downtown Loft"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="condo">Condo</SelectItem>
                      <SelectItem value="townhouse">Townhouse</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full property address"
                  rows={2}
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_guests">Max Guests</Label>
                  <Input
                    id="max_guests"
                    type="number"
                    min="1"
                    value={formData.max_guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_guests: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing Information</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pricing_type">Pricing Type</Label>
                  <Select
                    value={formData.pricing_type}
                    onValueChange={(value: 'fixed' | 'weekday_weekend' | 'seasonal') =>
                      setFormData(prev => ({ ...prev, pricing_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Rate</SelectItem>
                      <SelectItem value="weekday_weekend">Weekday/Weekend Rates</SelectItem>
                      <SelectItem value="seasonal">Seasonal Rates (Simple)</SelectItem>
                      <SelectItem value="seasonal_weekday_weekend">Seasonal + Weekday/Weekend Rates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fixed Rate */}
                {formData.pricing_type === 'fixed' && (
                  <div className="space-y-2">
                    <Label htmlFor="base_rate">Daily Rate ({currency}) *</Label>
                    <Input
                      id="base_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.base_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, base_rate: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                )}

                {/* Weekday/Weekend Rates */}
                {formData.pricing_type === 'weekday_weekend' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekday_rate">Weekday Rate ({currency}) *</Label>
                      <Input
                        id="weekday_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.weekday_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekday_rate: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekend_rate">Weekend Rate ({currency}) *</Label>
                      <Input
                        id="weekend_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.weekend_rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, weekend_rate: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Seasonal Rates */}
                {formData.pricing_type === 'seasonal' && (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">
                        Simple seasonal pricing will be available in a future update. For now, please use "Seasonal + Weekday/Weekend Rates" for advanced seasonal pricing.
                      </p>
                    </div>
                  </div>
                )}

                {/* Enhanced Seasonal + Weekday/Weekend Rates */}
                {formData.pricing_type === 'seasonal_weekday_weekend' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Seasonal Pricing</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            seasons: [...prev.seasons, {
                              name: '',
                              start_date: '',
                              end_date: '',
                              weekday_rate: '',
                              weekend_rate: ''
                            }]
                          }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Season
                      </Button>
                    </div>

                    {formData.seasons.length === 0 && (
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">
                          Add seasonal pricing periods with different weekday and weekend rates.
                        </p>
                      </div>
                    )}

                    {formData.seasons.map((season, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Season {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                seasons: prev.seasons.filter((_, i) => i !== index)
                              }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Season Name *</Label>
                            <Input
                              value={season.name}
                              onChange={(e) => {
                                const newSeasons = [...formData.seasons]
                                newSeasons[index].name = e.target.value
                                setFormData(prev => ({ ...prev, seasons: newSeasons }))
                              }}
                              placeholder="e.g., High Season, Winter"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Input
                              type="date"
                              value={season.start_date}
                              onChange={(e) => {
                                const newSeasons = [...formData.seasons]
                                newSeasons[index].start_date = e.target.value
                                setFormData(prev => ({ ...prev, seasons: newSeasons }))
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Date *</Label>
                            <Input
                              type="date"
                              value={season.end_date}
                              onChange={(e) => {
                                const newSeasons = [...formData.seasons]
                                newSeasons[index].end_date = e.target.value
                                setFormData(prev => ({ ...prev, seasons: newSeasons }))
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Weekday Rate ({currency}) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={season.weekday_rate}
                              onChange={(e) => {
                                const newSeasons = [...formData.seasons]
                                newSeasons[index].weekday_rate = e.target.value
                                setFormData(prev => ({ ...prev, seasons: newSeasons }))
                              }}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Weekend Rate ({currency}) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={season.weekend_rate}
                              onChange={(e) => {
                                const newSeasons = [...formData.seasons]
                                newSeasons[index].weekend_rate = e.target.value
                                setFormData(prev => ({ ...prev, seasons: newSeasons }))
                              }}
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Fallback Rates */}
                    <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                      <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">Fallback Rates</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                        These rates will be used for dates not covered by any seasonal period.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fallback_weekday_rate" className="text-foreground">Fallback Weekday Rate ({currency}) *</Label>
                          <Input
                            id="fallback_weekday_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.weekday_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, weekday_rate: e.target.value }))}
                            placeholder="0.00"
                            className="bg-background text-foreground border-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fallback_weekend_rate" className="text-foreground">Fallback Weekend Rate ({currency}) *</Label>
                          <Input
                            id="fallback_weekend_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.weekend_rate}
                            onChange={(e) => setFormData(prev => ({ ...prev, weekend_rate: e.target.value }))}
                            placeholder="0.00"
                            className="bg-background text-foreground border-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this property..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProperty}
              disabled={
                !formData.name ||
                !formData.address ||
                !formData.property_type ||
                (formData.pricing_type === 'fixed' && !formData.base_rate) ||
                (formData.pricing_type === 'weekday_weekend' && (!formData.weekday_rate || !formData.weekend_rate)) ||
                (formData.pricing_type === 'seasonal_weekday_weekend' && (
                  !formData.weekday_rate ||
                  !formData.weekend_rate ||
                  formData.seasons.some(season =>
                    !season.name ||
                    !season.start_date ||
                    !season.end_date ||
                    !season.weekday_rate ||
                    !season.weekend_rate
                  )
                ))
              }
            >
              {editingProperty ? 'Update Property' : 'Add Property'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
