// src/app/(admin)/products/new/page.tsx
'use client'; // Mark as client component for form handling

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload'; // Import the component
// TODO: Add proper auth check for client components if needed

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]); // State for image URLs
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadSuccess = (url: string) => {
    setImageUrls((prevUrls) => [...prevUrls, url]);
    setUploadError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setUploadError(errorMessage);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name || !price || isNaN(parseFloat(price))) {
      setError('Product name and a valid price are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          images: imageUrls, // Include image URLs
          // Add other fields like category_id later
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create product (${response.status})`);
      }

      console.log('Product created successfully');
      router.push('/dashboard/products');

    } catch (err) {
      console.error('Error creating product:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add proper authorization check here.

  return (
    <div>
      <h1>Add New Product</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <h2>Product Images</h2>
          <ImageUpload
            bucketName="product-images" // Use the bucket name created
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          {uploadError && <p style={{ color: 'red' }}>Upload Error: {uploadError}</p>}
          {imageUrls.length > 0 && (
            <div>
              <h3>Uploaded Images:</h3>
              <ul>
                {imageUrls.map((url, index) => (
                  <li key={index}>
                    <img src={url} alt={`Product image ${index + 1}`} width="100" />
                    {/* TODO: Add button to remove image */}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Product'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </button>
      </form>
    </div>
  );
}

