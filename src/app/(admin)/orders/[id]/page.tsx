// src/app/(admin)/orders/[id]/page.tsx
'use client'; // Mark as client component for state and interaction

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
// TODO: Add proper auth check for client components if needed

// Placeholder types - replace/refine with actual detailed types from your project
type OrderItemProduct = {
  name: string;
  price: number;
};

type OrderItem = {
  quantity: number;
  products: OrderItemProduct | null;
};

type OrderUser = {
  email: string | null;
};

type Order = {
  id: string;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address: any; // Use a more specific type
  billing_address: any; // Use a more specific type
  users: OrderUser | null;
  order_items: OrderItem[];
};

const VALID_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']; // Example statuses

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch order (${response.status})`);
        }
        const data: Order = await response.json();
        setOrder(data);
        setNewStatus(data.status); // Initialize status dropdown
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order data.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async (event: FormEvent) => {
    event.preventDefault();
    setUpdateError(null);
    setIsLoading(true);

    if (!newStatus || newStatus === order?.status) {
      setUpdateError('Please select a new status.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update status (${response.status})`);
      }

      const updatedOrder: Order = await response.json();
      setOrder(updatedOrder); // Update local state with the new order data
      setNewStatus(updatedOrder.status);
      alert('Order status updated successfully!'); // Simple feedback

    } catch (err) {
      console.error('Error updating order status:', err);
      setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // TODO: Add proper authorization check here.

  if (isFetching) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return <div>Error loading order: {error}</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  // Basic rendering - Improve styling and layout as needed
  return (
    <div>
      <h1>Order Details: {order.id}</h1>
      <button onClick={() => router.back()}>Back to Orders</button>

      <h2>Summary</h2>
      <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
      <p><strong>Customer:</strong> {order.users?.email || 'N/A'}</p>
      <p><strong>Total Amount:</strong> {order.total_amount} {/* Format currency */}</p>
      <p><strong>Current Status:</strong> {order.status}</p>

      <h2>Update Status</h2>
      <form onSubmit={handleStatusUpdate}>
        <label htmlFor="status">New Status:</label>
        <select
          id="status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          disabled={isLoading}
        >
          {VALID_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button type="submit" disabled={isLoading || newStatus === order.status}>
          {isLoading ? 'Updating...' : 'Update Status'}
        </button>
        {updateError && <p style={{ color: 'red' }}>Update Error: {updateError}</p>}
      </form>

      <h2>Items</h2>
      {order.order_items.length === 0 ? (
        <p>No items found for this order.</p>
      ) : (
        <ul>
          {order.order_items.map((item, index) => (
            <li key={index}>
              {item.quantity} x {item.products?.name || 'Unknown Product'} 
              (@ {item.products?.price || 0} each) {/* Format currency */}
            </li>
          ))}
        </ul>
      )}

      <h2>Shipping Address</h2>
      <pre>{JSON.stringify(order.shipping_address, null, 2)}</pre> {/* Display address - format nicely */}

      <h2>Billing Address</h2>
      <pre>{JSON.stringify(order.billing_address, null, 2)}</pre> {/* Display address - format nicely */}

    </div>
  );
}

