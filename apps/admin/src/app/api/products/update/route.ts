import { NextResponse } from 'next/server';
import supabase from '../../../configDB/supabaseConnect';

export async function PUT(request: Request) {
  try {
    const productData = await request.json();
    const { productId, ...updateData } = productData;
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!updateData.name || updateData.price <= 0) {
      return NextResponse.json(
        { error: 'Product name and valid price are required' },
        { status: 400 }
      );
    }
    
    // Update the product in the database
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('productId', productId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating product:', error);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, product: data });
  } catch (error) {
    console.error('Error in update route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 