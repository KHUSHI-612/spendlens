import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// We use the service role key for admin-level inserts bypassing RLS since we don't have user auth
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Missing Supabase environment variables. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
