const Stripe = require('stripe');
export const config = { runtime: 'nodejs' };

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const customerId = extractParam(req.url, 'id');
    if (!customerId) return res.status(400).json({ error: 'Customer id is required' });

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.retrieve(customerId);
    return res.status(200).json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    return res.status(500).json({ error: 'Failed to get customer' });
  }
}

function extractParam(url, key) {
  try {
    const u = new URL(url, 'http://localhost');
    const pathname = u.pathname || '';
    const parts = pathname.split('/');
    return parts[parts.length - 1] || null;
  } catch {
    return null;
  }
}


