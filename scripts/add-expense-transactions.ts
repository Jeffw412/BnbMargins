import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/types/database'

// This script adds more expense transactions to align with dashboard charts
// Run with: npx tsx scripts/add-expense-transactions.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function addExpenseTransactions() {
  console.log('💰 Adding expense transactions...')

  try {
    // Target user ID for jeffw412@aol.com
    const targetUserId = '46587081-afc1-40cc-ac97-16c8518fe949'

    console.log('🔍 Fetching current properties...')

    // Get all properties for the user
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', targetUserId)

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }

    console.log(`Found ${properties?.length || 0} properties`)

    if (!properties || properties.length === 0) {
      console.log('No properties found. Please run the seed script first.')
      return
    }

    console.log('📝 Creating additional expense transactions...')

    const additionalTransactions = []

    // Downtown Loft additional expenses
    const downtownLoft = properties.find(p => p.name === 'Downtown Loft')
    if (downtownLoft) {
      additionalTransactions.push(
        // Insurance
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Insurance',
          amount: 150,
          description: 'Property insurance premium',
          date: '2024-01-01',
        },
        // Marketing
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Marketing',
          amount: 75,
          description: 'Airbnb listing promotion',
          date: '2024-01-05',
        },
        // Utilities
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Utilities',
          amount: 120,
          description: 'Electricity and gas bill',
          date: '2024-01-15',
        },
        // Maintenance
        {
          property_id: downtownLoft.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Maintenance',
          amount: 200,
          description: 'HVAC system maintenance',
          date: '2024-02-01',
        }
      )
    }

    // Beachside Villa additional expenses
    const beachsideVilla = properties.find(p => p.name === 'Beachside Villa')
    if (beachsideVilla) {
      additionalTransactions.push(
        // Insurance
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Insurance',
          amount: 250,
          description: 'Property and flood insurance',
          date: '2024-01-01',
        },
        // Marketing
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Marketing',
          amount: 125,
          description: 'Professional photography',
          date: '2024-01-08',
        },
        // Utilities
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Utilities',
          amount: 180,
          description: 'Water, electricity, and internet',
          date: '2024-01-15',
        },
        // Additional cleaning
        {
          property_id: beachsideVilla.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Cleaning',
          amount: 100,
          description: 'Deep cleaning service',
          date: '2024-02-05',
        }
      )
    }

    // Mountain Cabin additional expenses
    const mountainCabin = properties.find(p => p.name === 'Mountain Cabin')
    if (mountainCabin) {
      additionalTransactions.push(
        // Insurance
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Insurance',
          amount: 200,
          description: 'Property insurance and liability',
          date: '2024-01-01',
        },
        // Marketing
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Marketing',
          amount: 90,
          description: 'VRBO listing upgrade',
          date: '2024-01-10',
        },
        // Additional utilities
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Utilities',
          amount: 160,
          description: 'Heating, electricity, and snow removal',
          date: '2024-01-20',
        },
        // Maintenance
        {
          property_id: mountainCabin.id,
          user_id: targetUserId,
          type: 'expense' as const,
          category: 'Maintenance',
          amount: 180,
          description: 'Roof and gutter maintenance',
          date: '2024-02-10',
        }
      )
    }

    const { data: insertedTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .insert(additionalTransactions)
      .select()

    if (transactionsError) {
      console.error('Error inserting transactions:', transactionsError)
      throw transactionsError
    }

    console.log(`✅ Created ${insertedTransactions?.length || 0} additional expense transactions`)

    console.log('✅ Expense transactions added successfully!')
    console.log('')
    console.log('📝 Added expense categories:')
    console.log('- Insurance: Property and liability coverage')
    console.log('- Marketing: Listing promotions and photography')
    console.log('- Utilities: Electricity, water, heating, internet')
    console.log('- Maintenance: Property upkeep and repairs')
    console.log('- Cleaning: Professional cleaning services')
    console.log('')
    console.log('💡 Dashboard charts should now show aligned financial data!')
  } catch (error) {
    console.error('❌ Error adding expense transactions:', error)
    process.exit(1)
  }
}

// Run the function
addExpenseTransactions()
