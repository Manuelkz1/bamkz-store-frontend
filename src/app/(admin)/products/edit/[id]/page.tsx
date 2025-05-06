// src/app/(admin)/products/edit/[id]/page.tsx
'use client'; // Mark as client component for form handling

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload'; // Import the component
// TODO: Add proper auth check for client components if needed

// Placeholder type for Product - replace with your actual type definition
type Product = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  images: string[]; // Expect images as an array of URLs
  // Add other fields like category_id if needed
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string; // Get product ID from URL

  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]); // State for image URLs
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch product (${response.status})`);
        }
        const data: Product = await response.json();
        setProduct(data);
        setName(data.name);
        setDescription(data.description || '');
        setPrice(data.price.toString());
        setImageUrls(data.images || []); // Initialize image URLs from fetched data
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product data.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUploadSuccess = (url: string) => {
    setImageUrls((prevUrls) => [...prevUrls, url]);
    setUploadError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setUploadError(errorMessage);
  };

  // TODO: Implement function to remove an image URL from state
  const handleRemoveImage = (urlToRemove: string) => {
    setImageUrls((prevUrls) => prevUrls.filter(url => url !== urlToRemove));
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
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          images: imageUrls, // Send updated image URLs
          // Add other fields as needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update product (${response.status})`);
      }

      console.log('Product updated successfully');
      router.push('/dashboard/products'); // Redirect after update

    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add proper authorization check here.

  if (isFetching) {
    return <div>Loading product details...</div>;
  }

  if (error && !product) {
    return <div>Error loading product: {error}</div>;
  }

  if (!product) {
    return <div>Product not found.</div>;
  }

  return (
    <div>
      <h1>Edit Product: {product.name}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading || isFetching}
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading || isFetching}
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
            disabled={isLoading || isFetching}
          />
        </div>

        {/* Image Upload Section */}
        <div>
          <h2>Product Images</h2>
          <ImageUpload
            bucketName="product-images"
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
          {uploadError && <p style={{ color: 'red' }}>Upload Error: {uploadError}</p>}
          {imageUrls.length > 0 && (
            <div>
              <h3>Current Images:</h3>
              <ul>
                {imageUrls.map((url, index) => (
                  <li key={index}>
                    <img src={url} alt={`Product image ${index + 1}`} width="100" />
                    <button type="button" onClick={() => handleRemoveImage(url)} disabled={isLoading || isFetching}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <button type="submit" disabled={isLoading || isFetching}>
          {isLoading ? 'Updating...' : 'Update Product'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={isLoading || isFetching}>
          Cancel
        </button>
      </form>
    </div>
  );
}

