// src/app/(admin)/categories/new/page.tsx
'use client'; // Mark as client component for form handling

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// TODO: Add proper auth check for client components if needed

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch('/api/categories', {
        method: 'POST',
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
        throw new Error(errorData.error || `Failed to create category (${response.status})`);
      }

      console.log('Category created successfully');
      router.push('/dashboard/categories'); // Redirect to the category list page

    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add proper authorization check here.

  return (
    <div>
      <h1>Add New Category</h1>
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

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Category'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={isLoading}>
          Cancel
        </button>
      </form>
    </div>
  );
}

