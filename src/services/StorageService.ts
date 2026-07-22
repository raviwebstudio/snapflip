import { GoogleDriveStorageProvider } from '../storage/GoogleDriveStorageProvider';
import { LocalStorageProvider } from '../storage/LocalStorageProvider';
import type { StorageProvider } from '../storage/StorageProvider';

export class StorageService {
  private provider: StorageProvider;

  constructor() {
    // Development only. Can be replaced with Google Drive or Cloudflare R2 without changing business logic.
    const isLocal = import.meta.env.VITE_STORAGE_PROVIDER === 'local';
    this.provider = isLocal ? new LocalStorageProvider() : new GoogleDriveStorageProvider();
  }

  async uploadGroup(
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
  }> {
    if (typeof (this.provider as any).uploadGroup === 'function') {
      return (this.provider as any).uploadGroup(userId, albumId, original, optimized, thumbnail, checksum);
    }
    throw new Error('uploadGroup is not supported on current StorageProvider');
  }

  async uploadFile(
    userId: string,
    albumId: string,
    file: File | Blob,
    type: 'original' | 'optimized' | 'thumbnail',
    metadata?: {
      width?: number;
      height?: number;
      originalSize?: number;
      optimizedSize?: number;
      compressionRatio?: number;
      mimeType?: string;
    }
  ): Promise<{ id: string; url: string }> {
    const path = `${userId}/${albumId}/${type}/${(file as File).name || 'image.webp'}`;
    const result = await this.provider.upload(file, path, metadata);
    return { id: result.id, url: result.url };
  }

  async deleteFile(providerId: string): Promise<boolean> {
    return this.provider.delete(providerId);
  }

  async getFileUrl(providerId: string): Promise<string> {
    return this.provider.getUrl(providerId);
  }

  async deleteFolder(userId: string, albumId: string): Promise<boolean> {
    if (typeof this.provider.deleteFolder === 'function') {
      return this.provider.deleteFolder(`${userId}/${albumId}`);
    }
    return false;
  }
}
