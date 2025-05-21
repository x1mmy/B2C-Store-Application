import { requireAuth } from '../../utils/auth';
import Link from 'next/link';
import { useCart } from '../../context/cartContext';

export default async function IndexPage({ searchParams }: { searchParams: { canceled: string } }) {
    const { canceled } = await searchParams
  
    if (canceled) {
      console.log(
        'Order canceled -- continue to shop around and checkout when you’re ready.'
      )
    }
    return (
      <form action="/api/checkout_sessions" method="POST">
        <section>
          <button type="submit" role="link">
            Checkout
          </button>
        </section>
      </form>
    )
  }