const speakeasy = require('speakeasy');
const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Server is not configured for 2FA verification' });
    }

    const { email, code } = req.body || {};
    if (!email || !code || String(code).length !== 6) {
      return res.status(400).json({ error: 'Email and 6-digit code are required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve client IP (consider X-Forwarded-For first)
    const xff = req.headers['x-forwarded-for'];
    const clientIP = (xff ? String(xff).split(',')[0].trim() : (req.socket && req.socket.remoteAddress)) || '';

    // Look up user and admin access
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin_access')
      .select('two_factor_secret, two_factor_enabled, allowed_ips')
      .eq('user_id', user.id)
      .single();

    if (adminError || !admin || !admin.two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up for this user' });
    }

    // Enforce IP allowlist if configured
    if (Array.isArray(admin.allowed_ips) && admin.allowed_ips.length > 0) {
      const allowed = admin.allowed_ips.map(String);
      if (!allowed.includes(clientIP)) {
        return res.status(403).json({ error: 'Access denied from this IP address' });
      }
    }

    // Verify TOTP using speakeasy (battle-tested)
    const isValid = speakeasy.totp.verify({
      secret: admin.two_factor_secret,
      encoding: 'base32',
      token: String(code),
      digits: 6,
      step: 30,
      algorithm: 'sha1',
      window: 5
    });

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid 2FA code', success: false });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('verify-2fa error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


