import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// GET all orders (consider adding filters like user_id, status, date range later)
export async function GET(request: NextRequest) {
  try {
    // Example: Fetch orders with related user email and product names from order_items
    // Adjust the select query based on your actual needs and relationships
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users ( email ), 
        order_items ( quantity, products ( name ) )
      `)
      .order('created_at', { ascending: false }); // Show newest orders first

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Error fetching orders', details: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error('Unexpected error fetching orders:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching orders', details: errorMessage }, { status: 500 });
  }
}

// POST - Order creation is typically handled by a specific checkout endpoint,
// often involving multiple steps (cart validation, payment, order creation).
// A simple POST here might not be appropriate.
// Placeholder for now, might be removed or adapted later.
export async function POST(request: NextRequest) {
  // Consider if this endpoint is needed or if order creation happens elsewhere (e.g., /api/checkout)
  return NextResponse.json({ message: 'Order creation endpoint not implemented. Usually handled via checkout process.' }, { status: 501 });
}

