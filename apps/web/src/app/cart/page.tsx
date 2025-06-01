"use client";

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '../context/cartContext';
import CheckoutButton from './CheckoutButton';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

/**
 * CartContent component that uses useSearchParams
 */
function CartContent() {
    // Access cart state and functions from the cart context
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    // Router for redirecting if needed
    const router = useRouter();
    const searchParams = useSearchParams();
    const canceled = searchParams.get('canceled');
    
    // Handle client-side rendering to avoid hydration issues
    // This is necessary because cart data is stored in localStorage
    const [isClient, setIsClient] = useState(false);
    // Track authentication state on client-side
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
        
        // Check authentication state on client-side
        // This is just a backup check - middleware should handle most auth redirects
        const checkAuthState = async () => {
            // Check if the auth cookie exists
            const authCookie = document.cookie
                .split('; ')
                .find(row => row.startsWith('sb-auth-state='));
                
            // If the auth cookie doesn't exist or is not authenticated, redirect to login
            if (!authCookie || !authCookie.includes('authenticated')) {
                router.push('/auth/login?redirect=/cart');
                return;
            }
            
            setIsAuthenticated(true);
        };
        
        checkAuthState();
    }, [router]);
    
    // Calculate cart totals based on Supabase product prices
    const subtotal = isClient ? getCartTotal() : 0;
    const total = subtotal;

    /**
     * Format currency values to display prices consistently
     * 
     * @param amount - The numeric amount to format
     * @returns Formatted price string (e.g., "$99.99")
     */
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Show loading state during client-side rendering or authentication check
    if (!isClient || !isAuthenticated) {
        return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black">Your Shopping Cart</h1>
        
        {canceled && (
            <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                Payment was canceled. Your cart items are still saved.
            </div>
        )}
        
        {/* Display empty cart message if cart has no items */}
        {cart.length === 0 ? (
            <div className="text-center py-8">
            <p className="text-xl mb-4 text-black">Your cart is empty</p>
            <Link href="/products" className="text-black hover:underline">
                Continue Shopping
            </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items - Display products fetched from Supabase */}
            <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                <table className="w-full">
                    <thead>
                    <tr className="border-b">
                        <th className="text-left py-2 text-black">Product</th>
                        <th className="text-right py-2 text-black">Price</th>
                        <th className="text-center py-2 text-black">Quantity</th>
                        <th className="text-right py-2 text-black">Total</th>
                        <th className="text-right py-2 text-black">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Map through cart items from cart context (product data from Supabase) */}
                    {cart.map((item) => (
                        <tr key={item.productId} className="border-b">
                        <td className="py-4">
                            <div className="flex items-center">
                            <div className="w-16 h-16 relative mr-4">
                                {/* Display product image from Supabase */}
                                <Image 
                                    src={item.imageURL} 
                                    alt={item.name} 
                                    fill
                                    className="object-cover rounded"
                                />
                            </div>
                            <span className="text-black">{item.name}</span>
                            </div>
                        </td>
                        {/* Display product price from Supabase */}
                        <td className="text-right py-4 text-black">{formatCurrency(item.price)}</td>
                        {/* Quantity controls */}
                        <td className="text-center py-4 text-black">
                            <div className="flex items-center justify-center">
                                <button 
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="w-8 h-8 bg-gray-200 rounded-l flex items-center justify-center"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="w-8 h-8 bg-gray-200 rounded-r flex items-center justify-center"
                                >
                                    +
                                </button>
                            </div>
                        </td>
                        {/* Calculate line total based on Supabase price and quantity */}
                        <td className="text-right py-4 text-black">{formatCurrency(item.price * item.quantity)}</td>
                        <td className="text-right py-4 text-black">
                            <button
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-600 hover:text-red-800"
                            >
                                Remove
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            
            {/* Order Summary - Calculated based on Supabase product prices */}
            <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-black">Order Summary</h2>
                <div className="flex justify-between py-2">
                    <span className="text-black">Subtotal</span>
                    <span className="text-black">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold border-t border-gray-200 mt-2 pt-2">
                    <span className="text-black">Total</span>
                    <span className="text-black">{formatCurrency(total)}</span>
                </div>
                
                <CheckoutButton items={cart} />
                
                <Link 
                    href="/products" 
                    className="w-full block text-center text-black mt-4 hover:underline"
                >
                    Continue Shopping
                </Link>
                </div>
            </div>
            </div>
        )}
        </div>
    );
}

/**
 * CartPage component displays the user's shopping cart with products from Supabase
 * It provides functionality to:
 * - View all cart items with their details from Supabase
 * - Update item quantities
 * - Remove items from cart
 * - See order summary with subtotal, tax, and total
 * - Proceed to checkout
 * 
 * This page is protected by middleware - unauthorized users are redirected to login
 */
export default function CartPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading cart...</div>}>
            <CartContent />
        </Suspense>
    );
}