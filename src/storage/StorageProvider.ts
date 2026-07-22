export interface StorageProvider {
  /** Uploads a file buffer to the provider and returns metadata */
  upload(
    file: File | Blob, 
    path: string, 
    metadata?: {
      width?: number;
      height?: number;
      originalSize?: number;
      optimizedSize?: number;
      compressionRatio?: number;
      mimeType?: string;
    }
  ): Promise<{ id: string; url: string; size: number }>;

  uploadGroup?(
    userId: string,
    albumId: string,
    original: File,
    optimized: Blob,
    thumbnail: Blob,
    checksum: string
  ): Promise<{
    storageFileId: string;
    googleFileId: string;
    originalPath: string;
    optimizedPath: string;
    thumbnailPath: string;
    reused: boolean;
  }>;
  
  /** Deletes a file by its provider ID */
  delete(providerId: string): Promise<boolean>;
  
  /** Retrieves a direct URL for a given provider ID */
  getUrl(providerId: string): Promise<string>;
  
  /** Creates a folder (if applicable to provider) */
  createFolder(path: string): Promise<{ id: string }>;
  
  /** Renames a file or folder */
  rename(providerId: string, newName: string): Promise<boolean>;
  
  /** Checks if a file or folder exists */
  exists(path: string): Promise<boolean>;

  /** Deletes a folder and all its contents recursively */
  deleteFolder?(path: string): Promise<boolean>;
}
