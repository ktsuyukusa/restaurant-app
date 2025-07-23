// Type definition for auth-specific translations
export interface AuthTranslations {
  [key: string]: string;
}

export const authTranslations: Record<string, AuthTranslations> = {
  en: {
    'auth.welcome': 'Welcome to Navikko',
    'auth.login_title': 'Login to Your Account',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.enter_email': 'Enter your email',
    'auth.enter_password': 'Enter your password',
    'auth.logging_in': 'Logging in...',
    'auth.or_login_with': 'Or login with',
    'auth.create_account': 'Create Your Account',
    'auth.account_type': 'Account Type',
    'auth.admin_code': 'Admin Code',
    'auth.admin': 'Admin',
    'auth.customer': 'Customer',
    'auth.restaurant_owner': 'Restaurant Owner',
    'auth.signin_with_google': 'Sign in with Google',
    'auth.or': 'or',
    'auth.full_name': 'Full Name',
    'auth.phone_number': 'Phone Number',
    'auth.create_password': 'Create a password',
    'auth.confirm_password_placeholder': 'Confirm your password',
    'auth.enter_full_name': 'Enter your full name',
    'auth.enter_phone': 'Enter your phone number',
    'auth.signing_up': 'Signing up...',
    'auth.i_am_a': 'I am a:',
    'auth.customer_desc': 'Browse restaurants and place orders',
    'auth.restaurant_owner_desc': 'Manage your restaurant and orders'
  },
  ja: {
    'auth.welcome': 'Navikkoへようこそ',
    'auth.login_title': 'ログイン',
    'auth.login': 'ログイン',
    'auth.signup': 'サインアップ',
    'auth.email': 'メールアドレス',
    'auth.password': 'パスワード',
    'auth.confirm_password': 'パスワード確認',
    'auth.enter_email': 'メールアドレスを入力',
    'auth.enter_password': 'パスワードを入力',
    'auth.logging_in': 'ログイン中...',
    'auth.or_login_with': 'または',
    'auth.create_account': 'アカウント作成',
    'auth.account_type': 'アカウントタイプ',
    'auth.admin_code': '管理者コード',
    'auth.admin': '管理者',
    'auth.customer': 'お客様',
    'auth.restaurant_owner': 'レストランオーナー'
  }
};
