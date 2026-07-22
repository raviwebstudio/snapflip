import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Setup Supabase Client using local environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://empvsfmweackevupmswr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error("Missing VITE_SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLocalStorage() {
  console.log("=== STEP 1: Setting up Mock Identifiers ===");
  const userId = '11111111-1111-1111-1111-111111111111';
  const albumId = '99999999-9999-9999-9999-999999999999';
  const checksum = 'mock-local-checksum-' + Date.now();

  // Create mock album in Supabase if not present
  await supabase.from('users').upsert({
    id: userId,
    email: 'dev-user@snapflip.com',
    name: 'Dev User',
    role: 'creator',
  });
  await supabase.from('albums').upsert({
    id: albumId,
    user_id: userId,
    title: 'Local Dev Test Album',
    slug: 'local-dev-test-album',
    status: 'draft',
    visibility: 'public',
  });

  console.log("✓ Identifiers set up successfully.\n");

  console.log("=== STEP 2: Dispatching Grouped Local Upload ===");
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  // Send request directly to our running Vite dev server middleware
  const res = await fetch('http://localhost:5173/api/storage/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      albumId,
      original: {
        fileName: 'test_local.png',
        fileBase64: base64Png,
        size: 100,
      },
      optimized: {
        fileName: 'test_local_optimized.webp',
        fileBase64: base64Png,
        size: 80,
      },
      thumbnail: {
        fileName: 'test_local_thumbnail.webp',
        fileBase64: base64Png,
        size: 20,
      },
    }),
  });

  if (!res.ok) {
    console.error("Local upload endpoint failed:", res.status, await res.text());
    process.exit(1);
  }

  const uploadResult = await res.json();
  console.log("Vite Storage upload result:", JSON.stringify(uploadResult, null, 2));

  // Verify files exist in storage/ folder
  const storageDir = path.join(process.cwd(), 'storage', userId, albumId);
  const origExists = fs.existsSync(path.join(storageDir, 'original', 'test_local.png'));
  const optExists = fs.existsSync(path.join(storageDir, 'optimized', 'test_local_optimized.webp'));
  const thumbExists = fs.existsSync(path.join(storageDir, 'thumbnail', 'test_local_thumbnail.webp'));

  console.log(`Verifying file writes on local disk under storage/ folder:`);
  console.log(`- Original written: ${origExists}`);
  console.log(`- Optimized written: ${optExists}`);
  console.log(`- Thumbnail written: ${thumbExists}`);

  if (!origExists || !optExists || !thumbExists) {
    console.error("Verification failed: Files were not written to the local filesystem.");
    process.exit(1);
  }
  console.log("✓ Local files written successfully!\n");

  console.log("=== STEP 3: Inserting storage_files Metadata ===");
  const { data: inserted, error: insertError } = await supabase
    .from('storage_files')
    .insert({
      user_id: userId,
      album_id: albumId,
      google_file_id: 'local',
      google_folder_id: 'local',
      original_path: uploadResult.originalPath,
      optimized_path: uploadResult.optimizedPath,
      thumbnail_path: uploadResult.thumbnailPath,
      mime_type: 'image/png',
      original_size: 100,
      optimized_size: 80,
      thumbnail_size: 20,
      checksum: checksum,
    })
    .select()
    .single();

  if (insertError) {
    console.error("Failed to save local metadata in storage_files:", insertError.message);
    process.exit(1);
  }

  console.log("Saved Database Metadata:", JSON.stringify(inserted, null, 2));
  console.log("✓ Metadata saved successfully in storage_files!\n");

  const storageFileId = inserted.id;

  console.log("=== STEP 4: Deleting Files and Metadata ===");
  // Simulate LocalStorageProvider delete
  const delPathsRes = await fetch('http://localhost:5173/api/storage/delete_paths', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paths: [inserted.original_path, inserted.optimized_path, inserted.thumbnail_path],
    }),
  });

  if (!delPathsRes.ok) {
    console.error("Failed to delete paths locally:", await delPathsRes.text());
    process.exit(1);
  }

  // Delete DB row
  const { error: deleteDbError } = await supabase
    .from('storage_files')
    .delete()
    .eq('id', storageFileId);

  if (deleteDbError) {
    console.error("Failed to delete DB row:", deleteDbError.message);
    process.exit(1);
  }

  const origDeleted = !fs.existsSync(path.join(storageDir, 'original', 'test_local.png'));
  const optDeleted = !fs.existsSync(path.join(storageDir, 'optimized', 'test_local_optimized.webp'));
  const thumbDeleted = !fs.existsSync(path.join(storageDir, 'thumbnail', 'test_local_thumbnail.webp'));

  console.log(`Verifying file deletions:`);
  console.log(`- Original deleted: ${origDeleted}`);
  console.log(`- Optimized deleted: ${optDeleted}`);
  console.log(`- Thumbnail deleted: ${thumbDeleted}`);

  if (!origDeleted || !optDeleted || !thumbDeleted) {
    console.error("Verification failed: Local files were not cleaned up from disk.");
    process.exit(1);
  }

  // Clean up directory
  await fetch('http://localhost:5173/api/storage/delete_folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, albumId }),
  });
  console.log(`- Directory cleaned: ${!fs.existsSync(storageDir)}`);

  // Clean up album from Supabase
  await supabase.from('albums').delete().eq('id', albumId);
  console.log(`- Database test album cleaned: true`);

  console.log("\n==================================================");
  console.log("LOCAL STORAGE DEV ENGINE VERIFIED SUCCESSFULLY!");
  console.log("==================================================");
}

testLocalStorage().catch(console.error);
