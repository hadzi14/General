/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://owvtritrlenpqoabjqwu.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dnRyaXRybGVucHFvYWJqcXd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3ODM0NTMsImV4cCI6MjEwNDM1OTQ1M30.2hsUpAPKQhR5vqrEjQO-9iHQ7TGQj1_7mi44SfQlxs4';

export const supabase = createClient(supabaseUrl, supabaseKey);
