import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/types/database'

// This script adds only booking data to existing properties
// Run with: npx tsx scripts/add-bookings-only.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function addBookingsOnly() {
  console.log('📅 Adding booking data only...')

  try {
    // Target user ID for jeffw412@aol.com
    const targetUserId = '46587081-afc1-40cc-ac97-16c8518fe949'

    console.log('🔍 Fetching existing properties...')

    // Get existing properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', targetUserId)

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }

    if (!properties || properties.length === 0) {
      console.log('❌ No properties found. Please run the seed script first.')
      return
    }

    console.log(`✅ Found ${properties.length} properties`)

    // Check if bookings already exist
    const { data: existingBookings, error: bookingsCheckError } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', targetUserId)

    if (bookingsCheckError) {
      console.error('Error checking existing bookings:', bookingsCheckError)
      throw bookingsCheckError
    }

    if (existingBookings && existingBookings.length > 0) {
      console.log(`Found ${existingBookings.length} existing bookings. Skipping booking creation.`)
      console.log('✅ Bookings already exist!')
      return
    }

    console.log('📝 Creating sample bookings...')

    // Find properties by name
    const downtownLoft = properties.find(p => p.name === 'Downtown Loft')
    const beachsideVilla = properties.find(p => p.name === 'Beachside Villa')
    const mountainCabin = properties.find(p => p.name === 'Mountain Cabin')

    const bookings = []

    // Downtown Loft bookings
    if (downtownLoft) {
      bookings.push(
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          guest_name: 'Sarah Johnson',
          guest_email: 'sarah.johnson@email.com',
          guest_phone: '+1 (555) 123-4567',
          check_in_date: '2024-01-15',
          check_out_date: '2024-01-20',
          nights: 5,
          guests: 2,
          total_amount: 1200,
          custom_rate: null,
          status: 'completed' as const,
          booking_source: 'Airbnb',
          notes: 'Early check-in requested',
        },
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          guest_name: 'Mike Chen',
          guest_email: 'mike.chen@email.com',
          guest_phone: '+1 (555) 987-6543',
          check_in_date: '2024-02-10',
          check_out_date: '2024-02-17',
          nights: 7,
          guests: 1,
          total_amount: 1800,
          custom_rate: null,
          status: 'completed' as const,
          booking_source: 'Airbnb',
          notes: 'Business traveler',
        },
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          guest_name: 'Emily Rodriguez',
          guest_email: 'emily.rodriguez@email.com',
          guest_phone: '+1 (555) 456-7890',
          check_in_date: '2024-12-28',
          check_out_date: '2025-01-02',
          nights: 5,
          guests: 3,
          total_amount: 1500,
          custom_rate: 300,
          status: 'confirmed' as const,
          booking_source: 'Direct',
          notes: 'New Year celebration',
        }
      )
    }

    // Beachside Villa bookings
    if (beachsideVilla) {
      bookings.push(
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          guest_name: 'David Wilson',
          guest_email: 'david.wilson@email.com',
          guest_phone: '+1 (555) 234-5678',
          check_in_date: '2024-01-18',
          check_out_date: '2024-01-25',
          nights: 7,
          guests: 6,
          total_amount: 2400,
          custom_rate: null,
          status: 'completed' as const,
          booking_source: 'Airbnb',
          notes: 'Family vacation',
        },
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          guest_name: 'Lisa Thompson',
          guest_email: 'lisa.thompson@email.com',
          guest_phone: '+1 (555) 345-6789',
          check_in_date: '2024-02-15',
          check_out_date: '2024-02-25',
          nights: 10,
          guests: 8,
          total_amount: 3200,
          custom_rate: null,
          status: 'completed' as const,
          booking_source: 'VRBO',
          notes: 'Anniversary celebration',
        },
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          guest_name: 'Robert Garcia',
          guest_email: 'robert.garcia@email.com',
          guest_phone: '+1 (555) 567-8901',
          check_in_date: '2025-01-05',
          check_out_date: '2025-01-12',
          nights: 7,
          guests: 4,
          total_amount: 2800,
          custom_rate: 400,
          status: 'confirmed' as const,
          booking_source: 'Direct',
          notes: 'Winter getaway',
        }
      )
    }

    // Mountain Cabin bookings
    if (mountainCabin) {
      bookings.push(
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          guest_name: 'Jennifer Lee',
          guest_email: 'jennifer.lee@email.com',
          guest_phone: '+1 (555) 678-9012',
          check_in_date: '2024-01-25',
          check_out_date: '2024-01-29',
          nights: 4,
          guests: 4,
          total_amount: 800,
          custom_rate: null,
          status: 'completed' as const,
          booking_source: 'Airbnb',
          notes: 'Ski weekend',
        },
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          guest_name: 'Mark Anderson',
          guest_email: 'mark.anderson@email.com',
          guest_phone: '+1 (555) 789-0123',
          check_in_date: '2024-02-20',
          check_out_date: '2024-02-26',
          nights: 6,
          guests: 5,
          total_amount: 1400,
          custom_rate: null,
          status: 'completed' as const,
          booking_source: 'Airbnb',
          notes: 'Mountain retreat',
        },
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          guest_name: 'Amanda Foster',
          guest_email: 'amanda.foster@email.com',
          guest_phone: '+1 (555) 890-1234',
          check_in_date: '2025-01-15',
          check_out_date: '2025-01-20',
          nights: 5,
          guests: 3,
          total_amount: 1250,
          custom_rate: 250,
          status: 'confirmed' as const,
          booking_source: 'VRBO',
          notes: 'Winter sports vacation',
        }
      )
    }

    const { data: insertedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookings)
      .select()

    if (bookingsError) {
      console.error('Error inserting bookings:', bookingsError)
      throw bookingsError
    }

    console.log(`✅ Created ${insertedBookings?.length || 0} bookings`)

    console.log('✅ Booking data added successfully!')
    console.log('')
    console.log('📝 Added bookings for user: jeffw412@aol.com')
    console.log('- Recent and upcoming reservations')
    console.log('- Various booking sources (Airbnb, VRBO, Direct)')
    console.log('- Mix of completed and confirmed statuses')
    console.log('')
    console.log('🎉 Recent Bookings section should now display data!')
  } catch (error) {
    console.error('❌ Error adding bookings:', error)
    process.exit(1)
  }
}

// Run the function
addBookingsOnly()
