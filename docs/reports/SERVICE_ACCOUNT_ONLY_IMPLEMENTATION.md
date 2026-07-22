# Platform Service Account Only Uploads - Implementation Report

This report documents the removal of the Google OAuth flow and the consolidation of all file uploads to use a single platform-owned Service Account.

---

## 1. Summary of Changes

We reverted the Google OAuth flow and consolidated the Google Drive architecture to run under a single platform Service Account:

### A. Frontend Settings UI Clean Up
*   **File:** [index.tsx](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/pages/Settings/index.tsx)
*   **Changes:**
    *   Removed `googleUser` state and session-caching `useEffect` listener.
    *   Removed Google login/logout handlers (`handleGoogleSignIn`, `handleGoogleSignOut`).
    *   Removed the **Google Drive Integration** card from the UI layout.
    *   Removed unused `supabase` and `useEffect` imports.

### B. Client Storage Provider Cleanup
*   **File:** [GoogleDriveStorageProvider.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/storage/GoogleDriveStorageProvider.ts)
*   **Changes:**
    *   Removed `sessionStorage` token retrievals and warnings.
    *   Removed the redirection logic to `/settings`.
    *   Reverted the Edge Function call to invoke `drive-storage` without any custom user OAuth authorization headers.

### C. Edge Function Token & Fallback Removal
*   **File:** [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts)
*   **Changes:**
    *   Reverted token lookup: Always obtains the Google access token from the Service Account private key (`saKey`).
    *   Removed all `Authorization` and `x-google-token` header parsing for user OAuth.
    *   Removed the upload rejection error that was checking for user tokens.
    *   **Folder Structure:** Uploads are placed into the root folder using the required hierarchy:
        `{rootFolderId}/{userId}/{albumId}/{type}/{fileName}` where `{userId}` represents the photographer's studio ID.

---

## 2. Google API Error Propagation

When a Drive upload fails (for example, if a personal folder is targeted and the Service Account hits the 0 GB storage limit), the Edge Function intercepts the error and returns the exact raw Google API response payload back to the client. This surfaces the detailed error reason (e.g. `storageQuotaExceeded`) in the UI, rather than a generic HTTP status code.

---

## 3. Verification & Validation Results

*   **Syntax and Hygiene:** `npm run lint` completed successfully with **0 warnings and 0 errors**.
*   **Production Bundle:** `npm run build` compiled successfully for production with **0 errors**.
*   **Deployments:** Redeployed the updated `drive-storage` Edge Function to remote Supabase.
*   **Platform Execution:** Executed the upload test script. It successfully initiated Service Account authentication and returned the exact Google API `403 storageQuotaExceeded` error directly from Deno, validating proper error propagation.
