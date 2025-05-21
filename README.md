# B2C Store Application

A full-stack B2C (Business-to-Consumer) e-commerce application with admin and web frontends.

## Project Structure

This monorepo contains:

- `apps/admin` - Admin dashboard for managing products, orders, and customers
- `apps/web` - Customer-facing web application
- `packages/` - Shared libraries and utilities

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

## Technologies

- Next.js
- TypeScript
- Turborepo
- PNPM Workspaces


# Stripe Checkout Integration

This directory contains the code for integrating Stripe Checkout into our B2C store application.

## Files

- `CheckoutButton.tsx`: Client-side component to handle checkout initiation
- `checkout/success/page.tsx`: Success page displayed after successful payment
- `../api/checkout_session/route.ts`: API endpoint to create Stripe checkout sessions
- `../api/webhook/route.ts`: Webhook handler for Stripe events

## Setup

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add the following environment variables to your `.env` file:

```
# Stripe API keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Webhook Setup

For local development, you can use the Stripe CLI to forward webhook events:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run: `stripe login`
3. Run: `stripe listen --forward-to localhost:3000/api/webhook`
4. Copy the webhook signing secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Usage

The `CheckoutButton` component can be added to the cart page to initiate checkout. When clicked, it will:

1. Collect the cart items
2. Make a request to the `/api/checkout_session` endpoint
3. Redirect the user to the Stripe Checkout page
4. After payment, Stripe will redirect to the success page

## Testing

Use Stripe's test cards for testing:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

More test cards: [Stripe Test Cards](https://stripe.com/docs/testing#cards) 


