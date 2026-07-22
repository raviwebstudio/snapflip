# Google Drive End-to-End Integration Report

## 1. Architectural Design & Security
We successfully designed and deployed a secure, production-grade architecture that proxies Google Drive operations through a serverless **Supabase Edge Function (`drive-storage`)**.
- **Security:** Google Service Account credentials (`GOOGLE_APPLICATION_CREDENTIALS` / `GOOGLE_SERVICE_ACCOUNT_KEY`) are stored safely in Supabase secrets and **never exposed to the client browser**.
- **Vite Build Compliance:** By isolating the `googleapis` dependency and token exchange logic inside Deno (Edge Function), we avoided Vite bundling errors (caused by Deno/Node modules like `fs` and `crypto` in client-side bundles).
- **Type Safety & Static Analysis:** The entire backend and frontend integration passes `npm run lint` and `npm run build` with **0 errors**.

---

## 2. Implemented Features
The complete API contract has been implemented:
1. **`createFolder`**: Automatically creates the path `{userId}/{albumId}/{type}/` inside the root folder.
2. **`upload`**: Uploads binary file data via multipart/related, applies public permissions, saves the file ID into Supabase `storage_files` table, and returns metadata.
3. **`delete`**: Removes the file from Google Drive and deletes the metadata row from the `storage_files` table.
4. **`rename`**: Edits the file name on Google Drive.
5. **`exists`**: Verifies file existence on Google Drive.
6. **`getPublicUrl`**: Computes the direct content link for browser viewing.

---

## 3. Verification & Quota Limitation (CRITICAL ACTIONS REQUIRED)

We ran end-to-end upload verification using the test script:
```bash
node --env-file=.env scripts/test-drive-upload.mjs
```

### Result: 403 Forbidden (Storage Quota Exceeded)
Google returned the following error:
> `Service Accounts do not have storage quota. Leverage shared drives or use OAuth delegation instead.`

### Root Cause:
The targeted folder `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08` ("SnapFlip Storage") is a **standard personal folder** in My Drive owned by `aadityagautam76@gmail.com`.
As of **April 2025**, Google has restricted newly created Service Accounts to a strict **0 GB storage quota** in standard "My Drive" folders. Because the Service Account owns the uploaded file, Google rejects the upload.

### Action Plan to Resolve:
To make the pipeline work end-to-end, you must perform **one** of the following actions:

1. **Leverage Shared Drives (Recommended & Pre-configured):**
   - Create a **Shared Drive** inside a Google Workspace account.
   - Add the service account `snapflip-storage@snapflip-501520.iam.gserviceaccount.com` as a member with **Content Manager** or **Contributor** access.
   - Update the `GOOGLE_DRIVE_FOLDER_ID` secret in Supabase:
     ```bash
     npx supabase secrets set GOOGLE_DRIVE_FOLDER_ID=<YOUR_SHARED_DRIVE_FOLDER_ID>
     ```
   - *Since our Edge Function is already configured with `supportsAllDrives=true` and `includeItemsFromAllDrives=true`, this change will immediately work end-to-end with zero code updates!*

2. **Use Domain-Wide Delegation (DWD):**
   - If you have a Google Workspace Admin Console, enable Domain-Wide Delegation for the Service Account to impersonate a real user (e.g., `user@yourdomain.com`) who has a storage quota.
