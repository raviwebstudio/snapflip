# API Contract

This document outlines the core interfaces and methods exposed by the Repositories, Services, and Storage Providers.

## 1. Storage Provider Interface

`src/storage/StorageProvider.ts`
```typescript
export interface StorageProvider {
  /** Uploads a file buffer to the provider and returns metadata */
  upload(file: File | Blob, path: string): Promise<{ id: string; url: string; size: number }>;
  
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
}
```

## 2. Services

### AlbumService
```typescript
export interface AlbumService {
  createDraft(userId: string, title: string): Promise<string>;
  publish(albumId: string): Promise<boolean>;
  archive(albumId: string): Promise<boolean>;
  softDelete(albumId: string): Promise<boolean>;
  restore(albumId: string): Promise<boolean>;
}
```

### PhotoService
```typescript
export interface PhotoService {
  uploadPhoto(albumId: string, file: File, orderIndex: number, orientation: number): Promise<boolean>;
  processImagePipeline(file: File): Promise<{ original: File; optimized: File; thumbnail: File }>;
  reorderPhotos(albumId: string, newOrder: { photoId: string; orderIndex: number }[]): Promise<boolean>;
  removePhoto(photoId: string): Promise<boolean>;
}
```

### ShareService
```typescript
export interface ShareService {
  generateShareLink(albumId: string): Promise<string>;
  generateQRCode(albumId: string): Promise<string>;
  setPassword(albumId: string, password: string): Promise<boolean>;
  verifyPassword(albumId: string, password: string): Promise<boolean>;
}
```

### AnalyticsService
```typescript
export interface AnalyticsService {
  logEvent(albumId: string, eventType: string, visitorHash: string, metadata: any): Promise<void>;
  getAlbumStats(albumId: string): Promise<{ views: number; uniqueVisitors: number; downloads: number; shares: number }>;
}
```

### ValidationService
```typescript
export interface ValidationService {
  canUploadMore(albumId: string): Promise<boolean>; // checks against max 50
  isValidTransition(currentStatus: string, newStatus: string): boolean;
  isValidFile(file: File): boolean;
}
```

## 3. Repositories

### AlbumRepository
```typescript
export interface AlbumRepository {
  findById(id: string): Promise<any>;
  findBySlug(slug: string): Promise<any>;
  create(album: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  softDelete(id: string): Promise<boolean>;
}
```

### PhotoRepository
```typescript
export interface PhotoRepository {
  findByAlbum(albumId: string): Promise<any[]>;
  create(photo: any): Promise<any>;
  delete(id: string): Promise<boolean>;
  countByAlbum(albumId: string): Promise<number>;
}
```
