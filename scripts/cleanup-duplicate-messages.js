// 重複メッセージクリーンアップスクリプト
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupDuplicateMessages() {
  try {
    console.log('重複メッセージをクリーンアップ中...')
    
    // 特定の会話の重複メッセージを削除
    const conversationId = '9d0c9dcb-37cc-4e63-8817-f2303c3d6768'
    const keepMessage = 'こんにちは！よろしくお願いします。'
    
    // 対象会話のメッセージを取得
    const { data: messages, error: fetchError } = await supabase
      .from('rextrix_messages')
      .select('id, content, sent_at')
      .eq('conversation_id', conversationId)
      .eq('content', keepMessage)
      .order('sent_at', { ascending: true })
    
    if (fetchError) {
      console.error('メッセージ取得エラー:', fetchError)
      return
    }
    
    console.log(`${messages.length}件の重複メッセージが見つかりました`)
    
    if (messages.length > 1) {
      // 最初のメッセージ以外を削除
      const messageIdsToDelete = messages.slice(1).map(msg => msg.id)
      
      console.log(`${messageIdsToDelete.length}件のメッセージを削除します...`)
      
      const { error: deleteError } = await supabase
        .from('rextrix_messages')
        .delete()
        .in('id', messageIdsToDelete)
      
      if (deleteError) {
        console.error('削除エラー:', deleteError)
      } else {
        console.log('✓ 重複メッセージの削除が完了しました')
      }
    } else {
      console.log('削除対象のメッセージはありません')
    }
    
  } catch (error) {
    console.error('クリーンアップエラー:', error)
  }
}

// スクリプト実行
cleanupDuplicateMessages().then(() => {
  console.log('クリーンアップ完了')
  process.exit(0)
})