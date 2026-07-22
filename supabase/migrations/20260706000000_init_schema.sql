-- Migration: Initialize Snapflip Database Schema
-- Generated: 2026-07-06

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================================
-- 1. USERS
-- =====================================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'creator',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  soft_delete_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON public.users(email);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 2. ALBUMS
-- =====================================================================================
CREATE TABLE public.albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL,
  visibility VARCHAR(50) DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  soft_delete_at TIMESTAMPTZ
);

CREATE INDEX idx_albums_user_id ON public.albums(user_id);
CREATE INDEX idx_albums_slug ON public.albums(slug);
CREATE INDEX idx_albums_status ON public.albums(status);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.albums FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 3. STORAGE FILES
-- =====================================================================================
CREATE TABLE public.storage_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(50) NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  url TEXT NOT NULL,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_storage_files_provider_id ON public.storage_files(provider_id);
ALTER TABLE public.storage_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.storage_files FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 4. ALBUM PHOTOS
-- =====================================================================================
CREATE TABLE public.album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  storage_file_id UUID REFERENCES public.storage_files(id) ON DELETE SET NULL,
  order_index INT NOT NULL,
  orientation INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_album_photos_album_id ON public.album_photos(album_id);
ALTER TABLE public.album_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.album_photos FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 5. ALBUM PASSWORDS
-- =====================================================================================
CREATE TABLE public.album_passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID UNIQUE REFERENCES public.albums(id) ON DELETE CASCADE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.album_passwords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.album_passwords FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 6. DRAFTS
-- =====================================================================================
CREATE TABLE public.drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID UNIQUE REFERENCES public.albums(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.drafts FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 7. ALBUM SHARES
-- =====================================================================================
CREATE TABLE public.album_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  share_url TEXT NOT NULL,
  qr_code_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.album_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.album_shares FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 8. ALBUM ANALYTICS
-- =====================================================================================
CREATE TABLE public.album_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES public.albums(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  visitor_hash VARCHAR(255) NOT NULL,
  device VARCHAR(100),
  browser VARCHAR(100),
  country VARCHAR(100),
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_album_analytics_album_id ON public.album_analytics(album_id);
CREATE INDEX idx_album_analytics_event_visitor ON public.album_analytics(event_type, visitor_hash);
ALTER TABLE public.album_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.album_analytics FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================================
-- 9. ACTIVITY LOGS
-- =====================================================================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for development" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);
