import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, secret } = await readJsonBody(req);

    if (!email || !secret) {
      return res.status(400).json({ error: 'Email and secret are required' });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Server env not set' });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update the admin_access table with the new 2FA secret
    const { data, error } = await supabase
      .from('admin_access')
      .update({ two_factor_secret: secret, two_factor_enabled: true, updated_at: new Date().toISOString() })
      .eq('user_id', (await supabase.from('users').select('id').eq('email', email).single()).data?.id);

    if (error) {
      console.error('Error updating 2FA secret:', error);
      return res.status(500).json({ error: 'Failed to update 2FA secret' });
    }

    return res.status(200).json({ success: true, message: '2FA secret updated successfully' });
  } catch (error) {
    console.error('Error in update-2fa-secret:', error);
    return res.status(500).json({ error: 'Internal server error' });
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