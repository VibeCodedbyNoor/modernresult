-- Allow public read access to all objects in school-assets
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'school-assets');

-- Allow authenticated users to upload files to school-assets
-- We'll use a simple policy for now: any authenticated user can upload.
-- In a real app, we'd restrict by school_id/folder.
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-assets');
CREATE POLICY "Authenticated Update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'school-assets');
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'school-assets');
