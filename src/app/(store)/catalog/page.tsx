// src/app/(store)/products/page.tsx
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AddToCartButton from '@/components/AddToCartButton'; // Import the button

// Placeholder type for Product
type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
};

async function getAllProducts(): Promise<Product[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true }); // Order alphabetically by name

  if (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
  return data || [];
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div>
      <h1>All Products</h1>
      {/* TODO: Add filtering/sorting options */} 
      {products.length === 0 ? (
        <p>No products available at the moment.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {products.map((product) => (
            <div key={product.id} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
              {product.images && product.images.length > 0 && (
                <Link href={`/products/${product.id}`}>
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }} 
                    />
                </Link>
              )}
              <h3>
                <Link href={`/products/${product.id}`}>{product.name}</Link>
              </h3>
              <p>Price: ${product.price.toFixed(2)}</p> {/* Format price */}
              {/* Add the button here */}
              <AddToCartButton product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.images?.[0] // Pass first image URL
              }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

