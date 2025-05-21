'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Use the same CartItem type as in cartContext
interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageURL: string;
  quantity: number;
}

interface CheckoutButtonProps {
  items: CartItem[]
  disabled?: boolean
}

export default function CheckoutButton({ items, disabled = false }: CheckoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      
      // Transform cart items to the format expected by our API
    //    stripe price_data
      const checkoutItems = items.map(item => ({
        id: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.imageURL
      }))
      
      const response = await fetch('/api/checkout_session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: checkoutItems }),
      })
      
      const data = await response.json()
      
      if (data.error) {
        console.error('Error:', data.error)
        setLoading(false)
        return
      }
      
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCheckout}
      disabled={disabled || loading || items.length === 0}
      className="w-full block text-center bg-black text-white font-bold py-2 px-4 rounded mt-6 hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processing...' : 'Proceed to Checkout'}
    </button>
  )
} 