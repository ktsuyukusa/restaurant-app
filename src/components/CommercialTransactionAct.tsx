import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommercialTransactionAct: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const commercialTransactionContent = {
    en: {
      title: 'Specified Commercial Transaction Act Disclosure',
      lastUpdated: 'Last Updated: December 2024',
      sections: [
        {
          title: '1. Business Information',
          content: `Business Name: WaSanDo 和讃堂
Representative: Kazuyoshi Tsuyukusa
Address: 1499-28 Kosato, Ueda, Nagano-ken, 386-0005 Japan
Phone: +81-70-3782-2505
Email: legal@wasando.com
Business Registration: Sole Proprietorship`
        },
        {
          title: '2. Product/Service Details',
          content: `Service: Multilingual Restaurant Management and Ordering Platform (Navikko)
Description: Software-as-a-Service platform for restaurant management, customer ordering, and payment processing with multilingual support (English, Japanese, Chinese, Korean).
Features: Restaurant dashboard, menu management, customer ordering system, payment processing, location-based discovery, real-time order management.`
        },
        {
          title: '3. Pricing',
          content: `Subscription Plans:
• Basic Plan: ¥2,980/month (excluding tax)
• Premium Plan: ¥4,980/month (excluding tax)
• Enterprise Plan: ¥9,980/month (excluding tax)

Transaction Fees:
• 3.5% per order (excluding tax)
• Payment processing fees may apply

All prices are in Japanese Yen (JPY) and exclude consumption tax (10%).`
        },
        {
          title: '4. Payment Methods',
          content: `Accepted Payment Methods:
• Credit Cards (Visa, MasterCard, JCB, American Express)
• PayPay
• Apple Pay
• Convenience Store Payments (7-Eleven, Lawson, FamilyMart)
• Bank Transfers

Payment processing is handled securely by KOMOJU.`
        },
        {
          title: '5. Service Terms',
          content: `Service Start: Immediately upon payment confirmation
Service Period: Monthly or yearly as selected
Service Delivery: Web-based platform accessible via browser
System Requirements: Modern web browser with internet connection
Availability: 24/7 (maintenance periods may apply)`
        },
        {
          title: '6. Cancellation Policy',
          content: `Subscription Cancellation:
• Cancel anytime through your account dashboard
• Service continues until the end of the current billing period
• No refunds for partial months

Order Cancellation:
• Orders can be cancelled up to 30 minutes before pickup time
• Full refund for cancelled orders
• Contact restaurant directly for immediate cancellations

Refund Processing:
• Refunds processed within 3-5 business days
• Original payment method will be credited`
        },
        {
          title: '7. Contact Information',
          content: `Customer Service:
Email: support@wasando.com
Phone: +81-70-3782-2505
WhatsApp: +81-70-3782-2505
Business Hours: Monday-Friday 9:00-18:00 JST

Legal Inquiries:
Email: legal@wasando.com
Address: WaSanDo 和讃堂, 1499-28 Kosato, Ueda, Nagano-ken, 386-0005 Japan`
        }
      ]
    },
    ja: {
      title: '特定商取引法に基づく表記',
      lastUpdated: '最終更新日: 2024年12月',
      sections: [
        {
          title: '1. 事業者の情報',
          content: `事業者名: WaSanDo 和讃堂
代表者: 露久和 和義
所在地: 〒386-0005 長野県上田市古里1499-28
電話番号: +81-70-3782-2505
メールアドレス: legal@wasando.com
事業形態: 個人事業主`
        },
        {
          title: '2. 商品・サービスの詳細',
          content: `サービス名: 多言語対応レストラン管理・注文プラットフォーム（Navikko）
サービス内容: レストラン管理、顧客注文、決済処理のためのソフトウェア・アズ・ア・サービスプラットフォーム。多言語対応（英語、日本語、中国語、韓国語）。
機能: レストランダッシュボード、メニュー管理、顧客注文システム、決済処理、位置情報ベースの検索、リアルタイム注文管理。`
        },
        {
          title: '3. 価格',
          content: `サブスクリプションプラン:
• ベーシックプラン: 月額2,980円（税抜）
• プレミアムプラン: 月額4,980円（税抜）
• エンタープライズプラン: 月額9,980円（税抜）

取引手数料:
• 注文あたり3.5%（税抜）
• 決済処理手数料が別途適用される場合があります

すべての価格は日本円（JPY）で表示され、消費税（10%）は含まれていません。`
        },
        {
          title: '4. 支払い方法',
          content: `対応決済方法:
• クレジットカード（Visa、MasterCard、JCB、American Express）
• PayPay
• Apple Pay
• コンビニ決済（セブン-イレブン、ローソン、ファミリーマート）
• 銀行振込

決済処理はKOMOJUにより安全に処理されます。`
        },
        {
          title: '5. サービス提供条件',
          content: `サービス開始: 決済確認後即座に開始
サービス期間: 選択された月額または年額
サービス提供方法: ブラウザ経由でアクセス可能なウェブベースプラットフォーム
システム要件: インターネット接続可能な最新のウェブブラウザ
利用可能時間: 24時間365日（メンテナンス期間を除く）`
        },
        {
          title: '6. キャンセル・返品ポリシー',
          content: `サブスクリプションキャンセル:
• アカウントダッシュボードからいつでもキャンセル可能
• 現在の請求期間終了までサービス継続
• 部分的な月の返金はありません

注文キャンセル:
• 受け取り時間の30分前までキャンセル可能
• キャンセルされた注文は全額返金
• 即座のキャンセルはレストランに直接連絡

返金処理:
• 返金は3-5営業日以内に処理
• 元の支払い方法に返金されます`
        },
        {
          title: '7. 連絡先情報',
          content: `カスタマーサポート:
メール: support@wasando.com
電話: +81-70-3782-2505
WhatsApp: +81-70-3782-2505
営業時間: 月曜日-金曜日 9:00-18:00 JST

法的お問い合わせ:
メール: legal@wasando.com
住所: WaSanDo 和讃堂, 〒386-0005長野県上田市古里1499-28`
        }
      ]
    },
    zh: {
      title: '特定商业交易法披露',
      lastUpdated: '最后更新：2024年12月',
      sections: [
        {
          title: '1. 企业信息',
          content: `企业名称: WaSanDo 和讃堂
代表: 露久和 和义
地址: 〒386-0005 长野县上田市古里1499-28
电话: +81-70-3782-2505
邮箱: legal@wasando.com
企业形态: 个人事业主`
        },
        {
          title: '2. 商品/服务详情',
          content: `服务名称: 多语言餐厅管理和订购平台（Navikko）
服务内容: 餐厅管理、客户订购、支付处理的软件即服务平台。支持多语言（英语、日语、中文、韩语）。
功能: 餐厅仪表板、菜单管理、客户订购系统、支付处理、基于位置的发现、实时订单管理。`
        },
        {
          title: '3. 价格',
          content: `订阅计划:
• 基础计划: 月费2,980日元（不含税）
• 高级计划: 月费4,980日元（不含税）
• 企业计划: 月费9,980日元（不含税）

交易手续费:
• 每笔订单3.5%（不含税）
• 可能适用支付处理费

所有价格以日元（JPY）显示，不含消费税（10%）。`
        },
        {
          title: '4. 支付方式',
          content: `接受的支付方式:
• 信用卡（Visa、MasterCard、JCB、American Express）
• PayPay
• Apple Pay
• 便利店支付（7-Eleven、Lawson、FamilyMart）
• 银行转账

支付处理由KOMOJU安全处理。`
        },
        {
          title: '5. 服务条款',
          content: `服务开始: 支付确认后立即开始
服务期限: 选择的月费或年费
服务提供方式: 可通过浏览器访问的基于网络平台
系统要求: 具有互联网连接的现代网络浏览器
可用时间: 24/7（维护期间除外）`
        },
        {
          title: '6. 取消/退款政策',
          content: `订阅取消:
• 可通过账户仪表板随时取消
• 服务持续到当前计费期结束
• 不提供部分月份的退款

订单取消:
• 可在取货时间前30分钟取消
• 取消的订单全额退款
• 立即取消请直接联系餐厅

退款处理:
• 退款在3-5个工作日内处理
• 将退款到原始支付方式`
        },
        {
          title: '7. 联系信息',
          content: `客户服务:
邮箱: support@wasando.com
电话: +81-70-3782-2505
WhatsApp: +81-70-3782-2505
营业时间: 周一-周五 9:00-18:00 JST

法律咨询:
邮箱: legal@wasando.com
地址: WaSanDo 和讃堂, 〒386-0005长野县上田市古里1499-28`
        }
      ]
    }
  };

  const content = commercialTransactionContent[currentLanguage as keyof typeof commercialTransactionContent] || commercialTransactionContent.en;

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

export default CommercialTransactionAct; 