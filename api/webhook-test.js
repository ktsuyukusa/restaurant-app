// Simple webhook test endpoint for development
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Webhook test received:', {
    body: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  res.status(200).json({ 
    received: true, 
    message: 'Webhook test endpoint working',
    timestamp: new Date().toISOString()
  });
} 