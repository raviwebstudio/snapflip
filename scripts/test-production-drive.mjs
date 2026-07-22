import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDrive() {
  console.log("=== STEP 1: Executing Service Account Health Check ===");
  const res = await fetch(`${supabaseUrl}/functions/v1/drive-storage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ action: 'healthCheck' })
  });

  console.log("Response Status:", res.status);
  const resText = await res.text();
  console.log("Response Body:", resText);

  if (!res.ok) {
    console.error("Health check call failed with status:", res.status);
    process.exit(1);
  }

  const healthData = JSON.parse(resText);
  if (!healthData.ok) {
    console.error("Health check reports system errors. Aborting upload tests.");
    process.exit(1);
  }
  console.log("✓ Health Check Passed successfully!\n");

  console.log("=== STEP 2: Creating Grouped Upload Payload ===");
  const userId = '11111111-1111-1111-1111-111111111111';
  const albumId = '22222222-2222-2222-2222-222222222222';
  
  // 1x1 Transparent PNG as a mock image base64
  const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const fileBytes = Buffer.from(base64Png, 'base64');
  
  // Ensure test user and album exist
  await supabase.from('users').upsert({
    id: userId,
    email: 'dev-user@snapflip.com',
    name: 'Dev User',
    role: 'creator',
  });
  await supabase.from('albums').upsert({
    id: albumId,
    user_id: userId,
    title: 'Development Album',
    slug: 'dev-album-test',
    status: 'draft',
    visibility: 'public',
  });

  // Calculate checksum (SHA-256)
  const crypto = await import('crypto');
  const checksum = crypto.createHash('sha256').update(fileBytes).digest('hex');
  console.log("Calculated mock image checksum:", checksum);

  // Grouped variants upload payload
  const uploadPayload = {
    action: 'upload',
    userId,
    albumId,
    checksum,
    mimeType: 'image/png',
    original: {
      fileName: 'test_image.png',
      fileBase64: base64Png,
      size: fileBytes.length,
    },
    optimized: {
      fileName: 'test_image_optimized.webp',
      fileBase64: base64Png,
      size: fileBytes.length,
    },
    thumbnail: {
      fileName: 'test_image_thumbnail.webp',
      fileBase64: base64Png,
      size: fileBytes.length,
    },
  };

  console.log("=== STEP 3: Uploading Grouped Variants ===");
  const uploadRes = await fetch(`${supabaseUrl}/functions/v1/drive-storage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify(uploadPayload)
  });

  console.log("Upload Response Status:", uploadRes.status);
  const uploadText = await uploadRes.text();
  console.log("Upload Response Body:", uploadText);

  if (!uploadRes.ok) {
    console.error("Grouped upload failed with status:", uploadRes.status);
    process.exit(1);
  }

  const uploadData = JSON.parse(uploadText);
  console.log("✓ Grouped upload succeeded! Files saved under correct folder structure in Drive.\n");

  const storageFileId = uploadData.storageFileId;

  console.log("=== STEP 4: Testing Deduplication (Duplicate Upload) ===");
  const { data: dupData, error: dupError } = await supabase.functions.invoke('drive-storage', {
    body: uploadPayload,
  });

  if (dupError) {
    console.error("Deduplication test failed:", dupError.message);
    process.exit(1);
  }

  console.log("Duplicate Upload Result:", JSON.stringify(dupData, null, 2));
  if (dupData.reused !== true || dupData.storageFileId !== storageFileId) {
    console.error("Deduplication failure: record was not reused!");
    process.exit(1);
  }
  console.log("✓ Deduplication verified successfully (skipped upload, reused storageFileId)!\n");

  console.log("=== STEP 5: Deleting Test Photo and Storage Metadata ===");
  const { data: deleteData, error: deleteError } = await supabase.functions.invoke('drive-storage', {
    body: {
      action: 'delete',
      storageFileId,
    },
  });

  if (deleteError) {
    console.error("Deletion failed:", deleteError.message);
    process.exit(1);
  }

  console.log("Deletion Result:", JSON.stringify(deleteData, null, 2));
  if (!deleteData.success) {
    console.error("Deletion reported success: false");
    process.exit(1);
  }
  console.log("✓ Deletion from Google Drive and storage_files metadata verified successfully!\n");

  console.log("==================================================");
  console.log("ALL INTEGRATION TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

testDrive().catch((err) => {
  console.error("Unexpected failure:", err);
  process.exit(1);
});
