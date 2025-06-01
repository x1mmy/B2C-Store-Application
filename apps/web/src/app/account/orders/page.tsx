"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Define types for our data
interface Product {
  productId: string;
  name: string;
  price: number;
  description: string;
  imageURL: string;
  category: string;
  stock: number;
}

interface OrderItem {
  orderItemsId: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  products?: {
    productId: string;
    name: string;
    price: number;
    imageURL: string;
  };
}

interface Order {
  orderId: string;
  userId: string;
  orderNumber: string;
  total: number;
  status: string;
  order_items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          credentials: 'include', // Include cookies for authentication
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Orders API response:', data);
          setOrders(data.orders || []);
        } else {
          setError('Failed to load orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-black">Your Orders</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-black">Your Orders</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-black">Your Orders</h1>
        
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
              <div key={order.orderId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-black">Order #{order.orderNumber?.substring(0, 8)}</h2>
                    {/* <p className="text-sm text-gray-500">
                      Order ID: {order.orderId.substring(0, 8)}
                    </p> */}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 text-sm rounded-full font-medium ${
                      order.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status.toLowerCase() === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status.toLowerCase() === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status.toLowerCase() === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="font-bold text-black mt-2 text-xl">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-black mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {order.order_items?.map((item: OrderItem) => (
                      <div key={item.orderItemsId} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black">
                            {item.products?.name }
                          </p>
                          <p className="text-xs text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-black">${item.price.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">each</p>
                        </div>
                      </div>
                    ))}
                  </div>
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