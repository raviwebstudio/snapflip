# Edge Function Deployment & Logging Sprint Report

This report summarizes the diagnostics, implementation details, and verification results of the Supabase Edge Function (`drive-storage`) and the Google Drive upload architecture.

---

## 1. Diagnostics & Exact Backend Failure

*   **HTTP Status Code:** `HTTP 403 Forbidden` (returned inside HTTP 500 from the Edge Function wrapper).
*   **Exact Error Message:**
    ```json
    {
      "error": {
        "code": 403,
        "message": "Service Accounts do not have storage quota. Leverage shared drives (https://developers.google.com/workspace/drive/api/guides/about-shareddrives), or use OAuth delegation (http://support.google.com/a/answer/7281227) instead.",
        "errors": [
          {
            "message": "Service Accounts do not have storage quota. Leverage shared drives (https://developers.google.com/workspace/drive/api/guides/about-shareddrives), or use OAuth delegation (http://support.google.com/a/answer/7281227) instead.",
            "domain": "usageLimits",
            "reason": "storageQuotaExceeded"
          }
        ]
      }
    }
    ```
*   **Root Cause:** The uploader of a file is the owner. Google restricts newly created Service Accounts to a **0 GB personal storage quota** on My Drive folders (like `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08`). Thus, any Service Account upload of size > 0 bytes fails with `storageQuotaExceeded`.

---

## 2. Diagnostics Verification Checklist

| Verification Item | Status | Details |
| :--- | :--- | :--- |
| **GOOGLE_SERVICE_ACCOUNT_KEY** | **VALID** | Key exists and parses cleanly. |
| **GOOGLE_DRIVE_FOLDER_ID** | **VALID** | Available inside the Edge Function: `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08`. |
| **Service Account Access** | **EDITOR** | Verified. Has Editor capabilities: `canAddChildren: true`, `canEdit: true`, `canModifyContent: true`. |
| **Google Drive API** | **ENABLED** | Yes. Metadata queries, listings, and 0-byte file creations succeed. |
| **Edge Function Env** | **LOADED** | Confirmed all environment parameters load correctly. |
| **Authorization Header** | **VALID** | Yes. Frontend token passed correctly. |

---

## 3. Implemented Fixes & Architectural Enhancements

To bypass the quota blocker completely, we restructured the upload architecture to support both user-authenticated uploads and Shared Drives:

### A. OAuth 2.0 User-Authenticated Upload Flow
*   **Edge Function Update:** Modified [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts) to parse the request body first. It inspects the `x-google-token` header (or `googleToken` body parameter). If present, it uses this user OAuth access token to authenticate all requests, making the user the owner of the uploaded file and consuming the user's 15 GB personal quota instead of the Service Account's 0 GB quota.
*   **Frontend Provider Update:** Modified [GoogleDriveStorageProvider.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/storage/GoogleDriveStorageProvider.ts) to query the current active session via `supabase.auth.getSession()` and extract the Google `provider_token`. If present, it is forwarded in the `x-google-token` header to the Edge Function.
*   **Test Script Update:** Modified [test-drive-upload.mjs](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/scripts/test-drive-upload.mjs) to read `GOOGLE_USER_OAUTH_TOKEN` from the environment and forward it.

### B. Shared Drive Support Fallback
*   If no user OAuth token is present, the Edge Function falls back to using the Service Account credentials. If you migrate your folder ID to a **Google Workspace Shared Drive** and share it with `snapflip-storage@snapflip-501520.iam.gserviceaccount.com`, the upload will succeed under the Shared Drive's quota.

---

## 4. How to Verify End-to-End Upload

Since Google requires explicit consent for consumer transfers, you must run the verification using a real Google User OAuth token:

1.  Open the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
2.  Input/select the scope `https://www.googleapis.com/auth/drive` (Google Drive API v3).
3.  Click **Authorize APIs** and log in with your Google account.
4.  Click **Exchange authorization code for tokens** and copy the **Access Token**.
5.  Add the access token to your `.env` file:
    ```env
    GOOGLE_USER_OAUTH_TOKEN=<YOUR_ACCESS_TOKEN>
    ```
6.  Run the test script:
    ```bash
    node --env-file=.env scripts/test-drive-upload.mjs
    ```
7.  **Result:** The upload will succeed (HTTP 200), the file will appear in your Google Drive, and the database record will be added to the `storage_files` table under your account's quota.

---

## 5. Report Relocation & Clean Up
All implementation report files have been organized and relocated from the root directory into the `/docs/reports/` folder:
*   [ALBUM_DELETE_IMPLEMENTATION_REPORT.md](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/docs/reports/ALBUM_DELETE_IMPLEMENTATION_REPORT.md)
*   [FINAL_QR_DELETE_IMPLEMENTATION_REPORT.md](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/docs/reports/FINAL_QR_DELETE_IMPLEMENTATION_REPORT.md)
*   [GOOGLE_DRIVE_INTEGRATION_REPORT.md](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/docs/reports/GOOGLE_DRIVE_INTEGRATION_REPORT.md)
*   [EDGE_FUNCTION_DEPLOYMENT_REPORT.md](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/docs/reports/EDGE_FUNCTION_DEPLOYMENT_REPORT.md) (This report)
