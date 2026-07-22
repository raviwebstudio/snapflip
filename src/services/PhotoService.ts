import { PhotoRepository } from '../repositories/PhotoRepository';
import { StorageService } from './StorageService';
import { ValidationService } from './ValidationService';
import { optimizeImagePipeline } from '../utils/imageUtils';

export class PhotoService {
  private photoRepo: PhotoRepository;
  private storageService: StorageService;
  private validationService: ValidationService;

  constructor(
    photoRepo: PhotoRepository = new PhotoRepository(),
    storageService: StorageService = new StorageService(),
    validationService: ValidationService = new ValidationService()
  ) {
    this.photoRepo = photoRepo;
    this.storageService = storageService;
    this.validationService = validationService;
  }

  async uploadPhoto(
    userId: string,
    albumId: string,
    file: File,
    orderIndex: number,
    orientation: number
  ): Promise<{ storageFileId: string; url: string; optimizedUrl: string; thumbnailUrl: string; width?: number; height?: number }> {
    const canUpload = await this.validationService.canUploadMore(albumId);
    if (!canUpload) {
      throw new Error('Maximum of 50 images per album allowed.');
    }

    // 1. Browser-side optimization pipeline (resizing, converting, quality scaling, checksumming)
    const pipeline = await optimizeImagePipeline(file);

    // 2. Upload all three variants in a single grouped call
    const result = await this.storageService.uploadGroup(
      userId,
      albumId,
      file,
      pipeline.optimized.blob,
      pipeline.thumbnail.blob,
      pipeline.checksum
    );

    // 3. Ensure test user and album exist in the DB for the foreign keys to succeed
    try {
      const { supabase } = await import('../lib/supabase');
      await supabase.from('users').upsert({
        id: userId,
        email: 'dev-user@snapflip.com',
        name: 'Dev User',
        role: 'creator',
      });

      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('id', albumId)
        .maybeSingle();

      if (!existingAlbum) {
        await supabase.from('albums').insert({
          id: albumId,
          user_id: userId,
          title: 'Development Album',
          slug: `dev-album-${albumId}`,
          status: 'draft',
          visibility: 'public',
        });
      }
    } catch (e) {
      console.warn('Ensuring test user/album failed, continuing anyway:', e);
    }

    // 4. Save the photo record linked to the storage file
    await this.photoRepo.create({
      album_id: albumId,
      storage_file_id: result.storageFileId,
      order_index: orderIndex,
      orientation: orientation,
    });

    return {
      storageFileId: result.storageFileId,
      url: result.originalPath,
      optimizedUrl: result.optimizedPath,
      thumbnailUrl: result.thumbnailPath,
      width: pipeline.metadata.width,
      height: pipeline.metadata.height,
    };
  }

  async reorderPhotos(
    _albumId: string,
    newOrder: { photoId: string; orderIndex: number }[]
  ): Promise<boolean> {
    for (const item of newOrder) {
      await this.photoRepo.updateOrder(item.photoId, item.orderIndex);
    }
    return true;
  }

  async removePhoto(photoId: string, driveFileId?: string): Promise<boolean> {
    // Delete from Google Drive if a Drive file ID is provided
    if (driveFileId) {
      await this.storageService.deleteFile(driveFileId);
    }
    return this.photoRepo.delete(photoId);
  }

}
