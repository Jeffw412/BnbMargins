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
    }

    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('📝 Seeded data for user: jeffw412@aol.com')
    console.log('- 3 sample properties')
    console.log('- Sample transactions with income and expenses')
    console.log('- Ready for testing reports!')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seeding function
seedDatabase()
