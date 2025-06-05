import { requireAuth } from '../utils/auth';
import LogoutButton from '../components/LogoutButton';
import Link from 'next/link';

// Force dynamic rendering for this page since it uses cookies
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  // This will redirect to login if user is not authenticated
  const session = await requireAuth();
  
  // Check if session and user exist
  if (!session || !session.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Please log in to view your account.
        </div>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Go to Login
        </Link>
      </div>
    );
  }
  
  const user = session.user;
  
  // Get additional properties for debugging
  const userDetails = {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    app_metadata: user.app_metadata,
    auth_provider: user.app_metadata?.provider || 'unknown',
    authenticated: session.isAuthenticated,
    last_sign_in: user.last_sign_in_at,
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-black">Your Account</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 data-testid="profile-information-title" className="text-xl font-bold mb-4 text-black">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 text-black">Email Address</p>
              <p data-testid="profile-information-email" className="font-medium text-black">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 text-black">User ID</p>
              <p data-testid="profile-information-user-id" className="font-medium text-black">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 text-black">Account Created</p>
              <p className="font-medium text-black">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            {user.last_sign_in_at && (
              <div>
                <p className="text-sm text-gray-500 text-black">Last Sign In</p>
                <p className="font-medium text-black">{new Date(user.last_sign_in_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 data-testid="recent-orders-title" className="text-xl font-bold mb-4 text-black">Recent Orders</h2>
          <p className="text-gray-500 text-black">View your order history and track your purchases.</p>
          <Link data-testid="recent-orders-link" href="/account/orders" className="text-blue-600 hover:underline block mt-4">
            View All Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black">Account Actions</h2>
          <div data-testid="account-actions" className="flex flex-wrap gap-4">
            <LogoutButton />
            <Link 
              data-testid="view-cart-link"
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