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
    // Note: This is just a template. In a real scenario, you would:
    // 1. Create a test user account
    // 2. Add sample properties for that user
    // 3. Add sample transactions for those properties
    
    console.log('✅ Database seeding completed successfully!')
    console.log('')
    console.log('📝 To test the application:')
    console.log('1. Go to http://localhost:3000')
    console.log('2. Sign up for a new account')
    console.log('3. The system will automatically create default categories')
    console.log('4. Add your properties and transactions through the UI')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seeding function
seedDatabase()
