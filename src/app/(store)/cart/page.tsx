// src/app/(store)/cart/page.tsx
'use client';

import Link from 'next/link';
import { useCart, CartItem } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, getItemCount } = useCart();

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    const quantity = parseInt(newQuantity.toString(), 10);
    if (!isNaN(quantity)) {
      updateQuantity(item.id, quantity);
    }
  };

  return (
    <div>
      <h1>Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div>
          <p>Your cart is empty.</p>
          <Link href="/products">Continue Shopping</Link>
        </div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.image && <img src={item.image} alt={item.name} width="50" style={{ marginRight: '10px' }} />}
                    <Link href={`/products/${item.id}`}>{item.name}</Link>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item, parseInt(e.target.value, 10))}
                      style={{ width: '60px' }}
                    />
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button onClick={() => removeFromCart(item.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h2>Cart Summary</h2>
            <p>Total Items: {getItemCount()}</p>
            <p><strong>Total Price: ${getCartTotal().toFixed(2)}</strong></p>
            <button onClick={clearCart}>Clear Cart</button>
            {/* TODO: Link to checkout page */}
            <Link href="/checkout">
              <button style={{ marginLeft: '10px' }}>Proceed to Checkout (TODO)</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

