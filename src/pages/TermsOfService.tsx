import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const termsContent = {
    en: {
      title: 'Terms of Service',
      lastUpdated: 'Last Updated: December 2024',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: `By accessing and using Navikko, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
        },
        {
          title: '2. Description of Service',
          content: `Navikko is a multilingual dining platform that connects customers with restaurants. Our services include:
• Restaurant browsing and discovery
• Online ordering and reservations
• Payment processing
• Location-based recommendations
• Multilingual support`
        },
        {
          title: '3. User Accounts',
          content: `To use certain features of Navikko, you must create an account. You are responsible for:
• Maintaining the confidentiality of your account
• All activities that occur under your account
• Providing accurate and complete information
• Notifying us immediately of any unauthorized use`
        },
        {
          title: '4. User Conduct',
          content: `You agree not to:
• Use the service for any unlawful purpose
• Impersonate any person or entity
• Interfere with or disrupt the service
• Attempt to gain unauthorized access to our systems
• Use automated systems to access the service`
        },
        {
          title: '5. Restaurant Partners',
          content: `Restaurant owners using Navikko must:
• Provide accurate menu and pricing information
• Maintain food safety standards
• Process orders in a timely manner
• Comply with all applicable laws and regulations
• Maintain appropriate insurance coverage`
        },
        {
          title: '6. Payment Terms',
          content: `• All payments are processed securely through our payment partners
• Prices are subject to change without notice
• Refunds are subject to restaurant policies
• Service fees may apply to orders
• Payment disputes should be resolved with the restaurant directly`
        },
        {
          title: '7. Privacy and Data',
          content: `Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices regarding the collection and use of your information.`
        },
        {
          title: '8. Intellectual Property',
          content: `The service and its original content, features, and functionality are owned by Navikko and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.`
        },
        {
          title: '9. Limitation of Liability',
          content: `Navikko shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.`
        },
        {
          title: '10. Termination',
          content: `We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever.`
        },
        {
          title: '11. Changes to Terms',
          content: `We reserve the right to modify or replace these terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.`
        },
        {
          title: '12. Contact Information',
          content: `If you have any questions about these Terms of Service, please contact us at:
Email: legal@wasando.com
Address: WaSanDo 和讃堂, 1499-28 Kosato, Ueda, Nagano-ken, 386-0005 Japan
WhatsApp: +81-70-3782-2505`
        }
      ]
    },
    ja: {
      title: '利用規約',
      lastUpdated: '最終更新日: 2024年12月',
      sections: [
        {
          title: '1. 利用規約の承諾',
          content: `Navikkoにアクセスし、使用することにより、本契約の条項に拘束されることに同意するものとします。上記に従うことに同意しない場合は、本サービスを使用しないでください。`
        },
        {
          title: '2. サービスの説明',
          content: `Navikkoは、お客様とレストランを結ぶ多言語対応のダイニングプラットフォームです。サービスには以下が含まれます：
• レストランの閲覧と発見
• オンライン注文と予約
• 決済処理
• 位置情報に基づく推奨
• 多言語サポート`
        },
        {
          title: '3. ユーザーアカウント',
          content: `Navikkoの特定の機能を使用するには、アカウントを作成する必要があります。以下について責任を負います：
• アカウントの機密性の維持
• アカウント下で発生するすべての活動
• 正確で完全な情報の提供
• 不正使用の即座の通知`
        },
        {
          title: '4. ユーザーの行為',
          content: `以下を行わないことに同意します：
• 違法な目的でのサービスの使用
• 人物や組織のなりすまし
• サービスの妨害や中断
• システムへの不正アクセスの試行
• 自動システムによるサービスアクセス`
        },
        {
          title: '5. レストランパートナー',
          content: `Navikkoを使用するレストランオーナーは以下を行う必要があります：
• 正確なメニューと価格情報の提供
• 食品安全基準の維持
• 注文の適時処理
• すべての適用法律と規制の遵守
• 適切な保険の維持`
        },
        {
          title: '6. 支払い条件',
          content: `• すべての支払いは決済パートナーを通じて安全に処理されます
• 価格は予告なく変更される場合があります
• 返金はレストランのポリシーに従います
• 注文にサービス料が適用される場合があります
• 支払いの紛争はレストランと直接解決する必要があります`
        },
        {
          title: '7. プライバシーとデータ',
          content: `お客様のプライバシーは私たちにとって重要です。情報の収集と使用に関する当社の慣行を理解するために、サービスの使用も管理するプライバシーポリシーをご確認ください。`
        },
        {
          title: '8. 知的財産',
          content: `サービスとそのオリジナルコンテンツ、機能、機能性はNavikkoが所有し、国際的な著作権、商標、特許、営業秘密、その他の知的財産法によって保護されています。`
        },
        {
          title: '9. 責任の制限',
          content: `Navikkoは、利益、データ、使用、信用、その他の無形損失の損失を含む、間接的、付随的、特別、結果的、または懲罰的損害について責任を負いません。`
        },
        {
          title: '10. 終了',
          content: `当社は、独自の裁量により、いかなる理由でも、事前の通知または責任なしに、アカウントを終了または停止し、サービスへのアクセスを即座に禁止する場合があります。`
        },
        {
          title: '11. 利用規約の変更',
          content: `当社は、いつでもこれらの条項を変更または置き換える権利を留保します。改訂が重要な場合、新しい条項が発効する前に少なくとも30日前に通知します。`
        },
        {
          title: '12. 連絡先情報',
          content: `この利用規約についてご質問がある場合は、以下までお問い合わせください：
メール: legal@wasando.com
住所: WaSanDo 和讃堂, 〒386-0005長野県上田市古里1499-28
WhatsApp: +81-70-3782-2505`
        }
      ]
    },
    zh: {
      title: '服务条款',
      lastUpdated: '最后更新：2024年12月',
      sections: [
        {
          title: '1. 条款接受',
          content: `通过访问和使用Navikko，您接受并同意受本协议条款的约束。如果您不同意遵守上述条款，请不要使用此服务。`
        },
        {
          title: '2. 服务描述',
          content: `Navikko是一个多语言餐饮平台，连接客户与餐厅。我们的服务包括：
• 餐厅浏览和发现
• 在线订购和预订
• 支付处理
• 基于位置的推荐
• 多语言支持`
        },
        {
          title: '3. 用户账户',
          content: `要使用Navikko的某些功能，您必须创建账户。您负责：
• 维护账户的机密性
• 账户下发生的所有活动
• 提供准确完整的信息
• 立即通知任何未经授权的使用`
        },
        {
          title: '4. 用户行为',
          content: `您同意不：
• 将服务用于任何非法目的
• 冒充任何个人或实体
• 干扰或破坏服务
• 尝试未经授权访问我们的系统
• 使用自动化系统访问服务`
        },
        {
          title: '5. 餐厅合作伙伴',
          content: `使用Navikko的餐厅老板必须：
• 提供准确的菜单和价格信息
• 维持食品安全标准
• 及时处理订单
• 遵守所有适用的法律和法规
• 维持适当的保险覆盖`
        },
        {
          title: '6. 支付条款',
          content: `• 所有支付都通过我们的支付合作伙伴安全处理
• 价格可能会更改，恕不另行通知
• 退款受餐厅政策约束
• 订单可能收取服务费
• 支付纠纷应与餐厅直接解决`
        },
        {
          title: '7. 隐私和数据',
          content: `您的隐私对我们很重要。请查看我们的隐私政策，它也管理您对服务的使用，以了解我们关于收集和使用您信息的做法。`
        },
        {
          title: '8. 知识产权',
          content: `服务及其原始内容、功能和功能由Navikko拥有，并受国际版权、商标、专利、商业秘密和其他知识产权法保护。`
        },
        {
          title: '9. 责任限制',
          content: `Navikko对任何间接、偶然、特殊、后果性或惩罚性损害不承担责任，包括但不限于利润、数据、使用、商誉或其他无形损失的损失。`
        },
        {
          title: '10. 终止',
          content: `我们可能会在我们的唯一裁量权下，出于任何原因，在事先通知或承担责任的情况下，立即终止或暂停您的账户并禁止访问服务。`
        },
        {
          title: '11. 条款变更',
          content: `我们保留随时修改或替换这些条款的权利。如果修订很重要，我们将在任何新条款生效前至少30天通知。`
        },
        {
          title: '12. 联系信息',
          content: `如果您对这些服务条款有任何疑问，请联系我们：
电子邮件: legal@wasando.com
地址: WaSanDo 和讃堂, 〒386-0005长野县上田市古里1499-28, 日本
WhatsApp: +81-70-3782-2505`
        }
      ]
    }
  };

  const content = termsContent[currentLanguage as keyof typeof termsContent] || termsContent.en;

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

export default TermsOfService; 