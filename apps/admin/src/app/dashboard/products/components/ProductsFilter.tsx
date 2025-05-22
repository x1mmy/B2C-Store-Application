'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

interface ProductsFilterProps {
  categories: string[];
  searchParams: {
    search?: string;
    category?: string;
  };
}

export default function ProductsFilter({ categories, searchParams }: ProductsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams as any);
      params.set(name, value);
      
      if (value === '') {
        params.delete(name);
      }
      
      return params.toString();
    },
    [searchParams]
  );
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`${pathname}?${createQueryString('search', e.target.value)}`);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?${createQueryString('category', e.target.value)}`);
  };
  
  return (
    <div className="bg-white shadow rounded-lg mb-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:max-w-md">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Search products"
              type="search"
              defaultValue={searchParams.search || ''}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <select
            id="category"
            name="category"
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            defaultValue={searchParams.category || ''}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 