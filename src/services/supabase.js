import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.SUPABASE_ANON_KEY

// Helper to ensure we don't crash if config is missing (useful during init/testing if vars not set)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key is missing. Check .env and app.config.js')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
