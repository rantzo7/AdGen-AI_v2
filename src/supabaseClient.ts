import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('VITE_SUPABASE_URL:', supabaseUrl);
    console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or Anon Key is missing in environment variables. Please check your .env file and ensure Vite is configured correctly.');
      // Throw an error to prevent further execution if critical variables are missing
      throw new Error('Supabase environment variables are not loaded.');
    }

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
