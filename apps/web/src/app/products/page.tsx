"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import supabase from '../configDB/supabaseConnect';
import ProductCard from '../components/productCard';
import Header from '../components/layout/header';
import Footer from '../components/layout/footer';
// import { useCart } from '../context/CartContext';

// Define the Product interface
interface Product {
    productId: string;
    name: string;
    price: number;
    imageURL: string;
    category: string;
    description: string;
    stock: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch products and categories
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            
            try {
                // Fetch all products
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*');

                if (productsError) {
                    console.error('Error fetching products:', productsError);
                } else {
                    setProducts(productsData || []);
                }

                // Fetch unique categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('products')
                    .select('category')
                    .not('category', 'is', null);

                if (categoriesError) {
                    console.error('Error fetching categories:', categoriesError);
                } else {
                    // Extract unique categories
                    const uniqueCategories = [...new Set(categoriesData.map(item => item.category))];
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    // // Generate an array of page numbers
    // const pageNumbers = [];
    // for (let i = 1; i <= totalPages; i++) {
    //     pageNumbers.push(i);
    // }
    

    return (

        <div className="min-h-screen bg-gray-50">
            <Header />
            {/* Header Section */}
            <div className="bg-black py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-white text-center">Our Products</h1>
                    {/* Categories */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.productId} product={product} addToCart={() => {}} />
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}