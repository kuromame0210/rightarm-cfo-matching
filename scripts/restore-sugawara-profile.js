#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function restoreSugawaraProfile() {
  try {
    console.log('🔄 菅原大源さんのプロフィールを復元します...\n')
    
    // 菅原大源さんのデータ（cfo.mdから）
    const sugawaraData = {
      cfo_user_id: 'new-sugawara-id-' + Date.now(),
      cfo_name: '菅原大源',
      cfo_display_name: '菅原大源',
      cfo_location: 'アメリカ・カリフォルニア州',
      cfo_availability: '週4日 4時間程度',
      cfo_compensation: '月15万円〜、週4日 1時間/日 16時間/月　稼働想定',
      cfo_skills: ['事業計画作成', '財務モデル作成', '資金調達戦略支援', '補助金申請支援', 'M&A支援', '経営管理'],
      cfo_possible_tasks: '事業計画作成、財務モデル作成、資金調達戦略支援、補助金申請支援、M&A支援、経営指標(財務・操業)の管理・考察・経営改善に向けた提言',
      cfo_certifications: '米国公認会計士・簿記2級・FP2級',
      cfo_working_areas: '全国リモートOK',
      cfo_introduction: '戦略と財務両輪の視点で事業成長を支援させて頂きます。',
      cfo_raw_profile: `2017年〜2023年:住友商事株式会社でアルミ業界における海外新規事業投資業務
2023年〜2024年:KPMG FASでM&Aアドバイザリー業務
2025年〜: Air Water Americaにて海外事業会社の経営管理・経営支援業務、新規事業投資業務`,
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // まず、対応するauth.usersレコードを作成
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: 'sugawara.taigen@example.com',
      email_confirm: true,
      user_metadata: {
        name: '菅原大源',
        role: 'cfo'
      }
    })

    if (userError) {
      console.error('ユーザー作成エラー:', userError)
      return
    }

    console.log('✅ 新しいユーザーを作成しました:', newUser.user.id)
    
    // プロフィールデータのuser_idを更新
    sugawaraData.cfo_user_id = newUser.user.id

    // CFOプロフィールを作成
    const { data: newProfile, error: profileError } = await supabase
      .from('cfo_profiles')
      .insert([sugawaraData])
      .select()

    if (profileError) {
      console.error('プロフィール作成エラー:', profileError)
      return
    }

    console.log('✅ 菅原大源さんのプロフィールを復元しました！')
    console.log('新しいID:', newProfile[0].cfo_user_id)
    console.log('メールアドレス:', 'sugawara.taigen@example.com')
    console.log('')

    // 最終確認
    const { data: finalProfiles, error: finalError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name, created_at')
      .order('created_at', { ascending: false })

    if (finalError) {
      console.error('最終確認エラー:', finalError)
      return
    }

    console.log('=== 復元後のプロフィール一覧 ===')
    console.log(`総件数: ${finalProfiles.length}`)
    finalProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.cfo_name} (${profile.cfo_user_id})`)
    })

    console.log('')
    console.log('🎉 菅原大源さんの復元が完了しました！')
    console.log('これで6名のCFOプロフィールが揃いました。')

  } catch (error) {
    console.error('エラー:', error)
  }
}

restoreSugawaraProfile();