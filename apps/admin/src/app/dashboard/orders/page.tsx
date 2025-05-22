import { Suspense } from 'react';
import Link from 'next/link';
import supabase from '../../configDB/supabaseConnect';

// Interface for Order Item
interface OrderItem {
  orderItemsId: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

// Interface for Order
interface Order {
  orderId: string;
  userId: string;
  orderNumber: string;
  total: number;
  status: string;
  created_at?: string;
  order_items?: OrderItem[];
  user?: {
    email: string;
  };
}

// Function to fetch orders
async function fetchOrders() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*),
      user:userId(email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return orders || [];
}

// Order Status Badge Component
function OrderStatusBadge({ status }: { status: string }) {
  let colorClass = '';
  
  switch (status.toLowerCase()) {
    case 'pending':
      colorClass = 'bg-yellow-100 text-yellow-800';
      break;
    case 'processing':
      colorClass = 'bg-blue-100 text-blue-800';
      break;
    case 'shipped':
      colorClass = 'bg-purple-100 text-purple-800';
      break;
    case 'delivered':
      colorClass = 'bg-green-100 text-green-800';
      break;
    case 'cancelled':
      colorClass = 'bg-red-100 text-red-800';
      break;
    default:
      colorClass = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  );
}

// Orders Loading Component
function OrdersLoading() {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {[...Array(5)].map((_, index) => (
          <li key={index}>
            <div className="px-4 py-4 sm:px-6">
              <div className="animate-pulse flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="flex space-x-4">
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Orders List Component
async function OrdersList() {
  const orders = await fetchOrders();
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {orders.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {orders.map((order: Order) => (
            <li key={order.orderId}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate mr-4">
                      Order #{order.orderNumber?.substring(0, 8)}
                    </p>
                    <p className="flex-shrink-0 text-sm text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer: {order.user?.email || 'Unknown'}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      Items: {order.order_items?.length || 0}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p className="font-medium text-gray-900">${order.total?.toFixed(2)}</p>
                    <Link
                      href={`/dashboard/orders/${order.orderId}`}
                      className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6 p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
          <div className="max-w-lg w-full lg:max-w-xs">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="search"
                name="search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Search orders by order number or customer"
                type="search"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <select
              id="status"
              name="status"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              id="sort"
              name="sort"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="total_desc">Amount: High to Low</option>
              <option value="total_asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>
      
      <Suspense fallback={<OrdersLoading />}>
        {/* @ts-ignore */}
        <OrdersList />
      </Suspense>
    </div>
  );
} 