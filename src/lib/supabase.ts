import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://etqdfxnyvrjyabjduhpk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0cWRmeG55dnJqeWFiamR1aHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyOTA5MDgsImV4cCI6MjA0ODg2NjkwOH0.Hg4Sr0s2yTuFkF6MOQkeSE6_WYm3Dx6e0YuohnS1xcQ";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);