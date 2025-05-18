import { requireAuth } from '../utils/auth';
import LogoutButton from '../components/LogoutButton';
import Link from 'next/link';

export default async function AccountPage() {
  // This will redirect to login if user is not authenticated
  const session = await requireAuth();
  const user = session.user;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Account</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          <p className="text-gray-500">You have no recent orders.</p>
          <Link href="/products" className="text-blue-600 hover:underline block mt-4">
            Browse Products
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Account Actions</h2>
          <div className="flex flex-wrap gap-4">
            <LogoutButton />
            <Link 
              href="/cart" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors inline-block"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 