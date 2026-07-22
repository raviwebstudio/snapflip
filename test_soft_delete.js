import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envConfig[match[1]] = value.trim();
    }
  }
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const albumId = "33333333-3333-3333-3333-333333333333"; // Wedding Collection
  
  console.log("Checking current state of Wedding Collection...");
  const { data: before } = await supabase.from('albums').select('*').eq('id', albumId).single();
  console.log("Before soft delete:", before);

  console.log("Soft deleting Wedding Collection...");
  const { error: updateErr } = await supabase
    .from('albums')
    .update({ soft_delete_at: new Date().toISOString() })
    .eq('id', albumId);

  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log("Update succeeded!");
  }

  const { data: after } = await supabase.from('albums').select('*').eq('id', albumId).single();
  console.log("After soft delete:", after);
}

run().catch(console.error);
