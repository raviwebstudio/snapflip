// Supabase Edge Function: drive-storage
// Secure, production-grade Service Account storage engine with diagnostics.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
  token_uri: string;
}

function loadServiceAccountKey(): ServiceAccountKey {
  const raw = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');
  const b64 = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY_B64');

  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (err) {
      console.warn("[drive-storage] GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON, trying base64 fallback:", err.message);
    }
  }

  if (b64) {
    try {
      return JSON.parse(atob(b64.trim()));
    } catch (err) {
      throw new Error(`Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY_B64: ${err.message}`);
    }
  }

  throw new Error("Neither GOOGLE_SERVICE_ACCOUNT_KEY nor GOOGLE_SERVICE_ACCOUNT_KEY_B64 is available or valid in environment secrets.");
}

// Helper to base64 encode bytes securely
function bytesToBase64(bytes: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 8192;
  const len = bytes.length;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...chunk));
  }
  return btoa(chunks.join(''));
}

function base64url(data: Uint8Array): string {
  return bytesToBase64(data)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function textToBase64url(text: string): string {
  return base64url(new TextEncoder().encode(text));
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

// Generate Service Account signed JWT
async function createSignedJwt(sa: ServiceAccountKey): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = textToBase64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = textToBase64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );
  const signingInput = `${header}.${payload}`;
  const key = await importPrivateKey(sa.private_key);
  const signature = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(signingInput))
  );
  return `${signingInput}.${base64url(signature)}`;
}

// Exchange JWT for Access Token (with 3-attempt retry)
async function getAccessToken(sa: ServiceAccountKey): Promise<string> {
  const backoffs = [1000, 2000, 5000];
  for (let i = 0; i < 3; i++) {
    try {
      const jwt = await createSignedJwt(sa);
      const res = await fetch(sa.token_uri, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
      });
      if (res.ok) {
        const data = await res.json();
        return data.access_token;
      }
      const text = await res.text();
      console.warn(`[Google OAuth token exchange] Attempt ${i + 1} failed: ${res.status} ${text}`);
      if (i < 2) await new Promise((r) => setTimeout(r, backoffs[i]));
    } catch (e) {
      console.warn(`[Google OAuth token exchange] Attempt ${i + 1} error: ${e.message}`);
      if (i < 2) await new Promise((r) => setTimeout(r, backoffs[i]));
    }
  }
  throw new Error('Google OAuth token exchange failed after 3 attempts.');
}

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

// Fetch wrapper with automatic retry and exponential backoff
async function driveRequest(token: string, path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${DRIVE_API}${path}`;
  const backoffs = [1000, 2000, 5000];
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });
      if (res.ok) return res;
      // Retry transient errors
      if (res.status >= 500 || res.status === 429) {
        console.warn(`[driveRequest] Transient error ${res.status} on ${path}. Retrying in ${backoffs[i]}ms...`);
        if (i < 2) await new Promise((r) => setTimeout(r, backoffs[i]));
        continue;
      }
      return res; // Return non-transient status (e.g. 403, 404) immediately
    } catch (err) {
      if (i === 2) throw err;
      console.warn(`[driveRequest] Error on ${path}: ${err.message}. Retrying in ${backoffs[i]}ms...`);
      await new Promise((r) => setTimeout(r, backoffs[i]));
    }
  }
  throw new Error(`driveRequest failed on path ${path} after 3 attempts.`);
}

// Find a folder by name inside parent
async function findFolder(token: string, name: string, parentId: string): Promise<string | null> {
  const q = encodeURIComponent(
    `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const res = await driveRequest(
    token,
    `/files?q=${q}&fields=files(id,name)&spaces=drive&includeItemsFromAllDrives=true&supportsAllDrives=true`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Folder lookup for "${name}" failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

// Create folder inside parent
async function createDriveFolder(token: string, name: string, parentId: string): Promise<string> {
  const existing = await findFolder(token, name, parentId);
  if (existing) return existing;

  const res = await driveRequest(token, '/files?supportsAllDrives=true&includeItemsFromAllDrives=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create folder "${name}": ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.id;
}

// Ensure the folder path exists, returning leaf folder ID
async function ensureFolderPath(
  token: string,
  rootFolderId: string,
  userId: string,
  albumId: string,
  type: string
): Promise<string> {
  const userFolderId = await createDriveFolder(token, userId, rootFolderId);
  const albumFolderId = await createDriveFolder(token, albumId, userFolderId);
  const typeFolderId = await createDriveFolder(token, type, albumFolderId);
  return typeFolderId;
}

// Upload a single file with retries
async function uploadFile(
  token: string,
  folderId: string,
  fileName: string,
  fileBytes: Uint8Array,
  mimeType: string
): Promise<{ id: string; size: number }> {
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const boundary = '-----snapflip_boundary';
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadata}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n` +
    `Content-Transfer-Encoding: base64\r\n\r\n` +
    `${bytesToBase64(fileBytes)}\r\n` +
    `--${boundary}--`;

  const uploadUrl = `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,size&supportsAllDrives=true&includeItemsFromAllDrives=true`;
  const backoffs = [1000, 2000, 5000];

  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          id: data.id,
          size: parseInt(data.size || '0', 10),
        };
      }

      const text = await res.text();
      console.warn(`[File upload] Attempt ${i + 1} failed for "${fileName}": ${res.status} ${text}`);
      if (res.status === 403 && text.includes('storageQuotaExceeded')) {
        throw new Error('Google Drive quota exceeded.');
      }

      if (i < 2) await new Promise((r) => setTimeout(r, backoffs[i]));
    } catch (e) {
      if (i === 2) throw e;
      if (i < 2) await new Promise((r) => setTimeout(r, backoffs[i]));
    }
  }
  throw new Error(`File upload failed for "${fileName}" after 3 attempts.`);
}

async function makePublic(token: string, fileId: string): Promise<void> {
  const res = await driveRequest(token, `/files/${fileId}/permissions?supportsAllDrives=true&includeItemsFromAllDrives=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn(`[makePublic] Failed setting public permissions on ${fileId}: ${res.status} ${text}`);
  }
}

async function deleteFile(token: string, fileId: string): Promise<boolean> {
  const res = await driveRequest(token, `/files/${fileId}?supportsAllDrives=true&includeItemsFromAllDrives=true`, { method: 'DELETE' });
  return res.ok || res.status === 204 || res.status === 404;
}

function getPublicUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function extractFileIdFromUrl(url: string): string | null {
  const match = url.match(/id=([^&]+)/);
  return match ? match[1] : null;
}

// Diagnostic Health Check function
async function runHealthCheck(supabase: any): Promise<{
  ok: boolean;
  details: {
    serviceAccountSecretExists: boolean;
    privateKeyParses: boolean;
    jwtGenerationWorks: boolean;
    googleTokenObtained: boolean;
    rootFolderAccessible: boolean;
    driveWritePermission: boolean;
    databaseConnectivity: boolean;
    errors: string[];
  }
}> {
  const details = {
    serviceAccountSecretExists: false,
    privateKeyParses: false,
    jwtGenerationWorks: false,
    googleTokenObtained: false,
    rootFolderAccessible: false,
    driveWritePermission: false,
    databaseConnectivity: false,
    errors: [] as string[]
  };

  try {
    let saKey: ServiceAccountKey;
    try {
      saKey = loadServiceAccountKey();
      details.serviceAccountSecretExists = true;
      details.privateKeyParses = true;
    } catch (e) {
      details.errors.push(`Service Account key loading/parsing failed: ${e.message}`);
      return { ok: false, details };
    }

    try {
      await createSignedJwt(saKey);
      details.jwtGenerationWorks = true;
    } catch (e) {
      details.errors.push(`JWT signing failed: ${e.message}`);
    }

    let token = '';
    try {
      token = await getAccessToken(saKey);
      details.googleTokenObtained = true;
    } catch (e) {
      details.errors.push(`Google Token exchange failed: ${e.message}`);
    }

    if (token) {
      const rootFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID')!;
      try {
        const res = await driveRequest(token, `/files/${rootFolderId}?fields=id,name,capabilities&supportsAllDrives=true&includeItemsFromAllDrives=true`);
        if (res.ok) {
          details.rootFolderAccessible = true;
          const meta = await res.json();
          if (meta.capabilities?.canAddChildren || meta.capabilities?.canEdit) {
            details.driveWritePermission = true;
          } else {
            details.errors.push("Root folder exists but lacks write permissions (canAddChildren/canEdit are false)");
          }
        } else {
          details.errors.push(`Root folder inaccessible: API status ${res.status}`);
        }
      } catch (e) {
        details.errors.push(`Root folder access check failed: ${e.message}`);
      }
    }

    try {
      const { error } = await supabase.from('albums').select('id').limit(1);
      if (!error) {
        details.databaseConnectivity = true;
      } else {
        details.errors.push(`Database connection failed: ${error.message}`);
      }
    } catch (e) {
      details.errors.push(`Database check failed: ${e.message}`);
    }
  } catch (err) {
    details.errors.push(`Critical diagnostic failure: ${err.message}`);
  }

  const ok = details.serviceAccountSecretExists &&
             details.privateKeyParses &&
             details.jwtGenerationWorks &&
             details.googleTokenObtained &&
             details.rootFolderAccessible &&
             details.driveWritePermission &&
             details.databaseConnectivity;

  return { ok, details };
}

// Startup health check logging
const startupSupabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);
runHealthCheck(startupSupabase).then(result => {
  console.log(`[drive-storage] [Startup Diagnostics] Healthy: ${result.ok}`);
  if (!result.ok) {
    console.error(`[drive-storage] [Startup Diagnostics] Errors:`, result.details.errors);
  }
});

// Serve API Handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
      },
    });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Secret retrieval
    const saKey = loadServiceAccountKey();

    const rootFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
    if (!rootFolderId || rootFolderId.toLowerCase() === 'root') {
      throw new Error('GOOGLE_DRIVE_FOLDER_ID is set to root or invalid. Direct uploads to root drive are forbidden.');
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const token = await getAccessToken(saKey);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    switch (action) {
      // ── HEALTH CHECK ──────────────────────────────────────────────────
      case 'healthCheck': {
        const result = await runHealthCheck(supabase);
        return new Response(JSON.stringify(result), { headers: corsHeaders });
      }

      // ── UPLOAD (GROUPED ATOMIC UPLOAD) ────────────────────────────────
      case 'upload': {
        const startTime = Date.now();
        const { 
          userId, 
          albumId, 
          checksum, 
          mimeType,
          original,  // { fileName, fileBase64, size }
          optimized, // { fileName, fileBase64, size }
          thumbnail  // { fileName, fileBase64, size }
        } = body;

        if (!userId || !albumId || !checksum) {
          throw new Error('Missing required arguments: userId, albumId, checksum');
        }
        if (!original || !optimized || !thumbnail) {
          throw new Error('Missing file variants: original, optimized, or thumbnail payload');
        }

        // Deduplication Check
        const { data: existing } = await supabase
          .from('storage_files')
          .select('*')
          .eq('album_id', albumId)
          .eq('checksum', checksum)
          .limit(1)
          .maybeSingle();

        if (existing) {
          console.log(`[Deduplication] Match found inside album ${albumId} for checksum ${checksum}. Skipping upload.`);
          return new Response(
            JSON.stringify({
              storageFileId: existing.id,
              googleFileId: existing.google_file_id,
              originalPath: existing.original_path,
              optimizedPath: existing.optimized_path,
              thumbnailPath: existing.thumbnail_path,
              reused: true,
            }),
            { headers: corsHeaders }
          );
        }

        // Folder Path ensuring
        const originalFolderId = await ensureFolderPath(token, rootFolderId, userId, albumId, 'original');
        const optimizedFolderId = await ensureFolderPath(token, rootFolderId, userId, albumId, 'optimized');
        const thumbnailFolderId = await ensureFolderPath(token, rootFolderId, userId, albumId, 'thumbnail');

        // Parallel variant upload
        const origBytes = Uint8Array.from(atob(original.fileBase64), (c) => c.charCodeAt(0));
        const optBytes = Uint8Array.from(atob(optimized.fileBase64), (c) => c.charCodeAt(0));
        const thumbBytes = Uint8Array.from(atob(thumbnail.fileBase64), (c) => c.charCodeAt(0));

        const [origRes, optRes, thumbRes] = await Promise.all([
          uploadFile(token, originalFolderId, original.fileName, origBytes, mimeType),
          uploadFile(token, optimizedFolderId, optimized.fileName, optBytes, 'image/webp'),
          uploadFile(token, thumbnailFolderId, thumbnail.fileName, thumbBytes, 'image/webp'),
        ]);

        // Make all files public
        await Promise.all([
          makePublic(token, origRes.id),
          makePublic(token, optRes.id),
          makePublic(token, thumbRes.id),
        ]);

        const origUrl = getPublicUrl(origRes.id);
        const optUrl = getPublicUrl(optRes.id);
        const thumbUrl = getPublicUrl(thumbRes.id);

        // Database transaction insert
        const { data: storageFile, error: insertError } = await supabase
          .from('storage_files')
          .insert({
            user_id: userId,
            album_id: albumId,
            google_file_id: origRes.id,
            google_folder_id: originalFolderId,
            original_path: origUrl,
            optimized_path: optUrl,
            thumbnail_path: thumbUrl,
            mime_type: mimeType,
            original_size: original.size,
            optimized_size: optimized.size,
            thumbnail_size: thumbnail.size,
            checksum,
          })
          .select('id')
          .single();

        if (insertError) {
          throw new Error(`Database record creation failed: ${insertError.message}`);
        }

        const duration = Date.now() - startTime;
        console.log(`[Upload Complete] Grouped upload finished successfully in ${duration}ms. Original file ID: ${origRes.id}`);

        return new Response(
          JSON.stringify({
            storageFileId: storageFile.id,
            googleFileId: origRes.id,
            originalPath: origUrl,
            optimizedPath: optUrl,
            thumbnailPath: thumbUrl,
            reused: false,
          }),
          { headers: corsHeaders }
        );
      }

      // ── DELETE PHOTO ──────────────────────────────────────────────────
      case 'delete': {
        const { storageFileId } = body;
        if (!storageFileId) throw new Error('Missing storageFileId parameter.');

        const { data: fileRecord } = await supabase
          .from('storage_files')
          .select('google_file_id, original_path, optimized_path, thumbnail_path')
          .eq('id', storageFileId)
          .maybeSingle();

        if (fileRecord) {
          const origId = fileRecord.google_file_id;
          const optId = extractFileIdFromUrl(fileRecord.optimized_path);
          const thumbId = extractFileIdFromUrl(fileRecord.thumbnail_path);

          const deletePromises: Promise<boolean>[] = [];
          if (origId) deletePromises.push(deleteFile(token, origId));
          if (optId) deletePromises.push(deleteFile(token, optId));
          if (thumbId) deletePromises.push(deleteFile(token, thumbId));

          await Promise.all(deletePromises);
        }

        const { error: dbErr } = await supabase
          .from('storage_files')
          .delete()
          .eq('id', storageFileId);

        return new Response(JSON.stringify({ success: !dbErr }), { headers: corsHeaders });
      }

      // ── DELETE ALBUM FOLDER ──────────────────────────────────────────
      case 'deleteAlbumFolder': {
        const { userId, albumId } = body;
        if (!userId || !albumId) throw new Error('Missing userId or albumId parameters.');

        const userFolderId = await findFolder(token, userId, rootFolderId);
        if (userFolderId) {
          const albumFolderId = await findFolder(token, albumId, userFolderId);
          if (albumFolderId) {
            const success = await deleteFile(token, albumFolderId);
            return new Response(JSON.stringify({ success }), { headers: corsHeaders });
          }
        }
        return new Response(
          JSON.stringify({ success: false, message: 'Album folder not found on Google Drive.' }),
          { headers: corsHeaders }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Error Handler] drive-storage endpoint exception: ${message}`);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
