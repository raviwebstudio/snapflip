import fs from 'fs';
import crypto from 'crypto';

const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentials = JSON.parse(fs.readFileSync(path, 'utf8'));

// Sign JWT with sub claim
function base64url(str) {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
const now = Math.floor(Date.now() / 1000);
const payload = base64url(JSON.stringify({
  iss: credentials.client_email,
  sub: 'aadityagautam76@gmail.com', // Impersonate folder owner
  scope: 'https://www.googleapis.com/auth/drive',
  aud: credentials.token_uri,
  iat: now,
  exp: now + 3600
}));

const sign = crypto.createSign('RSA-SHA256');
sign.update(`${header}.${payload}`);
const signature = base64url(sign.sign(credentials.private_key));
const jwt = `${header}.${payload}.${signature}`;

async function testImpersonate() {
  console.log("Requesting OAuth token with impersonation...");
  const tokenRes = await fetch(credentials.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  console.log("Token Response Status:", tokenRes.status);
  const tokenText = await tokenRes.text();
  console.log("Token Response Body:", tokenText);
}

testImpersonate().catch(console.error);
