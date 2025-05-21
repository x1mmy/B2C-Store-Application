import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../../configDB/supabaseConnect';
import { getSession } from '../../utils/auth';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderRequest {
  userId: string;
  total: number;
  items: OrderItem[];
  status: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('Order API called - checking authentication...');
    
    // Get authentication cookies from the request
    const sessionCookie = req.cookies.get('sb-auth-state')?.value;
    const accessTokenCookie = req.cookies.get('sb-access-token')?.value;
    
    console.log('Auth cookies present:', {
      sessionCookie: !!sessionCookie,
      accessTokenCookie: !!accessTokenCookie
    });
    
    // Verify user is authenticated
    const session = await getSession();
    console.log('Session retrieved:', session ? 'Session found' : 'No session');
    
    if (!session || !session.user) {
      console.error('No authenticated user found for order creation');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Set the auth session to ensure RLS works
    if (accessTokenCookie) {
      await supabase.auth.setSession({
        access_token: accessTokenCookie,
        refresh_token: req.cookies.get('sb-refresh-token')?.value || '',
      });
    }
    
    console.log('User authenticated:', session.user.id);
    
    // Parse the request body
    const orderData: OrderRequest = await req.json();
    console.log('Order data received:', JSON.stringify({
      userId: orderData.userId,
      total: orderData.total,
      itemsCount: orderData.items.length,
      status: orderData.status
    }));
    
    // Ensure user can only create orders for themselves
    if (orderData.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot create orders for other users' },
        { status: 403 }
      );
    }
    
    // Generate a unique order number
    const orderNumber = uuidv4();
    
    // Insert the order into the orders table
    const { data: orderData2, error: orderError } = await supabase
      .from('orders')
      .insert({
        userId: orderData.userId,
        orderNumber: orderNumber,
        total: orderData.total,
        status: orderData.status
      })
      .select()
      .single();
    
    console.log('Order creation response:', JSON.stringify(orderData2));
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: orderError.message },
        { status: 500 }
      );
    }
    
    // Check if we have a valid order response
    if (!orderData2) {
      console.error('No order data returned after insertion');
      return NextResponse.json(
        { success: false, error: 'Failed to create order - no data returned' },
        { status: 500 }
      );
    }
    
    // Try to get orderId from the response, checking for both "orderId" and "id" fields
    const orderId = orderData2.orderId || orderData2.id;
    
    if (!orderId) {
      console.error('No orderId found in response:', orderData2);
      return NextResponse.json(
        { success: false, error: 'Failed to get order ID after creation' },
        { status: 500 }
      );
    }
    
    console.log('Using orderId for items:', orderId);
    
    // Insert order items into the order_items table
    const orderItems = orderData.items.map(item => ({
      orderId: orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json(
        { success: false, error: itemsError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      orderId: orderId
    });
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
} 