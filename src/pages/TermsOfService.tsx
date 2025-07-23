import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TermsOfService: React.FC = () => {
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left">利用規約 / Terms of Service</h1>
          
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="text-gray-700 mb-4">
                本利用規約（以下「本規約」）は、WaSanDo 和讃堂（以下「当社」）が提供するNavikkoサービス（以下「本サービス」）の利用条件を定めるものです。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第2条（利用登録）</h2>
              <p className="text-gray-700 mb-4">
                本サービスの利用を希望する方は、本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
              </p>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第3条（禁止事項）</h2>
              <p className="text-gray-700 mb-4">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません：</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>当社、本サービスの他の利用者、または第三者に迷惑をかける行為</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">第4条（お問い合わせ）</h2>
              <p className="text-gray-700 mb-4">本規約に関するお問い合わせは下記までご連絡ください：</p>
              <p className="text-gray-700 mb-6">
                電子メール: info@wasando.com<br/>
                WhatsApp: <a href="https://wa.me/817037822505" className="text-navikko-primary hover:underline">お問い合わせ</a>
              </p>
            </div>

            {/* English Content */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Navikko, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Use the service for any unlawful purpose</li>
                <li>Interfere with or disrupt the service</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfService;
