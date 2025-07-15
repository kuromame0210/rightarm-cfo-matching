#!/usr/bin/env node

/**
 * 奥田豊さんのCFOプロフィールを作成するスクリプト
 * cfo_data.mdの情報を基に完全なプロフィールを登録
 */

const { createClient } = require('@supabase/supabase-js')
const { v4: uuidv4 } = require('uuid')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createOkudaProfile() {
  console.log('🏗️  奥田豊さんのCFOプロフィールを作成中...\n')
  
  try {
    // まずSupabase Authにユーザーを作成
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'okuda@example.com',
      email_confirm: true,
      password: 'temp123456'
    });

    if (authError) {
      console.error('❌ Auth ユーザー作成エラー:', authError);
      return;
    }

    console.log('✅ Auth ユーザーが作成されました:', authUser.user.id);
    const userId = authUser.user.id;
    // 奥田さんの詳細情報（cfo_data.mdから）
    const okudaProfile = {
      cfo_user_id: userId, // 作成したAuth ユーザーのIDを使用
      cfo_name: '奥田豊',
      cfo_display_name: '奥田豊',
      cfo_location: '奈良県生駒市',
      cfo_availability: '週２日・10時から18時',
      cfo_fee_min: 5000, // 時給5,000円以上
      cfo_fee_max: null,
      cfo_skills: [
        'IPO支援',
        '事業計画策定',
        '資金調達',
        'M&A支援',
        '管理会計導入',
        'PMI支援',
        '補助金申請',
        '銀行業務',
        '経理業務',
        '法人融資',
        '財務コンサルティング',
        '工場経理',
        '本社経理',
        '中小企業診断',
        '経営指導',
        '事業再生',
        '財務分析',
        '予算管理',
        'キャッシュフロー管理',
        '内部統制',
        '監査対応',
        '税務対応',
        '決算業務'
      ],
      cfo_raw_profile: `【名前】
奥田　豊

【居住地】
奈良県生駒市

【週の稼働可能時間】
週２日・10時から18時）

【経歴】
2006年〜2008年:株式会社りそな銀行で法人融資業務
2008年〜2016年:日本発条株式会社で本社経理及び工場経理業務
2016年～2024年：エスネットワークス株式会社で財務コンサル及び（管理部）経理部門長業務

【可能な業務】
IPO支援／事業計画策定/資金調達／M&A支援／管理会計導入／PMI支援/補助金申請

【保有資格】
中小企業診断士、日商簿記１級

【想定月額報酬】
成果報酬応相談、5,000円/h以上

【対応可能エリア】
全国リモートOK、大阪近郊は対面可

【紹介文】
銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。
また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。`,
      cfo_compensation: '成果報酬応相談、5,000円/h以上',
      cfo_possible_tasks: 'IPO支援／事業計画策定/資金調達／M&A支援／管理会計導入／PMI支援/補助金申請',
      cfo_certifications: '中小企業診断士、日商簿記１級',
      cfo_working_areas: '全国リモートOK、大阪近郊は対面可',
      cfo_introduction: '銀行及び事業会社を経験しているので、資金調達については両社の立場や状況を理解しております。また、経理部門長としてIPOを達成した経験があり、IPO支援をはじめ質の高い事業計画策定等も対応可能となります。',
      avatar_url: null
    }

    // データベースに挿入
    const { data, error } = await supabase
      .from('cfo_profiles')
      .insert([okudaProfile])
      .select()

    if (error) {
      console.error('❌ プロフィール作成エラー:', error)
      return
    }

    console.log('✅ 奥田豊さんのプロフィールが正常に作成されました!')
    console.log('📋 登録内容:')
    console.log(`   Auth User ID: ${userId}`)
    console.log(`   CFO User ID: ${okudaProfile.cfo_user_id}`)
    console.log(`   名前: ${okudaProfile.cfo_name}`)
    console.log(`   表示名: ${okudaProfile.cfo_display_name}`)
    console.log(`   居住地: ${okudaProfile.cfo_location}`)
    console.log(`   稼働: ${okudaProfile.cfo_availability}`)
    console.log(`   時給: ${okudaProfile.cfo_fee_min}円以上`)
    console.log(`   スキル数: ${okudaProfile.cfo_skills.length}`)
    console.log(`   報酬: ${okudaProfile.cfo_compensation}`)
    console.log(`   資格: ${okudaProfile.cfo_certifications}`)
    console.log(`   対応エリア: ${okudaProfile.cfo_working_areas}`)
    
    console.log('\n🎯 主な専門分野:')
    okudaProfile.cfo_skills.slice(0, 10).forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill}`)
    })
    if (okudaProfile.cfo_skills.length > 10) {
      console.log(`   ... 他 ${okudaProfile.cfo_skills.length - 10} 項目`)
    }

  } catch (error) {
    console.error('❌ 処理エラー:', error)
  }
}

// 実行
if (require.main === module) {
  createOkudaProfile()
}

module.exports = { createOkudaProfile }