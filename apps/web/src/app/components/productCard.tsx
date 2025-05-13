"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProductUrl } from '../utils/urlHelpers';
import { getImageUrl } from '../utils/supabaseStorage';

// Define the props for the ProductCard component
interface ProductCardProps {
    product: {
        productId: string;
        name: string;
        price: number;
        imageURL: string;
        category: string;
        description: string;
        stock: number;
    };
    addToCart: () => void;
}

// Define the ProductCard component
const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
    const productUrl = getProductUrl(product);
    const imageUrl = getImageUrl(product.imageURL);
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105">
            <Link href={productUrl} className="block relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <div className="relative w-full h-64">
                        <Image 
                            src={imageUrl}
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
                <button 
                    onClick={addToCart}
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