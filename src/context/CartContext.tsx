// src/context/CartContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of a cart item
export interface CartItem {
  id: string; // Product ID
  name: string;
  price: number;
  image?: string; // Optional image URL
  quantity: number;
}

// Define the shape of the context value
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Create a provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initial render (only on client-side)
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('shoppingCart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes (only on client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === itemToAdd.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map((item) =>
          item.id === itemToAdd.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...itemToAdd, quantity }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item // Ensure quantity doesn't go below 0
      ).filter(item => item.quantity > 0) // Remove item if quantity becomes 0
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Create a custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

