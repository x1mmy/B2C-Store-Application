"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import supabase from '../configDB/supabaseConnect';
import ProductCard from '../components/productCard';
// import Header from '../components/layout/header';
// import Footer from '../components/layout/footer';
// import { useCart } from '../context/CartContext';

/**
 * Product interface defines the structure of a product from Supabase database
 * This matches the schema of the products table in Supabase
 */
interface Product {
    productId: string;    // Unique identifier in Supabase products table
    name: string;         // Product name in Supabase
    price: number;        // Product price in Supabase
    imageURL: string;     // Image URL in Supabase storage or external source
    category: string;     // Product category in Supabase
    description: string;  // Product description in Supabase
    stock: number;        // Available inventory in Supabase
}

/**
 * ProductsPage component displays a grid of products fetched from Supabase
 * It also provides category filtering options for the products
 */
export default function ProductsPage() {
    // State for products fetched from Supabase
    const [products, setProducts] = useState<Product[]>([]);
    // State for unique categories from Supabase
    const [categories, setCategories] = useState<string[]>([]);
    // Loading state for API calls
    const [loading, setLoading] = useState(true);
    // State for tracking selected category
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    // State for search query
    const [searchQuery, setSearchQuery] = useState<string>('');

    /**
     * Fetch products and categories from Supabase when the component mounts
     */
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch all products from Supabase products table
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('*');

                if (productsError) {
                    console.error('Error fetching products:', productsError);
                } else {
                    // Store the Supabase products in state
                    setProducts(productsData || []);
                }

                // Fetch unique categories from Supabase products table
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('products')
                    .select('category')
                
                if (categoriesError) {
                    console.error('Error fetching categories:', categoriesError);
                } else {
                    // Extract unique categories from Supabase data
                    // by using the Set object to remove duplicates
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

    // Filter products based on selected category and search query
    const filteredProducts = products.filter(product => {
        // Filter by category if one is selected
        const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
        
        // Filter by search query if one exists
        const matchesSearch = searchQuery 
            ? product.name.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
            
        // Return products that match both filters
        return matchesCategory && matchesSearch;
    });

    // Show loading state while fetching from Supabase
    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Black header section with product categories from Supabase */}
            <div className="bg-black py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold text-white text-center">Our Products</h1>
                    
                    {/* Search bar */}
                    <div className="mt-6 max-w-md mx-auto">
                        <div className="relative rounded-full shadow-sm">
                            <input
                                type="text"
                                placeholder="Search products..."
                                data-testid="search-bar"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input block w-full pl-4 pr-10 py-2 rounded-full text-black bg-white border-gray-300 focus:border-red-600 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    
                    {/* Category filters - populated from Supabase data */}
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <button
                            data-testid="category-filter-button-all"
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-full ${selectedCategory === null 
                                ? 'bg-red-700 text-white' 
                                : 'bg-red-600 text-white hover:bg-red-700'} transition-colors`}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                data-testid={`category-filter-button-${category}`}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full ${selectedCategory === category 
                                    ? 'bg-red-700 text-white' 
                                    : 'bg-red-600 text-white hover:bg-red-700'} transition-colors`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products Grid - Displaying products from Supabase */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {/* Map through filtered products from Supabase and render ProductCard for each */}
                    {filteredProducts.map((product) => (
                        <ProductCard 
                            
                            key={product.productId} 
                            product={product} 
                            /* 
                              ProductCard component handles adding Supabase products to cart
                              using the cart context and addToCart function
                            */
                        />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}