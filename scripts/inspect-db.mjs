import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDb() {
  const { data, error } = await supabase
    .from('storage_files')
    .select('*')
    .limit(10);

  if (error) {
    console.error("Database query failed:", error.message);
    process.exit(1);
  }

  console.log("Database records in storage_files:", JSON.stringify(data, null, 2));
}

inspectDb().catch(console.error);
