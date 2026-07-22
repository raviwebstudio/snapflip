import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSupabaseConnection() {
  try {
    // Perform a lightweight query to verify the connection
    const { error } = await supabase.from('users').select('id').limit(1);

    // If the error relates to network issues, it failed to connect.
    // Errors like "relation does not exist" still mean we successfully connected to the database.
    if (error && error.message.includes('Failed to fetch')) {
      console.error('Supabase connection failed:', error.message);
      return false;
    }

    console.log('Supabase Connected');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
}

// Run the health check
checkSupabaseConnection();
