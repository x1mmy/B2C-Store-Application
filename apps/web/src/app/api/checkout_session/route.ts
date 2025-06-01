import { NextResponse } from 'next/server'
// import { headers } from 'next/headers'

import { stripe } from '../../configDB/stripe'

export async function POST(request: Request) {
  try {
    // Get origin from headers or use default
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    const body = await request.json()
    
    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: body.items.map((item: any) => ({
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            metadata: {
              productId: item.id // Store the Supabase product ID in metadata
            }
          },
          unit_amount: Math.round(item.price * 100), // Round to ensure integer values
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${origin}/cart/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=true`,
    });
    
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'An unknown error occurred' },
      { status: err.statusCode || 500 }
    )
  }
}