import supabase from '../configDB/supabaseConnect';
import { v4 as uuidv4 } from 'uuid';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Order {
  userId: string;
  total: number;
  items: OrderItem[];
  status: string;
}

/**
 * Creates a new order in Supabase with associated order items
 */
export async function createOrder(order: Order): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    // Generate a unique order number
    const orderNumber = uuidv4();
    
    // Insert the order into the orders table
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        userId: order.userId,
        orderNumber: orderNumber,
        total: order.total,
        status: order.status
      })
      .select()
      .single();
    
    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return { success: false, error: orderError?.message || 'Failed to create order' };
    }
    
    // Get the orderId from the response - check both fields
    const orderId = orderData.orderId || orderData.id;
    
    if (!orderId) {
      console.error('No orderId found in response:', orderData);
      return { success: false, error: 'Failed to get order ID after creation' };
    }
    
    // Insert order items into the order_items table
    const orderItems = order.items.map(item => ({
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
      // If order items insertion fails, we should ideally roll back the order creation
      // but for simplicity, we'll just return the error
      return { success: false, error: itemsError.message };
    }
    
    return { success: true, orderId: orderId };
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
} 