import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server'; // Import server client and auth helpers

// Helper function to get category ID from URL parameters
function getCategoryId(params: { id?: string }): string | null {
  return params.id || null;
}

// GET a single category by ID (publicly accessible)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const categoryId = getCategoryId(params);
  const supabase = createSupabaseServerClient(); // Use server client

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      console.error(`Error fetching category ${categoryId}:`, error);
      return NextResponse.json({ error: 'Error fetching category', details: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error(`Unexpected error fetching category ${categoryId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching category', details: errorMessage }, { status: 500 });
  }
}

// PUT (Update) a category by ID (requires admin privileges)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const categoryId = getCategoryId(params);
  const supabase = createSupabaseServerClient();
  const { session, error: sessionError } = await getUserSession();

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
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
    const categoryData = await request.json();
    delete categoryData.id;
    delete categoryData.created_at;

    if (!categoryData.name && !categoryData.description) {
        return NextResponse.json({ error: 'At least name or description must be provided for update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', categoryId)
      .select();

    if (error) {
      console.error(`Error updating category ${categoryId}:`, error);
      return NextResponse.json({ error: 'Error updating category', details: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Category not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 });

  } catch (err) {
    console.error(`Unexpected error updating category ${categoryId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error updating category', details: errorMessage }, { status: 500 });
  }
}

// DELETE a category by ID (requires admin privileges)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const categoryId = getCategoryId(params);
  const supabase = createSupabaseServerClient();
  const { session, error: sessionError } = await getUserSession();

  if (!categoryId) {
    return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
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
    // Optional: Check if category is associated with products before deleting

    const { error, count } = await supabase
      .from('categories')
      .delete({ count: 'exact' })
      .eq('id', categoryId);

    if (error) {
      console.error(`Error deleting category ${categoryId}:`, error);
      return NextResponse.json({ error: 'Error deleting category', details: error.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error(`Unexpected error deleting category ${categoryId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error deleting category', details: errorMessage }, { status: 500 });
  }
}

