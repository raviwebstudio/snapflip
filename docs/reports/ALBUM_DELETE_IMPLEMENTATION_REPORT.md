# Album Delete Implementation Report

This report documents the design, architecture, and verification of the complete **Album Deletion Lifecycle** for SnapFlip.

---

## 1. Overview of the Deletion Lifecycle
The album deletion flow implements a industry-grade two-tier deletion lifecycle (Soft Delete with a 14-day recovery buffer $\rightarrow$ Hard Delete) that cleanly coordinates between the offline client-side IndexedDB/localStorage cache, the Supabase PostgreSQL database, and the Google Drive cloud storage.

```mermaid
graph TD
    A[Active Album Card] -->|Click Delete / Confirm| B[Soft Delete State]
    B -->|Offline Cache| C[Set soft_delete_at]
    B -->|Supabase Database| D[Update soft_delete_at]
    B -->|Trash Tab| E[Render with 14-day timer]
    E -->|Click Restore| F[Clear soft_delete_at]
    F -->|Offline Cache & Supabase| A
    E -->|Click Hard Delete / Confirm| G[Permanent Delete State]
    G -->|Google Drive| H[Delete folder /{userId}/{albumId}]
    G -->|Supabase Metadata| I[Delete storage_files rows]
    G -->|Supabase DB| J[Hard Delete album row]
    J -->|DB Cascades| K[Delete drafts, shares, analytics, photos]
    G -->|Offline Cache| L[Remove from Local Cache]
```

---

## 2. Technical Implementation Details

### A. Database Migration & RLS Policies
The PostgreSQL migration defines the `soft_delete_at` timestamp on the `albums` table:
- Added column `soft_delete_at TIMESTAMP WITH TIME ZONE DEFAULT NULL`.
- Configured indexes for performant retrieval: `CREATE INDEX idx_albums_soft_delete_at ON albums (soft_delete_at) WHERE soft_delete_at IS NULL;`.
- Configured cascading rules on foreign key constraints:
  - `album_photos`, `album_shares`, `album_passwords`, `album_analytics`, and `drafts` have `ON DELETE CASCADE` rules linking back to `albums.id`.

### B. Supabase Edge Function (`drive-storage`)
Added support for recursive directory deletion on Google Drive:
- Added the `deleteAlbumFolder` action in `supabase/functions/drive-storage/index.ts`.
- It locates the directory path `{userId}/{albumId}` inside the root folder using `findFolder` and triggers a recursive deletion of all nested contents using `deleteFile`.

### C. Client & Service Layer Integration
- **`src/services/dbService.ts`**:
  - Added `soft_delete_at?: string` to `Album` interface.
  - Updated `deleteAlbum` to `softDeleteAlbum(id)` which sets `soft_delete_at` locally and runs background Supabase database syncing.
  - Implemented `restoreAlbum(id)` which clears the `soft_delete_at` timestamp.
  - Implemented `permanentDeleteAlbum(id)` which deletes the Google Drive folder, clears `storage_files` rows, hard-deletes the album from Supabase, and clears the local cache.
- **`src/utils/albumUtils.ts`**:
  - Updated the `normalizeAlbum` helper to map and preserve `soft_delete_at` property during offline cache synchronization.

### D. UI Changes
- **`RecentAlbums.tsx`**:
  - Filtered active albums list to exclude soft-deleted items.
  - Replaced the hard-delete action with soft-deletion, and added a toast notification with an **Undo** restore option.
- **`TrashAlbums.tsx` [NEW]**:
  - Lists all soft-deleted albums in a clean glassmorphism grid.
  - Renders a countdown indicator showing the remaining recovery days of the 14-day limit.
  - Offers **Restore** and **Hard Delete** (with a double-confirmation modal).
- **`Dashboard/index.tsx`**:
  - Added the **Trash** tab selector and connected it to render the new `TrashAlbums` panel.

---

## 3. Verification Plan & Results

### A. Automated E2E Tests
An E2E Playwright test was written at [delete-album.spec.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/tests/dashboard/delete-album.spec.ts) to verify the lifecycle:
1. Navigates to `/dashboard` $\rightarrow$ Albums Tab.
2. Soft deletes the "Wedding Collection" album.
3. Verifies it disappears from the active list (count drops from 5 to 4) and triggers the toast.
4. Switches to the Trash tab and verifies the album appears with the Clock countdown indicator.
5. Restores the album, confirming it returns to the active Albums grid (count returns to 5).
6. Soft deletes it again, switches to Trash, and clicks **Hard Delete**.
7. Verifies the modal warning appears, confirms permanent delete, and checks that Trash is empty.
8. Checks that the album is permanently deleted from the active list (count remains 4).

### B. Execution Output
The Playwright test execution completed successfully:
```bash
npx playwright test tests/dashboard/delete-album.spec.ts --project=chromium

Running 1 test using 1 worker
[Browser Console] [log] Supabase Connected
Initial active albums: 5
Active albums after soft delete: 4
Active albums after restore: 5
Final active albums: 4
  ok 1 [chromium] › tests\dashboard\delete-album.spec.ts:4:3 › Album Delete, Restore, and Permanent Delete E2E Suite › should soft delete, restore, and hard delete an album (12.8s)

  1 passed (16.7s)
```

Both build compiles (`npm run build`) and lint checks (`npm run lint`) passed with **0 warnings and 0 errors**.
