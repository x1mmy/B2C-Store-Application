import { NextResponse } from 'next/server'
import { stripe } from '../../configDB/stripe'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') || ''

    let event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      )
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Here you would typically:
        // 1. Fulfill the order (update database, send emails, etc.)
        // 2. Update inventory
        // 3. Create order records in your database
        console.log('Payment successful for session:', session.id)
        
        // Add your business logic for successful payments here
        
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook error: ${err.message}` },
      { status: 500 }
    )
  }
} 