// src/app/(admin)/categories/edit/[id]/page.tsx
'use client'; // Mark as client component for form handling

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
// TODO: Add proper auth check for client components if needed

// Placeholder type for Category - replace with your actual type definition
type Category = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string; // Get category ID from URL

  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!categoryId) return;

    const fetchCategory = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch(`/api/categories/${categoryId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch category (${response.status})`);
        }
        const data: Category = await response.json();
        setCategory(data);
        setName(data.name);
        setDescription(data.description || '');
      } catch (err) {
        console.error('Error fetching category details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load category data.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name) {
      setError('Category name is required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update category (${response.status})`);
      }

      console.log('Category updated successfully');
      router.push('/dashboard/categories'); // Redirect after update

    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add proper authorization check here.

  if (isFetching) {
    return <div>Loading category details...</div>;
  }

  if (error && !category) {
    return <div>Error loading category: {error}</div>;
  }

  if (!category) {
    return <div>Category not found.</div>;
  }

  return (
    <div>
      <h1>Edit Category: {category.name}</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Category Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        <button type="submit" disabled={isLoading || isFetching}>
          {isLoading ? 'Updating...' : 'Update Category'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={isLoading || isFetching}>
          Cancel
        </button>
      </form>
    </div>
  );
}

