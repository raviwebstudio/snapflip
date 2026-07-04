import type { Album } from "../services/dbService";

/**
 * Default album settings — used as fallback when settings is missing or incomplete.
 */
export const DEFAULT_ALBUM_SETTINGS: Album["settings"] = {
  title: "",
  description: "",
  theme: "dark-luxury",
  music: "none",
  visibility: "Public",
  passcode: "",
  watermark: false,
  allowDownload: true,
  albumSize: "auto",
  customWidth: undefined,
  customHeight: undefined,
  customUnit: "mm",
  detectedSize: undefined,
  qrCodeDataUrl: undefined,
  qrCodeSvg: undefined,
};

/**
 * Album Size configuration table.
 * Each entry contains the value stored in the database, a user-friendly label,
 * the physical dimensions in mm (width × height), and the orientation category.
 *
 * The aspect ratio is derived from physical dimensions.
 */
export const ALBUM_SIZE_OPTIONS = [
  // Auto
  { value: "auto",           label: "AUTO (Recommended)",   widthMm: 297,  heightMm: 210, orientation: "auto" },

  // A-Series (ISO standard)
  { value: "a5-portrait",    label: "A5 Portrait",          widthMm: 148,  heightMm: 210, orientation: "portrait" },
  { value: "a5-landscape",   label: "A5 Landscape",         widthMm: 210,  heightMm: 148, orientation: "landscape" },
  { value: "a4-portrait",    label: "A4 Portrait",          widthMm: 210,  heightMm: 297, orientation: "portrait" },
  { value: "a4-landscape",   label: "A4 Landscape",         widthMm: 297,  heightMm: 210, orientation: "landscape" },

  // Square formats (inches)
  { value: "8x8",            label: "8×8 Square",           widthMm: 203,  heightMm: 203, orientation: "square" },
  { value: "10x10",          label: "10×10 Square",         widthMm: 254,  heightMm: 254, orientation: "square" },
  { value: "12x12",          label: "12×12 Square",         widthMm: 305,  heightMm: 305, orientation: "square" },

  // Portrait formats (W×H in inches)
  { value: "8x12",           label: "8×12 Portrait",        widthMm: 203,  heightMm: 305, orientation: "portrait" },
  { value: "10x15",          label: "10×15 Portrait",       widthMm: 254,  heightMm: 381, orientation: "portrait" },
  { value: "12x18",          label: "12×18 Portrait",       widthMm: 305,  heightMm: 457, orientation: "portrait" },

  // Landscape formats (W×H in inches)
  { value: "12x8",           label: "12×8 Landscape",       widthMm: 305,  heightMm: 203, orientation: "landscape" },
  { value: "15x10",          label: "15×10 Landscape",      widthMm: 381,  heightMm: 254, orientation: "landscape" },
  { value: "18x12",          label: "18×12 Landscape",      widthMm: 457,  heightMm: 305, orientation: "landscape" },
  { value: "16x24",          label: "16×24 Portrait",       widthMm: 406,  heightMm: 610, orientation: "portrait" },

  // Custom
  { value: "custom",         label: "Custom",               widthMm: 300,  heightMm: 300, orientation: "custom" },
] as const;

/**
 * Lookup map for quick access by value key.
 */
export const ALBUM_SIZE_MAP: Record<string, (typeof ALBUM_SIZE_OPTIONS)[number]> =
  Object.fromEntries(ALBUM_SIZE_OPTIONS.map((o) => [o.value, o]));

/**
 * Returns a user-friendly badge label for an album size value.
 */
export function getSizeBadgeLabel(sizeValue: string | undefined): string {
  if (!sizeValue || sizeValue === "auto") return "Auto";
  return ALBUM_SIZE_MAP[sizeValue]?.label ?? "Auto";
}

/**
 * Returns the orientation category for an album size value.
 */
export function getSizeOrientation(
  sizeValue: string | undefined,
  customWidth?: string | number,
  customHeight?: string | number
): string {
  if (!sizeValue || sizeValue === "auto") return "Landscape";

  if (sizeValue === "custom" && customWidth && customHeight) {
    const w = Number(customWidth);
    const h = Number(customHeight);
    if (w > h) return "Landscape";
    if (h > w) return "Portrait";
    return "Square";
  }

  const entry = ALBUM_SIZE_MAP[sizeValue];
  if (entry) {
    if (entry.orientation === "portrait") return "Portrait";
    if (entry.orientation === "landscape") return "Landscape";
    if (entry.orientation === "square") return "Square";
  }

  return "Landscape";
}

/**
 * Returns pixel dimensions for the viewer to render pages at the correct aspect ratio.
 * 
 * The returned values are unitless proportional values (based on mm) that
 * the viewer uses for CSS aspect-ratio calculation.
 */
export function getAlbumPageDimensions(
  sizeValue: string | undefined,
  customWidth?: string,
  customHeight?: string,
  detectedSize?: string
): { width: number; height: number; aspectRatio: string } {
  // If auto mode, use detected size or default to landscape A4
  if (!sizeValue || sizeValue === "auto") {
    if (detectedSize) {
      // Map detected orientation to a sensible default size
      if (detectedSize === "Portrait") {
        return { width: 210, height: 297, aspectRatio: "210 / 297" };
      }
      if (detectedSize === "Square") {
        return { width: 254, height: 254, aspectRatio: "1 / 1" };
      }
    }
    // Default: landscape A4
    return { width: 297, height: 210, aspectRatio: "297 / 210" };
  }

  // Custom size
  if (sizeValue === "custom" && customWidth && customHeight) {
    const w = Number(customWidth) || 300;
    const h = Number(customHeight) || 300;
    return { width: w, height: h, aspectRatio: `${w} / ${h}` };
  }

  // Lookup from size table
  const entry = ALBUM_SIZE_MAP[sizeValue];
  if (entry) {
    return {
      width: entry.widthMm,
      height: entry.heightMm,
      aspectRatio: `${entry.widthMm} / ${entry.heightMm}`,
    };
  }

  // Fallback
  return { width: 297, height: 210, aspectRatio: "297 / 210" };
}

/**
 * Analyzes an array of photos and recommends an album size based on 
 * the dominant orientation of the uploaded images.
 *
 * Returns a recommendation object with the suggested size and a human-readable reason.
 */
export function detectRecommendedSize(
  photos: { width?: number; height?: number }[]
): { recommended: string; reason: string } {
  if (photos.length === 0) {
    return { recommended: "a4-landscape", reason: "Default recommendation (no photos uploaded)" };
  }

  let portraitCount = 0;
  let landscapeCount = 0;
  let squareCount = 0;

  for (const photo of photos) {
    const w = photo.width || 800;
    const h = photo.height || 600;
    const ratio = w / h;

    if (ratio > 1.15) {
      landscapeCount++;
    } else if (ratio < 0.85) {
      portraitCount++;
    } else {
      squareCount++;
    }
  }

  const total = photos.length;
  const landscapePct = Math.round((landscapeCount / total) * 100);
  const portraitPct = Math.round((portraitCount / total) * 100);
  const squarePct = Math.round((squareCount / total) * 100);

  if (portraitCount >= landscapeCount && portraitCount >= squareCount) {
    return {
      recommended: "a4-portrait",
      reason: `${portraitPct}% of photos are portrait oriented`,
    };
  }

  if (squareCount >= landscapeCount && squareCount >= portraitCount) {
    return {
      recommended: "10x10",
      reason: `${squarePct}% of photos are square oriented`,
    };
  }

  return {
    recommended: "a4-landscape",
    reason: `${landscapePct}% of photos are landscape oriented`,
  };
}

/**
 * Normalizes an album object to guarantee all required fields exist.
 * Merges any existing partial settings with DEFAULT_ALBUM_SETTINGS.
 * This MUST be called on every album loaded from any data source.
 */
export function normalizeAlbum(album: Record<string, unknown>): Album {
  const existingSettings = (album.settings ?? {}) as Partial<Album["settings"]>;

  return {
    id: (album.id as string) ?? "",
    name: (album.name as string) ?? "Untitled Album",
    coupleName: (album.coupleName as string) ?? "",
    eventType: (album.eventType as string) ?? "wedding",
    eventDate: (album.eventDate as string) ?? "",
    photos: (album.photos as Album["photos"]) ?? [],
    coverImage: (album.coverImage as string) ?? "",
    settings: {
      ...DEFAULT_ALBUM_SETTINGS,
      ...existingSettings,
      albumSize:
        existingSettings.albumSize === "square-10"
          ? "10x10"
          : existingSettings.albumSize === "square-8"
          ? "8x8"
          : existingSettings.albumSize === "square-12"
          ? "12x12"
          : (existingSettings.albumSize || "auto"),
    },
    status: (album.status as Album["status"]) ?? "Draft",
    updated: (album.updated as string) ?? "Unknown",
    gradient: (album.gradient as string) ?? "from-slate-900 to-slate-950",
  };
}
