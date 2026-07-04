import { UploadService } from "../services/uploadService";

/**
 * Parses the binary segment of a JPEG file to extract the EXIF orientation tag.
 * Returns the orientation number (1-8), or 1 if not found/not a JPEG.
 * Reads only the first 64KB for performance.
 */
export function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
      resolve(1); // Standard orientation for non-JPEG
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      const view = new DataView(buffer);

      if (view.byteLength < 2 || view.getUint16(0, false) !== 0xffd8) {
        resolve(1); // Not a valid JPEG SOI marker
        return;
      }

      let offset = 2;
      const length = view.byteLength;

      while (offset < length - 2) {
        const marker = view.getUint16(offset, false);
        if (marker === 0xffe1) {
          // Found APP1 section (EXIF resides here)
          offset += 2;
          const sectionLength = view.getUint16(offset, false);
          
          if (offset + 6 < length && view.getUint32(offset + 2, false) === 0x45786966) { // "Exif"
            const tiffOffset = offset + 8;
            let littleEndian = false;

            if (view.getUint16(tiffOffset, false) === 0x4949) {
              littleEndian = true;
            } else if (view.getUint16(tiffOffset, false) === 0x4d4d) {
              littleEndian = false;
            } else {
              resolve(1);
              return;
            }

            if (view.getUint16(tiffOffset + 2, littleEndian) !== 0x002a) {
              resolve(1);
              return;
            }

            const firstIFDOffset = view.getUint32(tiffOffset + 4, littleEndian);
            let dirOffset = tiffOffset + firstIFDOffset;

            if (dirOffset + 2 < length) {
              const entriesCount = view.getUint16(dirOffset, littleEndian);
              dirOffset += 2;

              for (let i = 0; i < entriesCount; i++) {
                const tagOffset = dirOffset + (i * 12);
                if (tagOffset + 10 >= length) break;

                const tag = view.getUint16(tagOffset, littleEndian);
                if (tag === 0x0112) { // Orientation tag
                  const orientation = view.getUint16(tagOffset + 8, littleEndian);
                  resolve(orientation >= 1 && orientation <= 8 ? orientation : 1);
                  return;
                }
              }
            }
          }
          offset += sectionLength;
        } else if ((marker & 0xff00) === 0xff00) {
          offset += 2 + view.getUint16(offset + 2, false);
        } else {
          break;
        }
      }
      resolve(1);
    };
    reader.onerror = () => resolve(1);
    // Read only the beginning of the file where APP1 lies
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Resizes an image file to a specified maximum width/height.
 * Returns a Data URL string.
 */
function resizeImageToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement("canvas");
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(objectUrl); // Fallback to raw object url
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(objectUrl);
    };
    img.src = objectUrl;
  });
}

/**
 * Generates optimized and thumbnail versions of an image.
 * Uses Cloudinary pathing parameters if active, otherwise compresses client-side.
 */
export async function generateImageVariants(
  file: File,
  cloudinaryUrl?: string
): Promise<{ optimizedUrl: string; thumbnailUrl: string }> {
  // If uploaded to Cloudinary, use URL transformations
  if (cloudinaryUrl && UploadService.isConfigured()) {
    // Cloudinary optimized: insert "/q_auto,f_auto"
    // Cloudinary thumbnail: insert "/c_limit,w_250,h_250"
    const isCloudinaryUrl = cloudinaryUrl.includes("res.cloudinary.com");
    if (isCloudinaryUrl) {
      const parts = cloudinaryUrl.split("/upload/");
      if (parts.length === 2) {
        const optimizedUrl = `${parts[0]}/upload/q_auto,f_auto/${parts[1]}`;
        const thumbnailUrl = `${parts[0]}/upload/c_limit,w_250,h_250/${parts[1]}`;
        return { optimizedUrl, thumbnailUrl };
      }
    }
    return { optimizedUrl: cloudinaryUrl, thumbnailUrl: cloudinaryUrl };
  }

  // Local fallback: downscale on Canvas
  const optimizedUrl = await resizeImageToDataUrl(file, 1600, 0.85);
  const thumbnailUrl = await resizeImageToDataUrl(file, 250, 0.70);

  return { optimizedUrl, thumbnailUrl };
}
