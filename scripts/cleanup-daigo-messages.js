// daigo.sato@example.com の重複メッセージクリーンアップスクリプト
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function findUserAndCleanupMessages() {
  try {
    console.log('daigo.sato@example.com のユーザーを検索中...')
    
    // daigo.sato@example.com のユーザーIDを取得
    const { data: users, error: userError } = await supabase
      .from('rextrix_users')
      .select('id, email')
      .eq('email', 'daigo.sato@example.com')
    
    if (userError) {
      console.error('ユーザー検索エラー:', userError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('daigo.sato@example.com のユーザーが見つかりません')
      return
    }
    
    const user = users[0]
    console.log(`✓ ユーザーが見つかりました: ${user.email}`)
    console.log(`ユーザーID: ${user.id}`)
    
    // このユーザーが参加している会話を検索
    const { data: conversations, error: convError } = await supabase
      .from('rextrix_conversations')
      .select('id, participant1_id, participant2_id')
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
    
    if (convError) {
      console.error('会話検索エラー:', convError)
      return
    }
    
    console.log(`✓ ${conversations.length}件の会話が見つかりました`)
    
    let totalDuplicatesRemoved = 0
    
    // 各会話の重複メッセージをチェック
    for (const conversation of conversations) {
      console.log(`\n会話 ${conversation.id} をチェック中...`)
      
      // この会話のメッセージを取得
      const { data: messages, error: msgError } = await supabase
        .from('rextrix_messages')
        .select('id, content, sender_id, sent_at')
        .eq('conversation_id', conversation.id)
        .order('sent_at', { ascending: true })
      
      if (msgError) {
        console.error('メッセージ取得エラー:', msgError)
        continue
      }
      
      console.log(`  ${messages.length}件のメッセージがあります`)
      
      // 同じコンテンツと送信者の重複メッセージを検索
      const contentGroups = {}
      
      messages.forEach(msg => {
        const key = `${msg.content}-${msg.sender_id}`
        if (!contentGroups[key]) {
          contentGroups[key] = []
        }
        contentGroups[key].push(msg)
      })
      
      // 重複があるグループを処理
      for (const [key, group] of Object.entries(contentGroups)) {
        if (group.length > 1) {
          console.log(`  重複メッセージ発見: "${group[0].content.substring(0, 50)}..." (${group.length}件)`)
          
          // 最初のメッセージ以外を削除
          const messageIdsToDelete = group.slice(1).map(msg => msg.id)
          
          const { error: deleteError } = await supabase
            .from('rextrix_messages')
            .delete()
            .in('id', messageIdsToDelete)
          
          if (deleteError) {
            console.error('  削除エラー:', deleteError)
          } else {
            console.log(`  ✓ ${messageIdsToDelete.length}件の重複メッセージを削除しました`)
            totalDuplicatesRemoved += messageIdsToDelete.length
          }
        }
      }
    }
    
    console.log(`\n=== クリーンアップ完了 ===`)
    console.log(`合計 ${totalDuplicatesRemoved}件の重複メッセージを削除しました`)
    
  } catch (error) {
    console.error('クリーンアップエラー:', error)
  }
}

// スクリプト実行
findUserAndCleanupMessages().then(() => {
  console.log('処理完了')
  process.exit(0)
})