'use client'

import { useState, useEffect } from 'react'
import AppHeader from '@/components/AppHeader'

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'poor'
  description: string
}

interface PagePerformance {
  path: string
  loadTime: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  cumulativeLayoutShift: number
  firstInputDelay: number
}

export default function PerformanceDebugPage() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [pagePerformances, setPagePerformances] = useState<PagePerformance[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')

  useEffect(() => {
    // 重い処理を遅延実行
    const timer = setTimeout(() => {
      // ダミーパフォーマンスデータ
      const dummyMetrics: PerformanceMetric[] = [
      {
        name: 'First Contentful Paint',
        value: 1.2,
        unit: 's',
        status: 'good',
        description: 'ページの最初のコンテンツが表示されるまでの時間'
      },
      {
        name: 'Largest Contentful Paint',
        value: 2.1,
        unit: 's',
        status: 'good',
        description: '最大のコンテンツ要素が表示されるまでの時間'
      },
      {
        name: 'First Input Delay',
        value: 45,
        unit: 'ms',
        status: 'good',
        description: 'ユーザーの最初の操作に対する応答時間'
      },
      {
        name: 'Cumulative Layout Shift',
        value: 0.08,
        unit: '',
        status: 'warning',
        description: 'ページの視覚的安定性の指標'
      },
      {
        name: 'Total Blocking Time',
        value: 180,
        unit: 'ms',
        status: 'warning',
        description: 'メインスレッドがブロックされた時間'
      },
      {
        name: 'Speed Index',
        value: 2.8,
        unit: 's',
        status: 'good',
        description: 'ページコンテンツの表示速度'
      }
    ]

    const dummyPagePerformances: PagePerformance[] = [
      {
        path: '/home',
        loadTime: 876,
        firstContentfulPaint: 1.1,
        largestContentfulPaint: 2.0,
        cumulativeLayoutShift: 0.05,
        firstInputDelay: 38
      },
      {
        path: '/scout',
        loadTime: 1205,
        firstContentfulPaint: 1.4,
        largestContentfulPaint: 2.3,
        cumulativeLayoutShift: 0.12,
        firstInputDelay: 52
      },
      {
        path: '/messages',
        loadTime: 945,
        firstContentfulPaint: 1.2,
        largestContentfulPaint: 1.9,
        cumulativeLayoutShift: 0.03,
        firstInputDelay: 41
      },
      {
        path: '/meetings',
        loadTime: 723,
        firstContentfulPaint: 0.9,
        largestContentfulPaint: 1.6,
        cumulativeLayoutShift: 0.02,
        firstInputDelay: 29
      },
      {
        path: '/auth/login',
        loadTime: 654,
        firstContentfulPaint: 0.8,
        largestContentfulPaint: 1.4,
        cumulativeLayoutShift: 0.01,
        firstInputDelay: 25
      }
    ]

      setMetrics(dummyMetrics)
      setPagePerformances(dummyPagePerformances)
    }, 100) // 100ms遅延

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200'
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'poor': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getLoadTimeStatus = (loadTime: number) => {
    if (loadTime < 800) return 'good'
    if (loadTime < 1200) return 'warning'
    return 'poor'
  }

  const averageLoadTime = pagePerformances.reduce((sum, page) => sum + page.loadTime, 0) / pagePerformances.length
  const fastestPage = pagePerformances.reduce((fastest, page) => 
    page.loadTime < fastest.loadTime ? page : fastest, pagePerformances[0] || { loadTime: 0, path: '' })
  const slowestPage = pagePerformances.reduce((slowest, page) => 
    page.loadTime > slowest.loadTime ? page : slowest, pagePerformances[0] || { loadTime: 0, path: '' })

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">⚡ パフォーマンス</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              デバッグ専用
            </span>
          </div>
          <p className="text-gray-600">
            アプリケーションのパフォーマンス指標とページ読み込み時間を監視
          </p>
        </div>

        {/* 時間範囲選択 */}
        <div className="mb-6">
          <div className="flex gap-2">
            {['1h', '24h', '7d', '30d'].map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-4 py-2 text-sm rounded-md ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {timeframe}
              </button>
            ))}
          </div>
        </div>

        {/* 概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{averageLoadTime.toFixed(0)}ms</div>
            <div className="text-sm text-gray-600">平均読み込み時間</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{fastestPage.loadTime}ms</div>
            <div className="text-sm text-gray-600">最速ページ</div>
            <div className="text-xs text-gray-500">{fastestPage.path}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{slowestPage.loadTime}ms</div>
            <div className="text-sm text-gray-600">最遅ページ</div>
            <div className="text-xs text-gray-500">{slowestPage.path}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{pagePerformances.length}</div>
            <div className="text-sm text-gray-600">監視ページ数</div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric) => (
              <div key={metric.name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{metric.name}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(metric.status)}`}>
                    {metric.status === 'good' ? '良好' : 
                     metric.status === 'warning' ? '注意' : '改善必要'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}{metric.unit}
                </div>
                <p className="text-sm text-gray-600">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ページ別パフォーマンス */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">ページ別パフォーマンス</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ページ</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">読み込み時間</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">FCP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">LCP</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">CLS</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">FID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {pagePerformances.map((page) => (
                  <tr key={page.path} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-blue-600">{page.path}</td>
                    <td className="py-3 px-4">{page.loadTime}ms</td>
                    <td className="py-3 px-4">{page.firstContentfulPaint}s</td>
                    <td className="py-3 px-4">{page.largestContentfulPaint}s</td>
                    <td className="py-3 px-4">{page.cumulativeLayoutShift}</td>
                    <td className="py-3 px-4">{page.firstInputDelay}ms</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(getLoadTimeStatus(page.loadTime))}`}>
                        {getLoadTimeStatus(page.loadTime) === 'good' ? '良好' : 
                         getLoadTimeStatus(page.loadTime) === 'warning' ? '注意' : '改善必要'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 改善提案 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">改善提案</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-yellow-600">⚠️</span>
              <div>
                <div className="font-medium text-yellow-800">Cumulative Layout Shift の改善</div>
                <div className="text-sm text-yellow-700">一部のページでレイアウトシフトが発生しています。画像やコンテンツのサイズを事前に指定することを推奨します。</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-blue-600">💡</span>
              <div>
                <div className="font-medium text-blue-800">コード分割の最適化</div>
                <div className="text-sm text-blue-700">スカウトページの初回読み込み時間が長めです。さらなるコンポーネント分割やLazy Loading を検討してください。</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600">✅</span>
              <div>
                <div className="font-medium text-green-800">全体的なパフォーマンス</div>
                <div className="text-sm text-green-700">ほとんどのページで良好なパフォーマンスを維持しています。継続的な監視を推奨します。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}