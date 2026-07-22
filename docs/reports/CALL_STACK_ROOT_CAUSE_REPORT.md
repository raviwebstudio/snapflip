# Google Drive Upload Call Stack Overflow - Root Cause & Fix Report

This report documents the root cause, analysis, and fix for the `Maximum call stack size exceeded` crash occurring during image uploads in SnapFlip.

---

## 1. Trace of the Upload Flow & Crash

### The Complete Flow
```
[React Frontend] PhotoUpload (StepUpload.tsx)
   ↓ (File picked and variants generated)
[Services] PhotoService (uploadPhoto)
   ↓ (Orchestrates uploads for original/optimized/thumbnail)
[Services] StorageService (uploadFile)
   ↓ (Delegates to provider)
[Storage Provider] GoogleDriveStorageProvider (upload)
   ↓ (Converts file to Base64, invokes Edge Function)
[Supabase Gateway] supabase.functions.invoke('drive-storage')
   ↓ (Incoming HTTP POST request)
[Supabase Edge Function] Deno Edge Function Handler (index.ts)
   ↓ (Calls uploadFile helper)
[Google Drive API Helper] uploadFile (index.ts)
   ↓ (Crashes here while encoding body payload)
Maximum call stack size exceeded
```

### Exact Crash Location
The crash occurred inside the `uploadFile` helper function in the Edge Function:
*   **File:** [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts) (original line 194)
*   **Code:**
    ```typescript
    `${btoa(String.fromCharCode(...fileBytes))}\r\n`
    ```

---

## 2. Root Cause Analysis

1.  **Arguments Spreading Limit:** The code attempted to convert the binary `Uint8Array` (`fileBytes`) into a binary string by spreading all of its elements using the spread operator (`...fileBytes`) as parameters to `String.fromCharCode`.
2.  **Stack Overflow:** JavaScript engines (including V8 in Deno) enforce a strict limit on the number of arguments a function can accept (typically up to ~65,535).
3.  **Real Image Size:** For any standard image upload (e.g., a 100 KB image), `fileBytes` has 102,400 elements. Unpacking these elements as arguments pushes 102,400 parameters onto the execution call stack at once. This exceeds the argument limits, leading to an immediate Deno crash and throwing the `Maximum call stack size exceeded` error.

---

## 3. Implemented Fix

To remove the call stack blocker without modifying the API contract, we replaced the spread operator with a secure **chunked conversion helper**:

### A. Safe Chunked Base64 Helper
Added the helper function `bytesToBase64(bytes: Uint8Array): string` to both the Edge Function and the client-side provider:
```typescript
function bytesToBase64(bytes: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 8192; // Safe chunk size well below stack limit
  const len = bytes.length;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    chunks.push(String.fromCharCode(...chunk));
  }
  return btoa(chunks.join(''));
}
```
*   **Why it works:** By processing the byte array in small slices (chunk size = 8192), the spread operator is only applied on 8192 elements at a time. This is 100% safe from engine call stack limits while remaining highly performant.

### B. Updated Codebases
*   **Edge Function:** Modified [index.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/supabase/functions/drive-storage/index.ts) to utilize `bytesToBase64` for encoding the upload payload and generating service account signature JWTs.
*   **Frontend Provider:** Modified [GoogleDriveStorageProvider.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/storage/GoogleDriveStorageProvider.ts) to utilize chunked base64 conversion, optimizing client-side upload speed and memory footprint.
*   **Verification Script:** Updated [test-drive-upload.mjs](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/scripts/test-drive-upload.mjs) to generate a large 100 KB test payload in memory, validating that uploads no longer crash on large files.

---

## 4. Verification & Validation Results

*   **Edge Function Deployment:** Successfully redeployed to remote Supabase via `npx supabase functions deploy drive-storage`.
*   **Execution Test:** Ran `node --env-file=.env scripts/test-drive-upload.mjs` with the 100 KB payload.
    *   **Result:** The base64 conversion completed successfully without any stack overflow crash. The Edge Function successfully parsed the request and initiated the Google Drive upload (triggering the Google quota exceeded error from the Google Drive API rather than Deno crashing).
*   **Syntax and Compiler Checks:**
    *   `npm run lint` completed with **0 warnings and 0 errors**.
    *   `npm run build` completed successfully for production with **0 errors**.
