// src/app/(store)/page.tsx
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Placeholder type for Product
type Product = {
  id: string;
  name: string;
  price: number;
  // Use 'images' based on schema inspection and previous check_supabase.py output
  images: string[]; // Changed back from image_urls
};

// Type for a single config row from the database
type SiteConfigRow = {
  key: string;
  value: string;
  description?: string;
  updated_at: string;
};

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('products')
    // Select specific columns needed for display, using 'images'
    .select('id, name, price, images') // Changed from image_urls
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching featured products:', error);
    // throw new Error(`Failed to fetch featured products: ${error.message}`);
    return [];
  }
  // Ensure images is always an array, even if null/undefined in DB
  return (data || []).map(p => ({ ...p, images: p.images || [] })); // Changed from image_urls
}

async function getSiteConfigValue(key: string): Promise<string | null> {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
        .from("site_config")
        .select('value')
        .eq('key', key)
        .maybeSingle();

    if (error) {
        console.error(`Error fetching site config for key '${key}':`, error);
        // throw new Error(`Failed to fetch site config for key '${key}': ${error.message}`);
        return null;
    }
    return data ? data.value : null;
}

export default async function HomePage() {
  let bannerUrls: string[] = [];
  const featuredProducts = await getFeaturedProducts();
  const bannerUrlsValue = await getSiteConfigValue('bannerUrls');

  if (bannerUrlsValue) {
    try {
      const parsedUrls = JSON.parse(bannerUrlsValue);
      if (Array.isArray(parsedUrls)) {
        bannerUrls = parsedUrls;
      } else {
        console.warn("\'bannerUrls\' value from DB is not a valid JSON array:", bannerUrlsValue);
      }
    } catch (parseError) {
      console.error("Error parsing 'bannerUrls' JSON from DB:", parseError, "Value:", bannerUrlsValue);
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Display Banner(s) */}
      {bannerUrls.length > 0 && (
        <div className="banners mb-8">
          {bannerUrls.map((url, index) => (
            <img key={index} src={url} alt={`Banner ${index + 1}`} className="w-full h-auto object-cover mb-4 rounded shadow-md" />
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
      {featuredProducts.length === 0 ? (
        <p>No featured products available right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              {/* Use product.images */} 
              {product.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 truncate">{product.name}</h3>
                <p className="text-gray-700 mb-2">${product.price.toFixed(2)}</p>
                <Link href={`/products/${product.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 text-center">
          <Link href="/products" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors">
            See all products
          </Link>
      </div>
    </div>
  );
}

