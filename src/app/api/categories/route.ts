import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server'; // Import server client and auth helpers

// GET all categories (publicly accessible)
export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient(); // Use server client
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Error fetching categories', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error('Unexpected error fetching categories:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching categories', details: errorMessage }, { status: 500 });
  }
}

// POST a new category (requires admin privileges)
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { session, error: sessionError } = await getUserSession();

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

    if (!categoryData.name) {
      return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
    }

    const categoryToInsert = {
      name: categoryData.name,
      description: categoryData.description || null,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([categoryToInsert])
      .select();

    if (error) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: 'Error creating category', details: error.message }, { status: 500 });
    }

    if (data && data.length > 0) {
        return NextResponse.json(data[0], { status: 201 });
    } else {
        return NextResponse.json({ error: 'Category created but no data returned' }, { status: 500 });
    }

  } catch (err) {
    console.error('Unexpected error creating category:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error creating category', details: errorMessage }, { status: 500 });
  }
}

