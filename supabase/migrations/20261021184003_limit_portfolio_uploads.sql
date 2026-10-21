-- Keep Storage limits aligned with the dashboard upload validation.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']::text[]
where id = 'portfolio';
