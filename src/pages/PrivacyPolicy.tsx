import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const privacyPolicyContent = {
    en: {
      title: 'Privacy Policy',
      lastUpdated: 'Last Updated: December 2024',
      sections: [
        {
          title: '1. Information We Collect',
          content: `We collect information you provide directly to us, such as when you create an account, place orders, or contact us. This may include:
• Name, email address, phone number
• Restaurant information (for restaurant owners)
• Location data (with your consent)
• Payment information (processed securely)
• Order history and preferences`
        },
        {
          title: '2. How We Use Your Information',
          content: `We use the information we collect to:
• Provide and improve our services
• Process orders and reservations
• Send you updates and notifications
• Personalize your experience
• Ensure security and prevent fraud`
        },
        {
          title: '3. Location Services',
          content: `With your consent, we may access your location to:
• Show nearby restaurants
• Provide location-based recommendations
• Improve our services
You can disable location access at any time in your device settings.`
        },
        {
          title: '4. Data Sharing',
          content: `We do not sell your personal information. We may share your information with:
• Restaurant partners (for order processing)
• Payment processors (for secure transactions)
• Service providers (for app functionality)
• Legal authorities (when required by law)`
        },
        {
          title: '5. Data Security',
          content: `We implement appropriate security measures to protect your personal information, including encryption and secure data storage. However, no method of transmission over the internet is 100% secure.`
        },
        {
          title: '6. Your Rights',
          content: `You have the right to:
• Access your personal information
• Update or correct your information
• Delete your account
• Opt out of marketing communications
• Request data portability`
        },
        {
          title: '7. Contact Us',
          content: `If you have questions about this Privacy Policy, please contact us at:
Email: privacy@wasando.com
Address: WaSanDo 和讃堂, 1499-28 Kosato, Ueda, Nagano-ken, 386-0005 Japan
WhatsApp: +81-70-3782-2505`
        }
      ]
    },
    ja: {
      title: 'プライバシーポリシー',
      lastUpdated: '最終更新日: 2024年12月',
      sections: [
        {
          title: '1. 収集する情報',
          content: `アカウント作成、注文、お問い合わせ時に直接提供していただく情報を収集します。これには以下が含まれます：
• 氏名、メールアドレス、電話番号
• レストラン情報（レストランオーナーの場合）
• 位置情報（同意に基づく）
• 支払い情報（安全に処理）
• 注文履歴と設定`
        },
        {
          title: '2. 情報の使用方法',
          content: `収集した情報を以下の目的で使用します：
• サービスの提供と改善
• 注文と予約の処理
• 更新と通知の送信
• パーソナライズされた体験の提供
• セキュリティの確保と不正防止`
        },
        {
          title: '3. 位置情報サービス',
          content: `ご同意いただいた場合、位置情報にアクセスして以下を行います：
• 近くのレストランの表示
• 位置情報に基づく推奨の提供
• サービスの改善
デバイス設定でいつでも位置情報アクセスを無効にできます。`
        },
        {
          title: '4. データの共有',
          content: `個人情報を販売することはありません。以下の場合に情報を共有する場合があります：
• レストランパートナー（注文処理のため）
• 決済処理業者（安全な取引のため）
• サービスプロバイダー（アプリ機能のため）
• 法執行機関（法律で要求される場合）`
        },
        {
          title: '5. データセキュリティ',
          content: `暗号化と安全なデータ保存を含む適切なセキュリティ対策を実装して個人情報を保護します。ただし、インターネット経由の送信方法は100%安全ではありません。`
        },
        {
          title: '6. お客様の権利',
          content: `以下の権利があります：
• 個人情報へのアクセス
• 情報の更新または修正
• アカウントの削除
• マーケティング通信のオプトアウト
• データの移植性の要求`
        },
        {
          title: '7. お問い合わせ',
          content: `このプライバシーポリシーについてご質問がある場合は、以下までお問い合わせください：
メール: privacy@wasando.com
住所: WaSanDo 和讃堂, 〒386-0005長野県上田市古里1499-28
WhatsApp: +81-70-3782-2505`
        }
      ]
    },
    zh: {
      title: '隐私政策',
      lastUpdated: '最后更新：2024年12月',
      sections: [
        {
          title: '1. 我们收集的信息',
          content: `我们收集您直接提供给我们的信息，例如创建账户、下单或联系我们时。这可能包括：
• 姓名、电子邮件地址、电话号码
• 餐厅信息（餐厅老板）
• 位置数据（经您同意）
• 支付信息（安全处理）
• 订单历史和偏好`
        },
        {
          title: '2. 我们如何使用您的信息',
          content: `我们使用收集的信息来：
• 提供和改进我们的服务
• 处理订单和预订
• 向您发送更新和通知
• 个性化您的体验
• 确保安全并防止欺诈`
        },
        {
          title: '3. 位置服务',
          content: `经您同意，我们可能会访问您的位置以：
• 显示附近的餐厅
• 提供基于位置的推荐
• 改进我们的服务
您可以随时在设备设置中禁用位置访问。`
        },
        {
          title: '4. 数据共享',
          content: `我们不会出售您的个人信息。我们可能会与以下各方共享您的信息：
• 餐厅合作伙伴（用于订单处理）
• 支付处理商（用于安全交易）
• 服务提供商（用于应用功能）
• 法律当局（法律要求时）`
        },
        {
          title: '5. 数据安全',
          content: `我们实施适当的安全措施来保护您的个人信息，包括加密和安全数据存储。但是，通过互联网传输的方法并非100%安全。`
        },
        {
          title: '6. 您的权利',
          content: `您有权：
• 访问您的个人信息
• 更新或更正您的信息
• 删除您的账户
• 选择退出营销通信
• 请求数据可移植性`
        },
        {
          title: '7. 联系我们',
          content: `如果您对本隐私政策有任何疑问，请联系我们：
电子邮件: privacy@wasando.com
地址: WaSanDo 和讃堂, 〒386-0005长野县上田市古里1499-28, 日本
WhatsApp: +81-70-3782-2505`
        }
      ]
    }
  };

  const content = privacyPolicyContent[currentLanguage as keyof typeof privacyPolicyContent] || privacyPolicyContent.en;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            {content.title}
          </h1>
          <p className="text-sm text-gray-500 text-center mt-2">
            {content.lastUpdated}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-8 text-sm leading-relaxed">
            {content.sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h2 className="font-semibold text-xl text-gray-900">
                  {section.title}
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 