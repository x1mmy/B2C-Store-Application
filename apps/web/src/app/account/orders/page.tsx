import { requireAuth } from '../../utils/auth';
import supabase from '../../configDB/supabaseConnect';
import Link from 'next/link';

// Define types for our data
interface OrderItem {
  orderItemsId: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  userId: string;
  orderNumber: string;
  total: number;
  status: string;
  // created_at is optional since the table doesn't have this column
  created_at?: string;
  order_items?: OrderItem[];
}

export default async function OrdersPage() {
  // Require authentication
  const session = await requireAuth();
  
  // Make sure we have a user
  if (!session || !session.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Please log in to view your orders.
        </div>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }
  
  const userId = session.user.id;
  
  // Fetch orders for the user
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .eq('userId', userId)
    ;
  
  if (error) {
    console.error('Error fetching orders:', error);
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-black">Your Orders</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error loading orders. Please try again later.
          </div>
        )}
        
        {!orders || orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-black text-center">You haven't placed any orders yet.</p>
            <div className="mt-4 text-center">
              <Link 
                href="/products" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: Order) => (
              <div key={order.orderId} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-black">Order #{order.orderNumber?.substring(0, 8)}</h2>
                    <p className="text-sm text-gray-500">
                      Order ID: {order.orderId.substring(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                      {order.status}
                    </span>
                    <p className="font-bold text-black mt-2">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-black mb-2">Order Items</h3>
                  <ul className="divide-y">
                    {order.order_items?.map((item: OrderItem) => (
                      <li key={item.orderItemsId} className="py-2 flex justify-between">
                        <span className="text-black">
                          {item.quantity} x Item {item.productId.substring(0, 8)}
                        </span>
                        <span className="font-medium text-black">${item.price.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <Link 
            href="/account" 
            className="text-blue-600 hover:underline"
          >
            ← Back to Account
          </Link>
        </div>
      </div>
    </div>
  );
} 