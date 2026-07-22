# Google Drive OAuth Authentication Flow Report

This report documents the implementation details, secure session caching, token forwarding, and redirection mechanisms for the Google Drive OAuth flow.

---

## 1. End-to-End OAuth Authentication Flow

To enable a completely user-authenticated Google Drive integration, the following flow was implemented:

```
[React Settings UI] ──(Click: Connect Google Drive)──> [Supabase OAuth]
                                                            │
                                                     (Google Consent)
                                                            │
[React Settings UI] <──(Redirect: /settings)───────── [Supabase Auth]
         │
  (Session Listener)
         ↓
  (Extract provider_token & google_user_email)
         ↓
  (Save to sessionStorage)
         │
[Create Album Flow] ──(Check google_provider_token)──> [If Missing] ──> [Redirect to /settings]
         │
    [If Present]
         ↓
  (Invoke drive-storage Edge Function with Authorization: Bearer <provider_token>)
         ↓
[Deno Edge Function] (Extract token from Authorization header)
         ↓
[Google Drive API] (Upload file using User OAuth Token)
```

---

## 2. Code Review & Implementation Details

### A. Secure Session Caching & UI (Settings)
*   **File:** [index.tsx](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/pages/Settings/index.tsx)
*   **Session listener:** Caches the `provider_token` and the user's Google email securely in `sessionStorage` (which exists only for the duration of the browser tab session):
    ```typescript
    const handleSession = (session: any) => {
      setGoogleUser(session?.user ?? null);
      if (session?.provider_token) {
        sessionStorage.setItem("google_provider_token", session.provider_token);
      }
      if (session?.user?.email) {
        sessionStorage.setItem("google_user_email", session.user.email);
      }
      if (!session) {
        sessionStorage.removeItem("google_provider_token");
        sessionStorage.removeItem("google_user_email");
      }
    };
    ```
*   Displays: `Connected as: <Google Email>`.
*   Clears `google_provider_token` and `google_user_email` from `sessionStorage` during logout/disconnect.

### B. Upload Redirection & Authorization Header (Storage Provider)
*   **File:** [GoogleDriveStorageProvider.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/storage/GoogleDriveStorageProvider.ts)
*   **Validation:** Checks `sessionStorage` for the `google_provider_token` before attempting an upload.
*   **Redirection:** If the token is missing, it cancels the upload, displays a warning, and redirects the user using `window.location.href = "/settings"`.
*   **Request:** Sends the token in the `Authorization: Bearer <token>` header:
    ```typescript
    const googleToken = sessionStorage.getItem("google_provider_token");
    if (!googleToken) {
      window.location.href = "/settings";
      throw new Error("Authentication required: Please connect your Google Drive account in settings.");
    }
    const { data, error } = await supabase.functions.invoke('drive-storage', {
      body: payload,
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    });
    ```

### C. Header Token Extraction (Edge Function)
*   **File:** [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts)
*   **Key-Filtering:** Extracts the bearer token from the `Authorization` header, ensuring it ignores the standard `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` (which are passed automatically by the Supabase client library validation):
    ```typescript
    const authHeader = req.headers.get('authorization');
    let authProviderToken: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const parsedToken = authHeader.substring(7);
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (parsedToken !== anonKey && parsedToken !== serviceKey) {
        authProviderToken = parsedToken;
      }
    }
    ```

---

## 3. Verification & Validation Results

*   **Compilation & Linting:** `npm run lint` and `npm run build` completed with **0 warnings and 0 errors**.
*   **Deployments:** Redeployed the updated `drive-storage` Deno Edge Function to Supabase successfully.
*   **Validation Checklist:**
    *   ✓ Google login connects successfully.
    *   ✓ Caches `provider_token` and Google email inside `sessionStorage`.
    *   ✓ Redirects user to `/settings` if attempting to upload photos when disconnected.
    *   ✓ Sends `Authorization: Bearer <provider_token>` headers on uploads.
    *   ✓ Files appear in the `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08` personal Google Drive folder.
    *   ✓ Updates the `storage_files` table in the database.
