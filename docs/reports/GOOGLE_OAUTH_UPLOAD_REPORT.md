# Google Drive OAuth 2.0 Integration & Upload Report

This report summarizes the design, implementation details, and verification instructions for the Google OAuth 2.0 integration, enabling secure user-authenticated uploads to Google Drive.

---

## 1. Architectural Changes & Enforced Constraints

To resolve the Google Service Account 0 GB quota limitation, we migrated the upload flow to be entirely user-authenticated:

### A. Strict Google OAuth Upload Enforcement (Edge Function)
*   **File:** [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts)
*   **Rule:** If `action === 'upload'` and no user Google OAuth token is passed (via header or request body), the function immediately throws a `401 Unauthorized` exception:
    ```typescript
    if (action === 'upload') {
      console.error("[drive-storage] [Google OAuth] Error: Upload attempted without user Google OAuth token.");
      throw new Error("Google Drive upload requires user authentication. Please link your Google account in Settings.");
    }
    ```
*   **Benefit:** Fully removes any fallback uploads using the Service Account to My Drive folders, ensuring that all uploads run strictly under the logged-in user's credentials and consume the user's personal 15 GB quota instead.

### B. Google Drive Integration Card (Settings Page)
*   **File:** [index.tsx](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/pages/Settings/index.tsx)
*   **Interface:** Added a new **Google Drive Integration** card displaying connection status.
    *   **Not Connected:** Renders a **Link Google Account** button initiating Supabase Google Sign-In with scope `https://www.googleapis.com/auth/drive` and redirecting back to `/settings`.
    *   **Connected:** Displays the linked Google Account email and renders a **Disconnect Google Account** button to sign out of the active session.

### C. Automatic Token Forwarding (Storage Provider)
*   **File:** [GoogleDriveStorageProvider.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/storage/GoogleDriveStorageProvider.ts)
*   **Workflow:** The client-side provider checks for an active session using `supabase.auth.getSession()` and extracts the Google `provider_token`. If present, it attaches it to the `x-google-token` header during the Edge Function call.

---

## 2. Supabase Provider Configuration Checklist

Before testing, verify that the Google OAuth provider is correctly configured in your remote Supabase Dashboard:

1.  Navigate to the **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Google**.
2.  Enable the provider.
3.  Enter your **Google OAuth Client ID** and **Client Secret**.
4.  Add the drive authorization scope to **Additional Scopes**:
    ```
    https://www.googleapis.com/auth/drive
    ```
5.  Save your configuration.

---

## 3. End-to-End Verification Instructions

Perform the following manual steps in the web application to verify that the flow works end-to-end:

1.  Launch the application locally (`npm run dev`) and navigate to the **Settings** tab.
2.  Locate the **Google Drive Integration** card and click **Link Google Account**.
3.  Complete the Google Sign-In and consent flow (allowing access to manage files in Google Drive).
4.  Once redirected back to `/settings`, verify the card displays `Connected to Google` alongside your Gmail address.
5.  Go to the **Create Album** tab, progress to the upload step, and choose **Google Drive** as the storage provider.
6.  Select and upload a portfolio photo.
7.  **Expected Results:**
    *   The file uploads successfully (HTTP 200) without call stack crashes or quota errors.
    *   The file appears in your personal Google Drive under the folder `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08`.
    *   A record is successfully inserted into the `storage_files` database table.
