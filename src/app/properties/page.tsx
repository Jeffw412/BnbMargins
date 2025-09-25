'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { formatCurrency } from '@/lib/utils'
import { Bath, Bed, Building2, Edit, MapPin, Plus, Star, Trash2, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

// Property type from database
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
  const { user } = useAuth()
  const { currency } = useSettings()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
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
    seasons: [],
  })

  // Load properties from database
  useEffect(() => {
    const loadProperties = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await db.properties.getAll(user.id)
        if (error) {
          console.error('Error loading properties:', error)
        } else {
          // Transform database properties to component format
          const transformedProperties: Property[] = data.map((prop: DatabaseProperty) => ({
            id: prop.id,
            name: prop.name,
            address: prop.address,
            property_type: prop.property_type,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            max_guests: prop.max_guests,
            notes: prop.notes,
            created_at: prop.created_at,
            // TODO: Calculate these from transactions
            monthly_revenue: 0,
            monthly_expenses: 0,
            occupancy_rate: 0,
            avg_rating: 4.5,
            total_reviews: 0,
            pricing_type: 'fixed',
            base_rate: 150,
          }))
          setProperties(transformedProperties)
        }
      } catch (error) {
        console.error('Error loading properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [user?.id])

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
      seasons: [],
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
      weekend_rate: property.weekend_rate?.toString() || '',
      seasons: [],
    })
    setIsAddDialogOpen(true)
  }

  const handleSaveProperty = async () => {
    if (!user?.id) return

    try {
      const propertyData = {
        user_id: user.id,
        name: formData.name,
        address: formData.address,
        property_type: formData.property_type,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        max_guests: formData.max_guests ? parseInt(formData.max_guests) : null,
        notes: formData.notes || null,
      }

      if (editingProperty) {
        // Update existing property
        const { data, error } = await db.properties.update(
          editingProperty.id,
          propertyData,
          user.id
        )
        if (error) {
          console.error('Error updating property:', error)
          return
        }
        if (data) {
          const dbProperty = data as DatabaseProperty
          const updatedProperty: Property = {
            ...editingProperty,
            id: dbProperty.id,
            name: dbProperty.name,
            address: dbProperty.address,
            property_type: dbProperty.property_type,
            bedrooms: dbProperty.bedrooms,
            bathrooms: dbProperty.bathrooms,
            max_guests: dbProperty.max_guests,
            notes: dbProperty.notes,
            created_at: dbProperty.created_at,
            monthly_revenue: editingProperty.monthly_revenue,
            monthly_expenses: editingProperty.monthly_expenses,
            occupancy_rate: editingProperty.occupancy_rate,
            avg_rating: editingProperty.avg_rating,
            total_reviews: editingProperty.total_reviews,
          }
          setProperties(prev => prev.map(p => (p.id === editingProperty.id ? updatedProperty : p)))
        }
      } else {
        // Create new property
        const { data, error } = await db.properties.create(propertyData)
        if (error) {
          console.error('Error creating property:', error)
          return
        }
        if (data) {
          const dbProperty = data as DatabaseProperty
          const newProperty: Property = {
            id: dbProperty.id,
            name: dbProperty.name,
            address: dbProperty.address,
            property_type: dbProperty.property_type,
            bedrooms: dbProperty.bedrooms,
            bathrooms: dbProperty.bathrooms,
            max_guests: dbProperty.max_guests,
            notes: dbProperty.notes,
            created_at: dbProperty.created_at,
            monthly_revenue: 0,
            monthly_expenses: 0,
            occupancy_rate: 0,
            avg_rating: 4.5,
            total_reviews: 0,
            pricing_type: 'fixed',
            base_rate: 150,
          }
          setProperties(prev => [...prev, newProperty])
        }
      }

      setIsAddDialogOpen(false)
      resetForm()
      setEditingProperty(null)
    } catch (error) {
      console.error('Error saving property:', error)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!user?.id) return

    try {
      const { error } = await db.properties.delete(propertyId, user.id)
      if (error) {
        console.error('Error deleting property:', error)
        return
      }
      setProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case 'apartment':
        return '🏢'
      case 'house':
        return '🏠'
      case 'condo':
        return '🏘️'
      case 'townhouse':
        return '🏘️'
      default:
        return '🏠'
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
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h2 className="mb-2 text-xl font-semibold">No properties yet</h2>
          <p className="text-muted-foreground mb-4">
            Add your first Airbnb property to start tracking its performance
          </p>
          <Button onClick={handleAddProperty}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Property
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map(property => (
            <Card key={property.id} className="transition-shadow hover:shadow-lg">
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
                    <Button variant="ghost" size="sm" onClick={() => handleEditProperty(property)}>
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
                <div className="text-muted-foreground flex items-start space-x-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
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
                  <div className="space-y-2 border-t pt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(property.monthly_revenue, currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Profit</span>
                      <span className="font-medium">
                        {formatCurrency(
                          (property.monthly_revenue || 0) - (property.monthly_expenses || 0),
                          currency
                        )}
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
                  <div className="space-y-1 border-t pt-2">
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
            <DialogDescription>
              {editingProperty
                ? 'Update your property information and details.'
                : 'Add a new Airbnb property to track its performance.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Downtown Loft"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select
                    value={formData.property_type}
                    onValueChange={value =>
                      setFormData(prev => ({ ...prev, property_type: value }))
                    }
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
                  onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full property address"
                  rows={2}
                />
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={e => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
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
                    onChange={e => setFormData(prev => ({ ...prev, bathrooms: e.target.value }))}
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
                    onChange={e => setFormData(prev => ({ ...prev, max_guests: e.target.value }))}
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
                      <SelectItem value="seasonal_weekday_weekend">
                        Seasonal + Weekday/Weekend Rates
                      </SelectItem>
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
                      onChange={e => setFormData(prev => ({ ...prev, base_rate: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                )}

                {/* Weekday/Weekend Rates */}
                {formData.pricing_type === 'weekday_weekend' && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="weekday_rate">Weekday Rate ({currency}) *</Label>
                      <Input
                        id="weekday_rate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.weekday_rate}
                        onChange={e =>
                          setFormData(prev => ({ ...prev, weekday_rate: e.target.value }))
                        }
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
                        onChange={e =>
                          setFormData(prev => ({ ...prev, weekend_rate: e.target.value }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Seasonal Rates */}
                {formData.pricing_type === 'seasonal' && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg border p-4">
                      <p className="text-muted-foreground text-sm">
                        Simple seasonal pricing will be available in a future update. For now,
                        please use "Seasonal + Weekday/Weekend Rates" for advanced seasonal pricing.
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
                            seasons: [
                              ...prev.seasons,
                              {
                                name: '',
                                start_date: '',
                                end_date: '',
                                weekday_rate: '',
                                weekend_rate: '',
                              },
                            ],
                          }))
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Season
                      </Button>
                    </div>

                    {formData.seasons.length === 0 && (
                      <div className="bg-muted/50 rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Add seasonal pricing periods with different weekday and weekend rates.
                        </p>
                      </div>
                    )}

                    {formData.seasons.map((season, index) => (
                      <div key={index} className="space-y-4 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Season {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                seasons: prev.seasons.filter((_, i) => i !== index),
                              }))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Season Name *</Label>
                            <Input
                              value={season.name}
                              onChange={e => {
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
                              onChange={e => {
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
                              onChange={e => {
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
                              onChange={e => {
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
                              onChange={e => {
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
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                      <h4 className="mb-3 font-medium text-blue-900 dark:text-blue-100">
                        Fallback Rates
                      </h4>
                      <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
                        These rates will be used for dates not covered by any seasonal period.
                      </p>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="fallback_weekday_rate" className="text-foreground">
                            Fallback Weekday Rate ({currency}) *
                          </Label>
                          <Input
                            id="fallback_weekday_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.weekday_rate}
                            onChange={e =>
                              setFormData(prev => ({ ...prev, weekday_rate: e.target.value }))
                            }
                            placeholder="0.00"
                            className="bg-background text-foreground border-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fallback_weekend_rate" className="text-foreground">
                            Fallback Weekend Rate ({currency}) *
                          </Label>
                          <Input
                            id="fallback_weekend_rate"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.weekend_rate}
                            onChange={e =>
                              setFormData(prev => ({ ...prev, weekend_rate: e.target.value }))
                            }
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
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                (formData.pricing_type === 'weekday_weekend' &&
                  (!formData.weekday_rate || !formData.weekend_rate)) ||
                (formData.pricing_type === 'seasonal_weekday_weekend' &&
                  (!formData.weekday_rate ||
                    !formData.weekend_rate ||
                    formData.seasons.some(
                      season =>
                        !season.name ||
                        !season.start_date ||
                        !season.end_date ||
                        !season.weekday_rate ||
                        !season.weekend_rate
                    )))
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
