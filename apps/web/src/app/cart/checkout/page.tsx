import { requireAuth } from '../../utils/auth';
import Link from 'next/link';

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

// Mock shipping methods
const shippingMethods = [
  { id: 'standard', name: 'Standard Shipping', price: 4.99, eta: '3-5 business days' },
  { id: 'express', name: 'Express Shipping', price: 12.99, eta: '1-2 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 24.99, eta: 'Next business day' }
];

export default async function CheckoutPage() {
  // This will redirect to login if user is not authenticated
  const session = await requireAuth();
  const user = session.user;
  
  // Calculate cart totals
  const subtotal = mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const shippingCost = 4.99; // Default shipping
  const total = subtotal + tax + shippingCost;

  // Function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="md:col-span-2">
          {/* User Account Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            <div className="mb-4">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id.substring(0, 8)}...</p>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="First Name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Last Name"
                />
              </div>
              <div className="mb-4 md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Street Address"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="City"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>
          
          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Shipping Method</h2>
            <div className="space-y-4">
              {shippingMethods.map((method) => (
                <div key={method.id} className="flex items-center border border-gray-200 p-4 rounded">
                  <input
                    type="radio"
                    id={method.id}
                    name="shippingMethod"
                    className="mr-3"
                    defaultChecked={method.id === 'standard'}
                  />
                  <label htmlFor={method.id} className="flex-grow">
                    <div className="flex justify-between">
                      <span className="font-medium">{method.name}</span>
                      <span>{formatCurrency(method.price)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{method.eta}</p>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="mb-4">
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <input
                type="text"
                id="cardNumber"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="**** **** **** ****"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  id="expiryDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="MM/YY"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  id="cvv"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="***"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            {/* Products list */}
            <div className="max-h-64 overflow-y-auto mb-4">
              {mockCartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex items-center">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded mr-3"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            
            {/* Place Order button */}
            <button 
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-6 hover:bg-blue-700 transition"
            >
              Place Order
            </button>
            
            <div className="mt-4 text-center">
              <Link href="/cart" className="text-blue-600 hover:underline">
                Return to Cart
              </Link>
            </div>
            
            {/* Terms */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              By placing your order, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 