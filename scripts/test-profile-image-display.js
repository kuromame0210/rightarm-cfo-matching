#!/usr/bin/env node

/**
 * プロフィール編集画面での画像表示テスト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testProfileImageDisplay() {
  console.log('🖼️  プロフィール編集画面での画像表示テスト\n')
  
  try {
    // 画像URLが設定されているCFOを取得
    const { data: cfoWithImage, error } = await supabase
      .from('cfo_profiles')
      .select('*')
      .not('avatar_url', 'is', null)
      .neq('avatar_url', '')
      .limit(1)
      .single()
    
    if (error || !cfoWithImage) {
      console.log('❌ 画像URLが設定されているCFOが見つかりません')
      return
    }
    
    console.log('✅ テスト対象CFO:')
    console.log(`   名前: ${cfoWithImage.cfo_display_name || cfoWithImage.cfo_name}`)
    console.log(`   ユーザーID: ${cfoWithImage.cfo_user_id}`)
    console.log(`   画像URL: ${cfoWithImage.avatar_url}`)
    
    // プロフィールAPI経由でデータを取得（フロントエンドと同じ形式）
    console.log('\\n🔍 プロフィールAPI経由でのデータ取得テスト:')
    
    // API呼び出しをシミュレート（内部処理をコピー）
    const profileData = {
      id: cfoWithImage.cfo_user_id,
      email: 'test@example.com', // 実際はauth情報から取得
      name: cfoWithImage.cfo_name,
      displayName: cfoWithImage.cfo_display_name,
      location: cfoWithImage.cfo_location,
      availability: cfoWithImage.cfo_availability,
      skills: cfoWithImage.cfo_skills,
      rawProfile: cfoWithImage.cfo_raw_profile,
      possibleTasks: cfoWithImage.cfo_possible_tasks,
      certifications: cfoWithImage.cfo_certifications,
      compensation: cfoWithImage.cfo_compensation,
      workingAreas: cfoWithImage.cfo_working_areas,
      introduction: cfoWithImage.cfo_introduction,
      avatarUrl: cfoWithImage.avatar_url, // 重要: この部分
      createdAt: cfoWithImage.created_at,
      updatedAt: cfoWithImage.updated_at
    }
    
    console.log('📋 APIレスポンス形式でのデータ:')
    console.log(`   avatarUrl: ${profileData.avatarUrl}`)
    console.log(`   name: ${profileData.name}`)
    console.log(`   displayName: ${profileData.displayName}`)
    
    // フロントエンドでの初期化処理をシミュレート
    console.log('\\n🎨 フロントエンド初期化シミュレーション:')
    
    const formDataSimulation = {
      name: profileData.name || 'Unknown',
      email: profileData.email || '',
      location: profileData.location || '',
      weeklyAvailability: profileData.availability || '',
      career: typeof profileData.rawProfile === 'string' ? profileData.rawProfile : '',
      skills: profileData.skills || [],
      possibleTasksDetail: profileData.possibleTasks || '',
      certifications: profileData.certifications ? profileData.certifications.split('\\n').filter(c => c.trim()) : [],
      compensation: profileData.compensation || '',
      availableAreas: profileData.workingAreas ? profileData.workingAreas.split('\\n').filter(a => a.trim()) : [],
      introduction: profileData.introduction || ''
    }
    
    // 画像URL設定のシミュレート
    const profileImageUrlSimulation = profileData.avatarUrl || profileData.profileImageUrl || null
    
    console.log('✅ シミュレーション結果:')
    console.log(`   フォームデータ設定: ${Object.keys(formDataSimulation).length}項目`)
    console.log(`   画像URL設定: ${profileImageUrlSimulation ? '成功' : '失敗'}`)
    
    if (profileImageUrlSimulation) {
      console.log(`   設定された画像URL: ${profileImageUrlSimulation}`)
      
      // 画像URLの検証
      console.log('\\n🔗 画像URL検証:')
      try {
        const urlCheck = new URL(profileImageUrlSimulation)
        console.log(`   ✅ 有効なURL形式`)
        console.log(`   ホスト: ${urlCheck.hostname}`)
        console.log(`   パス: ${urlCheck.pathname}`)
        
        // 画像へのアクセステスト（HEAD リクエスト）
        const fetch = (await import('node-fetch')).default
        const response = await fetch(profileImageUrlSimulation, { method: 'HEAD' })
        console.log(`   HTTP ステータス: ${response.status}`)
        console.log(`   Content-Type: ${response.headers.get('content-type') || 'Unknown'}`)
        
        if (response.ok) {
          console.log('   ✅ 画像にアクセス可能')
        } else {
          console.log('   ❌ 画像にアクセスできません')
        }
        
      } catch (urlError) {
        console.log(`   ❌ URL検証エラー: ${urlError.message}`)
      }
    } else {
      console.log('   ❌ 画像URLが設定されていません')
      console.log('   原因候補:')
      console.log('   - データベースの avatar_url カラムが空')
      console.log('   - プロフィールAPI のマッピング不正')
      console.log('   - フロントエンド初期化処理の不具合')
    }
    
  } catch (error) {
    console.error('❌ テスト実行エラー:', error.message)
  }
}

// 実行
if (require.main === module) {
  testProfileImageDisplay()
}

module.exports = { testProfileImageDisplay }