import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center text-navikko-primary hover:text-navikko-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る / Back to Home
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left">プライバシーポリシー / Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-left">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                事業者名: WaSanDo 和讃堂<br/>
                所在地: 〒386-0005 長野県上田市古里1499-28<br/>
                Address: 1499-28 Kosato, Ueda, Nagano, 386-0005 Japan<br/>
                電子メール: info@wasando.com<br/>
                WhatsApp: <a href="https://wa.me/817037822505" className="text-navikko-primary hover:underline">お問い合わせ</a><br/>
                最終更新: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Japanese Content */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 収集する個人情報</h2>
              <p className="text-gray-700 mb-4">
                WaSanDo 和讃堂（以下「当社」）は、Navikkoサービスの提供にあたり、以下の個人情報を収集いたします：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>氏名、電子メールアドレス、電話番号</li>
                <li>位置情報（お客様の同意を得た場合）</li>
                <li>レストランでのご注文・予約履歴</li>
                <li>決済情報</li>
                <li>サービス利用に関する履歴</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 個人情報の利用目的</h2>
              <p className="text-gray-700 mb-4">収集した個人情報は以下の目的で利用いたします：</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>サービスの提供・運営</li>
                <li>レストランでのご注文・予約の処理</li>
                <li>お客様への重要なお知らせの送信</li>
                <li>サービス品質の向上</li>
                <li>法的義務の履行</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 個人情報の第三者提供</h2>
              <p className="text-gray-700 mb-4">
                当社は、法令に基づく場合またはお客様の同意がある場合を除き、収集した個人情報を第三者に提供いたしません。
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. お問い合わせ</h2>
              <p className="text-gray-700 mb-4">
                個人情報の取り扱いに関するお問い合わせは下記までご連絡ください：
              </p>
              <p className="text-gray-700 mb-6">
                電子メール: info@wasando.com<br/>
                WhatsApp: <a href="https://wa.me/817037822505" className="text-navikko-primary hover:underline">お問い合わせ</a>
              </p>
            </div>

            {/* English Content */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                WaSanDo 和讃堂 ("we," "our," or "us") collects the following personal information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Name, email address, phone number</li>
                <li>Location information (with your consent)</li>
                <li>Restaurant order and reservation history</li>
                <li>Payment information</li>
                <li>Service usage history</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use collected information for:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Providing and operating our services</li>
                <li>Processing restaurant orders and reservations</li>
                <li>Sending important notifications</li>
                <li>Improving service quality</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-700 mb-4">
                We do not share personal information with third parties except as required by law or with your consent.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Privacy Policy, please contact us:
              </p>
              <p className="text-gray-700">
                Email: info@wasando.com<br/>
                WhatsApp: <a href="https://wa.me/817037822505" className="text-navikko-primary hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
