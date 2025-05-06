// src/app/(store)/checkout/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// Assuming Mercado Pago SDK might be needed later for Checkout Bricks, but not for redirection

interface MercadoPagoPreferenceResponse {
  preferenceId: string;
  init_point: string;
}

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart(); // Removed getItemCount as it wasn't used
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Customer info state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState(''); // Keep for potential future use or order details

  const handlePlaceOrder = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      setIsLoading(false);
      return;
    }

    // Basic form validation (can be enhanced)
    if (!customerName || !customerEmail || !shippingAddress) {
        setError('Please fill in all required fields.');
        setIsLoading(false);
        return;
    }

    console.log('Initiating checkout with:', { customerName, customerEmail, shippingAddress, cartItems });

    try {
      // Call the backend endpoint to create Mercado Pago preference
      const response = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          items: cartItems.map(item => ({ 
            id: item.id, 
            title: item.name, 
            quantity: item.quantity, 
            unit_price: item.price, // Ensure price is a number
            currency_id: 'ARS' // Set your currency
          })),
          payer: { 
              name: customerName.split(' ')[0], // MP often requires first name
              surname: customerName.split(' ').slice(1).join(' ') || customerName.split(' ')[0], // And last name
              email: customerEmail 
            },
          // back_urls and notification_url are usually set on the backend
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend error data:', errorData);
        throw new Error(errorData.error || 'Failed to create payment preference');
      }
      
      const { preferenceId, init_point }: MercadoPagoPreferenceResponse = await response.json();
      console.log('Preference created:', preferenceId);
      console.log('Redirecting to Mercado Pago:', init_point);
      
      // Redirect user to Mercado Pago checkout URL
      if (init_point) {
        window.location.href = init_point;
        // Note: clearCart() should ideally happen *after* successful payment confirmation (via webhook or success URL)
        // For simplicity in this step, we redirect immediately.
      } else {
        throw new Error('Failed to get Mercado Pago redirect URL.');
      }

    } catch (err) {
      console.error('Error during checkout process:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during checkout.');
      setIsLoading(false); // Stop loading indicator on error
    } 
    // No finally block needed here as redirection handles the loading state implicitly on success
  };

  // Redirect logic if cart is empty (can be improved)
  if (typeof window !== 'undefined' && cartItems.length === 0 && !isLoading) {
      router.push('/cart');
      return <div>Redirecting to cart...</div>; 
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <h2 className="text-xl font-semibold">Shipping & Contact Information</h2>
        {/* TODO: Add more detailed address fields if needed by Mercado Pago or for shipping */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name:</label>
          <input id="name" type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required disabled={isLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</label>
          <input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required disabled={isLoading} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Shipping Address:</label>
          <textarea id="address" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required disabled={isLoading} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <h2 className="text-xl font-semibold">Order Summary</h2>
        <div className="border rounded p-2 space-y-2">
            {cartItems.map(item => (
            <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            ))}
            <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
            </div>
        </div>

        <h2 className="text-xl font-semibold">Payment</h2>
        <p className="text-sm text-gray-600">You will be redirected to Mercado Pago to complete your payment securely.</p>

        {error && <p className="text-red-600 text-sm">Error: {error}</p>}

        <button 
          type="submit" 
          disabled={isLoading || cartItems.length === 0} 
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Proceed to Mercado Pago'}
        </button>
      </form>
    </div>
  );
}

