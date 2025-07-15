#!/usr/bin/env node

/**
 * プロフィール画像URL保存状況の確認
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAvatarUrls() {
  console.log('🖼️  プロフィール画像URL保存状況確認\n')
  
  try {
    // CFOプロフィールの画像URL確認
    console.log('👤 CFOプロフィールの画像URL確認:')
    const { data: cfoProfiles, error: cfoError } = await supabase
      .from('cfo_profiles')
      .select('cfo_user_id, cfo_name, cfo_display_name, avatar_url')
      .order('created_at', { ascending: false })
    
    if (cfoError) {
      console.error('❌ CFOプロフィール取得エラー:', cfoError.message)
    } else {
      console.log(`📊 CFOプロフィール数: ${cfoProfiles.length}`)
      cfoProfiles.forEach((profile, index) => {
        const hasAvatar = profile.avatar_url && profile.avatar_url.trim() !== ''
        const status = hasAvatar ? '✅' : '❌'
        console.log(`   ${status} ${profile.cfo_display_name || profile.cfo_name || 'Unknown'} (${profile.cfo_user_id})`)
        if (hasAvatar) {
          console.log(`      画像URL: ${profile.avatar_url}`)
        }
      })
    }
    
    console.log('\n🏢 企業プロフィールの画像URL確認:')
    const { data: bizProfiles, error: bizError } = await supabase
      .from('biz_profiles')
      .select('biz_user_id, biz_company_name, avatar_url')
      .order('created_at', { ascending: false })
    
    if (bizError) {
      console.error('❌ 企業プロフィール取得エラー:', bizError.message)
    } else {
      console.log(`📊 企業プロフィール数: ${bizProfiles.length}`)
      bizProfiles.forEach((profile, index) => {
        const hasAvatar = profile.avatar_url && profile.avatar_url.trim() !== ''
        const status = hasAvatar ? '✅' : '❌'
        console.log(`   ${status} ${profile.biz_company_name || 'Unknown'} (${profile.biz_user_id})`)
        if (hasAvatar) {
          console.log(`      画像URL: ${profile.avatar_url}`)
        }
      })
    }
    
    // ストレージバケット確認
    console.log('\n📁 ストレージバケット確認:')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ バケット取得エラー:', bucketsError.message)
    } else {
      console.log(`📊 バケット数: ${buckets.length}`)
      for (const bucket of buckets) {
        console.log(`   📦 ${bucket.name} (${bucket.public ? 'パブリック' : 'プライベート'})`)
        
        // プロフィール画像関連のバケットのファイル一覧
        if (bucket.name.includes('profile') || bucket.name.includes('logo')) {
          try {
            const { data: files, error: filesError } = await supabase.storage
              .from(bucket.name)
              .list('profiles', { limit: 10 })
            
            if (filesError) {
              console.log(`      ⚠️ ファイル一覧取得エラー: ${filesError.message}`)
            } else {
              console.log(`      📄 ファイル数: ${files ? files.length : 0}`)
              if (files && files.length > 0) {
                files.slice(0, 3).forEach(file => {
                  console.log(`         - ${file.name} (${file.metadata?.size || 'Unknown size'})`)
                })
                if (files.length > 3) {
                  console.log(`         ... 他 ${files.length - 3} ファイル`)
                }
              }
            }
          } catch (error) {
            console.log(`      ⚠️ ファイル確認エラー: ${error.message}`)
          }
        }
      }
    }
    
    // 最近登録されたユーザーの詳細確認
    console.log('\n🔍 最近のユーザー登録詳細確認:')
    const { data: recentCfos, error: recentError } = await supabase
      .from('cfo_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (recentError) {
      console.error('❌ 最近のCFO取得エラー:', recentError.message)
    } else {
      recentCfos.forEach((profile, index) => {
        console.log(`\n👤 CFO ${index + 1}: ${profile.cfo_display_name || profile.cfo_name}`)
        console.log(`   ユーザーID: ${profile.cfo_user_id}`)
        console.log(`   作成日時: ${new Date(profile.created_at).toLocaleString('ja-JP')}`)
        console.log(`   画像URL: ${profile.avatar_url || '未設定'}`)
        console.log(`   名前: ${profile.cfo_name || '未設定'}`)
        console.log(`   居住地: ${profile.cfo_location || '未設定'}`)
        console.log(`   保有資格: ${profile.cfo_certifications || '未設定'}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 確認処理エラー:', error.message)
  }
}

// 実行
if (require.main === module) {
  checkAvatarUrls()
}

module.exports = { checkAvatarUrls }