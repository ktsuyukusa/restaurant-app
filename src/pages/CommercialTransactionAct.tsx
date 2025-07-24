import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CommercialTransactionAct: React.FC = () => {
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
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-left">特定商取引法に基づく表記</h1>
          
          <div className="prose prose-lg max-w-none text-left">
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">事業者情報</h2>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700 w-32">販売事業者</td>
                    <td className="py-2 text-gray-900">WaSanDo 和讃堂</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">所在地</td>
                    <td className="py-2 text-gray-900">〒386-0005<br/>長野県上田市古里1499-28</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">連絡先</td>
                    <td className="py-2 text-gray-900">
                      電子メール: info@wasando.com<br/>
                      WhatsApp: <a href="https://wa.me/817037822505" className="text-navikko-primary hover:underline">お問い合わせ</a>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">販売価格</td>
                    <td className="py-2 text-gray-900">各商品ページに記載</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">支払方法</td>
                    <td className="py-2 text-gray-900">クレジットカード決済、電子マネー決済</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-2 font-medium text-gray-700">商品の引渡時期</td>
                    <td className="py-2 text-gray-900">各レストランが指定する時間</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-600">
              <p>最終更新: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialTransactionAct;
