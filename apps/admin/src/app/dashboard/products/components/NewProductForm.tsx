'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';

interface NewProductFormProps {
  categories: string[];
}

export default function NewProductForm({ categories }: NewProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
    imageURL: '',
    category: '',
    stock: 0
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price <= 0) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productId: crypto.randomUUID()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create product');
      }
      
      toast.success('Product created successfully');
      router.refresh();
      router.push('/dashboard/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Toaster position="top-right" />
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              id="name"
              data-testid="product-name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                id="price"
                data-testid="product-price"
                required
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
            
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                data-testid="product-stock"
                required
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="category"
              name="category"
              data-testid="product-category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="new">+ Add New Category</option>
            </select>
          </div>
          
          {formData.category === 'new' && (
            <div>
              <label htmlFor="newCategory" className="block text-sm font-medium text-gray-700">
                New Category Name *
              </label>
              <input
                type="text"
                name="newCategory"
                id="newCategory"
                data-testid="product-new-category"
                required
                onChange={(e) => {
                  if (e.target.value) {
                    setFormData(prev => ({
                      ...prev,
                      category: e.target.value
                    }));
                  }
                }}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="imageURL" className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="url"
              name="imageURL"
              id="imageURL"
              data-testid="product-imageURL"
              value={formData.imageURL}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              data-testid="product-description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
            />
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            data-testid="save-changes-button"
            disabled={isSubmitting}
            className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </>
  );
} 