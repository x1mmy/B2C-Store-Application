"use client";

import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        price: number;
        imageURL?: string;
        category?: string;
    };
    addToCart: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:scale-105">
            <Link href={`/products/${product.id}`} className="block relative">
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                    <img 
                        src={product.imageURL || "https://via.placeholder.com/300?text=Product+Image"} 
                        alt={product.name}
                        className="w-full h-64 object-cover"
                    />
                </div>
            </Link>
            <div className="p-4">
                <Link href={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">{product.name}</h3>
                </Link>
                {product.category && (
                    <span className="text-sm text-gray-500">{product.category}</span>
                )}
                <p className="mt-2 text-xl font-bold text-gray-900">${product.price?.toFixed(2)}</p>
                <button 
                    onClick={addToCart}
                    className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;