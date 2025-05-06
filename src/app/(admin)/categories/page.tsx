// src/app/(admin)/categories/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server';

// Placeholder type for Category - replace with your actual type definition
type Category = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
};

async function getCategories(): Promise<Category[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching categories for admin:', error);
        return [];
    }
    return data || [];
}

export default async function AdminCategoriesPage() {
  const { session, error: sessionError } = await getUserSession();

  if (sessionError || !session?.user) {
    console.log('Admin Categories: User not logged in, redirecting to /login');
    redirect('/login');
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    console.log(`Admin Categories: User ${session.user.email} is not an admin, redirecting to /`);
    redirect('/');
  }

  console.log(`Admin Categories: Access granted for admin user ${session.user.email}`);
  const categories = await getCategories();

  return (
    <div>
      <h1>Manage Categories</h1>
      <p>Here you can add, edit, or delete categories.</p>
      {/* TODO: Add button to navigate to a 'create category' page/modal */}
      <button>Add New Category (TODO)</button>

      <h2>Category List</h2>
      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions (TODO)</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || '-'}</td>
                <td>{new Date(category.created_at).toLocaleDateString()}</td>
                <td>
                  {/* TODO: Add Edit/Delete buttons/links */} 
                  Edit | Delete
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

