import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

// Helper function to get order ID from URL parameters
function getOrderId(params: { id?: string }): string | null {
  return params.id || null;
}

// GET a single order by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = getOrderId(params);

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // Fetch order with related user email and product names from order_items
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users ( email ),
        order_items ( quantity, products ( name, price ) )
      `)
      .eq('id', orderId)
      .single(); // Expecting a single result

    if (error) {
      if (error.code === 'PGRST116') { // Not Found
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      console.error(`Error fetching order ${orderId}:`, error);
      return NextResponse.json({ error: 'Error fetching order', details: error.message }, { status: 500 });
    }

    if (!data) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error(`Unexpected error fetching order ${orderId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Unexpected error fetching order', details: errorMessage }, { status: 500 });
  }
}

// PUT (Update) an order by ID (primarily for updating status)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const orderId = getOrderId(params);

  if (!orderId) {
    return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const updateData = await request.json();

    // Allow updating only specific fields, e.g., 'status'
    const allowedUpdates: { status?: string } = {};
    if (updateData.status) {
        // Add validation for allowed status values if needed
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']; // Example statuses
        if (!validStatuses.includes(updateData.status)) {
            return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
        }
        allowedUpdates.status = updateData.status;
    }
    // Add other updatable fields here if necessary

    if (Object.keys(allowedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update (only status is allowed)' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(allowedUpdates)
      .eq('id', orderId)
      .select(); // Return the updated data

    if (error) {
      console.error(`Error updating order ${orderId}:`, error);
      return NextResponse.json({ error: 'Error updating order', details: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Order not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json(data[0], { status: 200 }); // 200 OK

  } catch (err) {
    console.error(`Unexpected error updating order ${orderId}:`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
    if (err instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON format in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unexpected error updating order', details: errorMessage }, { status: 500 });
  }
}

// DELETE an order by ID - Generally discouraged in production e-commerce systems.
// Consider marking as 'cancelled' or 'archived' instead.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const orderId = getOrderId(params);

    if (!orderId) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    console.warn(`Attempting to delete order ${orderId}. This is generally discouraged.`);

    // If deletion is truly required, uncomment and implement carefully.
    // Ensure related data (like order_items) is handled appropriately (e.g., cascade delete or manual cleanup).
    /*
    try {
        // First, potentially delete related order_items if cascade is not set up
        // const { error: itemError } = await supabase.from('order_items').delete().eq('order_id', orderId);
        // if (itemError) { ... handle error ... }

        const { error, count } = await supabase
        .from('orders')
        .delete({ count: 'exact' })
        .eq('id', orderId);

        if (error) {
        console.error(`Error deleting order ${orderId}:`, error);
        return NextResponse.json({ error: 'Error deleting order', details: error.message }, { status: 500 });
        }

        if (count === 0) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order deleted successfully (use with caution)' }, { status: 200 });

    } catch (err) {
        console.error(`Unexpected error deleting order ${orderId}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        return NextResponse.json({ error: 'Unexpected error deleting order', details: errorMessage }, { status: 500 });
    }
    */

    // Default response: Method not allowed or not implemented for safety
    return NextResponse.json({ error: 'Deleting orders is not permitted. Consider cancelling instead.' }, { status: 405 }); // 405 Method Not Allowed
}

