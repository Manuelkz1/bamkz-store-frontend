// src/components/ImageUpload.tsx
'use client';

import { useState, ChangeEvent } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploadProps {
  bucketName: string;
  folderPath?: string; // Optional folder within the bucket
  onUploadSuccess: (filePath: string) => void;
  onUploadError: (error: string) => void;
}

export default function ImageUpload({ bucketName, folderPath = '', onUploadSuccess, onUploadError }: ImageUploadProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!event.target.files || event.target.files.length === 0) {
      return; // No file selected
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; // Simple random name
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;

    setUploading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL (adjust if using signed URLs)
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(filePath);

      if (!publicUrl) {
          throw new Error('Could not get public URL after upload.');
      }

      console.log('Upload successful, public URL:', publicUrl);
      onUploadSuccess(publicUrl); // Pass the full public URL

    } catch (err) {
      console.error('Error uploading image:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred during upload.';
      setError(message);
      onUploadError(message);
    } finally {
      setUploading(false);
      // Reset file input to allow uploading the same file again if needed
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div>
      <label htmlFor="image-upload">Upload Image:</label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>Upload Error: {error}</p>}
    </div>
  );
}

