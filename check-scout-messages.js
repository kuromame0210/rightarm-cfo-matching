const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://hkqkrwqfthzytktxkxtb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrcWtyd3FmdGh6eXRrdHh4dGIiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM0MjQ4MjcwLCJleHAiOjIwNDk4MjQyNzB9.4ILJoqrFGYbYBKHjyoA_mDJsxKCmPYWKIGcHJKdFZps'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkScoutMessages() {
  const userId = '9130389d-9ce7-4792-96f4-c97409d0084f'
  
  console.log('現在のユーザーIDが受信したスカウトメッセージを確認中...')
  
  // 受信したスカウトメッセージを確認
  const { data: receivedScouts, error: receivedError } = await supabase
    .from('rextrix_messages')
    .select('*')
    .eq('receiver_id', userId)
    .eq('msg_type', 'scout')
    .order('created_at', { ascending: false })
  
  if (receivedError) {
    console.error('受信スカウト確認エラー:', receivedError)
    return
  }
  
  console.log('受信したスカウトメッセージ:', receivedScouts)
  console.log('受信スカウト数:', receivedScouts?.length || 0)
  
  if (receivedScouts && receivedScouts.length > 0) {
    console.log('\n=== 受信スカウトの詳細 ===')
    receivedScouts.forEach((scout, index) => {
      console.log(`スカウト ${index + 1}:`)
      console.log(`  - ID: ${scout.id}`)
      console.log(`  - 送信者: ${scout.sender_id}`)
      console.log(`  - メッセージ: ${scout.message}`)
      console.log(`  - ステータス: ${scout.status}`)
      console.log(`  - 作成日時: ${scout.created_at}`)
      console.log('---')
    })
  }
  
  // 送信したスカウトメッセージも確認
  const { data: sentScouts, error: sentError } = await supabase
    .from('rextrix_messages')
    .select('*')
    .eq('sender_id', userId)
    .eq('msg_type', 'scout')
    .order('created_at', { ascending: false })
  
  if (sentError) {
    console.error('送信スカウト確認エラー:', sentError)
    return
  }
  
  console.log('\n送信したスカウトメッセージ:', sentScouts)
  console.log('送信スカウト数:', sentScouts?.length || 0)
  
  // 全てのスカウトメッセージを確認
  const { data: allScouts, error: allError } = await supabase
    .from('rextrix_messages')
    .select('*')
    .eq('msg_type', 'scout')
    .order('created_at', { ascending: false })
  
  if (allError) {
    console.error('全スカウト確認エラー:', allError)
    return
  }
  
  console.log('\n全てのスカウトメッセージ:', allScouts)
  console.log('全スカウト数:', allScouts?.length || 0)
  
  return {
    receivedScouts,
    sentScouts,
    allScouts
  }
}

checkScoutMessages().then(result => {
  console.log('\n=== 確認結果 ===')
  console.log('受信スカウト:', result?.receivedScouts?.length || 0)
  console.log('送信スカウト:', result?.sentScouts?.length || 0)
  console.log('全スカウト:', result?.allScouts?.length || 0)
})