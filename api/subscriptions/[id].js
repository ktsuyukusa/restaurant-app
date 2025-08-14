const Stripe = require('stripe');
export const config = { runtime: 'nodejs' };

module.exports = async function handler(req, res) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not configured');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const subscriptionId = extractParam(req.url, 'id');
    if (!subscriptionId) return res.status(400).json({ error: 'Subscription id is required' });

    if (req.method === 'GET') {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      return res.status(200).json(sub);
    }

    if (req.method === 'PUT') {
      const { priceId } = await readJsonBody(req);
      if (!priceId) return res.status(400).json({ error: 'priceId is required' });
      const sub = await stripe.subscriptions.update(subscriptionId, {
        items: [{ price: priceId }],
        proration_behavior: 'create_prorations',
      });
      return res.status(200).json(sub);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Subscription endpoint error:', error);
    return res.status(500).json({ error: 'Subscription operation failed' });
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


