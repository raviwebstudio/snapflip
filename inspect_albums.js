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

async function inspect() {
  const { data: albums, error: albumErr } = await supabase
    .from('albums')
    .select('*, drafts(payload)');

  const { data: photos, error: photoErr } = await supabase
    .from('album_photos')
    .select('*');

  if (albumErr || photoErr) {
    console.error(albumErr || photoErr);
  } else {
    console.log("ALBUMS:", JSON.stringify(albums, null, 2));
    console.log("PHOTOS COUNT:", photos.length);
    console.log("PHOTOS:", JSON.stringify(photos, null, 2));
  }
}

inspect().catch(console.error);
