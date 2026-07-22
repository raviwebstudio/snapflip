import { supabase } from '../lib/supabase';
import type { StorageProvider } from './StorageProvider';

/**
 * Development only. Can be replaced with Google Drive or Cloudflare R2 without changing business logic.
 */
export class LocalStorageProvider implements StorageProvider {
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

  private async callLocalApi(endpoint: string, payload: Record<string, unknown>): Promise<any> {
    const res = await fetch(`/api/storage/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Local Storage API error: ${text}`);
    }
    return res.json();
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
    // 1. Check database for existing checksum (Deduplication)
    const { data: existing } = await supabase
      .from('storage_files')
      .select('*')
      .eq('album_id', albumId)
      .eq('checksum', checksum)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return {
        storageFileId: existing.id,
        googleFileId: existing.google_file_id || 'local',
        originalPath: existing.original_path,
        optimizedPath: existing.optimized_path,
        thumbnailPath: existing.thumbnail_path,
        reused: true,
      };
    }

    // 2. Upload variants base64 to local API dev server
    const origBase64 = await this.fileToBase64(original);
    const optBase64 = await this.fileToBase64(optimized);
    const thumbBase64 = await this.fileToBase64(thumbnail);
    const baseName = original.name.replace(/\.[^/.]+$/, "");

    const uploadResult = await this.callLocalApi('upload', {
      userId,
      albumId,
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

    // 3. Save metadata exactly like production
    const { data: inserted, error: insertError } = await supabase
      .from('storage_files')
      .insert({
        user_id: userId,
        album_id: albumId,
        google_file_id: 'local',
        google_folder_id: 'local',
        original_path: uploadResult.originalPath,
        optimized_path: uploadResult.optimizedPath,
        thumbnail_path: uploadResult.thumbnailPath,
        mime_type: original.type,
        original_size: original.size,
        optimized_size: optimized.size,
        thumbnail_size: thumbnail.size,
        checksum: checksum,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to insert local storage metadata: ${insertError.message}`);
    }

    return {
      storageFileId: inserted.id,
      googleFileId: 'local',
      originalPath: inserted.original_path,
      optimizedPath: inserted.optimized_path,
      thumbnailPath: inserted.thumbnail_path,
      reused: false,
    };
  }

  async upload(
    file: File | Blob, 
    path: string,
    metadata?: {
      mimeType?: string;
    }
  ): Promise<{ id: string; url: string; size: number }> {
    const parts = path.split('/');
    const fileName = parts.pop()!;
    const type = parts.pop()!;
    const albumId = parts.pop()!;
    const userId = parts.pop()!;
    const fileBase64 = await this.fileToBase64(file);
    const mimeType = file instanceof File ? file.type : (metadata?.mimeType || 'application/octet-stream');

    const result = await this.callLocalApi('upload_single', {
      userId,
      albumId,
      type,
      fileName,
      fileBase64,
      mimeType,
    });

    return {
      id: 'local',
      url: result.url,
      size: result.size,
    };
  }

  async delete(storageFileId: string): Promise<boolean> {
    // Get file info from database
    const { data: fileInfo } = await supabase
      .from('storage_files')
      .select('*')
      .eq('id', storageFileId)
      .maybeSingle();

    if (fileInfo) {
      await this.callLocalApi('delete_paths', {
        paths: [fileInfo.original_path, fileInfo.optimized_path, fileInfo.thumbnail_path],
      });
      
      const { error } = await supabase
        .from('storage_files')
        .delete()
        .eq('id', storageFileId);
      
      if (error) {
        console.error('Failed to delete storage_files row:', error);
      }
    }
    return true;
  }

  async getUrl(providerId: string): Promise<string> {
    // For local dev, the path/url stored is already the direct path served by Vite
    return providerId;
  }

  async createFolder(_path: string): Promise<{ id: string }> {
    return { id: 'local' };
  }

  async rename(_providerId: string, _newName: string): Promise<boolean> {
    return true;
  }

  async exists(path: string): Promise<boolean> {
    const result = await this.callLocalApi('exists', { path });
    return result.exists;
  }

  async deleteFolder(path: string): Promise<boolean> {
    // path is expected as "{userId}/{albumId}"
    const parts = path.split('/');
    const albumId = parts.pop()!;
    const userId = parts.pop()!;

    await this.callLocalApi('delete_folder', { userId, albumId });

    // Clean up database rows
    await supabase
      .from('storage_files')
      .delete()
      .eq('album_id', albumId);

    return true;
  }
}
