import { supabase } from '../lib/supabase';
import { AlbumRepository } from '../repositories/AlbumRepository';
import { PhotoRepository } from '../repositories/PhotoRepository';
import { DraftRepository } from '../repositories/DraftRepository';
import { AlbumService } from './AlbumService';

export interface Album {
  id: string;
  name: string;
  slug?: string;
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
  published_at?: string;
  soft_delete_at?: string;
}

const DEFAULT_ALBUMS: Album[] = [
  {
    id: "wedding-coll",
    slug: "wedding-coll",
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
    slug: "pre-wedding",
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
      visibility: "Private",
      passcode: "123456",
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
    slug: "reception",
    name: "Reception Details",
    coupleName: "Maya & Rohan",
    eventType: "reception",
    eventDate: "2026-06-20",
    photos: Array(65).fill(null).map((_, idx) => ({
      id: `r-${idx}`,
      url: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=400",
      name: `reception-${idx}.jpg`,
      width: 1000,
      height: 750
    })),
    coverImage: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=400",
    settings: {
      title: "Reception Details",
      description: "Maya & Rohan's Wedding Reception",
      theme: "dark",
      music: "jazz-groove",
      visibility: "Public",
      passcode: "",
      watermark: true,
      allowDownload: true,
      albumSize: "a4-landscape"
    },
    status: "Published",
    updated: "2 days ago",
    gradient: "from-purple-950/40 to-slate-900",
  },
  {
    id: "editorial-shoot",
    slug: "editorial-shoot",
    name: "Fashion Editorial",
    coupleName: "Elena & Studio",
    eventType: "editorial",
    eventDate: "2026-05-10",
    photos: Array(32).fill(null).map((_, idx) => ({
      id: `e-${idx}`,
      url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400",
      name: `fashion-${idx}.jpg`,
      width: 900,
      height: 1350
    })),
    coverImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=400",
    settings: {
      title: "Fashion Editorial",
      description: "Elena's Premium Fashion Editorial Showcase",
      theme: "dark",
      music: "electronic-ambient",
      visibility: "Public",
      passcode: "",
      watermark: false,
      allowDownload: false,
      albumSize: "a4-portrait"
    },
    status: "Published",
    updated: "3 weeks ago",
    gradient: "from-slate-900 to-slate-950",
  },
  {
    id: "demo-album",
    slug: "demo-album",
    name: "Aura Showcase",
    coupleName: "Aura Demo Portfolio",
    eventType: "editorial",
    eventDate: "2026-07-04",
    photos: Array(6).fill(null).map((_, idx) => {
      const urls = [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200"
      ];
      const names = ["landscape1.jpg", "portrait1.jpg", "landscape2.jpg", "portrait2.jpg", "landscape3.jpg", "landscape4.jpg"];
      const widths = [1200, 800, 1000, 900, 1200, 1200];
      const heights = [800, 1200, 750, 1350, 800, 800];
      return {
        id: `demo-${idx}`,
        url: urls[idx],
        name: names[idx],
        width: widths[idx],
        height: heights[idx]
      };
    }),
    coverImage: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
    settings: {
      title: "Aura Showcase",
      description: "Premium photographer presentation showcase book.",
      theme: "dark-luxury",
      music: "fine-art",
      visibility: "Public",
      passcode: "",
      watermark: false,
      allowDownload: true,
      albumSize: "auto"
    },
    status: "Published",
    updated: "Just now",
    gradient: "from-[#0b3037] to-slate-900"
  }
];

const albumRepo = new AlbumRepository();
const photoRepo = new PhotoRepository();
const draftRepo = new DraftRepository();
const albumService = new AlbumService(albumRepo, draftRepo, photoRepo);

const devUserId = "11111111-1111-1111-1111-111111111111";

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  return `${base || 'album'}-${Math.random().toString(36).substring(2, 6)}`;
}

function mapDbAlbumToFrontend(dbAlbum: any, draftPayload: any, photos: any[]): Album {
  const payload = draftPayload || {};
  return {
    id: dbAlbum.id,
    slug: dbAlbum.slug || "",
    name: dbAlbum.title || payload.name || "Untitled Collection",
    coupleName: payload.coupleName || "Event",
    eventType: payload.eventType || "editorial",
    eventDate: payload.eventDate || dbAlbum.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    coverImage: payload.coverImage || "",
    photos: (photos && photos.length > 0)
      ? photos.map((p) => ({
          id: p.id,
          url: p.url,
          name: p.name || `photo-${p.id}.jpg`,
          width: p.width || 1200,
          height: p.height || 800,
          optimizedUrl: p.optimizedUrl || p.url,
          thumbnailUrl: p.thumbnailUrl || p.url,
          orientation: p.orientation || 0
        }))
      : (payload.photos || []).map((p: any) => ({
          id: p.id,
          url: p.url,
          name: p.name || `photo-${p.id || 'unknown'}.jpg`,
          width: p.width || 1200,
          height: p.height || 800,
          optimizedUrl: p.optimizedUrl || p.url,
          thumbnailUrl: p.thumbnailUrl || p.url,
          orientation: p.orientation || 0
        })),
    settings: {
      title: dbAlbum.title || payload.settings?.title || "Untitled Collection",
      description: payload.settings?.description || "",
      theme: payload.settings?.theme || "dark",
      music: payload.settings?.music || "none",
      visibility: dbAlbum.visibility === "password_protected" ? "Private" : "Public",
      passcode: payload.settings?.passcode || "",
      watermark: payload.settings?.watermark ?? false,
      allowDownload: payload.settings?.allowDownload ?? true,
      albumSize: payload.settings?.albumSize || "auto",
      customWidth: payload.settings?.customWidth,
      customHeight: payload.settings?.customHeight,
      customUnit: payload.settings?.customUnit || "mm",
      detectedSize: payload.settings?.detectedSize,
      qrCodeDataUrl: payload.settings?.qrCodeDataUrl,
      qrCodeSvg: payload.settings?.qrCodeSvg,
    },
    status: dbAlbum.status === "published" ? "Published" : "Draft",
    updated: "Just now",
    gradient: payload.gradient || "from-slate-900 to-slate-950",
    published_at: payload.published_at || undefined,
    soft_delete_at: dbAlbum.soft_delete_at || undefined
  };
}

export class DbService {
  public static onBinariesLoaded(cb: () => void): () => void {
    // No-op fallback since IndexedDB binaries are no longer used
    setTimeout(cb, 10);
    return () => {};
  }

  /**
   * Fetch all albums from Supabase.
   */
  public static async getAlbums(): Promise<Album[]> {
    try {
      const { data: dbAlbums, error: albumErr } = await supabase
        .from('albums')
        .select('*, drafts(payload)')
        .order('created_at', { ascending: false });

      if (albumErr) throw albumErr;

      const list: Album[] = [];
      for (const row of dbAlbums || []) {
        const photos = await photoRepo.findByAlbum(row.id);
        const draft = row.drafts?.[0] || row.drafts;
        const payload = draft ? draft.payload : {};
        list.push(mapDbAlbumToFrontend(row, payload, photos));
      }
      return list;
    } catch (err) {
      console.error("Error loading albums from Supabase:", err);
      return [];
    }
  }

  /**
   * Fetch single album by ID/Slug.
   */
  public static async getAlbumById(id: string): Promise<Album | undefined> {
    if (!isUuid(id)) {
      if (id === "demo-album" || id === "wedding-coll" || id === "pre-wedding" || id === "reception" || id === "editorial-shoot") {
        return DEFAULT_ALBUMS.find((a) => a.id === id);
      }
      // Try to query by slug instead
      try {
        const { data: dbAlbum } = await supabase
          .from('albums')
          .select('*, drafts(payload)')
          .eq('slug', id)
          .maybeSingle();
        if (dbAlbum) {
          const photos = await photoRepo.findByAlbum(dbAlbum.id);
          const draft = dbAlbum.drafts?.[0] || dbAlbum.drafts;
          const payload = draft ? draft.payload : {};
          return mapDbAlbumToFrontend(dbAlbum, payload, photos);
        }
      } catch (err) {
        console.warn("Failed to find album by slug:", err);
      }
      return undefined;
    }

    try {
      const { data: dbAlbum, error } = await supabase
        .from('albums')
        .select('*, drafts(payload)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!dbAlbum) return undefined;

      const photos = await photoRepo.findByAlbum(dbAlbum.id);
      const draft = dbAlbum.drafts?.[0] || dbAlbum.drafts;
      const payload = draft ? draft.payload : {};
      return mapDbAlbumToFrontend(dbAlbum, payload, photos);
    } catch (err) {
      console.error("Error finding album by id:", err);
      return undefined;
    }
  }

  private static async syncPhotos(albumId: string, incomingPhotos: any[]) {
    const currentPhotos = await photoRepo.findByAlbum(albumId);
    const incomingPhotoIds = new Set(incomingPhotos.map((p) => p.id));

    console.log("[syncPhotos] currentPhotos IDs:", currentPhotos.map(p => ({ id: p.id, storage_file_id: p.storage_file_id })));
    console.log("[syncPhotos] incomingPhotos IDs:", Array.from(incomingPhotoIds));

    // Remove deleted photos
    for (const p of currentPhotos) {
      if (!incomingPhotoIds.has(p.id) && !incomingPhotoIds.has(p.storage_file_id)) {
        await supabase.from('album_photos').delete().eq('id', p.id);
      }
    }

    // Update orientation / order index for remaining or newly uploaded photos
    for (let idx = 0; idx < incomingPhotos.length; idx++) {
      const photo = incomingPhotos[idx];
      const match = currentPhotos.find((p) => p.id === photo.id || p.storage_file_id === photo.id);
      if (match) {
        await supabase.from('album_photos')
          .update({
            order_index: idx,
            orientation: photo.orientation || 0
          })
          .eq('id', match.id);
      } else {
        await supabase.from('album_photos')
          .update({ order_index: idx })
          .eq('storage_file_id', photo.id);
      }
    }
  }

  /**
   * Create a new album item.
   */
  public static async createAlbum(album: Omit<Album, "id" | "updated" | "gradient">): Promise<Album> {
    // Ensure dev user exists in the users table first
    try {
      await supabase.from('users').upsert({
        id: devUserId,
        email: 'dev-user@snapflip.com',
        name: 'Dev User',
        role: 'creator',
      });
    } catch (e) {
      console.warn("Failed to upsert dev user in createAlbum:", e);
    }

    const generatedSlug = generateSlug(album.name);
    const { data: created, error } = await supabase
      .from('albums')
      .insert({
        user_id: devUserId,
        title: album.name,
        slug: generatedSlug,
        status: album.status?.toLowerCase() || 'draft',
        visibility: album.settings?.visibility === 'Private' ? 'password_protected' : 'public',
      })
      .select()
      .single();

    if (error) throw error;

    // Create draft record to store metadata payload
    const gradients = [
      "from-[#0b3037] to-slate-900",
      "from-[#051a24] to-slate-900",
      "from-purple-950/40 to-slate-900",
      "from-slate-900 to-slate-950"
    ];
    const gradient = gradients[Math.floor(Math.random() * gradients.length)];
    const isPublished = album.status === "Published";
    const payload = {
      ...album,
      id: created.id,
      slug: generatedSlug,
      published_at: isPublished ? new Date().toISOString() : undefined,
      gradient,
      updated: "Just now"
    };

    await draftRepo.save(created.id, payload);

    if (album.photos !== undefined) {
      await this.syncPhotos(created.id, album.photos);
    }

    const finalPhotos = await photoRepo.findByAlbum(created.id);
    return mapDbAlbumToFrontend(created, payload, finalPhotos);
  }

  /**
   * Update fields of an existing album.
   */
  public static async updateAlbum(id: string, fields: Partial<Album>): Promise<Album> {
    if (!isUuid(id)) {
      if (id === "demo-album" || id === "wedding-coll" || id === "pre-wedding" || id === "reception" || id === "editorial-shoot") {
        const idx = DEFAULT_ALBUMS.findIndex((a) => a.id === id);
        if (idx !== -1) {
          const original = DEFAULT_ALBUMS[idx];
          const updated = {
            ...original,
            ...fields,
            settings: {
              ...original.settings,
              ...(fields.settings || {})
            },
            status: fields.status || original.status,
            published_at: fields.status === 'Published' && original.status !== 'Published' ? new Date().toISOString() : original.published_at || fields.published_at
          };
          DEFAULT_ALBUMS[idx] = updated;
          return updated;
        }
      }
      throw new Error(`Invalid UUID format: ${id}`);
    }

    // Fetch existing album status and slug
    const { data: currentDbAlbum } = await supabase.from('albums').select('status, slug').eq('id', id).maybeSingle();
    const existingDbStatus = currentDbAlbum?.status;
    const existingDbSlug = currentDbAlbum?.slug;

    // 1. Update album record in DB
    const updateObj: Record<string, any> = {};
    if (fields.name !== undefined) {
      updateObj.title = fields.name;
      if (!existingDbSlug || existingDbStatus === 'draft') {
        updateObj.slug = generateSlug(fields.name);
      }
    }
    if (fields.status !== undefined) {
      updateObj.status = fields.status.toLowerCase();
    }
    if (fields.settings?.visibility !== undefined) {
      updateObj.visibility = fields.settings.visibility === 'Private' ? 'password_protected' : 'public';
    }

    if (Object.keys(updateObj).length > 0) {
      const { error: updateError } = await supabase.from('albums').update(updateObj).eq('id', id);
      if (updateError) {
        console.error("Error updating album status/metadata in DB:", updateError);
        throw updateError;
      }
    }

    // 2. Fetch existing payload, merge fields, and update drafts payload
    const existingDraft = await draftRepo.findByAlbum(id);
    const existingPayload = existingDraft ? existingDraft.payload : {};
    
    // Determine published_at
    let publishedAt = existingPayload.published_at;
    if (fields.status === 'Published' && existingPayload.status !== 'Published') {
      publishedAt = new Date().toISOString();
    } else if (fields.published_at) {
      publishedAt = fields.published_at;
    }

    const updatedPayload = {
      ...existingPayload,
      ...fields,
      id,
      slug: updateObj.slug || existingDbSlug || existingPayload.slug,
      published_at: publishedAt
    };

    await draftRepo.save(id, updatedPayload);

    // 3. Synchronize album_photos table if photos array is provided
    if (fields.photos !== undefined) {
      await this.syncPhotos(id, fields.photos);
    }

    const { data: updatedAlbum, error: fetchError } = await supabase.from('albums').select('*').eq('id', id).single();
    if (fetchError) {
      console.error("Error fetching updated album from DB:", fetchError);
      throw fetchError;
    }
    const finalPhotos = await photoRepo.findByAlbum(id);
    return mapDbAlbumToFrontend(updatedAlbum, updatedPayload, finalPhotos);
  }

  /**
   * Soft Delete.
   */
  public static async softDeleteAlbum(id: string): Promise<boolean> {
    if (!isUuid(id)) return false;
    return albumService.softDelete(id);
  }

  /**
   * Restore.
   */
  public static async restoreAlbum(id: string): Promise<boolean> {
    if (!isUuid(id)) return false;
    return albumService.restore(id);
  }

  /**
   * Permanently delete an album.
   */
  public static async permanentDeleteAlbum(id: string): Promise<void> {
    if (!isUuid(id)) return;
    await albumService.hardDelete(devUserId, id);
  }

  /**
   * Duplicate an existing album.
   */
  public static async duplicateAlbum(id: string): Promise<Album> {
    if (!isUuid(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }

    const original = await this.getAlbumById(id);
    if (!original) throw new Error(`Album with ID ${id} not found.`);

    const duplicated = await this.createAlbum({
      name: `${original.name} (Copy)`,
      coupleName: original.coupleName,
      eventType: original.eventType,
      eventDate: original.eventDate,
      photos: [],
      coverImage: original.coverImage,
      settings: {
        ...original.settings,
        title: `${original.settings.title} (Copy)`,
      },
      status: "Draft",
    });

    // Copy photos link rows
    for (let idx = 0; idx < original.photos.length; idx++) {
      const p = original.photos[idx];
      // Since it's duplicated, we can link it to the same storage_files in Supabase
      if (p.id) {
        // Find storage_file row linked to this photo
        const { data: apRow } = await supabase
          .from('album_photos')
          .select('storage_file_id')
          .eq('id', p.id)
          .maybeSingle();

        if (apRow && apRow.storage_file_id) {
          await photoRepo.create({
            album_id: duplicated.id,
            storage_file_id: apRow.storage_file_id,
            order_index: idx,
            orientation: p.orientation || 0
          });
        }
      }
    }

    return (await this.getAlbumById(duplicated.id))!;
  }

  /**
   * Publish a draft album.
   */
  public static async publishAlbum(id: string): Promise<Album> {
    if (!isUuid(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }
    await albumService.publish(id);
    return (await this.getAlbumById(id))!;
  }

  /**
   * Unpublish an album.
   */
  public static async unpublishAlbum(id: string): Promise<Album> {
    if (!isUuid(id)) {
      throw new Error(`Invalid UUID format: ${id}`);
    }
    await supabase.from('albums').update({ status: 'draft' }).eq('id', id);
    return (await this.getAlbumById(id))!;
  }
}

export default DbService;
