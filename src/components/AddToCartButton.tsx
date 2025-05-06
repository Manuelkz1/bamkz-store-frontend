// src/components/AddToCartButton.tsx
'use client';

import { useCart, CartItem } from '@/context/CartContext';

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>; // Pass product details needed for cart
  quantity?: number; // Optional quantity, defaults to 1
}

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Optional: Show a confirmation message/toast
    alert(`${product.name} added to cart!`);
  };

  return (
    <button onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}

