export interface Album {
  id: string;
  name: string;
  coupleName: string;
  eventType: string;
  eventDate: string;
  photos: {
    id: string;
    url: string;
    name: string;
    width?: number;
    height?: number;
    optimizedUrl?: string;
    thumbnailUrl?: string;
    orientation?: number;
  }[];
  coverImage: string;
  settings: {
    title: string;
    description: string;
    theme: string;
    music: string;
    visibility: "Public" | "Private";
    passcode: string;
    watermark: boolean;
    allowDownload: boolean;
    albumSize: string;
    customWidth?: string;
    customHeight?: string;
    customUnit?: string;
    detectedSize?: string;
    qrCodeDataUrl?: string;
    qrCodeSvg?: string;
  };
  status: "Draft" | "Published";
  updated: string;
  gradient: string;
}

const DEFAULT_ALBUMS: Album[] = [
  {
    id: "wedding-coll",
    name: "Wedding Collection",
    coupleName: "Sarah & Mark",
    eventType: "wedding",
    eventDate: "2026-06-12",
    photos: Array(82).fill(null).map((_, idx) => ({
      id: `w-${idx}`,
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400",
      name: `wedding-${idx}.jpg`,
      width: 1200,
      height: 800
    })),
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400",
    settings: {
      title: "Wedding Collection",
      description: "Sarah & Mark's Beautiful Wedding Showcase",
      theme: "dark",
      music: "fine-art",
      visibility: "Public",
      passcode: "",
      watermark: true,
      allowDownload: true,
      albumSize: "a4-landscape"
    },
    status: "Published",
    updated: "2 hours ago",
    gradient: "from-[#0b3037] to-slate-900",
  },
  {
    id: "pre-wedding",
    name: "Pre Wedding",
    coupleName: "Alisha & Kabir",
    eventType: "engagement",
    eventDate: "2026-05-24",
    photos: Array(48).fill(null).map((_, idx) => ({
      id: `p-${idx}`,
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400",
      name: `pre-wedding-${idx}.jpg`,
      width: 800,
      height: 1200
    })),
    coverImage: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=400",
    settings: {
      title: "Pre Wedding Shoot",
      description: "Alisha & Kabir's Pre Wedding Highlights",
      theme: "light",
      music: "acoustic",
      visibility: "Public",
      passcode: "",
      watermark: false,
      allowDownload: true,
      albumSize: "a4-portrait"
    },
    status: "Published",
    updated: "1 day ago",
    gradient: "from-[#051a24] to-slate-900",
  },
  {
    id: "reception",
    name: "Reception Details",
    coupleName: "Maya & Rohan",
    eventType: "reception",
    eventDate: "2026-06-20",
    photos: Array(65).fill(null).map((_, idx) => ({
      id: `r-${idx}`,
      url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=400",
      name: `reception-${idx}.jpg`,
      width: 1000,
      height: 1000
    })),
    coverImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=400",
    settings: {
      title: "Reception Showcase",
      description: "Maya & Rohan's Wedding Reception",
      theme: "dark",
      music: "none",
      visibility: "Private",
      passcode: "1234",
      watermark: true,
      allowDownload: false,
      albumSize: "10x10"
    },
    status: "Draft",
    updated: "3 days ago",
    gradient: "from-purple-950/40 to-slate-900",
  },
  {
    id: "portfolio-coll",
    name: "Portfolio Collection",
    coupleName: "Fine Art Stills",
    eventType: "editorial",
    eventDate: "2026-04-10",
    photos: Array(45).fill(null).map((_, idx) => ({
      id: `po-${idx}`,
      url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=400",
      name: `editorial-${idx}.jpg`,
      width: 1800,
      height: 1200
    })),
    coverImage: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=400",
    settings: {
      title: "Fine Art Portfolio",
      description: "Studio Editorial & Portrait Portfolio",
      theme: "system",
      music: "classical",
      visibility: "Public",
      passcode: "",
      watermark: false,
      allowDownload: true,
      albumSize: "12x18"
    },
    status: "Published",
    updated: "1 week ago",
    gradient: "from-slate-900 to-slate-950",
  },
  {
    id: "demo-album",
    name: "Wedding & Editorial Showcase",
    coupleName: "Charlotte & Daniel",
    eventType: "wedding",
    eventDate: "2026-06-28",
    photos: [
      { id: "d-1", url: "/demo-album/photo1.jpg", name: "ceremony-entrance.jpg", width: 800, height: 1200 },
      { id: "d-2", url: "/demo-album/photo2.jpg", name: "vows-exchange.jpg", width: 1200, height: 800 },
      { id: "d-3", url: "/demo-album/photo3.jpg", name: "bridal-portrait.jpg", width: 800, height: 1200 },
      { id: "d-4", url: "/demo-album/photo4.jpg", name: "reception-banquet.jpg", width: 1200, height: 800 },
      { id: "d-5", url: "/demo-album/photo5.jpg", name: "groom-portrait.jpg", width: 800, height: 1200 },
      { id: "d-6", url: "/demo-album/photo6.jpg", name: "details-rings.jpg", width: 1000, height: 1000 },
      { id: "d-7", url: "/demo-album/photo7.jpg", name: "venue-decor.jpg", width: 1200, height: 800 },
      { id: "d-8", url: "/demo-album/photo8.jpg", name: "editorial-session.jpg", width: 800, height: 1200 },
      { id: "d-9", url: "/demo-album/photo9.jpg", name: "sunset-escape.jpg", width: 1200, height: 800 },
      { id: "d-10", url: "/demo-album/photo10.jpg", name: "bridal-veil-close.jpg", width: 800, height: 1200 }
    ],
    coverImage: "/demo-album/cover.jpg",
    settings: {
      title: "Showcase Album",
      description: "Charlotte & Daniel's Premium Photography Album Showcase.",
      theme: "dark-luxury",
      music: "fine-art",
      visibility: "Public",
      passcode: "",
      watermark: true,
      allowDownload: true,
      albumSize: "auto"
    },
    status: "Published",
    updated: "Just now",
    gradient: "from-[#0b3037] to-slate-900",
  }
];
import { normalizeAlbum } from "../utils/albumUtils";

const DB_NAME = "snapflip_binary_db";
const STORE_NAME = "images";
const localBlobUrls = new Map<string, string>();
let dbInstance: IDBDatabase | null = null;
let isLoaded = false;
const loadCallbacks = new Set<() => void>();

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

function saveBinary(key: string, blob: Blob): Promise<void> {
  return openDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(blob, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// Load all binaries from IndexedDB on startup
export function loadAllBinaries(): Promise<void> {
  if (isLoaded) return Promise.resolve();
  return openDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          const key = cursor.key as string;
          const blob = cursor.value as Blob;
          if (blob instanceof Blob) {
            const url = URL.createObjectURL(blob);
            localBlobUrls.set(key, url);
          }
          cursor.continue();
        } else {
          isLoaded = true;
          resolve();
          loadCallbacks.forEach((cb) => cb());
        }
      };
      request.onerror = () => reject(request.error);
    });
  });
}

// Register callback for when binaries are ready in memory
export function onBinariesLoaded(cb: () => void): () => void {
  if (isLoaded) {
    cb();
    return () => {};
  }
  loadCallbacks.add(cb);
  return () => {
    loadCallbacks.delete(cb);
  };
}

// Auto-run startup load
if (typeof window !== "undefined") {
  loadAllBinaries().catch((err) => console.error("Error loading snapflip binaries:", err));
}

function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

function processAlbumBinaries(album: Album): void {
  // 1. Process coverImage
  if (album.coverImage && album.coverImage.startsWith("data:image/")) {
    try {
      const blob = dataURLtoBlob(album.coverImage);
      const key = `${album.id}_cover`;
      const url = URL.createObjectURL(blob);
      localBlobUrls.set(key, url);
      saveBinary(key, blob).catch((err) => console.error("Failed to save cover image binary:", err));
      album.coverImage = `binary:${album.id}_cover`;
    } catch (e) {
      console.error("Failed to convert cover image Base64 to Blob:", e);
    }
  } else if (album.coverImage && album.coverImage.startsWith("blob:")) {
    const key = `${album.id}_cover`;
    localBlobUrls.set(key, album.coverImage);
    fetch(album.coverImage)
      .then((r) => r.blob())
      .then((blob) => saveBinary(key, blob))
      .catch((e) => console.error("Failed to persist cover image blob:", e));
    album.coverImage = `binary:${album.id}_cover`;
  }

  // 2. Process photos
  album.photos.forEach((photo) => {
    // Process main URL
    if (photo.url && photo.url.startsWith("data:image/")) {
      try {
        const blob = dataURLtoBlob(photo.url);
        const key = `${photo.id}_url`;
        const url = URL.createObjectURL(blob);
        localBlobUrls.set(key, url);
        saveBinary(key, blob).catch((err) => console.error("Failed to save photo URL binary:", err));
        photo.url = `binary:${photo.id}_url`;
      } catch (e) {
        console.error("Failed to convert photo URL Base64 to Blob:", e);
      }
    } else if (photo.url && photo.url.startsWith("blob:")) {
      const key = `${photo.id}_url`;
      localBlobUrls.set(key, photo.url);
      fetch(photo.url)
        .then((r) => r.blob())
        .then((blob) => saveBinary(key, blob))
        .catch((e) => console.error("Failed to persist photo URL blob:", e));
      photo.url = `binary:${photo.id}_url`;
    }

    // Process optimized URL
    if (photo.optimizedUrl && photo.optimizedUrl.startsWith("data:image/")) {
      try {
        const blob = dataURLtoBlob(photo.optimizedUrl);
        const key = `${photo.id}_opt`;
        const url = URL.createObjectURL(blob);
        localBlobUrls.set(key, url);
        saveBinary(key, blob).catch((err) => console.error("Failed to save optimized URL binary:", err));
        photo.optimizedUrl = `binary:${photo.id}_opt`;
      } catch (e) {
        console.error("Failed to convert optimized URL Base64 to Blob:", e);
      }
    } else if (photo.optimizedUrl && photo.optimizedUrl.startsWith("blob:")) {
      const key = `${photo.id}_opt`;
      localBlobUrls.set(key, photo.optimizedUrl);
      fetch(photo.optimizedUrl)
        .then((r) => r.blob())
        .then((blob) => saveBinary(key, blob))
        .catch((e) => console.error("Failed to persist optimized URL blob:", e));
      photo.optimizedUrl = `binary:${photo.id}_opt`;
    }
  });
}

export class DbService {
  public static onBinariesLoaded(cb: () => void): () => void {
    return onBinariesLoaded(cb);
  }

  /**
   * Fetch all albums from localStorage database.
   * Every album passes through normalizeAlbum() to guarantee settings integrity.
   */
  public static getAlbums(): Album[] {
    const data = localStorage.getItem("snapflip_albums");
    let list: Album[] = [];

    if (!data) {
      list = DEFAULT_ALBUMS.map((a) => normalizeAlbum(a as unknown as Record<string, unknown>));
      localStorage.setItem("snapflip_albums", JSON.stringify(list));
      return list;
    }

    try {
      const parsed = JSON.parse(data) as Record<string, unknown>[];
      list = parsed.map((a) => normalizeAlbum(a));
    } catch {
      list = DEFAULT_ALBUMS.map((a) => normalizeAlbum(a as unknown as Record<string, unknown>));
      localStorage.setItem("snapflip_albums", JSON.stringify(list));
      return list;
    }

    // Resolve binary placeholders to local object URLs
    list.forEach((album) => {
      if (album.coverImage && album.coverImage.startsWith("binary:")) {
        const key = album.coverImage.substring(7);
        if (localBlobUrls.has(key)) {
          album.coverImage = localBlobUrls.get(key)!;
        } else {
          // If not loaded yet, fallback to thumbnail of first photo if available
          const firstPhoto = album.photos[0];
          if (firstPhoto && firstPhoto.thumbnailUrl) {
            album.coverImage = firstPhoto.thumbnailUrl;
          }
        }
      }

      album.photos.forEach((photo) => {
        if (photo.url && photo.url.startsWith("binary:")) {
          const key = photo.url.substring(7);
          if (localBlobUrls.has(key)) {
            photo.url = localBlobUrls.get(key)!;
          } else if (photo.thumbnailUrl) {
            photo.url = photo.thumbnailUrl;
          }
        }
        if (photo.optimizedUrl && photo.optimizedUrl.startsWith("binary:")) {
          const key = photo.optimizedUrl.substring(7);
          if (localBlobUrls.has(key)) {
            photo.optimizedUrl = localBlobUrls.get(key)!;
          } else if (photo.thumbnailUrl) {
            photo.optimizedUrl = photo.thumbnailUrl;
          }
        }
      });
    });

    // Ensure demo-album is present in the database (migration check)
    const hasDemo = list.some((a) => a.id === "demo-album");
    if (!hasDemo) {
      const demoRaw = DEFAULT_ALBUMS.find((a) => a.id === "demo-album");
      if (demoRaw) {
        const demoNormalized = normalizeAlbum(demoRaw as unknown as Record<string, unknown>);
        list.push(demoNormalized);
        localStorage.setItem("snapflip_albums", JSON.stringify(list));
      }
    }

    return list;
  }

  /**
   * Save the complete list of albums back to storage.
   */
  public static saveAlbums(albums: Album[]): void {
    localStorage.setItem("snapflip_albums", JSON.stringify(albums));
  }

  /**
   * Fetch single album by ID. Result is always normalized.
   */
  public static getAlbumById(id: string): Album | undefined {
    const albums = this.getAlbums();
    return albums.find((a) => a.id === id);
  }

  /**
   * Create or save a new album item.
   */
  public static createAlbum(album: Omit<Album, "id" | "updated" | "gradient">): Album {
    const albums = this.getAlbums();
    const gradients = [
      "from-[#0b3037] to-slate-900",
      "from-[#051a24] to-slate-900",
      "from-purple-950/40 to-slate-900",
      "from-slate-900 to-slate-950"
    ];
    const newAlbum: Album = {
      ...album,
      id: Math.random().toString(36).substring(2, 9),
      updated: "Just now",
      gradient: gradients[albums.length % gradients.length]
    };
    
    processAlbumBinaries(newAlbum);
    
    albums.unshift(newAlbum);
    this.saveAlbums(albums);
    
    // Return with blob URLs for instant rendering in active session
    const returnAlbum = { ...newAlbum };
    if (returnAlbum.coverImage.startsWith("binary:")) {
      const key = returnAlbum.coverImage.substring(7);
      if (localBlobUrls.has(key)) returnAlbum.coverImage = localBlobUrls.get(key)!;
    }
    returnAlbum.photos = returnAlbum.photos.map((photo) => {
      const p = { ...photo };
      if (p.url.startsWith("binary:")) {
        const key = p.url.substring(7);
        if (localBlobUrls.has(key)) p.url = localBlobUrls.get(key)!;
      }
      if (p.optimizedUrl && p.optimizedUrl.startsWith("binary:")) {
        const key = p.optimizedUrl.substring(7);
        if (localBlobUrls.has(key)) p.optimizedUrl = localBlobUrls.get(key)!;
      }
      return p;
    });
    
    return returnAlbum;
  }

  /**
   * Update fields of an existing album.
   */
  public static updateAlbum(id: string, fields: Partial<Album>): Album {
    const albums = this.getAlbums();
    const index = albums.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Album with ID ${id} not found.`);
    }
    
    const targetAlbum = {
      ...albums[index],
      ...fields,
      id,
    };
    
    processAlbumBinaries(targetAlbum);
    
    const updatedAlbum = {
      ...targetAlbum,
      updated: "Just now"
    };
    
    albums[index] = updatedAlbum;
    this.saveAlbums(albums);
    
    // Return with blob URLs for instant rendering in active session
    const returnAlbum = { ...updatedAlbum };
    if (returnAlbum.coverImage.startsWith("binary:")) {
      const key = returnAlbum.coverImage.substring(7);
      if (localBlobUrls.has(key)) returnAlbum.coverImage = localBlobUrls.get(key)!;
    }
    returnAlbum.photos = returnAlbum.photos.map((photo) => {
      const p = { ...photo };
      if (p.url.startsWith("binary:")) {
        const key = p.url.substring(7);
        if (localBlobUrls.has(key)) p.url = localBlobUrls.get(key)!;
      }
      if (p.optimizedUrl && p.optimizedUrl.startsWith("binary:")) {
        const key = p.optimizedUrl.substring(7);
        if (localBlobUrls.has(key)) p.optimizedUrl = localBlobUrls.get(key)!;
      }
      return p;
    });
    
    return returnAlbum;
  }

  /**
   * Delete an album.
   */
  public static deleteAlbum(id: string): void {
    const albums = this.getAlbums();
    const updated = albums.filter((a) => a.id !== id);
    this.saveAlbums(updated);
  }

  /**
   * Duplicate an existing album.
   */
  public static duplicateAlbum(id: string): Album {
    const albums = this.getAlbums();
    const target = albums.find((a) => a.id === id);
    if (!target) {
      throw new Error(`Album with ID ${id} not found.`);
    }
    const duplicated: Album = {
      ...target,
      id: Math.random().toString(36).substring(2, 9),
      name: `${target.name} (Copy)`,
      updated: "Just now",
      status: "Draft" // Duplicates start as Draft by default
    };
    albums.unshift(duplicated);
    this.saveAlbums(albums);
    return duplicated;
  }

  /**
   * Publish a draft album.
   */
  public static publishAlbum(id: string): Album {
    const albums = this.getAlbums();
    const index = albums.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Album with ID ${id} not found.`);
    }
    const target = albums[index];
    const updatedAlbum: Album = {
      ...target,
      status: "Published",
      updated: "Just now"
    };
    albums[index] = updatedAlbum;
    this.saveAlbums(albums);
    return updatedAlbum;
  }

  /**
   * Unpublish an album.
   */
  public static unpublishAlbum(id: string): Album {
    const albums = this.getAlbums();
    const index = albums.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Album with ID ${id} not found.`);
    }
    const target = albums[index];
    const updatedAlbum: Album = {
      ...target,
      status: "Draft",
      updated: "Just now"
    };
    albums[index] = updatedAlbum;
    this.saveAlbums(albums);
    return updatedAlbum;
  }
}

export default DbService;
