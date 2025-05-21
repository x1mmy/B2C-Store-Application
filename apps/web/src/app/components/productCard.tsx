"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProductUrl } from '../utils/urlHelpers';
// import { getImageUrl } from '../utils/supabaseStorage';
import { useCart } from '../context/cartContext';

/**
 * ProductCardProps interface defines the expected props for the ProductCard component
 * The product object structure matches the Supabase products table schema
 */
interface ProductCardProps {
    product: {
        productId: string;  // Unique identifier from Supabase products table
        name: string;       // Product name from Supabase
        price: number;      // Product price from Supabase
        imageURL: string;   // Image URL from Supabase storage or external source
        category: string;   // Category from Supabase
        description: string; // Description from Supabase
        stock: number;      // Available inventory count from Supabase
    };
}

/**
 * ProductCard component displays a single product card with data from Supabase
 * It provides functionality to view product details and add the product to cart
 * 
 * @param product - Product data fetched from Supabase products table
 */
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Generate the product URL for linking to the product detail page
    const productUrl = getProductUrl(product);
    // Commented out: const imageUrl = getImageUrl(product.imageURL);
    
    // Access the addToCart function from the cart context
    const { addToCart } = useCart();
    
    /**
     * Handles the "Add to Cart" button click
     * Takes the Supabase product data and passes it to the cart context
     */
    const handleAddToCart = () => {
        addToCart({
            productId: product.productId, // Pass the Supabase product ID for reference
            name: product.name,           // Product name from Supabase
            price: product.price,         // Product price from Supabase
            imageURL: product.imageURL,   // Image URL from Supabase
        });
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105">
            {/* Link to the product detail page */}
            <Link href={productUrl} className="block relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <div className="relative w-full h-64">
                        <Image 
                            src={product.imageURL}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                        />
                    </div>
                </div>
            </Link>
            <div className="p-4">
                <Link href={productUrl}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">{product.name}</h3>
                </Link>
                {product.category && (
                    <span className="text-sm text-gray-500">{product.category}</span>
                )}
                <p className="mt-2 text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                {/* Add to Cart button - disabled if product is out of stock based on Supabase data */}
                <button 
                    onClick={handleAddToCart}
                    className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                    disabled={product.stock <= 0}
                >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;