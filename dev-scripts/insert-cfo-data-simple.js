// CFOデータ直接挿入スクリプト (Auth認証なし)
// データベースに直接CFOデータを挿入します

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// CFOデータ読み込み
const fs = require('fs')
const path = require('path')

function loadCFOData() {
  try {
    const dataPath = path.join(__dirname, 'cfo-data.json')
    const rawData = fs.readFileSync(dataPath, 'utf8')
    const { cfos } = JSON.parse(rawData)
    return cfos
  } catch (error) {
    console.error('CFOデータの読み込みエラー:', error)
    return []
  }
}

async function insertCFODataDirectly() {
  console.log('🚀 CFOデータ直接挿入を開始します...\n')
  
  const cfoData = loadCFOData()
  
  if (cfoData.length === 0) {
    console.error('❌ CFOデータが見つかりません')
    return
  }
  
  console.log(`📋 ${cfoData.length}件のCFOデータを処理します\n`)
  
  for (let i = 0; i < cfoData.length; i++) {
    const cfo = cfoData[i]
    
    try {
      console.log(`\n📝 ${i + 1}/${cfoData.length}: ${cfo.profile.displayName} (${cfo.profile.nickname})`)
      
      // 1. rextrix_users テーブルに挿入
      console.log('  👤 ユーザーレコード作成中...')
      const { data: userData, error: userError } = await supabase
        .from('rextrix_users')
        .insert({
          email: cfo.profile.email,
          user_type: 'cfo',
          status: 'active',
          email_verified: true,
          auth_provider: 'manual', // 手動挿入を示す
          is_migrated: true,
          migrated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (userError) {
        console.error(`    ❌ ユーザー作成エラー:`, userError.message)
        continue
      }
      
      console.log(`    ✅ ユーザーID: ${userData.id}`)
      
      // 2. rextrix_user_profiles テーブルに挿入
      console.log('  📋 プロフィール作成中...')
      const { error: profileError } = await supabase
        .from('rextrix_user_profiles')
        .insert({
          user_id: userData.id,
          display_name: cfo.profile.displayName,
          nickname: cfo.profile.nickname,
          introduction: cfo.profile.introduction,
          region: cfo.profile.region,
          work_preference: cfo.profile.workPreference,
          compensation_range: cfo.profile.compensationRange
        })
      
      if (profileError) {
        console.error(`    ❌ プロフィール作成エラー:`, profileError.message)
        continue
      }
      
      console.log(`    ✅ プロフィール作成完了`)
      
      // 3. rextrix_cfos テーブルに挿入
      console.log('  💼 CFOレコード作成中...')
      const { data: cfoRecord, error: cfoError } = await supabase
        .from('rextrix_cfos')
        .insert({
          user_id: userData.id,
          experience_years: cfo.experience.years,
          experience_summary: cfo.experience.summary,
          achievements: cfo.experience.achievements,
          certifications: cfo.certifications,
          is_available: true,
          max_concurrent_projects: 3,
          rating: 4.5,
          review_count: 0
        })
        .select()
        .single()
      
      if (cfoError) {
        console.error(`    ❌ CFO作成エラー:`, cfoError.message)
        continue
      }
      
      console.log(`    ✅ CFOレコードID: ${cfoRecord.id}`)
      
      // 4. スキル情報の処理（オプション）
      if (cfo.skills && cfo.skills.length > 0) {
        console.log(`  🏷️  スキル情報処理中... (${cfo.skills.length}件)`)
        
        for (const skill of cfo.skills) {
          // スキルタグが存在するか確認
          const { data: existingTag } = await supabase
            .from('rextrix_skill_tags')
            .select('id')
            .eq('name', skill.name)
            .single()
          
          let skillTagId = existingTag?.id
          
          // スキルタグが存在しない場合は作成
          if (!skillTagId) {
            const { data: newTag, error: tagError } = await supabase
              .from('rextrix_skill_tags')
              .insert({
                name: skill.name,
                category: 'general'
              })
              .select('id')
              .single()
            
            if (tagError) {
              console.error(`      ❌ スキルタグ作成エラー (${skill.name}):`, tagError.message)
              continue
            }
            
            skillTagId = newTag.id
            console.log(`      ➕ 新規スキルタグ作成: ${skill.name}`)
          }
          
          // CFOスキル関連付け
          const { error: skillError } = await supabase
            .from('rextrix_cfo_skills')
            .insert({
              cfo_id: cfoRecord.id,
              skill_tag_id: skillTagId,
              proficiency_level: skill.proficiency || 'intermediate'
            })
          
          if (skillError) {
            console.error(`      ❌ スキル関連付けエラー (${skill.name}):`, skillError.message)
          }
        }
        
        console.log(`    ✅ スキル処理完了`)
      }
      
      console.log(`  🎉 ${cfo.profile.displayName} の挿入完了!`)
      
    } catch (error) {
      console.error(`  💥 ${cfo.profile.displayName} の処理中にエラー:`, error.message)
    }
  }
  
  console.log('\n🏁 CFOデータ直接挿入完了!')
  
  // 挿入結果の確認
  console.log('\n📊 挿入結果確認...')
  const { count: userCount } = await supabase
    .from('rextrix_users')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', 'cfo')
  
  const { count: cfoCount } = await supabase
    .from('rextrix_cfos')
    .select('*', { count: 'exact', head: true })
  
  console.log(`✅ CFOユーザー: ${userCount}件`)
  console.log(`✅ CFOレコード: ${cfoCount}件`)
}

// 実行前確認
async function confirmExecution() {
  const { count } = await supabase
    .from('rextrix_cfos')
    .select('*', { count: 'exact', head: true })
  
  if (count > 0) {
    console.log(`⚠️  データベースには既に${count}件のCFOデータが存在します`)
    console.log('継続すると重複データが作成される可能性があります')
    console.log('続行するには、スクリプトを再実行してください')
    return false
  }
  
  return true
}

// メイン実行
async function main() {
  try {
    const canProceed = await confirmExecution()
    if (canProceed) {
      await insertCFODataDirectly()
    }
  } catch (error) {
    console.error('💥 実行エラー:', error)
  }
}

main()