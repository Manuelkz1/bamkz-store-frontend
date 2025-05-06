// src/app/(store)/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AddToCartButton from '@/components/AddToCartButton'; // Import the button

// Placeholder type for Product
type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
};

async function getProductById(productId: string): Promise<Product | null> {
  if (!productId) return null;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    console.error(`Error fetching product ${productId}:`, error);
    if (error.code === 'PGRST116') {
      return null;
    }
    return null;
  }
  return data;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound(); // Trigger 404 page if product not found
  }

  return (
    <div>
      {/* TODO: Improve layout and styling */}
      <h1>{product.name}</h1>
      
      {/* Image Gallery/Display */}
      {product.images && product.images.length > 0 ? (
        <div>
          <img 
            src={product.images[0]} 
            alt={product.name} 
            style={{ maxWidth: '400px', height: 'auto', marginBottom: '20px' }} 
          />
          {/* TODO: Add thumbnails or carousel for multiple images */}
        </div>
      ) : (
        <div style={{ width: '400px', height: '300px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          No Image Available
        </div>
      )}

      <p>{product.description || 'No description available.'}</p>
      <p><strong>Price: ${product.price.toFixed(2)}</strong></p> {/* Format price */}

      {/* TODO: Add Quantity Selector */}
      
      {/* Add the button here */}
      <AddToCartButton product={{
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] // Pass first image URL
      }} />

      {/* TODO: Consider adding related products section */}
    </div>
  );
}

