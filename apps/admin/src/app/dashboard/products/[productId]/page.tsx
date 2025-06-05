import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import supabase from '../../../configDB/supabaseConnect';
import ProductForm from '../components/ProductForm';

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

// Function to fetch a single product
async function fetchProduct(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('productId', productId)
    .single();
  
  if (error) {
    // Handle the case where product doesn't exist (e.g., after deletion)
    if (error.code === 'PGRST116') {
      // Product not found - this is expected after deletion
      return null;
    }
    // Only log other types of errors
    console.error('Error fetching product:', error);
    return null;
  }
  
  return data;
}

// Function to fetch categories for dropdown
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

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = await fetchProduct(productId);
  const categories = await fetchCategories();
  
  if (!product) {
    notFound();
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <Link 
          href="/dashboard/products" 
          className="text-indigo-600 hover:text-indigo-900 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Products
        </Link>
      </div>
      
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit Product</h3>
            <p className="mt-1 text-sm text-gray-600">
              Update your product information here. Fields marked with * are required.
            </p>
            {product.imageURL && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500">Current Image</h4>
                <div className="mt-2">
                  <Image 
                    src={product.imageURL}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="max-w-full h-auto rounded-lg shadow-md object-contain"
                    style={{ maxHeight: '300px' }}
                    unoptimized={true}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <ProductForm product={product} categories={categories} />
        </div>
      </div>
    </div>
  );
} 