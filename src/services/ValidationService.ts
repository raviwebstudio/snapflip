import { PhotoRepository } from '../repositories/PhotoRepository';

export class ValidationService {
  private maxImagesPerAlbum = 50;
  private photoRepo: PhotoRepository;

  constructor(photoRepo: PhotoRepository = new PhotoRepository()) {
    this.photoRepo = photoRepo;
  }

  async canUploadMore(albumId: string): Promise<boolean> {
    const currentCount = await this.photoRepo.countByAlbum(albumId);
    return currentCount < this.maxImagesPerAlbum;
  }

  isValidTransition(currentStatus: string, newStatus: string): boolean {
    const validTransitions: Record<string, string[]> = {
      'draft': ['published', 'soft_deleted'],
      'published': ['shared', 'archived', 'soft_deleted'],
      'shared': ['archived', 'soft_deleted'],
      'archived': ['published', 'soft_deleted'],
      'soft_deleted': ['draft', 'published', 'archived'] // restore
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  isValidFile(file: File): boolean {
    // Only accept image files
    return file.type.startsWith('image/');
  }
}
