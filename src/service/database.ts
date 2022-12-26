import {createClient} from "@supabase/supabase-js";

const supabase_url = "https://qtiudgyqrmmyhrmiuvbi.supabase.co"
const anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0aXVkZ3lxcm1teWhybWl1dmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzE5NzgxNTgsImV4cCI6MTk4NzU1NDE1OH0._MMZlVwzRWwtkXoMiAOTgptUN2YkaPDuBPZpPnIzGY0"
export const supabase = createClient(supabase_url, anon_key)