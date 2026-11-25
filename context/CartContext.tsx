"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { Product } from "@/lib/data";
import { finalPrice } from "@/lib/queries";

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  storeName: string;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, storeName?: string) => void;
  removeFromCart: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  checkoutItem: CartItem | null;
  setCheckoutItem: (item: CartItem | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<CartItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wanikarya_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch {
      // Ignore errors in reading localStorage
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("wanikarya_cart", JSON.stringify(cart));
      } catch {
        // Ignore errors
      }
    }
  }, [cart, isLoaded]);

  // Toast auto-hide
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const addToCart = (product: Product, quantity = 1, storeName = "") => {
    const itemPrice = finalPrice(product);
    setCart((prev) => {
      const existing = prev.find((item) => item.slug === product.slug);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stock || 999);
        return prev.map((item) =>
          item.slug === product.slug ? { ...item, quantity: newQty } : item
        );
      } else {
        return [
          ...prev,
          {
            slug: product.slug,
            name: product.name,
            price: itemPrice,
            originalPrice: product.price,
            image: product.image,
            quantity: Math.min(quantity, product.stock || 999),
            storeName,
            stock: product.stock,
          },
        ];
      }
    });

    setToastMessage(`✓ ${quantity}x "${product.name}" berhasil dimasukkan ke keranjang`);
  };

  const removeFromCart = (slug: string) => {
    setCart((prev) => prev.filter((item) => item.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.slug === slug) {
          const clamped = item.stock ? Math.min(quantity, item.stock) : quantity;
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        checkoutItem,
        setCheckoutItem,
        isCheckoutOpen,
        setIsCheckoutOpen,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
