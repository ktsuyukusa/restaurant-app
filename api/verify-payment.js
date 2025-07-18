import Stripe from 'stripe';

export default async function handler(req, res) {
  // Check if Stripe is configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { session_id } = req.body;
    
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.status(200).json({ verified: session.payment_status === 'paid' });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
} 