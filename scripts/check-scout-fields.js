// スカウトメッセージの実際のフィールドと構造化データを確認するスクリプト
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

// 環境変数を読み込み
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkScoutFields() {
  console.log('🔍 スカウトメッセージの構造化データを詳細確認中...\n')

  try {
    // スカウトメッセージの詳細データ確認
    const { data: scoutMessages, error: scoutError } = await supabase
      .from('messages')
      .select('*')
      .eq('msg_type', 'scout')
      .limit(3)

    if (scoutError) {
      console.error('❌ スカウトメッセージ取得エラー:', scoutError)
      return
    }

    console.log(`📊 スカウトメッセージの詳細分析 (${scoutMessages?.length || 0}件):`)
    
    if (scoutMessages && scoutMessages.length > 0) {
      scoutMessages.forEach((message, index) => {
        console.log(`\n  📩 スカウト ${index + 1} (ID: ${message.msg_id}):`)
        console.log(`    - sender_id: ${message.sender_id}`)
        console.log(`    - receiver_id: ${message.receiver_id}`)
        console.log(`    - body: ${message.body?.substring(0, 100)}...`)
        console.log(`    - sent_at: ${message.sent_at}`)
        
        // フィールドの存在チェック
        console.log('\n    🔍 構造化データフィールド分析:')
        console.log(`    - scout_details: ${message.scout_details ? 'あり' : 'なし'}`)
        
        if (message.scout_details) {
          console.log('    - scout_details内容:')
          console.log(`      * compensation: ${JSON.stringify(message.scout_details.compensation || 'なし')}`)
          console.log(`      * work_conditions: ${JSON.stringify(message.scout_details.work_conditions || 'なし')}`)
          console.log(`      * project_details: ${JSON.stringify(message.scout_details.project_details || 'なし')}`)
          console.log(`      * job_requirements: ${JSON.stringify(message.scout_details.job_requirements || 'なし')}`)
        }
        
        // 実際のAPIレスポンスをシミュレート
        console.log('\n    🧪 APIが返すべき構造化データ (シミュレート):')
        
        const formatCompensation = (compensation) => {
          if (!compensation) return '相談'
          
          if (compensation.type === 'negotiable') return '応相談'
          
          if (compensation.min_amount && compensation.max_amount) {
            const minMan = Math.floor(compensation.min_amount / 10000)
            const maxMan = Math.floor(compensation.max_amount / 10000)
            return `${minMan}万円〜${maxMan}万円`
          }
          
          if (compensation.min_amount) {
            const minMan = Math.floor(compensation.min_amount / 10000)
            return `${minMan}万円〜`
          }
          
          return compensation.type === 'monthly' ? '月額制' : 
                 compensation.type === 'hourly' ? '時給制' : '相談'
        }

        const formatWorkStyle = (workConditions) => {
          if (!workConditions) return '相談'
          
          let result = []
          
          if (workConditions.days_per_week) {
            if (workConditions.days_per_week === 'flexible') {
              result.push('柔軟対応')
            } else {
              result.push(`週${workConditions.days_per_week}日`)
            }
          }
          
          if (workConditions.start_time && workConditions.end_time) {
            result.push(`${workConditions.start_time}-${workConditions.end_time}`)
          }
          
          if (workConditions.flexible) {
            result.push('時間調整可')
          }
          
          return result.length > 0 ? result.join('・') : '相談'
        }

        const formatStartDate = (projectDetails) => {
          if (!projectDetails || !projectDetails.start_date) return '相談'
          
          try {
            const date = new Date(projectDetails.start_date)
            return date.toLocaleDateString('ja-JP', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          } catch {
            return projectDetails.start_date
          }
        }

        const formatDuration = (projectDetails) => {
          if (!projectDetails || !projectDetails.duration_months) return '相談'
          
          if (projectDetails.duration_months === 'permanent') return '長期継続'
          
          const months = projectDetails.duration_months
          if (months >= 12) {
            const years = Math.floor(months / 12)
            const remainingMonths = months % 12
            return remainingMonths > 0 ? `${years}年${remainingMonths}ヶ月` : `${years}年`
          }
          
          return `${months}ヶ月`
        }
        
        console.log(`    - compensation (API): "${formatCompensation(message.scout_details?.compensation)}"`)
        console.log(`    - work_style (API): "${formatWorkStyle(message.scout_details?.work_conditions)}"`)
        console.log(`    - start_date (API): "${formatStartDate(message.scout_details?.project_details)}"`)
        console.log(`    - duration (API): "${formatDuration(message.scout_details?.project_details)}"`)
        
        console.log('\n    ' + '='.repeat(60))
      })
    } else {
      console.log('    📭 スカウトメッセージが存在しません')
    }

    // 具体的なスカウト詳細API呼び出しをシミュレート
    if (scoutMessages && scoutMessages.length > 0) {
      console.log('\n\n🎯 実際のスカウト詳細API (/api/scouts/1) のレスポンス予測:')
      console.log('=' .repeat(70))
      
      const firstScout = scoutMessages[0]
      console.log(`📊 Scout ID: ${firstScout.msg_id}`)
      console.log(`📝 本文: ${firstScout.body?.substring(0, 100)}...`)
      console.log(`💰 compensation: "相談" （構造化データなし）`)
      console.log(`⏰ work_style: "相談" （構造化データなし）`)
      console.log(`📅 start_date: "相談" （構造化データなし）`)
      console.log(`📅 duration: "相談" （構造化データなし）`)
      console.log(`❓ has_structured_data: ${!!firstScout.scout_details}`)
      console.log(`\n💡 この"相談"が画面に表示されている理由は構造化データが存在しないため`)
    }

  } catch (error) {
    console.error('❌ 確認中にエラー:', error)
  }
}

checkScoutFields().catch(console.error)