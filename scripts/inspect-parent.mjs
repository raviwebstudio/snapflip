
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.");
  process.exit(1);
}

async function inspectParent() {
  const fs = await import('fs');
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentials = JSON.parse(fs.readFileSync(path, 'utf8'));

  // Sign JWT
  const crypto = await import('crypto');
  function base64url(str) {
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
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

  const tokenRes = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  console.log("=== Inspecting Parent Folder permissions ===");
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}/permissions?fields=permissions(id,displayName,emailAddress,role,type)&supportsAllDrives=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("Permissions list:", JSON.stringify(data, null, 2));

  console.log("\n=== Inspecting Parent Folder metadata ===");
  const res2 = await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}?fields=id,name,owners,driveId,capabilities&supportsAllDrives=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data2 = await res2.json();
  console.log("Folder metadata:", JSON.stringify(data2, null, 2));
}

inspectParent().catch(console.error);
