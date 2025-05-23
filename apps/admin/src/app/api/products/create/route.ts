import { NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';

export async function POST(request: Request) {
  try {
    const productData = await request.json();
    
    // Validate required fields
    if (!productData.name || !productData.productId || productData.price <= 0) {
      return NextResponse.json(
        { error: 'Product name, ID, and valid price are required' },
        { status: 400 }
      );
    }
    
    // Insert the product into the database
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Error in create route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 