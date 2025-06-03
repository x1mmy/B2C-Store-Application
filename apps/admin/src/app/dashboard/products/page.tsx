import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import supabase from '../../configDB/supabaseConnect';
import ProductsFilter from './components/ProductsFilter';

// Interface for Product
interface Product {
  productId: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  category: string;
  stock: number;
}

// Function to fetch products
async function fetchProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return products || [];
}

// Function to fetch unique categories
async function fetchCategories() {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .not('category', 'is', null);
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  // Extract unique categories
  const categories = [...new Set(data.map(item => item.category))];
  return categories;
}

// Product Loading Component
function ProductsLoading() {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="divide-y divide-gray-200">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-6 flex flex-col sm:flex-row sm:items-start">
            <div className="flex-grow flex flex-col sm:flex-row sm:items-center">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <div className="w-20 h-20 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
              <div className="flex-grow">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
              <div className="h-10 w-16 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Products List Component
async function ProductsList({ searchParams }: { searchParams: { search?: string; category?: string } }) {
  const searchTerm = searchParams?.search || '';
  const categoryFilter = searchParams?.category || '';
  
  const products = await fetchProducts();
  
  // Filter products based on search term and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      {filteredProducts.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No products found. Create your first product to get started.</p>
          <Link 
            href="/dashboard/products/new" 
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Product
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredProducts.map((product: Product) => (
            <div key={product.productId} className="p-6 flex flex-col sm:flex-row sm:items-start">
              <div className="flex-grow flex flex-col sm:flex-row sm:items-center">
                <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  {product.imageURL ? (
                    <Image 
                      src={product.imageURL} 
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center">
                      <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 data-testid="product-name" className="text-lg font-medium text-indigo-600">
                    {product.name}
                  </h3>
                  <div data-testid="product-category" className="mt-1 text-sm text-gray-500">
                    {product.category}
                  </div>
                  <div data-testid="product-price" className="mt-1 font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </div>
                  <div data-testid="product-stock" className="mt-1 text-sm text-gray-500">
                    Stock: {product.stock}
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <Link
                  href={`/dashboard/products/${product.productId}`}
                  data-testid="product-edit-button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ search?: string; category?: string }> }) {
  const categories = await fetchCategories();
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 data-testid="products-title" className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          href="/dashboard/products/new"
          data-testid="add-product-button"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Product
        </Link>
      </div>
      
      <ProductsFilter categories={categories} searchParams={resolvedSearchParams} />
      
      <Suspense fallback={<ProductsLoading />}>
        <ProductsList searchParams={resolvedSearchParams} />
      </Suspense>
    </div>
  );
} 