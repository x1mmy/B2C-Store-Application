import Link from 'next/link';
import supabase from '../../../configDB/supabaseConnect';
import NewProductForm from '../components/NewProductForm';

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

export default async function NewProductPage() {
  const categories = await fetchCategories();
  
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
            <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Product</h3>
            <p className="mt-1 text-sm text-gray-600">
              Add a new product to your inventory. Fields marked with * are required.
            </p>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <NewProductForm categories={categories} />
        </div>
      </div>
    </div>
  );
} 