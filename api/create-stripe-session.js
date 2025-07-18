const Stripe = require('stripe');

module.exports = async function handler(req, res) {
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
    const { order_id, amount, currency, customer_email, customer_name, items, restaurant_id } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'apple_pay', 'google_pay'],
      line_items: items.map(item => ({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${req.headers.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/order/cancel`,
      customer_email: customer_email,
      metadata: {
        order_id: order_id,
        restaurant_id: restaurant_id,
        customer_name: customer_name,
      },
    });

    res.status(200).json({
      sessionId: session.id,
      url: session.url,
      amount: amount,
      currency: currency,
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: error.message });
  }
} 