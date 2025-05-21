'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '../../../context/cartContext';

export default function ClearCart() {
  const { clearCart } = useCart();
  const hasCleared = useRef(false);
  
  useEffect(() => {
    // Only clear the cart once to prevent infinite rerenders
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);
  
  // This is a non-visual component, so return null
  return null;
} 