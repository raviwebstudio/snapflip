import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

/**
 * Generates valid mock PNG files for test file uploads
 */
export function createMockImages(count: number): string[] {
  const dir = path.join(process.cwd(), 'tests', 'fixtures');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");
  const paths: string[] = [];

  for (let i = 1; i <= count; i++) {
    const filePath = path.join(dir, `mock_photo_${i}.png`);
    // Append unique index string so that each file has a unique hash/checksum
    const uniqueBuffer = Buffer.concat([png, Buffer.from(`unique-${i}`)]);
    fs.writeFileSync(filePath, uniqueBuffer);
    paths.push(filePath);
  }

  return paths;
}

/**
 * Removes temporary mock images folder
 */
export function cleanupMockImages() {
  const dir = path.join(process.cwd(), 'tests', 'fixtures');
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(dir, file));
      } catch {
        // ignore
      }
    }
    try {
      fs.rmdirSync(dir);
    } catch {
      // ignore
    }
  }
}

function getSupabaseClient() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envConfig: Record<string, string> = {};
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

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials in .env");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function clearDatabase() {
  const supabase = getSupabaseClient();
  const userId = '11111111-1111-1111-1111-111111111111';

  // Ensure dev user exists in users table first
  await supabase.from('users').upsert({
    id: userId,
    email: 'dev-user@snapflip.com',
    name: 'Dev User',
    role: 'creator',
  });

  // Delete all albums for the dev user
  const { error } = await supabase
    .from('albums')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}

export async function seedDatabase() {
  const supabase = getSupabaseClient();
  const userId = '11111111-1111-1111-1111-111111111111';

  // Clear first
  await clearDatabase();

  const defaultAlbums = [
    {
      id: "33333333-3333-3333-3333-333333333333",
      title: "Wedding Collection",
      slug: "wedding-collection",
      status: "published",
      visibility: "public"
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      title: "Pre Wedding",
      slug: "pre-wedding",
      status: "published",
      visibility: "public"
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      title: "Reception Details",
      slug: "reception-details",
      status: "published",
      visibility: "public"
    },
    {
      id: "66666666-6666-6666-6666-666666666666",
      title: "Fashion Editorial",
      slug: "fashion-editorial",
      status: "published",
      visibility: "public"
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      title: "Aura Showcase",
      slug: "aura-showcase",
      status: "published",
      visibility: "public"
    }
  ];

  for (const album of defaultAlbums) {
    const { error: albumErr } = await supabase.from('albums').insert({
      id: album.id,
      user_id: userId,
      title: album.title,
      slug: album.slug,
      status: album.status,
      visibility: album.visibility
    });
    if (albumErr) throw albumErr;

    const payload = {
      id: album.id,
      name: album.title,
      coupleName: album.title === "Aura Showcase" ? "Aura Demo Portfolio" : "Sarah & Mark",
      eventType: album.title === "Fashion Editorial" ? "editorial" : "wedding",
      eventDate: "2026-06-12",
      coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400",
      photos: Array(5).fill(null).map((_, idx) => ({
        id: `photo-${album.id}-${idx}`,
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400",
        name: `photo-${idx}.jpg`,
        width: 1200,
        height: 800
      })),
      settings: {
        title: album.title,
        description: `${album.title} showcase`,
        theme: "dark",
        music: "fine-art",
        visibility: "Public",
        passcode: "",
        watermark: true,
        allowDownload: true,
        albumSize: "a4-landscape"
      },
      status: "Published",
      updated: "Just now",
      gradient: "from-[#0b3037] to-slate-900"
    };

    const { error: draftErr } = await supabase.from('drafts').insert({
      album_id: album.id,
      payload
    });
    if (draftErr) throw draftErr;
  }
}
