# Backend Architecture

This document describes the architectural layers implemented to support Snapflip's transition to a production-grade backend, designed to scale to 100,000+ users.

## Core Principles
1. **Separation of Concerns:** React UI components NEVER interact with the database directly. All interactions flow through Services -> Repositories.
2. **Abstracted Storage:** Storage mechanisms (Google Drive, Supabase Storage, Cloudinary) are completely abstracted behind a `StorageProvider` interface, allowing the system to swap providers with zero UI or business logic changes.
3. **Normalized Data:** Supabase serves as the single source of truth using a highly normalized PostgreSQL schema.

## Layers

### 1. Presentation Layer (React UI)
- Currently frozen.
- Subscribes to or calls methods on the Service Layer.

### 2. Service Layer (`src/services/`)
Contains all business logic, validations, and orchestration.
- **`AlbumService`**: Manages the Album lifecycle (`Draft` -> `Published` -> `Shared` -> `Archived` -> `Soft Deleted` -> `Permanent Delete`). Handles soft deletes (14-day retention).
- **`PhotoService`**: Enforces limits (max 50 images per album) and manages the image pipeline (generates Original, Optimized, and Thumbnail assets).
- **`StorageService`**: Coordinates file uploads, linking them to the abstracted `StorageProvider`.
- **`ShareService`**: Responsible for album passwords and QR generation logic. Ensures passwords are required when viewing protected albums.
- **`AnalyticsService`**: Tracks Views, Unique Visitors, QR Opens, Downloads, Shares, Device, Browser, Country, and Referrer data.
- **`ValidationService`**: Centralized logic for input validation, permissions, and limit checking.

### 3. Repository Layer (`src/repositories/`)
Handles all direct database interactions. Converts service requests into Supabase queries.
- **`UserRepository`**: CRUD for users.
- **`AlbumRepository`**: CRUD and complex queries for Albums.
- **`PhotoRepository`**: Manages AlbumPhotos metadata.
- **`DraftRepository`**: Manages auto-saved drafts and their JSONB payloads.
- **`AnalyticsRepository`**: Inserts and aggregates analytics events.

### 4. Storage Provider Layer (`src/providers/` or `src/storage/`)
An interface-driven layer wrapping external APIs.
- **`StorageProvider` (Interface)**: Defines `upload()`, `delete()`, `getUrl()`, `createFolder()`, `rename()`, `exists()`.
- **`GoogleDriveStorageProvider`**: First implementation, wrapping Google Drive API Beta integration.

## Image Pipeline
When a user uploads an image:
1. `ValidationService` ensures album has < 50 images.
2. `PhotoService` receives the blob.
3. `PhotoService` uses `StorageService` to upload 3 variations via the `StorageProvider`:
   - Original
   - Optimized
   - Thumbnail
4. `PhotoRepository` links these 3 variations to the Album via `StorageFiles` table.

## Album Lifecycle & State Machine
- **Draft:** Work in progress, auto-saved to `drafts` table.
- **Published:** Finalized, images uploaded, entries written to `albums` and `album_photos`.
- **Shared:** QR code active, link generated (via `AlbumShares`).
- **Archived:** Hidden from main views.
- **Soft Deleted:** Triggers `soft_delete_at` timestamp. Recoverable for 14 days.
- **Permanent Delete:** Cron/Database trigger completely purges record and cascades.
