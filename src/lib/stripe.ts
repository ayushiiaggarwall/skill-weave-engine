import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!stripePublishableKey) {
  console.warn('⚠️ Stripe publishable key not found')
}

export const stripe = loadStripe(stripePublishableKey || 'pk_test_placeholder')

export const redirectToCheckout = async (sessionId: string) => {
  const stripeInstance = await stripe
  if (!stripeInstance) {
    throw new Error('Stripe not loaded')
  }
  
  const { error } = await stripeInstance.redirectToCheckout({
    sessionId
  })
  
  if (error) {
    throw error
  }
}
