import { FunctionsHttpError } from '@supabase/supabase-js';
import type { StorageProvider } from './StorageProvider';
import { supabase } from '../lib/supabase';

/**
 * Google Drive storage provider.
 * All operations are proxied through the Supabase Edge Function `drive-storage`
 * so that the Service Account credentials never reach the browser.
 */
export class GoogleDriveStorageProvider implements StorageProvider {

  private async callEdgeFunction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.functions.invoke('drive-storage', {
      body: payload,
    });
    if (error) {
      let detailedMessage = error.message;
      if (error instanceof FunctionsHttpError) {
        try {
          const body = await error.context.json();
          if (body?.error) {
            detailedMessage = typeof body.error === 'string' ? body.error : JSON.stringify(body.error);
          } else if (body?.message) {
            detailedMessage = body.message;
          } else {
            detailedMessage = JSON.stringify(body);
          }
        } catch {
          // ignore parsing error
        }
      }
      throw new Error(`Drive Edge Function error: ${detailedMessage}`);
    }
    if (data?.error) {
      throw new Error(`Drive API error: ${data.error}`);
    }
    return data;
  }

  private async fileToBase64(file: File | Blob): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const chunks: string[] = [];
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      chunks.push(String.fromCharCode(...bytes.subarray(i, i + chunkSize)));
    }
    return btoa(chunks.join(''));
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
    const origBase64 = await this.fileToBase64(original);
    const optBase64 = await this.fileToBase64(optimized);
    const thumbBase64 = await this.fileToBase64(thumbnail);
    const baseName = original.name.replace(/\.[^/.]+$/, "");

    const result = await this.callEdgeFunction({
      action: 'upload',
      userId,
      albumId,
      checksum,
      mimeType: original.type,
      original: {
        fileName: original.name,
        fileBase64: origBase64,
        size: original.size,
      },
      optimized: {
        fileName: `${baseName}_optimized.webp`,
        fileBase64: optBase64,
        size: optimized.size,
      },
      thumbnail: {
        fileName: `${baseName}_thumbnail.webp`,
        fileBase64: thumbBase64,
        size: thumbnail.size,
      },
    });

    return {
      storageFileId: result.storageFileId as string,
      googleFileId: result.googleFileId as string,
      originalPath: result.originalPath as string,
      optimizedPath: result.optimizedPath as string,
      thumbnailPath: result.thumbnailPath as string,
      reused: result.reused as boolean,
    };
  }

  async upload(
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
  ): Promise<{ id: string; url: string; size: number }> {
    // Left as compatibility stub or helper
    const parts = path.split('/');
    const fileName = parts.pop()!;
    const type = parts.pop()!;
    const albumId = parts.pop()!;
    const userId = parts.pop()!;
    const fileBase64 = await this.fileToBase64(file);
    const mimeType = file instanceof File ? file.type : (metadata?.mimeType || 'application/octet-stream');

    const result = await this.callEdgeFunction({
      action: 'upload_single_fallback', // or just callEdgeFunction upload
      userId,
      albumId,
      type,
      fileName,
      fileBase64,
      mimeType,
    });

    return {
      id: result.storageFileId as string,
      url: result.url as string,
      size: result.size as number,
    };
  }

  async delete(storageFileId: string): Promise<boolean> {
    const result = await this.callEdgeFunction({
      action: 'delete',
      storageFileId,
    });
    return result.success as boolean;
  }

  async getUrl(providerId: string): Promise<string> {
    const result = await this.callEdgeFunction({
      action: 'getPublicUrl',
      driveFileId: providerId,
    });
    return result.url as string;
  }

  async createFolder(path: string): Promise<{ id: string }> {
    // path is expected as "{userId}/{albumId}"
    const parts = path.split('/');
    const albumId = parts.pop()!;
    const userId = parts.pop()!;

    const result = await this.callEdgeFunction({
      action: 'createFolder',
      userId,
      albumId,
    });

    return { id: result.originalId as string };
  }

  async rename(providerId: string, newName: string): Promise<boolean> {
    const result = await this.callEdgeFunction({
      action: 'rename',
      driveFileId: providerId,
      newName,
    });
    return result.success as boolean;
  }

  async exists(providerId: string): Promise<boolean> {
    const result = await this.callEdgeFunction({
      action: 'exists',
      driveFileId: providerId,
    });
    return result.exists as boolean;
  }

  async deleteFolder(path: string): Promise<boolean> {
    // path is expected as "{userId}/{albumId}"
    const parts = path.split('/');
    const albumId = parts.pop()!;
    const userId = parts.pop()!;

    const result = await this.callEdgeFunction({
      action: 'deleteAlbumFolder',
      userId,
      albumId,
    });
    return result.success as boolean;
  }
}
