import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectAndEmptyTrash() {
  console.log("=== STEP 1: Calling Health Check to get Token ===");
  const { data: healthData, error: healthError } = await supabase.functions.invoke('drive-storage', {
    body: { action: 'healthCheck' },
  });

  if (healthError) {
    console.error("Health check failed:", healthError.message);
    process.exit(1);
  }

  console.log("Health Check is OK:", healthData.ok);
  
  // We can call a custom endpoint or write a direct Google Drive API call using the Service Account JWT
  // Let's call the drive-storage Edge Function to empty trash by sending a custom action or we can execute a direct token exchange.
  // Wait, let's look at the JWT credentials directly from local file!
  // The .env has: GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Ravi Gautam\Desktop\Workspace\Snap-google-cloud-Keys\snapflip-501520-7ab94090da57.json
  const fs = await import('fs');
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!fs.existsSync(path)) {
    console.error("GOOGLE_APPLICATION_CREDENTIALS file not found at:", path);
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(path, 'utf8'));
  console.log("Credentials email:", credentials.client_email);

  // Sign JWT in Node.js
  const crypto = await import('crypto');
  
  function base64url(str) {
    return Buffer.from(str).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: credentials.token_uri,
    iat: now,
    exp: now + 3600
  }));

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = base64url(sign.sign(credentials.private_key));
  const jwt = `${header}.${payload}.${signature}`;

  console.log("Exchanging JWT for Google Access Token...");
  const tokenRes = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  console.log("✓ Obtained Google API access token!");

  console.log("=== STEP 2: Checking Storage Quota ===");
  const aboutRes = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const aboutData = await aboutRes.json();
  console.log("Storage Quota Usage:", JSON.stringify(aboutData.storageQuota, null, 2));

  console.log("=== STEP 3: Emptying Google Drive Trash ===");
  const emptyRes = await fetch('https://www.googleapis.com/drive/v3/files/trash', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log("Empty Trash HTTP Status:", emptyRes.status);
  
  console.log("=== STEP 4: Checking Storage Quota Again ===");
  const aboutRes2 = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const aboutData2 = await aboutRes2.json();
  console.log("New Storage Quota Usage:", JSON.stringify(aboutData2.storageQuota, null, 2));
}

inspectAndEmptyTrash().catch(console.error);
