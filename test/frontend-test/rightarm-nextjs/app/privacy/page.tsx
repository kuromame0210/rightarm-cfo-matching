'use client';

import { motion } from 'framer-motion';
import { Shield, Calendar, Lock, Eye, Database, UserCheck } from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: '1. 収集する個人情報',
      content: `当社は、本サービスの提供にあたり、以下の個人情報を収集することがあります。

【ユーザー登録時】
・氏名、メールアドレス、電話番号
・会社名、部署、役職
・プロフィール画像
・自己紹介文

【CFO登録時の追加情報】
・経歴、学歴、保有資格
・専門スキル、対応可能業界
・過去の実績、成果
・希望稼働条件、料金設定

【企業登録時の追加情報】
・企業規模、業界、設立年
・事業内容、財務課題
・CFOへの要求事項
・予算、契約条件

【サービス利用時】
・メッセージの内容
・検索履歴、閲覧履歴
・マッチング履歴、契約履歴
・決済情報（クレジットカード情報等）

【自動収集される情報】
・IPアドレス、ブラウザ情報
・アクセス日時、利用状況
・Cookie情報`
    },
    {
      icon: Eye,
      title: '2. 個人情報の利用目的',
      content: `当社は、収集した個人情報を以下の目的で利用いたします。

【サービス提供のため】
・ユーザー認証、アカウント管理
・マッチング機能の提供
・メッセージング機能の提供
・契約管理、決済処理

【サービス改善のため】
・サービスの品質向上、機能改善
・ユーザー体験の最適化
・新機能の開発、提供

【コミュニケーションのため】
・重要な通知、お知らせの送信
・キャンペーン、イベント情報の配信
・カスタマーサポートの提供

【安全性確保のため】
・不正利用の防止、検出
・セキュリティ対策の実施
・利用規約違反の調査

【その他】
・法令に基づく対応
・統計データの作成（個人を特定しない形式）
・マーケティング、広告配信の最適化`
    },
    {
      icon: UserCheck,
      title: '3. 個人情報の第三者提供',
      content: `当社は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。

【同意がある場合】
・ユーザーから明示的な同意を得た場合
・マッチング成立時の相手企業・CFOへの必要情報の提供

【法令に基づく場合】
・法令により開示が義務付けられている場合
・裁判所、警察等の公的機関からの要請がある場合

【業務委託の場合】
・決済処理、メール配信等の業務委託先への提供
・適切な秘密保持契約を締結した委託先に限定

【事業承継の場合】
・合併、買収等による事業承継に伴う場合
・事前にユーザーへ通知いたします

【緊急事態の場合】
・ユーザーや第三者の生命、身体、財産の保護のために必要な場合
・当社の権利、財産の保護のために必要な場合`
    },
    {
      icon: Lock,
      title: '4. 個人情報の安全管理',
      content: `当社は、個人情報の紛失、破壊、改ざん、漏洩等を防止するため、以下の安全管理措置を講じています。

【技術的安全管理措置】
・SSL/TLS暗号化通信の実装
・ファイアウォール、WAFによる不正アクセス防御
・定期的なセキュリティ監査の実施
・脆弱性診断の定期実施

【物理的安全管理措置】
・データセンターの物理的セキュリティ
・サーバールームへの入退室管理
・監視カメラによる24時間監視

【人的安全管理措置】
・従業員への定期的なセキュリティ教育
・秘密保持契約の締結
・アクセス権限の最小限化

【組織的安全管理措置】
・個人情報保護責任者の設置
・個人情報取扱規程の策定、運用
・定期的な内部監査の実施
・インシデント対応体制の構築`
    },
    {
      icon: Database,
      title: '5. 個人情報の保存期間',
      content: `当社は、個人情報を以下の期間保存いたします。

【アカウント情報】
・退会から3年間
・法令で保存期間が定められている場合はその期間

【取引関連情報】
・契約終了から7年間
・会計帳簿等の法定保存期間に準拠

【コミュニケーション履歴】
・メッセージ: 送信から5年間
・サポート履歴: 完了から3年間

【ログ情報】
・アクセスログ: 記録から1年間
・セキュリティログ: 記録から3年間

【マーケティング情報】
・配信停止まで、または最終利用から2年間

保存期間経過後は、個人情報を安全に削除いたします。`
    },
    {
      icon: UserCheck,
      title: '6. ユーザーの権利',
      content: `ユーザーは、自己の個人情報について以下の権利を有します。

【開示請求権】
・当社が保有する個人情報の開示を請求する権利
・開示には本人確認が必要です

【訂正・削除請求権】
・個人情報の訂正、追加、削除を請求する権利
・アカウント設定から一部は自分で変更可能

【利用停止請求権】
・個人情報の利用停止、消去を請求する権利
・サービス提供に必要な情報は例外となる場合があります

【同意撤回権】
・個人情報の利用に関する同意を撤回する権利
・ただし、サービス利用に支障が生じる場合があります

これらの権利を行使される場合は、お問い合わせページよりご連絡ください。
本人確認の上、法令に従って対応いたします。`
    },
    {
      icon: Eye,
      title: '7. Cookieの利用',
      content: `当社は、サービスの利便性向上のためCookieを利用しています。

【利用目的】
・ログイン状態の維持
・ユーザー設定の保存
・サービス利用状況の分析
・広告配信の最適化

【第三者Cookie】
・Google Analytics（アクセス解析）
・Google Ads（広告配信）
・Facebook Pixel（広告効果測定）

【Cookie の無効化】
ブラウザの設定でCookieを無効にできますが、一部機能が制限される場合があります。

【Google Analytics】
Google Analyticsのオプトアウトアドオンにより無効化できます。`
    },
    {
      icon: Shield,
      title: '8. 国外への個人情報の移転',
      content: `当社は、サービス提供のため以下の場合に個人情報を国外に移転することがあります。

【クラウドサービス】
・Amazon Web Services（米国）
・Google Cloud Platform（米国）
・Microsoft Azure（米国、欧州）

【業務委託先】
・メール配信サービス（米国）
・決済処理サービス（米国、欧州）
・カスタマーサポートツール（米国）

【安全管理措置】
・移転先の国の個人情報保護法制の確認
・適切な契約条項の締結
・EU標準契約条項（SCC）の利用
・定期的な監査の実施

移転先において十分な個人情報保護措置が講じられるよう管理しています。`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-black" />
              <h1 className="text-4xl font-bold text-black">プライバシーポリシー</h1>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>最終更新日: 2024年1月1日</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 前文 */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 rounded-lg p-6 border border-blue-200"
          >
            <h2 className="text-lg font-semibold text-blue-900 mb-3">個人情報保護への取り組み</h2>
            <p className="text-blue-800 text-sm leading-relaxed">
              RightArm株式会社（以下「当社」）は、CFOマッチングプラットフォーム「RightArm」（以下「本サービス」）の提供にあたり、
              ユーザーの皆様の個人情報の保護に努めています。本プライバシーポリシーは、個人情報の収集、利用、管理について定めたものです。
              本サービスをご利用になる前に、必ずお読みください。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ポリシー内容 */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-black leading-tight">
                    {section.title}
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line pl-16">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* お問い合わせ・連絡先 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-8"
          >
            <h2 className="text-xl font-bold text-black mb-6">9. お問い合わせ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">個人情報に関するお問い合わせ</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  個人情報の取扱いに関するご質問、開示・訂正・削除等のご請求については、
                  以下の窓口までお問い合わせください。
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">連絡先</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>RightArm株式会社</div>
                    <div>個人情報保護責任者</div>
                    <div>メール: privacy@rightarm.jp</div>
                    <div>電話: 03-1234-5678</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">受付時間</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div>平日 9:00〜18:00</div>
                    <div>（土日祝日・年末年始を除く）</div>
                    <div className="mt-2 text-blue-600">
                      <a href="/contact" className="hover:underline">
                        お問い合わせフォーム →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 改定について */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 bg-gray-50 rounded-lg p-6"
          >
            <h3 className="text-lg font-semibold text-black mb-3">10. プライバシーポリシーの改定</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              当社は、法令の変更やサービスの改善等に伴い、本プライバシーポリシーを改定することがあります。
              重要な変更については、サービス内での通知やメールにてお知らせいたします。
              改定後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}