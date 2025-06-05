import { Suspense } from 'react';
import supabase from '../configDB/supabaseConnect';

// Interface for Dashboard Stats
interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
}

// Function to fetch dashboard stats
async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    // Fetch total customers (unique users with orders)
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    
    return {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
    };
  }
}

// Stats Card Component
function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg transform transition-all hover:scale-105">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-4">
            {icon}
          </div>
          <div className="ml-6 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoadingStats() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-md bg-gray-300 h-12 w-12"></div>
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard Stats Component
async function DashboardStats() {
  const stats = await fetchDashboardStats();
  
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
      <StatCard 
        title="Total Products" 
        value={stats.totalProducts} 
        icon={<svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>} 
      />
      <StatCard 
        title="Total Orders" 
        value={stats.totalOrders} 
        icon={<svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>} 
      />
      <StatCard 
        title="Total Customers" 
        value={stats.totalCustomers} 
        icon={<svg className="h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>} 
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 data-testid="dashboard-title" className="text-lg font-medium text-gray-900 mb-2">Welcome to your Admin Dashboard</h2>
          <p className="text-gray-600">
            This is your central hub for managing your e-commerce store. Use the sidebar to navigate to different sections.
          </p>
        </div>
        
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        
        <Suspense fallback={<LoadingStats />}>
          {/* @ts-ignore */}
          <DashboardStats />
        </Suspense>
        
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/dashboard/products"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <div>
                <p className="text-base font-medium text-gray-900">Add New Product</p>
                <p className="text-sm text-gray-500">Create and publish a new product</p>
              </div>
            </a>
            <a
              href="/dashboard/orders"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <svg className="h-6 w-6 text-indigo-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <div>
                <p className="text-base font-medium text-gray-900">View Recent Orders</p>
                <p className="text-sm text-gray-500">Check and process recent orders</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 