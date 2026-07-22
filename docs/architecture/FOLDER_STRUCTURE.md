# Snapflip Folder Structure

This defines the newly introduced backend-focused architecture within the existing frontend application.

```text
snapflip/
├── src/
│   ├── repositories/             # Layer for all Database interactions (Supabase)
│   │   ├── UserRepository.ts
│   │   ├── AlbumRepository.ts
│   │   ├── PhotoRepository.ts
│   │   ├── DraftRepository.ts
│   │   └── AnalyticsRepository.ts
│   │
│   ├── services/                 # Layer for Business Logic and orchestration
│   │   ├── AlbumService.ts
│   │   ├── PhotoService.ts
│   │   ├── StorageService.ts
│   │   ├── ShareService.ts
│   │   ├── AnalyticsService.ts
│   │   └── ValidationService.ts
│   │
│   ├── storage/                  # Storage Abstraction Layer
│   │   ├── StorageProvider.ts             # Base interface
│   │   └── GoogleDriveStorageProvider.ts  # Concrete implementation
│   │
│   ├── components/               # Frozen React UI Components
│   ├── pages/                    # Frozen React Pages
│   └── lib/                      # Base libraries and clients (e.g. supabase client)
│
├── tests/
│   └── ...                       # Playwright tests
│
├── docs/
│   ├── architecture/
│   │   ├── DATABASE_SCHEMA.md
│   │   ├── BACKEND_ARCHITECTURE.md
│   │   ├── FOLDER_STRUCTURE.md
│   │   └── API_CONTRACT.md
│   ├── reports/
│   │   ├── IMPLEMENTATION_REPORT.md
│   │   └── BACKEND_VERIFICATION_REPORT.md
│   ├── roadmap/
│   │   ├── PROJECT_ROADMAP.md
│   │   └── CHANGELOG.md
│   ├── setup/
│   │   └── PROJECT_RULES.md
│   ├── meeting-notes/
│   └── README.md
```

## Storage Provider Folder Convention
Within any `StorageProvider` (such as Google Drive or Supabase Storage), the files must follow this strict folder hierarchy:
```text
[Storage Bucket / Drive Root]
└── User ID (UUID)/
    └── Album ID (UUID)/
        ├── original/
        │   └── image_1.jpg
        ├── optimized/
        │   └── image_1.webp
        └── thumbnail/
            └── image_1.webp
```
