// マスターデータ: 地域 API
import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

// 地域データ（Japan地域を基にした包括的なリスト）
const REGIONS_DATA = [
  { id: 'all', name: '全国', code: 'ALL', type: 'nationwide', prefecture: null, displayOrder: 1 },
  { id: 'remote', name: 'リモート可', code: 'REMOTE', type: 'remote', prefecture: null, displayOrder: 2 },
  
  // 関東地方
  { id: 'tokyo', name: '東京都', code: 'JP-13', type: 'prefecture', prefecture: '東京都', displayOrder: 10 },
  { id: 'kanagawa', name: '神奈川県', code: 'JP-14', type: 'prefecture', prefecture: '神奈川県', displayOrder: 11 },
  { id: 'chiba', name: '千葉県', code: 'JP-12', type: 'prefecture', prefecture: '千葉県', displayOrder: 12 },
  { id: 'saitama', name: '埼玉県', code: 'JP-11', type: 'prefecture', prefecture: '埼玉県', displayOrder: 13 },
  { id: 'ibaraki', name: '茨城県', code: 'JP-08', type: 'prefecture', prefecture: '茨城県', displayOrder: 14 },
  { id: 'tochigi', name: '栃木県', code: 'JP-09', type: 'prefecture', prefecture: '栃木県', displayOrder: 15 },
  { id: 'gunma', name: '群馬県', code: 'JP-10', type: 'prefecture', prefecture: '群馬県', displayOrder: 16 },
  
  // 関西地方
  { id: 'osaka', name: '大阪府', code: 'JP-27', type: 'prefecture', prefecture: '大阪府', displayOrder: 20 },
  { id: 'kyoto', name: '京都府', code: 'JP-26', type: 'prefecture', prefecture: '京都府', displayOrder: 21 },
  { id: 'hyogo', name: '兵庫県', code: 'JP-28', type: 'prefecture', prefecture: '兵庫県', displayOrder: 22 },
  { id: 'nara', name: '奈良県', code: 'JP-29', type: 'prefecture', prefecture: '奈良県', displayOrder: 23 },
  { id: 'wakayama', name: '和歌山県', code: 'JP-30', type: 'prefecture', prefecture: '和歌山県', displayOrder: 24 },
  { id: 'shiga', name: '滋賀県', code: 'JP-25', type: 'prefecture', prefecture: '滋賀県', displayOrder: 25 },
  
  // 中部地方
  { id: 'aichi', name: '愛知県', code: 'JP-23', type: 'prefecture', prefecture: '愛知県', displayOrder: 30 },
  { id: 'shizuoka', name: '静岡県', code: 'JP-22', type: 'prefecture', prefecture: '静岡県', displayOrder: 31 },
  { id: 'gifu', name: '岐阜県', code: 'JP-21', type: 'prefecture', prefecture: '岐阜県', displayOrder: 32 },
  { id: 'mie', name: '三重県', code: 'JP-24', type: 'prefecture', prefecture: '三重県', displayOrder: 33 },
  { id: 'nagano', name: '長野県', code: 'JP-20', type: 'prefecture', prefecture: '長野県', displayOrder: 34 },
  { id: 'yamanashi', name: '山梨県', code: 'JP-19', type: 'prefecture', prefecture: '山梨県', displayOrder: 35 },
  { id: 'ishikawa', name: '石川県', code: 'JP-17', type: 'prefecture', prefecture: '石川県', displayOrder: 36 },
  { id: 'fukui', name: '福井県', code: 'JP-18', type: 'prefecture', prefecture: '福井県', displayOrder: 37 },
  { id: 'toyama', name: '富山県', code: 'JP-16', type: 'prefecture', prefecture: '富山県', displayOrder: 38 },
  { id: 'niigata', name: '新潟県', code: 'JP-15', type: 'prefecture', prefecture: '新潟県', displayOrder: 39 },
  
  // 九州・沖縄地方
  { id: 'fukuoka', name: '福岡県', code: 'JP-40', type: 'prefecture', prefecture: '福岡県', displayOrder: 40 },
  { id: 'saga', name: '佐賀県', code: 'JP-41', type: 'prefecture', prefecture: '佐賀県', displayOrder: 41 },
  { id: 'nagasaki', name: '長崎県', code: 'JP-42', type: 'prefecture', prefecture: '長崎県', displayOrder: 42 },
  { id: 'kumamoto', name: '熊本県', code: 'JP-43', type: 'prefecture', prefecture: '熊本県', displayOrder: 43 },
  { id: 'oita', name: '大分県', code: 'JP-44', type: 'prefecture', prefecture: '大分県', displayOrder: 44 },
  { id: 'miyazaki', name: '宮崎県', code: 'JP-45', type: 'prefecture', prefecture: '宮崎県', displayOrder: 45 },
  { id: 'kagoshima', name: '鹿児島県', code: 'JP-46', type: 'prefecture', prefecture: '鹿児島県', displayOrder: 46 },
  { id: 'okinawa', name: '沖縄県', code: 'JP-47', type: 'prefecture', prefecture: '沖縄県', displayOrder: 47 },
  
  // 東北地方
  { id: 'miyagi', name: '宮城県', code: 'JP-04', type: 'prefecture', prefecture: '宮城県', displayOrder: 50 },
  { id: 'fukushima', name: '福島県', code: 'JP-07', type: 'prefecture', prefecture: '福島県', displayOrder: 51 },
  { id: 'yamagata', name: '山形県', code: 'JP-06', type: 'prefecture', prefecture: '山形県', displayOrder: 52 },
  { id: 'iwate', name: '岩手県', code: 'JP-03', type: 'prefecture', prefecture: '岩手県', displayOrder: 53 },
  { id: 'akita', name: '秋田県', code: 'JP-05', type: 'prefecture', prefecture: '秋田県', displayOrder: 54 },
  { id: 'aomori', name: '青森県', code: 'JP-02', type: 'prefecture', prefecture: '青森県', displayOrder: 55 },
  
  // 北海道・中国・四国
  { id: 'hokkaido', name: '北海道', code: 'JP-01', type: 'prefecture', prefecture: '北海道', displayOrder: 60 },
  { id: 'hiroshima', name: '広島県', code: 'JP-34', type: 'prefecture', prefecture: '広島県', displayOrder: 61 },
  { id: 'okayama', name: '岡山県', code: 'JP-33', type: 'prefecture', prefecture: '岡山県', displayOrder: 62 },
  { id: 'yamaguchi', name: '山口県', code: 'JP-35', type: 'prefecture', prefecture: '山口県', displayOrder: 63 },
  { id: 'tottori', name: '鳥取県', code: 'JP-31', type: 'prefecture', prefecture: '鳥取県', displayOrder: 64 },
  { id: 'shimane', name: '島根県', code: 'JP-32', type: 'prefecture', prefecture: '島根県', displayOrder: 65 },
  { id: 'tokushima', name: '徳島県', code: 'JP-36', type: 'prefecture', prefecture: '徳島県', displayOrder: 66 },
  { id: 'kagawa', name: '香川県', code: 'JP-37', type: 'prefecture', prefecture: '香川県', displayOrder: 67 },
  { id: 'ehime', name: '愛媛県', code: 'JP-38', type: 'prefecture', prefecture: '愛媛県', displayOrder: 68 },
  { id: 'kochi', name: '高知県', code: 'JP-39', type: 'prefecture', prefecture: '高知県', displayOrder: 69 }
]

// GET: 地域一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'prefecture', 'nationwide', 'remote'
    const popular = searchParams.get('popular') === 'true'

    let filteredRegions = REGIONS_DATA

    // タイプフィルター
    if (type) {
      filteredRegions = filteredRegions.filter(region => region.type === type)
    }

    // 人気地域フィルター（主要都市のみ）
    if (popular) {
      const popularIds = ['all', 'remote', 'tokyo', 'osaka', 'aichi', 'fukuoka', 'hokkaido', 'miyagi', 'hiroshima']
      filteredRegions = filteredRegions.filter(region => popularIds.includes(region.id))
    }

    // 表示順でソート
    filteredRegions.sort((a, b) => a.displayOrder - b.displayOrder)

    // 地方別にグループ化
    const grouped = {
      special: filteredRegions.filter(r => ['nationwide', 'remote'].includes(r.type)),
      kanto: filteredRegions.filter(r => ['tokyo', 'kanagawa', 'chiba', 'saitama', 'ibaraki', 'tochigi', 'gunma'].includes(r.id)),
      kansai: filteredRegions.filter(r => ['osaka', 'kyoto', 'hyogo', 'nara', 'wakayama', 'shiga'].includes(r.id)),
      chubu: filteredRegions.filter(r => ['aichi', 'shizuoka', 'gifu', 'mie', 'nagano', 'yamanashi', 'ishikawa', 'fukui', 'toyama', 'niigata'].includes(r.id)),
      kyushu: filteredRegions.filter(r => ['fukuoka', 'saga', 'nagasaki', 'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa'].includes(r.id)),
      tohoku: filteredRegions.filter(r => ['miyagi', 'fukushima', 'yamagata', 'iwate', 'akita', 'aomori'].includes(r.id)),
      others: filteredRegions.filter(r => ['hokkaido', 'hiroshima', 'okayama', 'yamaguchi', 'tottori', 'shimane', 'tokushima', 'kagawa', 'ehime', 'kochi'].includes(r.id))
    }

    return createSuccessResponse({
      regions: filteredRegions,
      grouped,
      total: filteredRegions.length
    })

  } catch (error) {
    console.error('Regions API error:', error)
    return createErrorResponse('地域一覧の取得中にエラーが発生しました', { status: 500 })
  }
}