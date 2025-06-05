import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../../configDB/supabaseConnect';
import { getSession } from '../../utils/auth';
import { cookies } from 'next/headers';

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
  orderNumber?: string; // Optional order number from client
}

export async function GET(req: NextRequest) {
  try {
    console.log('Orders GET API called - checking authentication...');
    
    // Get authentication cookies directly from the request
    const getSessionCookie = req.cookies.get('sb-auth-state')?.value;
    const getAccessTokenCookie = req.cookies.get('sb-access-token')?.value;
    const getRefreshTokenCookie = req.cookies.get('sb-refresh-token')?.value || '';
    
    // Verify user is authenticated - call getSession only once
    const session = await getSession();
    
    if (!session || !session.user) {
      console.error('No authenticated user found for order retrieval');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    console.log('Fetching orders for user:', userId);
    
    // Set the auth session to ensure RLS works - only if we have tokens
    if (getAccessTokenCookie && getRefreshTokenCookie) {
      try {
        await supabase.auth.setSession({
          access_token: getAccessTokenCookie,
          refresh_token: getRefreshTokenCookie,
        });
      } catch (setSessionError) {
        console.log('Warning: Could not set auth session, but proceeding with authenticated user');
      }
    }
    
    // Fetch orders for the user with product details
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          orderItemsId,
          orderId,
          productId,
          quantity,
          price
        )
      `)
      .eq('userId', userId)
      .order('orderId', { ascending: false }); // Order by newest first (UUIDs are roughly chronological)
    
    // If we have orders, fetch product details for all order items
    if (orders && orders.length > 0) {
      for (const order of orders) {
        if (order.order_items && order.order_items.length > 0) {
          const productIds = order.order_items.map((item: any) => item.productId);
          
          const { data: products } = await supabase
            .from('products')
            .select('productId, name')
            .in('productId', productIds);
          
          // Match products to order items
          if (products) {
            order.order_items = order.order_items.map((item: any) => ({
              ...item,
              products: products.find((p: any) => p.productId === item.productId)
            }));
          }
        }
      }
    }
    
    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('Unexpected error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Order API called - checking authentication...');
    
    // Get authentication cookies directly from the request
    const sessionCookie = req.cookies.get('sb-auth-state')?.value;
    const accessTokenCookie = req.cookies.get('sb-access-token')?.value;
    const refreshTokenCookie = req.cookies.get('sb-refresh-token')?.value || '';
    
    console.log('Auth cookies present:', {
      sessionCookie: !!sessionCookie,
      accessTokenCookie: !!accessTokenCookie,
      refreshTokenCookie: !!refreshTokenCookie
    });
    
    // Verify user is authenticated - call getSession only once
    const session = await getSession();
    console.log('Session retrieved:', session ? 'Session found' : 'No session');
    
    if (!session || !session.user) {
      console.error('No authenticated user found for order creation');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in again' },
        { status: 401 }
      );
    }
    
    // Set the auth session to ensure RLS works - only if we have tokens
    if (accessTokenCookie && refreshTokenCookie) {
      try {
        await supabase.auth.setSession({
          access_token: accessTokenCookie,
          refresh_token: refreshTokenCookie,
        });
      } catch (setSessionError) {
        console.log('Warning: Could not set auth session, but proceeding with authenticated user');
      }
    }
    
    console.log('User authenticated:', session.user.id);
    
    // Parse the request body
    const orderData: OrderRequest = await req.json();
    console.log('Order data received:', JSON.stringify({
      userId: orderData.userId,
      total: orderData.total,
      itemsCount: orderData.items.length,
      status: orderData.status,
      orderNumber: orderData.orderNumber ? 'provided' : 'will generate'
    }));
    
    // Ensure user can only create orders for themselves
    if (orderData.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot create orders for other users' },
        { status: 403 }
      );
    }
    
    // Use provided order number or generate a new one
    const orderNumber = orderData.orderNumber || uuidv4();
    
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
      orderId: orderId,
      orderNumber: orderNumber // Return the order number as well
    });
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Unexpected error occurred' },
      { status: 500 }
    );
  }
} 