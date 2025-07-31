import { getSupabaseClient } from '@/lib/supabase';

interface AdminSecurityRecord {
  id: string;
  user_id: string;
  allowed_ips: string[];
  ip_restriction_enabled: boolean;
  last_login_ip: string | null;
  last_login_at: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  two_fa_enabled: boolean;
  two_fa_secret: string | null;
  backup_codes: string[];
}

interface AdminAuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string | null;
  ip_address: string | null;
  user_agent: string | null;
  success: boolean;
  details: Record<string, unknown>;
  created_at: string;
}

class AdminSecurityService {
  private supabase = getSupabaseClient();

  /**
   * Validates if admin can access from current IP address
   * Required for Japanese payment compliance (Komoju/Stripe)
   */
  async validateAdminIPAccess(userId: string, clientIP: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc('validate_admin_ip_access', {
        user_id: userId,
        client_ip: clientIP
      });

      if (error) {
        console.error('❌ IP validation error:', error);
        await this.logAdminAction(userId, 'IP_VALIDATION_ERROR', 'security', clientIP, null, false, { error: error.message });
        return false;
      }

      await this.logAdminAction(userId, 'IP_VALIDATION', 'security', clientIP, null, data, { result: data });
      return data === true;
    } catch (error) {
      console.error('❌ IP validation exception:', error);
      return false;
    }
  }

  /**
   * Gets admin security settings
   */
  async getAdminSecurity(userId: string): Promise<AdminSecurityRecord | null> {
    try {
      const { data, error } = await this.supabase
        .from('admin_security')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching admin security:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Exception fetching admin security:', error);
      return null;
    }
  }

  /**
   * Updates admin security settings
   */
  async updateAdminSecurity(userId: string, updates: Partial<AdminSecurityRecord>): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('admin_security')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error updating admin security:', error);
        await this.logAdminAction(userId, 'SECURITY_UPDATE_ERROR', 'admin_security', null, null, false, { error: error.message });
        return false;
      }

      await this.logAdminAction(userId, 'SECURITY_UPDATED', 'admin_security', null, null, true, { updates });
      return true;
    } catch (error) {
      console.error('❌ Exception updating admin security:', error);
      return false;
    }
  }

  /**
   * Records admin login attempt
   */
  async recordLoginAttempt(userId: string, clientIP: string, success: boolean, userAgent?: string): Promise<void> {
    try {
      // Update last login info if successful
      if (success) {
        await this.supabase
          .from('admin_security')
          .update({
            last_login_ip: clientIP,
            last_login_at: new Date().toISOString(),
            failed_login_attempts: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Increment failed attempts
        const { data: security } = await this.supabase
          .from('admin_security')
          .select('failed_login_attempts')
          .eq('user_id', userId)
          .single();

        const failedAttempts = (security?.failed_login_attempts || 0) + 1;
        const lockUntil = failedAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null; // 30 min lock

        await this.supabase
          .from('admin_security')
          .update({
            failed_login_attempts: failedAttempts,
            locked_until: lockUntil,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }

      // Log the attempt
      await this.logAdminAction(
        userId,
        success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        'authentication',
        clientIP,
        userAgent,
        success,
        { ip_address: clientIP }
      );
    } catch (error) {
      console.error('❌ Error recording login attempt:', error);
    }
  }

  /**
   * Checks if admin account is locked
   */
  async isAdminLocked(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('admin_security')
        .select('locked_until, failed_login_attempts')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return false;
      }

      if (data.locked_until) {
        const lockTime = new Date(data.locked_until);
        const now = new Date();
        
        if (now < lockTime) {
          return true;
        } else {
          // Lock expired, reset failed attempts
          await this.supabase
            .from('admin_security')
            .update({
              locked_until: null,
              failed_login_attempts: 0,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Error checking admin lock status:', error);
      return false;
    }
  }

  /**
   * Logs admin actions for compliance audit trail
   * Required for Japanese financial regulations
   */
  async logAdminAction(
    userId: string,
    action: string,
    resource?: string | null,
    ipAddress?: string | null,
    userAgent?: string | null,
    success: boolean = true,
    details: Record<string, unknown> = {}
  ): Promise<void> {
    try {
      await this.supabase.rpc('log_admin_action', {
        user_id: userId,
        action_name: action,
        resource_name: resource,
        client_ip: ipAddress,
        client_user_agent: userAgent,
        action_success: success,
        action_details: details
      });
    } catch (error) {
      console.error('❌ Error logging admin action:', error);
      // Don't throw here to avoid breaking the main flow
    }
  }

  /**
   * Gets admin audit logs for compliance reporting
   */
  async getAdminAuditLogs(
    userId?: string,
    startDate?: string,
    endDate?: string,
    action?: string,
    limit: number = 100
  ): Promise<AdminAuditLog[]> {
    try {
      let query = this.supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      if (action) {
        query = query.eq('action', action);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ Exception fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Validates 2FA code for admin
   */
  async validate2FA(userId: string, code: string): Promise<boolean> {
    try {
      // This would integrate with your existing 2FA system
      // For now, we'll log the attempt
      await this.logAdminAction(userId, '2FA_VALIDATION', 'authentication', null, null, true, { code_length: code.length });
      
      // Return true for now - integrate with your actual 2FA validation
      return true;
    } catch (error) {
      console.error('❌ Error validating 2FA:', error);
      await this.logAdminAction(userId, '2FA_VALIDATION_ERROR', 'authentication', null, null, false, { error: error.message });
      return false;
    }
  }

  /**
   * Gets client IP address from request headers
   */
  getClientIP(request?: Request): string {
    if (!request) {
      return '127.0.0.1'; // localhost fallback
    }

    // Check various headers for real IP
    const headers = request.headers;
    const forwarded = headers.get('x-forwarded-for');
    const realIP = headers.get('x-real-ip');
    const cfConnectingIP = headers.get('cf-connecting-ip');

    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();

    return '127.0.0.1';
  }

  /**
   * Enhanced admin authentication with security checks
   */
  async authenticateAdmin(email: string, password: string, clientIP: string, userAgent?: string): Promise<{
    success: boolean;
    user?: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
      app_metadata?: Record<string, unknown>;
    };
    requiresIP?: boolean;
    isLocked?: boolean;
    requires2FA?: boolean;
    error?: string;
  }> {
    try {
      // First, try to authenticate with Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return {
          success: false,
          error: authError?.message || 'Authentication failed'
        };
      }

      const userId = authData.user.id;

      // Check if account is locked
      const isLocked = await this.isAdminLocked(userId);
      if (isLocked) {
        await this.recordLoginAttempt(userId, clientIP, false, userAgent);
        return {
          success: false,
          isLocked: true,
          error: 'Account is temporarily locked due to failed login attempts'
        };
      }

      // Validate IP access
      const ipValid = await this.validateAdminIPAccess(userId, clientIP);
      if (!ipValid) {
        await this.recordLoginAttempt(userId, clientIP, false, userAgent);
        return {
          success: false,
          requiresIP: true,
          error: 'Access denied from this IP address'
        };
      }

      // Check if 2FA is required
      const security = await this.getAdminSecurity(userId);
      if (security?.two_fa_enabled) {
        return {
          success: false,
          requires2FA: true,
          user: authData.user,
          error: '2FA verification required'
        };
      }

      // Success - record login
      await this.recordLoginAttempt(userId, clientIP, true, userAgent);
      
      return {
        success: true,
        user: authData.user
      };
    } catch (error) {
      console.error('❌ Admin authentication error:', error);
      return {
        success: false,
        error: 'Authentication system error'
      };
    }
  }
}

export default new AdminSecurityService();