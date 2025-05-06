import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server'; // Import server client and auth helpers

// Helper function to get product ID from URL parameters
function getProductId(params: { id?: string }): string | null {
  return params.id || null;
}

// GET a single product by ID (publicly accessible)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const productId = getProductId(params);
  const supabase = createSupabaseServerClient(); // Use server client

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      console.error(`Error fetching product ${productId}:`, error);
      return NextResponse.json({ error: 'Error fetching product', details: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error(`Unexpected error fetching product ${productId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching product', details: errorMessage }, { status: 500 });
  }
}

// PUT (Update) a product by ID (requires admin privileges)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const productId = getProductId(params);
  const supabase = createSupabaseServerClient();
  const { session, error: sessionError } = await getUserSession();

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Not logged in' }, { status: 401 });
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
  }

  // Admin user proceeds...
  try {
    const productData = await request.json();
    delete productData.id;
    delete productData.created_at;

    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)
      .select();

    if (error) {
      console.error(`Error updating product ${productId}:`, error);
      return NextResponse.json({ error: 'Error updating product', details: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Product not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });

  } catch (err) {
    console.error(`Unexpected error updating product ${productId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error updating product', details: errorMessage }, { status: 500 });
  }
}

// DELETE a product by ID (requires admin privileges)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const productId = getProductId(params);
  const supabase = createSupabaseServerClient();
  const { session, error: sessionError } = await getUserSession();

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  if (sessionError || !session?.user) {
    return NextResponse.json({ error: 'Unauthorized: Not logged in' }, { status: 401 });
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    return NextResponse.json({ error: 'Forbidden: Admin privileges required' }, { status: 403 });
  }

  // Admin user proceeds...
  try {
    const { error, count } = await supabase
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', productId);

    if (error) {
      console.error(`Error deleting product ${productId}:`, error);
      return NextResponse.json({ error: 'Error deleting product', details: error.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error(`Unexpected error deleting product ${productId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error deleting product', details: errorMessage }, { status: 500 });
  }
}

