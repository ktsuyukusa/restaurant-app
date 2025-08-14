const Stripe = require('stripe');
export const config = { runtime: 'nodejs' };

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  try {
    const subscriptionId = extractParam(req.url, 'id');
    if (!subscriptionId) return res.status(400).json({ error: 'Subscription id is required' });

    const { cancelAtPeriodEnd = true } = await readJsonBody(req);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sub = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !!cancelAtPeriodEnd,
    });
    return res.status(200).json(sub);
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}

function extractParam(url, key) {
  try {
    const u = new URL(url, 'http://localhost');
    const pathname = u.pathname || '';
    const parts = pathname.split('/');
    const idx = parts.findIndex(p => p === 'subscriptions');
    return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
  } catch {
    return null;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}


