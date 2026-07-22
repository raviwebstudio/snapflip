/**
 * Test script: Upload a tiny test image to Google Drive via the drive-storage Edge Function.
 * Run with: node --env-file=.env scripts/test-drive-upload.mjs
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const PNG_BASE64 = '';

async function main() {
  console.log('--- Google Drive Upload Test ---');
  console.log(`Edge Function URL: ${SUPABASE_URL}/functions/v1/drive-storage`);

  const payload = {
    action: 'upload',
    userId: 'test-user',
    albumId: 'test-album',
    type: 'original',
    fileName: `test-image-${Date.now()}.png`,
    fileBase64: PNG_BASE64,
    mimeType: 'image/png',
  };

  console.log(`Uploading ${payload.fileName}...`);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/drive-storage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`❌ Upload failed (${res.status}): ${text}`);
    process.exit(1);
  }

  const data = JSON.parse(text);
  console.log('✅ Upload succeeded!');
  console.log(`   Drive File ID : ${data.driveFileId}`);
  console.log(`   Storage File ID: ${data.storageFileId}`);
  console.log(`   Public URL    : ${data.url}`);
  console.log(`   Size (bytes)  : ${data.size}`);
  console.log('');
  console.log('Verify in Google Drive:');
  console.log(`  https://drive.google.com/file/d/${data.driveFileId}/view`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
