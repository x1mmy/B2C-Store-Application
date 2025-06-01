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
  product?: {
    productId: string;
    name: string;
    price: number;
    imageURL: string;
  };
}

// Interface for Order
interface Order {
  orderId: string;
  userId: string;
  orderNumber: string;
  total: number;
  status: string;
  order_items?: OrderItem[];
  user?: {
    id: string;
    email: string;
  };
}

// Function to fetch orders
async function fetchOrders() {
  try {
    // First, fetch all orders with order items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('orderNumber', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return [];
    }

    if (!orders || orders.length === 0) {
      return [];
    }

    // Get all unique user IDs from orders
    const userIds = [...new Set(orders.map(order => order.userId))];
    
    // Fetch user information using Auth Admin API
    let users: any[] = [];
    if (userIds.length > 0) {
      try {
        // Use the auth admin API to get user details
        const userPromises = userIds.map(async (userId) => {
          try {
            const { data, error } = await supabase.auth.admin.getUserById(userId);
            if (error) {
              console.error(`Error fetching user ${userId}:`, error);
              return {
                id: userId,
                email: `User-${userId.substring(0, 8)}`
              };
            }
            return {
              id: data.user.id,
              email: data.user.email || `User-${userId.substring(0, 8)}`
            };
          } catch (err) {
            console.error(`Exception fetching user ${userId}:`, err);
            return {
              id: userId,
              email: `User-${userId.substring(0, 8)}`
            };
          }
        });

        users = await Promise.all(userPromises);
      } catch (error) {
        console.error('Error with auth admin API:', error);
        // Fallback to user IDs
        users = userIds.map(userId => ({
          id: userId,
          email: `User-${userId.substring(0, 8)}`
        }));
      }
    }

    // Get all unique product IDs from order items
    const allOrderItems = orders.flatMap(order => order.order_items || []);
    const productIds = [...new Set(allOrderItems.map(item => item.productId))];
    
    // Fetch product information
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('productId, name, price, imageURL')
      .in('productId', productIds);

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Combine the data
    const ordersWithDetails = orders.map(order => ({
      ...order,
      user: users?.find(user => user.id === order.userId) || null,
      order_items: order.order_items?.map((item: any) => ({
        ...item,
        product: products?.find(product => product.productId === item.productId) || null
      })) || []
    }));

    return ordersWithDetails;
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return [];
  }
}

// Order Status Badge Component
function OrderStatusBadge({ status }: { status: string }) {
  let colorClass = '';
  
  switch (status) {
    default:
      colorClass = 'bg-green-100 text-black';
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
    <div className="bg-gray-50 overflow-hidden sm:rounded-md">
      {orders.length === 0 ? (
        <div className="p-6 text-center bg-white rounded-lg">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-6 p-4">
          {orders.map((order: Order) => (
            <div key={order.orderId} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="text-sm font-medium text-indigo-600 truncate mr-4">
                      Order #{order.orderId?.substring(0, 8)}
                    </p>
                    {/* <p className="flex-shrink-0 text-sm text-gray-500">
                      Status: {order.status.toUpperCase()}
                    </p> */}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <OrderStatusBadge status={order.status.toUpperCase()} />
                  </div>
                </div>
                <div className="mt-4 sm:flex sm:justify-between">
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
                    {/* <Link
                      href={`/dashboard/orders/${order.orderId}`}
                      className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      View Details
                    </Link> */}
                  </div>
                </div>
                
                {/* Product Details */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Products:</h4>
                    <div className="space-y-3">
                      {order.order_items.map((item: OrderItem) => (
                        <div key={item.orderItemsId} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center">
                            {item.product?.imageURL && (
                              <img 
                                src={item.product.imageURL} 
                                alt={item.product.name || 'Product'} 
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                            )}
                            <span className="text-gray-700 font-medium">
                              {item.product?.name || `Product ID: ${item.productId}`}
                            </span>
                          </div>
                          <div className="text-gray-600 font-medium">
                            Qty: {item.quantity} × ${(item.product?.price || (item.price / item.quantity)).toFixed(2)} = ${item.price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function OrdersPage() {
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
            {/* <select
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
            </select> */}
            <select
              id="sort"
              name="sort"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black"
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