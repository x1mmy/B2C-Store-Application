import { getSession } from '../utils/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Mock cart data - in a real app this would come from a database or state management
const mockCartItems = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    quantity: 1,
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 2,
    name: 'Smartphone Case',
    price: 19.99,
    quantity: 2,
    image: 'https://via.placeholder.com/150'
  },
  {
    id: 3,
    name: 'USB-C Cable',
    price: 9.99,
    quantity: 3,
    image: 'https://via.placeholder.com/150'
  }
];

export default async function CartPage() {
  // Get the user session
  const session = await getSession();
  const isAuthenticated = !!session;
  
  // Calculate cart totals
  const subtotal = mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {mockCartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCartItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-16 h-16 object-cover rounded mr-4"
                          />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-4">{formatCurrency(item.price)}</td>
                      <td className="text-right py-4">{item.quantity}</td>
                      <td className="text-right py-4">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold border-t border-gray-200 mt-2 pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
              
              {isAuthenticated ? (
                <Link 
                  href="/cart/checkout" 
                  className="w-full block text-center bg-blue-600 text-white font-bold py-2 px-4 rounded mt-6 hover:bg-blue-700 transition"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="mt-4">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
                    <p className="text-sm">Please log in to complete your purchase</p>
                  </div>
                  <Link 
                    href={`/auth/login?redirect=${encodeURIComponent('/cart/checkout')}`}
                    className="w-full block text-center bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition"
                  >
                    Log in to Checkout
                  </Link>
                </div>
              )}
              
              <Link 
                href="/products" 
                className="w-full block text-center text-blue-600 mt-4 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}