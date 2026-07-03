export interface Album {
  id: string;
  name: string;
  coupleName: string;
  eventType: string;
  eventDate: string;
  photos: { id: string; url: string; name: string; width?: number; height?: number }[];
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
      albumSize: "square-10"
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
  }
];

export class DbService {
  /**
   * Fetch all albums from localStorage database.
   */
  public static getAlbums(): Album[] {
    const data = localStorage.getItem("snapflip_albums");
    if (!data) {
      localStorage.setItem("snapflip_albums", JSON.stringify(DEFAULT_ALBUMS));
      return DEFAULT_ALBUMS;
    }
    try {
      const parsed = JSON.parse(data) as Album[];
      // Normalize: ensure every album has a valid settings object
      return parsed.map((album) => ({
        ...album,
        settings: {
          title: "",
          description: "",
          theme: "dark-luxury",
          music: "none",
          visibility: "Public" as const,
          passcode: "",
          watermark: false,
          allowDownload: true,
          albumSize: "auto",
          ...((album as Record<string, unknown>).settings as Record<string, unknown> || {}),
        },
      }));
    } catch {
      localStorage.setItem("snapflip_albums", JSON.stringify(DEFAULT_ALBUMS));
      return DEFAULT_ALBUMS;
    }
  }

  /**
   * Save the complete list of albums back to storage.
   */
  public static saveAlbums(albums: Album[]): void {
    localStorage.setItem("snapflip_albums", JSON.stringify(albums));
  }

  /**
   * Fetch single album by ID.
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
    
    albums.unshift(newAlbum);
    this.saveAlbums(albums);
    return newAlbum;
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
    const updatedAlbum = {
      ...albums[index],
      ...fields,
      updated: "Just now"
    };
    albums[index] = updatedAlbum;
    this.saveAlbums(albums);
    return updatedAlbum;
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
