#!/usr/bin/env node

// /api/companies APIの実際のレスポンスを調査し、JSON文字列表示問題を特定するスクリプト
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testCompaniesApiResponse() {
  console.log('🔍 /api/companies APIレスポンス分析開始...\n')
  
  try {
    // 1. 直接Supabaseからデータ取得（APIと同じクエリを実行）
    console.log('📊 1. 直接Supabaseクエリ実行:')
    const { data: bizProfiles, error } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('Supabaseクエリエラー:', error)
      return
    }
    
    console.log(`取得件数: ${bizProfiles?.length || 0}件\n`)
    
    // 2. 各レコードのbiz_raw_profileフィールドを詳しく分析
    bizProfiles?.forEach((profile, index) => {
      console.log(`--- レコード ${index + 1}: ${profile.biz_company_name} ---`)
      console.log(`biz_raw_profileの型: ${typeof profile.biz_raw_profile}`)
      
      if (profile.biz_raw_profile) {
        // 最初の500文字を表示
        const truncated = profile.biz_raw_profile.length > 500 
          ? profile.biz_raw_profile.substring(0, 500) + '...' 
          : profile.biz_raw_profile
        console.log(`内容 (最初の500文字):\n${truncated}`)
        
        // JSON形式かどうか判定
        let isJson = false
        let jsonData = null
        try {
          jsonData = JSON.parse(profile.biz_raw_profile)
          isJson = true
          console.log('✅ JSON形式として解析成功')
          console.log('JSONキー:', Object.keys(jsonData))
          
          // JSONの各フィールドを確認
          Object.entries(jsonData).forEach(([key, value]) => {
            console.log(`  ${key}: ${typeof value === 'string' ? value.substring(0, 100) : value}`)
          })
        } catch (e) {
          console.log('❌ JSON形式ではない（プレーンテキスト）')
        }
        
        console.log('')
      } else {
        console.log('biz_raw_profile: null\n')
      }
    })
    
    // 3. APIと同じデータ変換処理を実行
    console.log('🔄 3. APIと同じデータ変換処理:')
    const companies = (bizProfiles || []).map(profile => ({
      id: profile.biz_user_id,
      userId: profile.biz_user_id,
      companyName: profile.biz_company_name,
      location: profile.biz_location,
      revenueMin: profile.biz_revenue_min,
      revenueMax: profile.biz_revenue_max,
      issues: profile.biz_issues || [],
      description: profile.biz_raw_profile,  // ここが問題のポイント
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      // フロントエンド互換性フィールド
      company_name: profile.biz_company_name,
      business_name: profile.biz_company_name,
      region: profile.biz_location,
      industry: '未設定',
      is_recruiting: true,
      profile_image_url: profile.avatar_url
    }))
    
    console.log('変換後データサンプル:')
    companies.forEach((company, index) => {
      console.log(`\n--- 変換後レコード ${index + 1}: ${company.companyName} ---`)
      console.log(`description の型: ${typeof company.description}`)
      console.log(`description の内容 (最初の200文字):`)
      const desc = company.description || 'null'
      console.log(desc.substring(0, 200))
      
      if (company.description) {
        try {
          const parsed = JSON.parse(company.description)
          console.log('⚠️  descriptionがJSON文字列として格納されている（フロントエンドで問題となる原因）')
          console.log('解析されたJSONキー:', Object.keys(parsed))
        } catch (e) {
          console.log('✅ descriptionは通常のテキスト（問題なし）')
        }
      }
    })
    
    // 4. フロントエンドのformatCompanyData関数をシミュレート
    console.log('\n🎨 4. フロントエンドでの表示処理シミュレート:')
    
    const formatRevenueFromNumbers = (minRevenue, maxRevenue) => {
      if (!minRevenue && !maxRevenue) return '年商未設定'
      
      const formatBillion = (amount) => {
        if (amount >= 100000000) {
          return Math.floor(amount / 100000000) + '億円'
        }
        return Math.floor(amount / 10000) + '万円'
      }
      
      if (minRevenue === maxRevenue) {
        return formatBillion(minRevenue)
      }
      
      return `${formatBillion(minRevenue)}〜${formatBillion(maxRevenue)}`
    }
    
    const formatCompanyData = (company) => {
      return {
        id: company.id || company.biz_user_id,
        companyName: company.companyName || company.biz_company_name || '会社名未設定',
        description: company.description || company.biz_raw_profile || '会社概要未設定',
        revenueRange: formatRevenueFromNumbers(company.biz_revenue_min, company.biz_revenue_max),
        challenges: company.biz_raw_profile ? '詳細は企業概要をご覧ください' : '財務課題未設定',
        postedAt: company.created_at || new Date().toISOString(),
        logo: '🏢'
      }
    }
    
    companies.forEach((company, index) => {
      const formatted = formatCompanyData(company)
      console.log(`\n--- フロントエンド表示データ ${index + 1}: ${formatted.companyName} ---`)
      console.log(`表示される description:`)
      console.log(formatted.description.substring(0, 300))
      
      // ここで、JSON文字列がそのまま表示される問題を確認
      if (formatted.description.startsWith('{')) {
        console.log('🚨 問題発見: descriptionにJSON文字列がそのまま表示される')
        try {
          const jsonData = JSON.parse(formatted.description)
          console.log('  → 本来表示すべき内容:', jsonData.description || jsonData.businessName || 'descriptionフィールドなし')
        } catch (e) {
          console.log('  → JSON解析に失敗')
        }
      }
    })
    
    // 5. 修正案の提示
    console.log('\n💡 5. 修正案:')
    console.log('問題: biz_raw_profileフィールドにJSON文字列とプレーンテキストが混在')
    console.log('解決策: APIレスポンス内でJSON文字列を適切に解析して返す')
    
    const improvedFormatting = companies.map(company => {
      let description = company.description
      
      // JSON文字列の場合は適切に解析
      if (description && description.startsWith('{')) {
        try {
          const jsonData = JSON.parse(description)
          description = jsonData.description || jsonData.businessName || description
        } catch (e) {
          // JSON解析失敗時はそのまま使用
        }
      }
      
      return {
        ...company,
        description: description || '会社概要未設定'
      }
    })
    
    console.log('\n修正後の表示例:')
    improvedFormatting.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName}`)
      console.log(`   説明: ${company.description.substring(0, 150)}...`)
    })
    
  } catch (error) {
    console.error('🚨 分析中にエラーが発生:', error)
  }
}

if (require.main === module) {
  testCompaniesApiResponse()
}

module.exports = { testCompaniesApiResponse }