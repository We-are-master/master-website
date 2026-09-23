import { useEffect, useMemo } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

/**
 * Checkout transparente: o formulário de pagamento da Stripe dentro da
 * página. A chave publicável vem do servidor (/api/b2c/config), que só a
 * entrega quando é do mesmo modo da secreta; assim o par nunca fica trocado.
 */
const stripes = new Map()
function getStripe(publishableKey) {
  if (!stripes.has(publishableKey)) stripes.set(publishableKey, loadStripe(publishableKey))
  return stripes.get(publishableKey)
}

const APPEARANCE = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#020040',
    colorText: '#0a0a1f',
    colorTextSecondary: '#6b6b85',
    colorDanger: '#b3261e',
    colorBackground: '#ffffff',
    fontFamily: 'Inter, Geist, system-ui, -apple-system, Segoe UI, sans-serif',
    fontSizeBase: '16px',
    borderRadius: '14px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { border: '1px solid #cdcdd8', boxShadow: 'none', padding: '14px' },
    '.Input:focus': { borderColor: '#020040', boxShadow: '0 0 0 3px rgba(2, 0, 64, 0.12)' },
    '.Label': { fontWeight: '600', color: '#0a0a1f' },
    '.Tab': { border: '1px solid #cdcdd8', boxShadow: 'none' },
    '.Tab--selected': { borderColor: '#020040', boxShadow: '0 0 0 1px #020040' },
  },
}

/** Entrega ao pai: `validate` (antes de pedir a cobrança) e `confirm` (paga). */
function Bridge({ register }) {
  const stripe = useStripe()
  const elements = useElements()
  useEffect(() => {
    if (!stripe || !elements) return undefined
    register({
      validate: async () => {
        const { error } = await elements.submit()
        return error ? error.message : null
      },
      confirm: async ({ clientSecret, billing, receiptEmail }) => {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          clientSecret,
          // Cartão com 3D Secure resolve aqui mesmo; Klarna e afins voltam
          // para a confirmação com ?payment_intent=…
          redirect: 'if_required',
          confirmParams: {
            return_url: `${window.location.origin}/book/confirmed`,
            receipt_email: receiptEmail,
            payment_method_data: { billing_details: billing },
          },
        })
        if (error) return { error: error.message }
        if (paymentIntent.status !== 'succeeded' && paymentIntent.status !== 'processing') {
          return { error: 'The payment was not completed. Check the card details and try again.' }
        }
        return { paymentIntentId: paymentIntent.id, status: paymentIntent.status }
      },
    })
    return () => register(null)
  }, [stripe, elements, register])

  return (
    <PaymentElement
      options={{
        layout: { type: 'tabs', defaultCollapsed: false },
        business: { name: 'Fixfy' },
        wallets: { applePay: 'auto', googlePay: 'auto' },
        fields: {
          billingDetails: {
            name: 'never',
            email: 'never',
            phone: 'never',
            address: { country: 'never', postalCode: 'never', line1: 'never', line2: 'never', city: 'never', state: 'never' },
          },
        },
      }}
    />
  )
}

export default function EmbeddedPayment({ publishableKey, amount, register }) {
  const stripePromise = useMemo(() => getStripe(publishableKey), [publishableKey])
  return (
    <Elements
      // Valor novo remonta o formulário: o Elements no modo adiado precisa do total certo.
      key={amount}
      stripe={stripePromise}
      options={{
        mode: 'payment',
        amount: Math.round(amount * 100),
        currency: 'gbp',
        // Sem o Link da Stripe: o bloco "Save my information for faster checkout"
        // (cadastro opcional, com e-mail e celular de novo) só alongava o
        // pagamento. Cartão, Apple Pay, Google Pay e Klarna continuam.
        excludedPaymentMethodTypes: ['link'],
        appearance: APPEARANCE,
        fonts: [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }],
      }}
    >
      <Bridge register={register} />
    </Elements>
  )
}
