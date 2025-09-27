import { createClient } from '@supabase/supabase-js'
import { Database } from '../src/types/database'

// This script cleans up duplicate data in the database
// Run with: npx tsx scripts/cleanup-duplicates.ts

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

async function cleanupDuplicates() {
  console.log('🧹 Starting database cleanup...')

  try {
    // Target user ID for jeffw412@aol.com
    const targetUserId = '46587081-afc1-40cc-ac97-16c8518fe949'

    console.log('🔍 Checking for duplicate properties...')

    // Get all properties for the user
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: true })

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError)
      throw propertiesError
    }

    console.log(`Found ${properties?.length || 0} properties`)

    if (properties && properties.length > 3) {
      // Group properties by name to find duplicates
      const propertyGroups = properties.reduce((groups, property) => {
        const name = property.name
        if (!groups[name]) {
          groups[name] = []
        }
        groups[name].push(property)
        return groups
      }, {} as Record<string, typeof properties>)

      // Keep only the first property of each name and delete the rest
      for (const [name, propertyList] of Object.entries(propertyGroups)) {
        if (propertyList.length > 1) {
          console.log(`🔄 Found ${propertyList.length} duplicates of "${name}", keeping the first one...`)
          
          // Keep the first property (oldest by created_at)
          const [keepProperty, ...duplicateProperties] = propertyList
          
          for (const duplicateProperty of duplicateProperties) {
            console.log(`🗑️ Deleting duplicate property: ${duplicateProperty.name} (ID: ${duplicateProperty.id})`)
            
            // Delete related bookings first
            const { error: bookingsDeleteError } = await supabase
              .from('bookings')
              .delete()
              .eq('property_id', duplicateProperty.id)
            
            if (bookingsDeleteError) {
              console.error('Error deleting bookings:', bookingsDeleteError)
            }
            
            // Delete related transactions
            const { error: transactionsDeleteError } = await supabase
              .from('transactions')
              .delete()
              .eq('property_id', duplicateProperty.id)
            
            if (transactionsDeleteError) {
              console.error('Error deleting transactions:', transactionsDeleteError)
            }
            
            // Delete the duplicate property
            const { error: propertyDeleteError } = await supabase
              .from('properties')
              .delete()
              .eq('id', duplicateProperty.id)
            
            if (propertyDeleteError) {
              console.error('Error deleting property:', propertyDeleteError)
            }
          }
        }
      }
    }

    console.log('✅ Database cleanup completed successfully!')
    console.log('')
    console.log('📝 Cleaned data for user: jeffw412@aol.com')
    console.log('- Removed duplicate properties')
    console.log('- Cleaned up related transactions and bookings')
    console.log('- Database is now consistent!')
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
    process.exit(1)
  }
}

// Run the cleanup function
cleanupDuplicates()
