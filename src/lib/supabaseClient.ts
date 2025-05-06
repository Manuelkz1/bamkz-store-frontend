import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  console.warn('Supabase URL is not configured. Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.warn('Supabase Anon Key is not configured. Please add NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

