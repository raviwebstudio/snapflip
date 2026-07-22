-- Drop dependent constraints
ALTER TABLE IF EXISTS public.album_photos DROP CONSTRAINT IF EXISTS album_photos_storage_file_id_fkey;

-- Drop table
DROP TABLE IF EXISTS public.storage_files CASCADE;

-- Create table with new schema
CREATE TABLE public.storage_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  google_file_id VARCHAR(255) NOT NULL,
  google_folder_id VARCHAR(255) NOT NULL,
  original_path TEXT NOT NULL,
  optimized_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  original_size BIGINT NOT NULL,
  optimized_size BIGINT NOT NULL,
  thumbnail_size BIGINT NOT NULL,
  checksum VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-add foreign key constraint on album_photos
ALTER TABLE public.album_photos
  ADD CONSTRAINT album_photos_storage_file_id_fkey
  FOREIGN KEY (storage_file_id) REFERENCES public.storage_files(id) ON DELETE SET NULL;

-- Enable RLS and create policy
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.storage_files FOR ALL USING (true) WITH CHECK (true);
