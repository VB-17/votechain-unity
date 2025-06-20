
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mobmmkkwlkoimmzvrbwn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vYm1ta2t3bGtvaW1tenZyYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMTk4MTAsImV4cCI6MjA1ODU5NTgxMH0.BGqaWlUdU5IwGYuAPESRsh3ueQWvp1B9HGyO41gK1uo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
