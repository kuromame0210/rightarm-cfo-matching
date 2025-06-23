import Link from 'next/link'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { CheckIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      title: '双方向マッチング',
      description: '企業からCFOへ、CFOから企業へ、両方向のスカウトが可能',
      icon: '🎯'
    },
    {
      title: 'スキル・課題で検索',
      description: '31種類のスキルタグと16種類の課題タグで最適な相手を見つける',
      icon: '🔍'
    },
    {
      title: '安心の決済システム',
      description: '銀行振込ベースで証憑管理、透明性の高い取引',
      icon: '💳'
    },
    {
      title: '段階的な交渉',
      description: '5段階のステータス管理で、スムーズな契約まで',
      icon: '📊'
    }
  ]

  const howItWorks = [
    {
      step: '1',
      title: 'プロフィール作成',
      description: 'スキル・経験・条件を詳しく入力'
    },
    {
      step: '2',
      title: 'マッチング',
      description: 'AIが最適な相手を推薦、または自分で検索'
    },
    {
      step: '3',
      title: 'スカウト・交渉',
      description: 'メッセージで条件を相談、面談を実施'
    },
    {
      step: '4',
      title: '契約・開始',
      description: '契約成立後、お仕事開始'
    }
  ]

  return (
    <Layout>
      {/* Hero Section - CrowdWorks Style */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              CFOマッチング<br />
              プラットフォーム
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 max-w-3xl mx-auto">
              経験豊富なCFOと成長企業を双方向でつなぐ<br />
              新しいプラットフォーム
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                <Link href="/auth/register">CFOとして登録</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3">
                <Link href="/auth/register">企業として登録</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              RIGHTARMの特徴
            </h2>
            <p className="text-xl text-gray-600">
              従来のマッチングプラットフォームにはない、独自の機能を提供
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              利用の流れ
            </h2>
            <p className="text-xl text-gray-600">
              簡単4ステップで理想の相手と出会える
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              料金プラン
            </h2>
            <p className="text-xl text-gray-600">
              成果報酬型で安心してご利用いただけます
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">CFO</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">無料</div>
              <p className="text-gray-600 mb-8">
                登録・プロフィール作成・スカウト受信まで完全無料
              </p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  プロフィール作成
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  スカウト受信
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  メッセージ機能
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  面談調整
                </li>
              </ul>
            </div>
            <div className="bg-blue-50 rounded-lg p-8 text-center border-2 border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">企業</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">5%</div>
              <p className="text-gray-600 mb-8">
                契約成立時のみ、契約金額の5%
              </p>
              <ul className="text-left space-y-2 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  CFO検索・スカウト
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  メッセージ機能
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  面談調整
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  契約管理
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            今すぐ始めましょう
          </h2>
          <p className="text-xl mb-8 text-gray-600">
            理想のCFOとの出会い、成長企業とのマッチングを実現
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
              <Link href="/auth/register">無料で始める</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3">
              <Link href="/discover/cfos">CFOを探す</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
