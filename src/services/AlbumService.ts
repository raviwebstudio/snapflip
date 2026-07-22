import { AlbumRepository } from '../repositories/AlbumRepository';
import { DraftRepository } from '../repositories/DraftRepository';
import { PhotoRepository } from '../repositories/PhotoRepository';
import { StorageService } from './StorageService';
import { supabase } from '../lib/supabase';

export class AlbumService {
  private albumRepo: AlbumRepository;
  private draftRepo: DraftRepository;
  private photoRepo: PhotoRepository;
  private storageService: StorageService;

  constructor(
    albumRepo: AlbumRepository = new AlbumRepository(),
    draftRepo: DraftRepository = new DraftRepository(),
    photoRepo: PhotoRepository = new PhotoRepository(),
    storageService: StorageService = new StorageService()
  ) {
    this.albumRepo = albumRepo;
    this.draftRepo = draftRepo;
    this.photoRepo = photoRepo;
    this.storageService = storageService;
  }

  async createDraft(userId: string, title: string): Promise<string> {
    const album = await this.albumRepo.create({
      user_id: userId,
      title,
      status: 'draft',
      visibility: 'public'
    });
    return album.id;
  }

  async publish(albumId: string): Promise<boolean> {
    const album = await this.albumRepo.update(albumId, { status: 'published' });
    if (album) {
      const draft = await this.draftRepo.findByAlbum(albumId);
      if (draft) {
        const payload = draft.payload || {};
        payload.status = 'Published';
        await this.draftRepo.save(albumId, payload);
      }
      return true;
    }
    return false;
  }

  async archive(albumId: string): Promise<boolean> {
    await this.albumRepo.update(albumId, { status: 'archived' });
    return true;
  }

  async softDelete(albumId: string): Promise<boolean> {
    try {
      console.log("AlbumService: softDelete called for ID:", albumId);
      const album = await this.albumRepo.findById(albumId);
      console.log("AlbumService: findById result:", album);
      if (!album) {
        console.warn("AlbumService: findById returned null/undefined for ID:", albumId);
        return false;
      }
      const userId = album.user_id;

      const photos = await this.photoRepo.findByAlbum(albumId);

      // Delete folder from Google Drive
      try {
        console.log("AlbumService: deleting storage folder for user", userId, "album", albumId);
        await this.storageService.deleteFolder(userId, albumId);
      } catch (driveErr) {
        console.warn('Google Drive folder deletion failed during softDelete:', driveErr);
      }

      // Delete storage_files records
      const storageFileIds = photos.map((p) => p.storage_file_id).filter(Boolean);
      if (storageFileIds.length > 0) {
        const { error: storageErr } = await supabase
          .from('storage_files')
          .delete()
          .in('id', storageFileIds);
        if (storageErr) {
          console.error('Error deleting storage_files records during softDelete:', storageErr);
        }
      }

      // Delete album_photos records
      const { error: photoErr } = await supabase
        .from('album_photos')
        .delete()
        .eq('album_id', albumId);
      if (photoErr) {
        console.error('Error deleting album_photos records during softDelete:', photoErr);
      }

      return this.albumRepo.softDelete(albumId);
    } catch (err) {
      console.error('Failed to soft delete album:', err);
      return false;
    }
  }

  async restore(albumId: string): Promise<boolean> {
    return this.albumRepo.restore(albumId);
  }

  async hardDelete(userId: string, albumId: string): Promise<boolean> {
    try {
      // 1. Fetch all photos to get their storage_file_id
      const photos = await this.photoRepo.findByAlbum(albumId);

      // 2. Delete the album folder recursively from Google Drive
      try {
        await this.storageService.deleteFolder(userId, albumId);
      } catch (driveErr) {
        console.warn('Google Drive folder deletion failed/skipped during hardDelete:', driveErr);
      }

      // 3. Delete metadata records from storage_files table
      const storageFileIds = photos.map((p) => p.storage_file_id).filter(Boolean);
      if (storageFileIds.length > 0) {
        const { error: storageErr } = await supabase
          .from('storage_files')
          .delete()
          .in('id', storageFileIds);
        if (storageErr) {
          console.error('Error hard deleting storage_files records:', storageErr);
        }
      }

      // 4. Delete album metadata from DB (cascades to album_photos, drafts, shares, analytics, passwords)
      const success = await this.albumRepo.hardDelete(albumId);
      return success;
    } catch (err) {
      console.error('Failed to hard delete album:', err);
      return false;
    }
  }
}
