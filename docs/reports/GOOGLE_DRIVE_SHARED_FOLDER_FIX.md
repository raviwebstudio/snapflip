# Google Drive Shared Folder & Quota Fix Report

This report documents the root cause analysis, query parameter enforcement, security guards, and the verification results for the platform Service Account integration.

---

## 1. Root Cause Analysis: Service Account Quota Blocker

### Why does `storageQuotaExceeded` occur?
1.  **Quota Constraints:** Google Service Accounts are machine identities that have a fixed, non-configurable personal storage quota of exactly **0 GB**.
2.  **Ownership Rules on My Drive (Personal):** The configured root folder `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08` belongs to the personal Google account `aadityagautam76@gmail.com`. It is shared with the Service Account.
3.  **File Ownership:** When the Service Account uploads any file (> 0 bytes) to this shared folder, the Service Account is designated as the file owner. In consumer Google Drive, files always consume the storage quota of the **file owner**, not the parent folder owner.
4.  **Result:** Since the Service Account's quota limit is 0 bytes, any upload of a non-empty file fails immediately with:
    `Service Accounts do not have storage quota. Leverage shared drives or use OAuth delegation instead.`

---

## 2. API Adjustments & Parameter Enforcement

To support shared structures and Shared Drives correctly, all Google Drive API endpoints inside [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts) were updated to enforce Shared Drive query parameters:

*   **Enforced Parameters:** `supportsAllDrives=true` and `includeItemsFromAllDrives=true`.
*   **Targeted Functions:**
    *   `findFolder`
    *   `createDriveFolder`
    *   `uploadFile`
    *   `makePublic`
    *   `deleteFile`
    *   `renameFile`
    *   `fileExists`

---

## 3. Security Guards & Root Upload Restraints

We implemented a safety guard in [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts) to guarantee that the Service Account never attempts to upload files directly into its own root storage directory:

```typescript
const rootFolderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');
if (!rootFolderId || rootFolderId.toLowerCase() === 'root') {
  throw new Error('GOOGLE_DRIVE_FOLDER_ID is set to root or invalid. Uploads directly to Service Account root drive are forbidden.');
}
```

---

## 4. Runtime Verification Logs

Running the test upload script returned a successful `HTTP 200` upload for a 0-byte file (which bypasses the quota limit):

### Request Logs
*   **Parent Folder ID:** `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08`
*   **Parent Folder Name:** `SnapFlip Storage`
*   **Owner:** `aadityagautam76@gmail.com`
*   **Drive ID:** `My Drive` (Personal Drive)
*   **Request URL:** `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,webViewLink&supportsAllDrives=true&includeItemsFromAllDrives=true`

### Google API Response (Success)
```json
{
  "id": "1DHfb8lXKqh4ZY6Ff5heR82_MaEHBsv1I",
  "name": "test-image-1783539371820.png",
  "size": "0"
}
```
*   **Storage File ID:** `6e7b7e1c-0422-4ef1-9390-5fab1f167af5` (inserted successfully into the database table `storage_files`).
*   **Verify in Google Drive:** [test-image-1783539371820.png](https://drive.google.com/file/d/1DHfb8lXKqh4ZY6Ff5heR82_MaEHBsv1I/view)

---

## 5. Architectural Solutions to Resolve the Quota Blocker

To support uploads of real files (which are > 0 bytes) without encountering `storageQuotaExceeded`, choose one of the following paths:

### Option A: Migrate to Google Workspace Shared Drive (Recommended)
1.  Create a **Shared Drive** in a Google Workspace domain.
2.  Add the Service Account email `snapflip-storage@snapflip-501520.iam.gserviceaccount.com` as a member with **Contributor** or **Content Manager** access.
3.  Create a folder inside that Shared Drive and set its ID as `GOOGLE_DRIVE_FOLDER_ID`.
4.  *Why this works:* Any file uploaded to a Shared Drive is owned by the organization domain, not the uploader, completely bypassing the Service Account's 0 GB limit and consuming the Shared Drive's workspace quota instead.

### Option B: Use Google Workspace Domain-Wide Delegation
1.  Delegate domain-wide authority to the Service Account in Google Workspace Admin Console.
2.  Configure the Edge Function to impersonate the administrator/user account (`aadityagautam76@gmail.com`) when acquiring OAuth tokens.
3.  *Why this works:* The Service Account uploads files *as the user*, so all files are owned by the user and consume the user's workspace quota.

### Option C: Revert to User-Authenticated OAuth
1.  Re-enable the Google OAuth login flow in the frontend.
2.  Each user connects their own Google Drive and uploads files using their personal OAuth credentials.
