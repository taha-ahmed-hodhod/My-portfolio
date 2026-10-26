-- Add cv_url to profile and allow PDF uploads in portfolio bucket
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS cv_url text;

-- Update storage.buckets to allow PDF MIME type and adjust file size limit to 20MB
UPDATE storage.buckets
SET allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']::text[],
    file_size_limit = 20971520
WHERE id = 'portfolio';
