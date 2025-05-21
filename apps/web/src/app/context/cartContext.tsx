"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * CartItem interface defines the structure of items in the shopping cart
 * These properties mirror the essential product data from Supabase's product table
 */
interface CartItem {
  productId: string;   // References the unique productId from Supabase products table
  name: string;        // Product name from Supabase
  price: number;       // Product price from Supabase
  imageURL: string;    // Image URL stored in Supabase or external storage
  quantity: number;    // Quantity selected by the user (not from Supabase)
}

/**
 * CartContextType defines all the operations that can be performed on the cart
 * This provides a consistent interface for cart operations throughout the application
 */
interface CartContextType {
  cart: CartItem[];    // The current cart state
  addToCart: (product: {
    productId: string;
    name: string;
    price: number;
    imageURL: string;
  }, quantity?: number) => void;          // Adds a product from Supabase to the cart with optional quantity
  removeFromCart: (productId: string) => void;  // Removes a product using its Supabase ID
  updateQuantity: (productId: string, quantity: number) => void;  // Updates quantity of a specific product
  clearCart: () => void;  // Empties the entire cart
  getCartTotal: () => number;  // Calculates the total price of all items
  getTotalItems: () => number;  // Calculates the total number of items
}

// Create the context with an initial default value
const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getTotalItems: () => 0,
});

/**
 * Custom hook that provides access to the cart context
 * This makes it easy to use cart functionality in any component
 */
export const useCart = () => useContext(CartContext);

/**
 * CartProvider component that wraps the application and provides cart functionality
 * This manages the cart state and provides methods to interact with it
 * 
 * @param children - React components that will have access to the cart context
 */
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize cart from localStorage if available
  // This allows cart data to persist between page refreshes
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  // Save cart to localStorage whenever it changes
  // This ensures cart data persists even if the user leaves and returns later
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  /**
   * Adds a product from Supabase to the cart
   * If the product is already in the cart, its quantity is increased
   * Otherwise, it's added as a new item with specified quantity or 1 by default
   * 
   * @param product - Product data from Supabase (productId, name, price, imageURL)
   * @param quantity - Optional quantity to add (defaults to 1)
   */
  const addToCart = (product: {
    productId: string;
    name: string;
    price: number;
    imageURL: string;
  }, quantity: number = 1) => {
    setCart((prevCart) => {
      // Check if the product is already in the cart by matching Supabase productId
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === product.productId
      );

      if (existingItemIndex >= 0) {
        // If the product is already in the cart, increase the quantity by the specified amount
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // If the product is not in the cart, add it with the specified quantity
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  /**
   * Removes a product from the cart using its Supabase productId
   * 
   * @param productId - The unique identifier from Supabase products table
   */
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  /**
   * Updates the quantity of a specific product in the cart
   * If quantity is set to 0 or less, the product is removed from the cart
   * 
   * @param productId - The unique identifier from Supabase products table
   * @param quantity - The new quantity to set
   */
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  /**
   * Clears all items from the cart
   * This is typically used after checkout or when the user wants to start fresh
   */
  const clearCart = () => {
    setCart([]);
  };

  /**
   * Calculates the total price of all items in the cart
   * This multiplies each product's Supabase price by its quantity and sums them
   * 
   * @returns The total price as a number
   */
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  /**
   * Calculates the total number of items in the cart
   * This counts each product according to its quantity
   * 
   * @returns The total number of items as a number
   */
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Return the CartContext.Provider with all the cart functionality
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

