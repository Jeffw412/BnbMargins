import { Database } from '@/types/database'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// For server-side operations that require elevated permissions
export const createServerClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseServiceKey) {
    throw new Error('Missing Supabase service role key. Please check your .env.local file.')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Helper functions for common operations
export const auth = supabase.auth

// Database helpers
export const db = {
  // Properties
  properties: {
    getAll: (userId: string) =>
      supabase.from('properties').select('*').eq('user_id', userId),

    getById: (id: string, userId: string) =>
      supabase.from('properties').select('*').eq('id', id).eq('user_id', userId).single(),

    create: (property: Database['public']['Tables']['properties']['Insert']) =>
      supabase.from('properties').insert(property).select().single(),

    update: (id: string, updates: Database['public']['Tables']['properties']['Update'], userId: string) =>
      supabase.from('properties').update(updates).eq('id', id).eq('user_id', userId).select().single(),

    delete: (id: string, userId: string) =>
      supabase.from('properties').delete().eq('id', id).eq('user_id', userId)
  },

  // Transactions
  transactions: {
    getAll: (userId: string) =>
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),

    getByProperty: (propertyId: string, userId: string) =>
      supabase.from('transactions').select('*').eq('property_id', propertyId).eq('user_id', userId).order('date', { ascending: false }),

    getById: (id: string, userId: string) =>
      supabase.from('transactions').select('*').eq('id', id).eq('user_id', userId).single(),

    create: (transaction: Database['public']['Tables']['transactions']['Insert']) =>
      supabase.from('transactions').insert(transaction).select().single(),

    update: (id: string, updates: Database['public']['Tables']['transactions']['Update'], userId: string) =>
      supabase.from('transactions').update(updates).eq('id', id).eq('user_id', userId).select().single(),

    delete: (id: string, userId: string) =>
      supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
  },

  // Categories
  categories: {
    getAll: (userId: string) =>
      supabase.from('categories').select('*').eq('user_id', userId).order('name'),

    getByType: (type: 'income' | 'expense', userId: string) =>
      supabase.from('categories').select('*').eq('user_id', userId).eq('type', type).order('name'),

    create: (category: Database['public']['Tables']['categories']['Insert']) =>
      supabase.from('categories').insert(category).select().single(),

    update: (id: string, updates: Database['public']['Tables']['categories']['Update'], userId: string) =>
      supabase.from('categories').update(updates).eq('id', id).eq('user_id', userId).select().single(),

    delete: (id: string, userId: string) =>
      supabase.from('categories').delete().eq('id', id).eq('user_id', userId)
  },

  // Profiles
  profiles: {
    get: (userId: string) =>
      supabase.from('profiles').select('*').eq('id', userId).single(),

    update: (userId: string, updates: Database['public']['Tables']['profiles']['Update']) =>
      supabase.from('profiles').update(updates).eq('id', userId).select().single()
  }
}

// Auth helpers
export const authHelpers = {
  signUp: async (email: string, password: string, fullName?: string) => {
    return await auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await auth.signInWithPassword({ email, password })
  },

  signOut: async () => {
    return await auth.signOut()
  },

  getCurrentUser: async () => {
    const { data: { user } } = await auth.getUser()
    return user
  },

  getCurrentSession: async () => {
    const { data: { session } } = await auth.getSession()
    return session
  }
}

export default supabase
