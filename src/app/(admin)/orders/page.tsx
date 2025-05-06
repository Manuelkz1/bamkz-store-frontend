// src/app/(admin)/orders/page.tsx
import { redirect } from 'next/navigation';
import { createSupabaseServerClient, getUserSession, isAdmin } from '@/lib/supabase/server';

// Placeholder types - replace with actual detailed types
type OrderItemProduct = {
  name: string;
  price: number;
};

type OrderItem = {
  quantity: number;
  products: OrderItemProduct | null; // Assuming relation loads product
};

type OrderUser = {
  email: string | null;
};

type Order = {
  id: string;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: string; // e.g., 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  shipping_address: any; // Adjust type based on your schema
  billing_address: any; // Adjust type based on your schema
  users: OrderUser | null; // Assuming relation loads user
  order_items: OrderItem[]; // Assuming relation loads order items
};

async function getOrders(): Promise<Order[]> {
    const supabase = createSupabaseServerClient();
    // Fetch orders including related user email and basic item info
    const { data, error } = await supabase
        .from('orders')
        .select(`
            *,
            users ( email ),
            order_items ( quantity, products ( name, price ) )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders for admin:', error);
        return [];
    }
    // Cast needed as Supabase select type might be broader
    return (data as Order[]) || [];
}

export default async function AdminOrdersPage() {
  const { session, error: sessionError } = await getUserSession();

  if (sessionError || !session?.user) {
    console.log('Admin Orders: User not logged in, redirecting to /login');
    redirect('/login');
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    console.log(`Admin Orders: User ${session.user.email} is not an admin, redirecting to /`);
    redirect('/');
  }

  console.log(`Admin Orders: Access granted for admin user ${session.user.email}`);
  const orders = await getOrders();

  return (
    <div>
      <h1>Manage Orders</h1>
      <p>View and manage customer orders.</p>

      <h2>Order List</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer Email</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions (TODO)</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.users?.email || 'N/A'}</td>
                <td>{order.total_amount}</td> {/* TODO: Format currency */} 
                <td>{order.status}</td>
                <td>
                  {/* TODO: Add View Details / Update Status buttons/links */} 
                  View | Update Status
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

