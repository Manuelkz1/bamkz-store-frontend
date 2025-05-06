import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server'; // Import server client and auth helpers

// GET all products (publicly accessible)
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient(); // Use server client
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Error fetching products', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error fetching products:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching products', details: errorMessage }, { status: 500 });
  }
}

// POST a new product (requires admin privileges)
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { session, error: sessionError } = await getUserSession();

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Not logged in' }, { status: 401 });
  }

  // Check if the user is an admin
  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
  }

  // Admin user proceeds...
  try {
    const productData = await request.json();

    if (!productData.name || !productData.price) {
      return NextResponse.json({ error: 'Missing required fields: name and price' }, { status: 400 });
    }

    const productToInsert = {
      name: productData.name,
      description: productData.description || null,
      price: productData.price,
      images: productData.images || [],
      // category_id: productData.category_id || null,
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: 'Error creating product', details: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {
        return NextResponse.json(data[0], { status: 201 });
    } else {
        return NextResponse.json({ error: 'Product created but no data returned' }, { status: 500 });
    }

  } catch (err) {
    console.error('Unexpected error creating product:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error creating product', details: errorMessage }, { status: 500 });
  }
}

