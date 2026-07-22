import fs from 'fs';
import crypto from 'crypto';

const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentials = JSON.parse(fs.readFileSync(path, 'utf8'));

// Sign JWT
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

async function testUploadAndTransfer() {
  console.log("Uploading a 1-byte file to the shared folder...");
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  
  const metadata = JSON.stringify({
    name: 'test_0byte.txt',
    parents: [folderId]
  });

  const boundary = '-----snapflip_boundary';
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/plain\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `\r\n` +
    `--${boundary}--`;

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });

  console.log("Upload Status:", uploadRes.status);
  const uploadText = await uploadRes.text();
  console.log("Upload Response:", uploadText);

  if (!uploadRes.ok) {
    process.exit(1);
  }

  const file = JSON.parse(uploadText);

  console.log("\nTrying to transfer ownership to aadityagautam76@gmail.com...");
  const permRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions?transferOwnership=true&supportsAllDrives=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      role: 'owner',
      type: 'user',
      emailAddress: 'aadityagautam76@gmail.com'
    })
  });

  console.log("Permission Status:", permRes.status);
  const permText = await permRes.text();
  console.log("Permission Response:", permText);
}

testUploadAndTransfer().catch(console.error);
