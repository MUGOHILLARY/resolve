import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://vwwlubtvjgwxdrbhpqse.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3d2x1YnR2amd3eGRyYmhwcXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MDIyOTUsImV4cCI6MjEwMDA3ODI5NX0.7KYStsjoQ5bm2yleygakpWkJgwNFhMZ2nToxiFUogHk";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);