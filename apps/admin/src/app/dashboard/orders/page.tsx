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

// Pagination interface
interface PaginationResult {
  orders: Order[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// Function to fetch orders with pagination
async function fetchOrders(page: number = 1, pageSize: number = 10): Promise<PaginationResult> {
  try {
    const offset = (page - 1) * pageSize;

    // Get total count of orders
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error fetching orders count:', countError);
      return {
        orders: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      };
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // First, fetch orders with order items (with pagination)
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .order('orderNumber', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return {
        orders: [],
        totalCount,
        totalPages,
        currentPage: page
      };
    }

    if (!orders || orders.length === 0) {
      return {
        orders: [],
        totalCount,
        totalPages,
        currentPage: page
      };
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

    return {
      orders: ordersWithDetails,
      totalCount,
      totalPages,
      currentPage: page
    };
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return {
      orders: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page
    };
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

// Pagination Component
function Pagination({ 
  currentPage, 
  totalPages, 
  totalCount,
  pageSize 
}: { 
  currentPage: number; 
  totalPages: number; 
  totalCount: number;
  pageSize: number;
}) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div className="flex-1 flex justify-between sm:hidden">
        {currentPage > 1 ? (
          <Link
            href={`?page=${currentPage - 1}`}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
            Previous
          </span>
        )}
        {currentPage < totalPages ? (
          <Link
            href={`?page=${currentPage + 1}`}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
            Next
          </span>
        )}
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {currentPage > 1 ? (
              <Link
                href={`?page=${currentPage - 1}`}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ) : (
              <span className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            
            {getPageNumbers().map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }
              
              const isCurrentPage = pageNum === currentPage;
              return (
                <Link
                  key={pageNum}
                  href={`?page=${pageNum}`}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    isCurrentPage
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </Link>
              );
            })}
            
            {currentPage < totalPages ? (
              <Link
                href={`?page=${currentPage + 1}`}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            ) : (
              <span className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-gray-100 text-sm font-medium text-gray-400 cursor-not-allowed">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </nav>
        </div>
      </div>
    </div>
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
async function OrdersList({ currentPage, pageSize }: { currentPage: number; pageSize: number }) {
  const result = await fetchOrders(currentPage, pageSize);
  const { orders, totalCount, totalPages } = result;
  
  return (
    <div className="bg-gray-50 overflow-hidden sm:rounded-md">
      {orders.length === 0 ? (
        <div className="p-6 text-center bg-white rounded-lg">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6 p-4">
            {orders.map((order: Order) => (
              <div key={order.orderId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="text-sm font-medium text-indigo-600 truncate mr-4" data-testid="order-Id">
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
                      <p data-testid="order-customer" className="flex items-center text-sm text-gray-500">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Customer: {order.user?.email || 'Unknown'}
                      </p>
                      <p data-testid="order-items" className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        Items: {order.order_items?.length || 0}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p data-testid="order-total" className="font-medium text-gray-900">${order.total?.toFixed(2)}</p>
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
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const pageSize = 5; // Changed from 10 to 5 orders per page

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
      </div>
      
      <Suspense fallback={<OrdersLoading />}>
        {/* @ts-ignore */}
        <OrdersList currentPage={currentPage} pageSize={pageSize} />
      </Suspense>
    </div>
  );
} 