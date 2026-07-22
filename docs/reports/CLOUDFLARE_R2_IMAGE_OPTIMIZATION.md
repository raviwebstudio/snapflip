# Browser-Side WebP Image Optimization Pipeline Report

This report documents the implementation of a client-side image optimization pipeline to convert, compress, and scale images before uploading them, conserving server resources and storage space.

---

## 1. Browser-Side Optimization Pipeline

To prevent large, raw camera images from being uploaded directly, a production-grade image optimization pipeline has been implemented in the browser using HTML5 Canvas:

*   **Pre-Optimization File Guard:** Files larger than 10MB are rejected immediately before any processing with a clear UI message:
    `Upload failed: File "{fileName}" exceeds the maximum limit of 10MB before optimization.`
*   **WebP Conversion:** All selected images (`image/jpeg`, `image/png`, etc.) are converted to the modern WebP format (`image/webp`).
*   **EXIF Orientation Preservation:** Modern browsers natively handle EXIF orientation during `Image` loading. The pipeline rotates the pixel data correctly and saves the WebP with standard orientation 1.
*   **Aspect-Ratio Scaling:** Resizes the image keeping its aspect ratio:
    *   Maximum width/height: 2400px.
*   **Dynamic Compression Tuning:**
    *   Compresses WebP using a quality setting between 75-82% (default 80%).
    *   If the resulting file size exceeds 1MB, it dynamically falls back to 75% quality to target an ideal range of 300KB–800KB and a maximum limit of 1MB.
*   **Variant Generation:** Automatically generates three optimized versions:
    *   `original` (optimized high quality, max 2400px)
    *   `optimized` (max 1600px)
    *   `thumbnail` (max 400px)
*   **Visual Upload Progress:** Progress indicators are updated in real-time as each image finishes browser optimization and starts uploading.

---

## 2. Database Schema Expansion

To track optimization efficiency, a migration script was run to add new columns to the `storage_files` table:

```sql
ALTER TABLE public.storage_files 
ADD COLUMN IF NOT EXISTS width INT,
ADD COLUMN IF NOT EXISTS height INT,
ADD COLUMN IF NOT EXISTS original_size BIGINT,
ADD COLUMN IF NOT EXISTS optimized_size BIGINT,
ADD COLUMN IF NOT EXISTS compression_ratio NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS mime_type VARCHAR(50);
```

### Table Metadata Columns
| Column Name | Type | Description |
| :--- | :--- | :--- |
| `width` | `INT` | Optimized image width in pixels. |
| `height` | `INT` | Optimized image height in pixels. |
| `original_size` | `BIGINT` | Raw file size in bytes before browser optimization. |
| `optimized_size` | `BIGINT` | Optimized WebP file size in bytes after browser optimization. |
| `compression_ratio` | `NUMERIC` | Ratio representing `optimized_size / original_size`. |
| `mime_type` | `VARCHAR` | The target file format (`image/webp`). |

---

## 3. Storage Integration & Backend Recording

### A. Client Metadata Forwarding
The client-side storage provider ([GoogleDriveStorageProvider.ts](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/storage/GoogleDriveStorageProvider.ts)) extracts the dimensions, size before compression, and size after compression, and forwards them in the request body to the Edge Function.

### B. Database Insertion
The `drive-storage` Edge Function destructures the optimization metadata and stores it on the row corresponding to the original file:
```typescript
const { width, height, originalSize, optimizedSize, compressionRatio } = body;
// Inserted into public.storage_files table columns
```

---

## 4. Analytics Dashboard Storage Display

A new **Total Storage Saved** card has been added to the Analytics page ([Analytics/index.tsx](file:///c:/Users/Ravi%20Gautam/Desktop/Workspace/snapflip/src/pages/Analytics/index.tsx)) that queries Supabase dynamically and displays storage savings in real-time.

*   **Dynamic Query:**
    ```typescript
    const { data } = await supabase
      .from("storage_files")
      .select("original_size, optimized_size")
      .eq("file_type", "original");
    ```
*   **Metrics Rendered:**
    *   **Value:** Total megabytes saved across all uploaded items (`SUM(original_size - optimized_size)`).
    *   **Subtext change label:** Displays the total percentage of storage saved (e.g. `-80% size`).

---

## 5. Verification Results

*   ✓ **Database Schema:** Migration successfully executed and verified on the remote database.
*   ✓ **Code Hygiene:** `npm run lint` and `npm run build` compiled successfully with **0 warnings and 0 errors**.
