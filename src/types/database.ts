export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          property_type: string
          bedrooms: number | null
          bathrooms: number | null
          max_guests: number | null
          purchase_price: number | null
          purchase_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          property_type: string
          bedrooms?: number | null
          bathrooms?: number | null
          max_guests?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          property_type?: string
          bedrooms?: number | null
          bathrooms?: number | null
          max_guests?: number | null
          purchase_price?: number | null
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      property_pricing: {
        Row: {
          id: string
          property_id: string
          user_id: string
          pricing_type: 'fixed' | 'weekday_weekend' | 'seasonal' | 'seasonal_weekday_weekend'
          base_rate: number
          weekday_rate: number | null
          weekend_rate: number | null
          seasonal_rates: any | null
          seasonal_weekday_rates: any | null
          seasonal_weekend_rates: any | null
          default_season_name: string | null
          currency: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          pricing_type: 'fixed' | 'weekday_weekend' | 'seasonal'
          base_rate: number
          weekday_rate?: number | null
          weekend_rate?: number | null
          seasonal_rates?: any | null
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          pricing_type?: 'fixed' | 'weekday_weekend' | 'seasonal' | 'seasonal_weekday_weekend'
          base_rate?: number
          weekday_rate?: number | null
          weekend_rate?: number | null
          seasonal_rates?: any | null
          seasonal_weekday_rates?: any | null
          seasonal_weekend_rates?: any | null
          default_season_name?: string | null
          currency?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
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
        Insert: {
          id?: string
          property_id: string
          user_id: string
          guest_name: string
          guest_email?: string | null
          guest_phone?: string | null
          check_in_date: string
          check_out_date: string
          nights: number
          guests: number
          total_amount: number
          custom_rate?: number | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          booking_source?: string | null
          notes?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          refund_amount?: number | null
          cancellation_fee?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          guest_name?: string
          guest_email?: string | null
          guest_phone?: string | null
          check_in_date?: string
          check_out_date?: string
          nights?: number
          guests?: number
          total_amount?: number
          custom_rate?: number | null
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          booking_source?: string | null
          notes?: string | null
          cancelled_at?: string | null
          cancellation_reason?: string | null
          refund_amount?: number | null
          cancellation_fee?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
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
        Insert: {
          id?: string
          property_id: string
          user_id: string
          booking_id?: string | null
          type: 'income' | 'expense'
          category: string
          amount: number
          description?: string | null
          date: string
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          booking_id?: string | null
          type?: 'income' | 'expense'
          category?: string
          amount?: number
          description?: string | null
          date?: string
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      transaction_type: 'income' | 'expense'
      property_type: 'apartment' | 'house' | 'condo' | 'townhouse' | 'other'
      pricing_type: 'fixed' | 'weekday_weekend' | 'seasonal'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    }
  }
}
