// src/app/(store)/layout.tsx
import type { Metadata } from "next";
import Link from 'next/link';
import { CartProvider } from "@/context/CartContext"; // Import CartProvider
// Import global styles if you have them, e.g., import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "BAMKZ Store", // Default title, can be overridden by pages
  description: "Your awesome online store",
};

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <CartProvider> {/* Wrap content with CartProvider */} 
          <header>
            {/* Basic Header Structure */}
            <nav>
              <Link href="/">Home</Link> | 
              <Link href="/products">Products</Link> | 
              {/* TODO: Add Cart Link with item count */}
              <Link href="/cart">Cart (TODO)</Link> | 
              {/* TODO: Add Login/Account Link */}
              <Link href="/login">Login (TODO)</Link>
            </nav>
            <h1>BAMKZ Store (TODO: Fetch Site Name/Logo)</h1>
          </header>
          
          <main>
            {children} {/* Page content will be rendered here */}
          </main>

          <footer>
            {/* Basic Footer */}
            <p>&copy; {new Date().getFullYear()} BAMKZ Store. All rights reserved.</p>
            {/* TODO: Add links to informational pages (About, Contact, etc.) */}
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}

