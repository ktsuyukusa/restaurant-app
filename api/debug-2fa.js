const { createClient } = require('@supabase/supabase-js');
const speakeasy = require('speakeasy');

module.exports = async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const email = (req.query && req.query.email) || (req.body && req.body.email);

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Server env not set', details: { supabaseUrl: !!supabaseUrl, serviceKey: !!supabaseServiceKey } });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const projectRef = (() => {
      try { return new URL(supabaseUrl).host.split('.')[0]; } catch { return null; }
    })();

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found', projectRef });
    }

    const { data: admin, error: adminError } = await supabase
      .from('admin_access')
      .select('two_factor_secret, allowed_ips, two_factor_enabled')
      .eq('user_id', user.id)
      .single();

    const now = Math.floor(Date.now() / 1000);
    const step = 30;
    const remaining = step - (now % step);

    if (adminError || !admin) {
      return res.status(200).json({
        projectRef,
        hasAdminAccess: false,
        serverTime: new Date(now * 1000).toISOString(),
        secondsRemaining: remaining
      });
    }

    // Do not return the secret; only reveal minimal diagnostics
    const secretPrefix = admin.two_factor_secret ? String(admin.two_factor_secret).slice(0, 4) : null;
    const clientIP = ((req.headers['x-forwarded-for'] || '').toString().split(',')[0] || req.socket?.remoteAddress || '').trim();
    const ipAllowed = Array.isArray(admin.allowed_ips) && admin.allowed_ips.length > 0
      ? admin.allowed_ips.map(String).includes(clientIP)
      : true; // if empty, treat as allowed

    return res.status(200).json({
      projectRef,
      hasAdminAccess: true,
      hasSecret: !!admin.two_factor_secret,
      secretPrefix,
      twoFactorEnabled: !!admin.two_factor_enabled,
      ipAllowed,
      clientIP,
      serverTime: new Date(now * 1000).toISOString(),
      secondsRemaining: remaining,
      windowUsedByVerify: 5
    });
  } catch (e) {
    return res.status(500).json({ error: 'Internal error' });
  }
};


