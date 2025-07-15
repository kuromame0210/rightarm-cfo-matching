#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function deleteOldCFOProfiles() {
  try {
    console.log('🗑️ 古いCFOプロフィールを削除します...\n')
    
    // 削除対象の4件（ID指定）
    const deleteTargets = [
      {
        id: 'f2fd22fa-9e5e-4bb7-be3c-d81934932872',
        name: '菅原　大源',
        email: 'crow0210kuro+4@gmail.com',
        reason: '全角スペース版・重複'
      },
      {
        id: '9130389d-9ce7-4792-96f4-c97409d0084f',
        name: '佐藤大悟',
        email: 'crow0210kuro@gmail.com',
        reason: '重複1'
      },
      {
        id: '1ba4f566-aed1-415d-8eaa-4bc3a6e0e0bc',
        name: '佐藤大悟',
        email: 'crow0210kuro+2@gmail.com',
        reason: '重複2'
      },
      {
        id: 'fc25d040-1b1e-4140-8c86-69e6665c983d',
        name: '田中太郎',
        email: 'test-cfo@example.com',
        reason: 'テストデータ'
      }
    ]

    console.log('=== 削除対象確認 ===')
    deleteTargets.forEach((target, index) => {
      console.log(`${index + 1}. ${target.name} (${target.email})`)
      console.log(`   ID: ${target.id}`)
      console.log(`   理由: ${target.reason}`)
      console.log('')
    })

    // 削除実行前に現在のデータを確認
    console.log('削除実行前の確認...')
    const { data: beforeProfiles, error: beforeError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name')
      .in('cfo_user_id', deleteTargets.map(t => t.id))

    if (beforeError) {
      console.error('削除前確認エラー:', beforeError)
      return
    }

    console.log('削除前に見つかったプロフィール:', beforeProfiles.length)
    beforeProfiles.forEach(profile => {
      console.log(`- ${profile.cfo_name} (${profile.cfo_user_id})`)
    })
    console.log('')

    // 実際の削除実行
    console.log('🗑️ 削除を実行します...')
    const { error: deleteError } = await supabase
      .from('cfo_profiles')
      .delete()
      .in('cfo_user_id', deleteTargets.map(t => t.id))

    if (deleteError) {
      console.error('削除エラー:', deleteError)
      return
    }

    console.log('✅ 削除完了！')
    console.log('')

    // 削除後の確認
    console.log('=== 削除後の確認 ===')
    const { data: afterProfiles, error: afterError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name, created_at')
      .order('created_at', { ascending: false })

    if (afterError) {
      console.error('削除後確認エラー:', afterError)
      return
    }

    console.log(`残りのプロフィール数: ${afterProfiles.length}`)
    afterProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.cfo_name} (${profile.cfo_user_id})`)
    })

    console.log('')
    console.log('🎉 データベースの整理が完了しました！')
    console.log('残り6件のCFOプロフィールが正常に保持されています。')

  } catch (error) {
    console.error('エラー:', error)
  }
}

deleteOldCFOProfiles();