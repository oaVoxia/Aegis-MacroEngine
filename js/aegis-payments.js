/**
 * Aegis Macro - Dual Payment Gateway Rails
 * Stripe Checkout (Fiat) + Sphere Pay (USDC/USDT)
 * Note: Real session creation requires a backend endpoint.
 * This client module prepares the payloads and handles redirects / returns.
 */
class PaymentProcessor {
  constructor(stripePublicKey = '', spherePayApiKey = '') {
    this.stripeKey = stripePublicKey;
    this.sphereApiKey = spherePayApiKey;
  }

  async initiateStripeCheckout(tier, duration) {
    // In production this POSTs to your backend /api/create-stripe-session
    // which creates a Stripe Checkout Session and returns { url }
    const response = await fetch('/api/create-stripe-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, duration, success_url: window.location.href, cancel_url: window.location.href })
    });
    if (!response.ok) throw new Error('Stripe session creation failed');
    const session = await response.json();
    window.location.href = session.url;
  }

  async initiateSphereCheckout(tier, duration, walletAddress) {
    const response = await fetch('/api/create-sphere-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.sphereApiKey}`
      },
      body: JSON.stringify({ tier, duration, walletAddress, asset: 'USDC' })
    });
    if (!response.ok) throw new Error('Sphere payment creation failed');
    const paymentData = await response.json();
    return paymentData.paymentUrl;
  }
}

// Demo helper: simulate successful payment and return a pre-signed license
async function simulatePaymentSuccess(tier = 'Desk', duration = 365) {
  // In production the backend would return a freshly signed JWT after payment confirmation
  const demoToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vLXVzZXJAYWVnaXMubWFjcm8iLCJ0aWVyIjoiRGVzayIsImV4cGlyZXNfYXQiOjE4MjM0NTQ0NzgsImlhdCI6MTc5MTkxODQ3OH0.YhUFaB51J8ucEM41afsn0hYTbgsIwGWiD2pPJZq51260MKCZUd7p5PqD7D8RPrhKdrNJ2C6ut2t2s-c-iyRYAg';
  return { token: demoToken, tier };
}

window.PaymentProcessor = PaymentProcessor;
window.simulatePaymentSuccess = simulatePaymentSuccess;
