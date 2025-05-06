// src/app/(admin)/settings/page.tsx
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';
// TODO: Add proper auth check for client components if needed

// Placeholder type for Settings - adjust based on your actual data structure
type SiteSettings = {
  id?: string; // Assuming a single settings record, maybe with a fixed ID
  siteName?: string;
  logoUrl?: string;
  bannerUrls?: string[];
  // Add other settings like contact info, social links, etc.
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSettings>({});
  const [siteName, setSiteName] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [bannerUrls, setBannerUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch existing settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch('/api/settings'); // Assuming GET fetches current settings
        if (!response.ok) {
          // Handle case where settings might not exist yet (e.g., 404)
          if (response.status === 404) {
            console.log('No existing settings found, initializing empty.');
            setSettings({});
            setSiteName('');
            setLogoUrl(undefined);
            setBannerUrls([]);
            return; // Exit fetch logic
          }
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch settings (${response.status})`);
        }
        const data: SiteSettings = await response.json();
        setSettings(data);
        setSiteName(data.siteName || '');
        setLogoUrl(data.logoUrl);
        setBannerUrls(data.bannerUrls || []);
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load settings.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleLogoUploadSuccess = (url: string) => {
    setLogoUrl(url);
    setUploadError(null);
  };

  const handleBannerUploadSuccess = (url: string) => {
    setBannerUrls((prev) => [...prev, url]);
    setUploadError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setUploadError(errorMessage);
  };

  const handleRemoveBanner = (urlToRemove: string) => {
    setBannerUrls((prev) => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST', // Or PUT if you always update a single record
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteName,
          logoUrl,
          bannerUrls,
          // Include other settings fields here
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save settings (${response.status})`);
      }

      console.log('Settings saved successfully');
      alert('Settings saved successfully!'); // Simple feedback
      // Optionally refetch or update local state if needed
      const updatedData = await response.json();
      setSettings(updatedData);

    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add proper authorization check here.

  if (isFetching) {
    return <div>Loading settings...</div>;
  }

  if (error && !settings.id) {
      // Show fetch error only if we couldn't load initial settings
      return <div>Error loading settings: {error}</div>;
  }

  return (
    <div>
      <h1>Site Settings</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="siteName">Site Name:</label>
          <input
            id="siteName"
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Logo Upload */}
        <div>
          <h2>Site Logo</h2>
          {logoUrl && (
            <div>
              <p>Current Logo:</p>
              <img src={logoUrl} alt="Site Logo" width="150" />
              <button type="button" onClick={() => setLogoUrl(undefined)} disabled={isLoading}>Remove Logo</button>
            </div>
          )}
          <ImageUpload
            bucketName="logos" // Assuming a 'logos' bucket
            onUploadSuccess={handleLogoUploadSuccess}
            onUploadError={handleUploadError}
          />
          {uploadError && <p style={{ color: 'red' }}>Upload Error: {uploadError}</p>}
        </div>

        {/* Banner Upload */}
        <div>
          <h2>Site Banners</h2>
          <ImageUpload
            bucketName="banners" // Assuming a 'banners' bucket
            onUploadSuccess={handleBannerUploadSuccess}
            onUploadError={handleUploadError}
          />
          {uploadError && <p style={{ color: 'red' }}>Upload Error: {uploadError}</p>}
          {bannerUrls.length > 0 && (
            <div>
              <h3>Current Banners:</h3>
              <ul>
                {bannerUrls.map((url, index) => (
                  <li key={index}>
                    <img src={url} alt={`Banner ${index + 1}`} width="200" />
                    <button type="button" onClick={() => handleRemoveBanner(url)} disabled={isLoading}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Add other settings fields here */} 

        {error && <p style={{ color: 'red' }}>Save Error: {error}</p>}

        <button type="submit" disabled={isLoading || isFetching}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}

