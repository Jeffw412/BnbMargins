import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/types/database'

// This script seeds the database with sample data for testing
// Run with: npx tsx scripts/seed-database.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Target user ID for jeffw412@aol.com
    const targetUserId = '46587081-afc1-40cc-ac97-16c8518fe949' // Actual user ID from Supabase auth

    console.log('🔍 Checking for existing data...')

    // Check if properties already exist
    const { data: existingProperties, error: checkError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', targetUserId)

    if (checkError) {
      console.error('Error checking existing properties:', checkError)
      throw checkError
    }

    if (existingProperties && existingProperties.length > 0) {
      console.log(
        `Found ${existingProperties.length} existing properties. Skipping property creation.`
      )
      console.log('✅ Database already seeded!')
      console.log('')
      console.log('📝 Existing data for user: jeffw412@aol.com')
      console.log(`- ${existingProperties.length} properties`)
      console.log('- Use cleanup script first if you want to re-seed')
      return
    }

    console.log('📝 Creating sample properties...')

    // Create sample properties
    const properties = [
      {
        user_id: targetUserId,
        name: 'Downtown Loft',
        address: '123 Main St, Downtown, NY 10001',
        property_type: 'apartment',
        bedrooms: 2,
        bathrooms: 1,
        max_guests: 4,
        purchase_price: 450000,
        purchase_date: '2023-01-15',
        notes: 'Modern loft in downtown area with great city views',
      },
      {
        user_id: targetUserId,
        name: 'Beachside Villa',
        address: '456 Ocean Drive, Miami Beach, FL 33139',
        property_type: 'house',
        bedrooms: 4,
        bathrooms: 3,
        max_guests: 8,
        purchase_price: 850000,
        purchase_date: '2022-06-20',
        notes: 'Luxury beachfront villa with private pool',
      },
      {
        user_id: targetUserId,
        name: 'Mountain Cabin',
        address: '789 Pine Ridge Rd, Aspen, CO 81611',
        property_type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        max_guests: 6,
        purchase_price: 650000,
        purchase_date: '2023-03-10',
        notes: 'Cozy mountain retreat with ski access',
      },
    ]

    const { data: insertedProperties, error: propertiesError } = await supabase
      .from('properties')
      .insert(properties)
      .select()

    if (propertiesError) {
      console.error('Error inserting properties:', propertiesError)
      throw propertiesError
    }

    console.log(`✅ Created ${insertedProperties?.length || 0} properties`)

    if (insertedProperties && insertedProperties.length > 0) {
      console.log('📝 Creating sample transactions...')

      // Create sample transactions for each property
      const transactions = []

      // Downtown Loft transactions
      const downtownLoft = insertedProperties.find(p => p.name === 'Downtown Loft')
      if (downtownLoft) {
        transactions.push(
          {
            property_id: downtownLoft.id,
            user_id: targetUserId,
            type: 'income' as const,
            category: 'Booking Revenue',
            amount: 1200,
            description: 'Airbnb booking - 5 nights',
            date: '2024-01-15',
          },
          {
            property_id: downtownLoft.id,
            user_id: targetUserId,
            type: 'expense' as const,
            category: 'Cleaning',
            amount: 80,
            description: 'Professional cleaning service',
            date: '2024-01-16',
          },
          {
            property_id: downtownLoft.id,
            user_id: targetUserId,
            type: 'income' as const,
            category: 'Booking Revenue',
            amount: 1800,
            description: 'Airbnb booking - 7 nights',
            date: '2024-02-10',
          }
        )
      }

      // Beachside Villa transactions
      const beachsideVilla = insertedProperties.find(p => p.name === 'Beachside Villa')
      if (beachsideVilla) {
        transactions.push(
          {
            property_id: beachsideVilla.id,
            user_id: targetUserId,
            type: 'income' as const,
            category: 'Booking Revenue',
            amount: 2400,
            description: 'Airbnb booking - 7 nights',
            date: '2024-01-18',
          },
          {
            property_id: beachsideVilla.id,
            user_id: targetUserId,
            type: 'expense' as const,
            category: 'Maintenance',
            amount: 150,
            description: 'Pool cleaning and maintenance',
            date: '2024-01-20',
          },
          {
            property_id: beachsideVilla.id,
            user_id: targetUserId,
            type: 'income' as const,
            category: 'Booking Revenue',
            amount: 3200,
            description: 'Airbnb booking - 10 nights',
            date: '2024-02-15',
          }
        )
      }

      // Mountain Cabin transactions
      const mountainCabin = insertedProperties.find(p => p.name === 'Mountain Cabin')
      if (mountainCabin) {
        transactions.push(
          {
            property_id: mountainCabin.id,
            user_id: targetUserId,
            type: 'income' as const,
            category: 'Booking Revenue',
            amount: 800,
            description: 'Airbnb booking - 4 nights',
            date: '2024-01-25',
          },
          {
            property_id: mountainCabin.id,
            user_id: targetUserId,
            type: 'expense' as const,
            category: 'Utilities',
            amount: 120,
            description: 'Heating and electricity',
            date: '2024-01-30',
          },
          {
            property_id: mountainCabin.id,
            user_id: targetUserId,
            type: 'income' as const,
            category: 'Booking Revenue',
            amount: 1400,
            description: 'Airbnb booking - 6 nights',
            date: '2024-02-20',
          }
        )
      }

      const { data: insertedTransactions, error: transactionsError } = await supabase
        .from('transactions')
        .insert(transactions)
        .select()

      if (transactionsError) {
        console.error('Error inserting transactions:', transactionsError)
        throw transactionsError
      }

      console.log(`✅ Created ${insertedTransactions?.length || 0} transactions`)

      console.log('📝 Creating sample bookings...')

      // Create sample bookings for each property
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
    }

    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('📝 Seeded data for user: jeffw412@aol.com')
    console.log('- 3 sample properties')
    console.log('- Sample transactions with income and expenses')
    console.log('- Sample bookings with recent and upcoming reservations')
    console.log('- Ready for testing reports and dashboard!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seeding function
seedDatabase()
