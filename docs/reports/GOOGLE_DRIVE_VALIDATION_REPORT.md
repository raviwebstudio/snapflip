# Google Drive Integration Validation Report

This report documents the verification results, health check logs, and architectural findings regarding the platform Service Account storage quota limits.

---

## 1. Diagnostic Health Check Verification Results

We verified the health check endpoint using a custom test script. The Edge Function returned a successful diagnostic run:

```json
{
  "ok": true,
  "details": {
    "serviceAccountSecretExists": true,
    "privateKeyParses": true,
    "jwtGenerationWorks": true,
    "googleTokenObtained": true,
    "rootFolderAccessible": true,
    "driveWritePermission": true,
    "databaseConnectivity": true,
    "errors": []
  }
}
```
All system hooks (secret parsing, JWT signing, token exchanges, parent folder access, and database queries) are **100% operational and healthy**.

---

## 2. Service Account Quota Restriction Findings

During integration testing, uploading any file containing bytes (> 0 bytes) to the personal shared folder `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08` returns a **403 storageQuotaExceeded** exception:

```json
{
  "error": "Google Drive quota exceeded."
}
```

### Technical Root Cause
1. **Google Storage Policy:** As of April 15, 2025, Google Cloud Service Accounts have a hard-coded personal storage quota of **0 bytes** by default.
2. **File Ownership in My Drive:** The folder `1eZoJUnfucAmVlIjazePLZsu-lnUk6H08` is a personal folder owned by `aadityagautam76@gmail.com`. In consumer My Drive structures, files created by the Service Account are owned by the Service Account and thus count against its 0-byte quota.
3. **No Direct Ownership Bypass:** Direct ownership transfer from the Service Account to the personal user without manual consent is blocked by Google Security (`consentRequiredForOwnershipTransfer`).

---

## 3. Recommended Production Remedy: Google Workspace Shared Drive

To upload real images successfully in production using the Service Account, the platform owner must:
1. **Create a Shared Drive** inside a Google Workspace organization account (e.g. Business or Enterprise).
2. **Add the Service Account** `snapflip-storage@snapflip-501520.iam.gserviceaccount.com` as a **Contributor** or **Content Manager** on that Shared Drive.
3. **Point to a Folder inside the Shared Drive** by updating the `GOOGLE_DRIVE_FOLDER_ID` secret in Supabase.

### Why this works:
Files created in a Google Workspace **Shared Drive** are owned by the organization/Shared Drive itself, not the uploader. This completely bypasses the Service Account's individual 0-byte limit and charges the pooled organization storage instead.
