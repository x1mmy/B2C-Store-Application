"use client";

import { useState, useEffect } from 'react';
import { useParams } from "next/navigation";
import supabase from "../../configDB/supabaseConnect";
import Image from 'next/image';
import Link from 'next/link';
import { createUrlSlug } from '../../utils/urlHelpers';
import { useCart } from '../../context/cartContext';
import Header from '@/app/components/layout/header';


/**
 * Product interface defines the structure of a product from Supabase database
 * This matches the schema of the products table in Supabase
 */
interface Product {
    productId: string;    // Unique identifier in Supabase products table
    name: string;         // Product name in Supabase
    description: string;  // Product description in Supabase
    price: number;        // Product price in Supabase
    imageURL: string;     // Image URL in Supabase storage or external source
    category: string;     // Product category in Supabase
    stock: number;        // Available inventory in Supabase
}

/**
 * ProductPage component displays detailed information about a specific product
 * It fetches product data from Supabase based on the URL parameter
 * It allows users to select quantity and add the product to their cart
 */
export default function ProductPage() {
    // Get the product ID/slug from the URL parameters
    const params = useParams();
    
    // State for storing the product data from Supabase
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for the quantity selector
    const [quantity, setQuantity] = useState(1);
    
    // Access the cart context to add products from Supabase
    const { addToCart } = useCart();

    /**
     * Fetch the product data from Supabase when the component mounts
     * or when the product ID in the URL changes
     */
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // Get the slug from the URL
                const slug = params.id as string;

                // Query Supabase products table to find the matching product
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .filter('name', 'ilike', `%${slug.replace(/-/g, '%')}%`);

                if (error) throw error;
                
                if (!data || data.length === 0) {
                    setError('Product not found');
                    return;
                }

                // Find the exact match by comparing slugs
                const matchingProduct = data.find(
                    p => createUrlSlug(p.name) === slug
                );

                if (!matchingProduct) {
                    setError('Product not found');
                    return;
                }

                // Set the product data from Supabase to state
                setProduct(matchingProduct);
            } catch (err) {
                setError('Failed to load product details');
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    /**
     * Handle quantity changes, ensuring it's within valid limits based on Supabase stock
     * 
     * @param value - The new quantity value
     */
    const handleQuantityChange = (value: number) => {
        if (value >= 1 && value <= (product?.stock || 1)) {
            setQuantity(value);
        }
    };

    /**
     * Handle adding the product to the cart
     * Adds the product from Supabase to the cart with the selected quantity
     */
    const handleAddToCart = () => {
        if (product && product.stock > 0) {
            // Add the product to cart once with the selected quantity
            addToCart({
                productId: product.productId, // Supabase product ID
                name: product.name,           // Product name from Supabase
                price: product.price,         // Product price from Supabase
                imageURL: product.imageURL,   // Image URL from Supabase
            }, quantity);
        }
    };

    // Loading state while fetching product from Supabase
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">

                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
                </div>

            </div>
        );
    }

    // Error state if product not found in Supabase
    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50">

                <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
                        <p className="mt-2 text-gray-600">{error || "This product could not be found."}</p>
                        <Link href="/products" className="mt-4 inline-block px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                            Return to Products
                        </Link>
                    </div>
                </div>

            </div>
        );
    }

    // Display the product details from Supabase
    return (
        <div className="min-h-screen bg-gray-50">
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Product Image from Supabase */}
                    <div className="aspect-w-1 aspect-h-1 w-full">
                        <div className="h-96 w-full relative rounded-lg overflow-hidden">
                            {product.imageURL ? (
                                <Image
                                    src={product.imageURL}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="w-full h-full object-center object-contain"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No image available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Details from Supabase */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        {/* Product Name from Supabase */}
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                        
                        {/* Product Category from Supabase */}
                        {product.category && (
                            <div className="mt-3">
                                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                    {product.category}
                                </span>
                            </div>
                        )}

                        {/* Product Price from Supabase */}
                        <div className="mt-6">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-gray-900">${product.price.toFixed(2)}</p>
                        </div>

                        {/* Product Description from Supabase */}
                        {product.description && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                                <div className="mt-2 prose prose-sm text-gray-500">
                                    <p>{product.description}</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-8">
                            {/* Quantity Selector - limited by stock from Supabase */}
                            <div className="flex items-center">
                                {/* <button
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    className="p-2 border rounded-l-md hover:bg-gray-100"
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button> */}
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                                    className="w-16 text-center text-gray-900 border-t border-b"
                                    min="1"
                                    max={product.stock}
                                />
                                {/* <button
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    className="p-2 border rounded-r-md hover:bg-gray-100"
                                    disabled={quantity >= product.stock}
                                >
                                    +
                                </button> */}
                            </div>

                            {/* Add to Cart Button - disabled if out of stock in Supabase */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="mt-4 w-full bg-red-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={product.stock <= 0}
                            >
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                        </div>

                        {/* Stock Status from Supabase */}
                        <div className="mt-6">
                            <p className="text-sm text-gray-500">
                                {product.stock > 0 
                                    ? `${product.stock} units in stock` 
                                    : 'Out of stock'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

        </div>
    );
}


