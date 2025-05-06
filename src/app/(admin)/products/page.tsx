// src/app/(admin)/products/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server';

// Placeholder type for Product - replace with your actual type definition
type Product = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  // Add other fields like category_id if needed
};

async function getProducts(): Promise<Product[]> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching products for admin:', error);
        // Handle error appropriately, maybe return empty array or throw
        return [];
    }
    return data || [];
}

export default async function AdminProductsPage() {
  const { session, error: sessionError } = await getUserSession();

  if (sessionError || !session?.user) {
    console.log('Admin Products: User not logged in, redirecting to /login');
    redirect('/login');
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    console.log(`Admin Products: User ${session.user.email} is not an admin, redirecting to /`);
    redirect('/');
  }

  console.log(`Admin Products: Access granted for admin user ${session.user.email}`);
  const products = await getProducts();

  return (
    <div>
      <h1>Manage Products</h1>
      <p>Here you can add, edit, or delete products.</p>
      {/* TODO: Add button to navigate to a 'create product' page/modal */}
      <button>Add New Product (TODO)</button>

      <h2>Product List</h2>
      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Created At</th>
              <th>Actions (TODO)</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.price}</td> {/* TODO: Format currency */} 
                <td>{new Date(product.created_at).toLocaleDateString()}</td>
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

