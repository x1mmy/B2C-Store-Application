import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { stripe } from '../../../configDB/stripe'
import { getUserId, getSessionWithToken } from '../../../utils/auth'
import ClearCart from './ClearCart'
import supabase from '../../../configDB/supabaseConnect'
import { v4 as uuidv4 } from 'uuid'

// Define interfaces for type safety
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderResponse {
  success: boolean;
  orderId?: string;
  error?: string;
}

export default async function Success({ searchParams }: { searchParams: Promise<{ session_id: string }> }) {
  const { session_id } = await searchParams

  if (!session_id) {
    return redirect('/cart')
  }

  let orderCreated = false;
  let orderId: string | null = null;
  let orderNumber: string | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items', 'line_items.data.price.product']
    })

    const customerEmail = session.customer_details?.email || ''
    
    if (session.status === 'open') {
      return redirect('/cart')
    }

    if (session.status === 'complete') {
      // Get the authenticated user ID and token
      const userSession = await getSessionWithToken();
      const userId = userSession?.user?.id;
      
      if (userId && session.line_items?.data) {
        // Extract cart data from Stripe session metadata
        const cartItems = session.line_items.data.map(item => {
          const product = item.price?.product as any;
          return {
            productId: product?.metadata?.productId || product?.id, // Use metadata productId or fallback to Stripe product ID
            name: product?.name || 'Unknown Product',
            price: (item.amount_total || 0) / 100, // Convert from cents to dollars
            quantity: item.quantity || 1
          }
        })
        
        console.log('Cart items extracted from Stripe session:', cartItems);
        
        // Generate order number that will be used regardless of API or direct DB path
        orderNumber = uuidv4();
        
        // First try using the API with proper cookie forwarding
        try {
          // Get cookies to forward to API
          const cookieStore = await cookies();
          const authCookies = [
            cookieStore.get('sb-access-token')?.value ? `sb-access-token=${cookieStore.get('sb-access-token')?.value}` : '',
            cookieStore.get('sb-refresh-token')?.value ? `sb-refresh-token=${cookieStore.get('sb-refresh-token')?.value}` : '',
            cookieStore.get('sb-auth-state')?.value ? `sb-auth-state=${cookieStore.get('sb-auth-state')?.value}` : ''
          ].filter(Boolean).join('; ');
          
          // In development, use localhost, in production use relative URL (which works with same-origin requests)
          const apiUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:3001/api/orders'
            : '/api/orders';
          
          console.log('Calling orders API at:', apiUrl);
          
          // Create the order using the API route with forwarded cookies
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': authCookies, // Forward authentication cookies
            },
            body: JSON.stringify({
              userId,
              total: (session.amount_total || 0) / 100, // Convert from cents to dollars
              items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              })),
              status: 'completed',
              orderNumber: orderNumber // Pass the generated order number to API
            })
          })
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Order API error (${response.status}):`, errorText);
            // Continue with direct DB access as fallback
            throw new Error('API failed, using direct DB access');
          } else {
            const orderResult = await response.json();
            
            if (!orderResult.success) {
              console.error('Failed to save order:', orderResult.error);
              // Continue with direct DB access as fallback
              throw new Error('API reported failure, using direct DB access');
            } else {
              console.log('Order created successfully with ID:', orderResult.orderId);
              orderId = orderResult.orderId;
              orderCreated = true;
            }
          }
        } catch (apiError) {
          console.error('Error with API order creation:', apiError);
          
          // Fallback to direct database insertion if API fails
          console.log('Attempting direct database insertion as fallback...');
          
          try {
            // Set the auth session if we have a token
            if (userSession?.accessToken) {
              await supabase.auth.setSession({
                access_token: userSession.accessToken,
                refresh_token: '',
              });
              console.log('Successfully set auth session for direct DB access');
            }
            
            // Insert the order directly using the same order number
            const { data: orderData, error: orderError } = await supabase
              .from('orders')
              .insert({
                userId: userId,
                orderNumber: orderNumber, // Use the same order number
                total: (session.amount_total || 0) / 100,
                status: 'completed'
              })
              .select()
              .single();
            
            console.log('Direct DB order insertion result:', orderData ? 'Success' : 'Failed', orderError || '');
            
            if (orderError || !orderData) {
              console.error('Error creating order directly:', orderError);
            } else {
              // Get the inserted order ID - check both possible field names
              orderId = orderData.orderId || orderData.id;
              
              if (orderId) {
                console.log('Order created directly with ID:', orderId);
                orderCreated = true;
                
                // Insert order items
                const formattedItems = cartItems.map(item => ({
                  orderId: orderId,
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price
                }));
                
                const { error: itemsError } = await supabase
                  .from('order_items')
                  .insert(formattedItems);
                
                if (itemsError) {
                  console.error('Error creating order items directly:', itemsError);
                } else {
                  console.log('Order items created successfully');
                }
              }
            }
          } catch (dbError) {
            console.error('Error with direct database insertion:', dbError);
          }
        }
      }
      
      return (
        <div className="max-w-3xl mx-auto p-8">
          {/* Clear the cart via client component */}
          <ClearCart />
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-center mb-6">
              <svg 
                className="w-16 h-16 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-center mb-4 text-black">Payment Successful!</h1>
            <p className="text-center mb-6 text-black">
              Thank you for your purchase. {orderCreated ? 'Your order has been placed successfully.' : 'Your payment was processed successfully.'}
            </p>
            {orderCreated && orderNumber && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Order Details:</p>
                  <p className="text-lg font-semibold text-gray-800">
                    Order Number: <span className="font-mono text-blue-600">#{orderNumber?.substring(0, 8)}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Keep this order number for your records
                  </p>
                </div>
              </div>
            )}
            <div className="text-center">
              <a 
                href="/" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded mr-4"
              >
                Continue Shopping
              </a>
              <a 
                href="/account/orders" 
                className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded"
              >
                View Orders
              </a>
            </div>
          </div>
        </div>
      )
    }

    return redirect('/cart')
  } catch (error) {
    console.error('Error retrieving checkout session:', error)
    return redirect('/cart?error=payment_verification_failed')
  }
}