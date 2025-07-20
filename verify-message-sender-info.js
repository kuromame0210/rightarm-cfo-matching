// メッセージ送信者情報の検証スクリプト
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyMessageSenderInfo() {
  console.log('🔍 メッセージ送信者情報の検証を開始...')
  
  try {
    // 1. 最新のメッセージ3件を取得
    console.log('\n📥 最新メッセージ3件を取得...')
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(3)
    
    if (messagesError) {
      console.error('❌ メッセージ取得エラー:', messagesError)
      return
    }
    
    if (!messages || messages.length === 0) {
      console.log('⚠️ メッセージデータが見つかりません')
      return
    }
    
    console.log(`✅ ${messages.length}件のメッセージを取得`)
    
    // 2. 各メッセージの送信者・受信者情報を検証
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]
      console.log(`\n📨 メッセージ ${i + 1}:`)
      console.log('  ID:', message.msg_id)
      console.log('  送信者ID:', message.sender_id)
      console.log('  受信者ID:', message.receiver_id)
      console.log('  メッセージ:', message.body)
      console.log('  送信日時:', message.sent_at)
      console.log('  タイプ:', message.msg_type)
      
      // 送信者のプロフィール情報を取得
      console.log('\n👤 送信者情報:')
      
      // CFOプロフィールを確認
      const { data: senderCfoProfile } = await supabase
        .from('cfo_profiles')
        .select('cfo_name, cfo_display_name, avatar_url')
        .eq('cfo_user_id', message.sender_id)
        .single()
      
      if (senderCfoProfile) {
        console.log('  タイプ: CFO')
        console.log('  名前:', senderCfoProfile.cfo_display_name || senderCfoProfile.cfo_name)
        console.log('  アバター:', senderCfoProfile.avatar_url || '👤')
      } else {
        // 企業プロフィールを確認
        const { data: senderBizProfile } = await supabase
          .from('biz_profiles')
          .select('biz_company_name, avatar_url')
          .eq('biz_user_id', message.sender_id)
          .single()
        
        if (senderBizProfile) {
          console.log('  タイプ: 企業')
          console.log('  名前:', senderBizProfile.biz_company_name)
          console.log('  アバター:', senderBizProfile.avatar_url || '🏢')
        } else {
          console.log('  ⚠️ 送信者のプロフィール情報が見つかりません')
        }
      }
      
      // 受信者のプロフィール情報を取得
      console.log('\n📨 受信者情報:')
      
      // CFOプロフィールを確認
      const { data: receiverCfoProfile } = await supabase
        .from('cfo_profiles')
        .select('cfo_name, cfo_display_name, avatar_url')
        .eq('cfo_user_id', message.receiver_id)
        .single()
      
      if (receiverCfoProfile) {
        console.log('  タイプ: CFO')
        console.log('  名前:', receiverCfoProfile.cfo_display_name || receiverCfoProfile.cfo_name)
        console.log('  アバター:', receiverCfoProfile.avatar_url || '👤')
      } else {
        // 企業プロフィールを確認
        const { data: receiverBizProfile } = await supabase
          .from('biz_profiles')
          .select('biz_company_name, avatar_url')
          .eq('biz_user_id', message.receiver_id)
          .single()
        
        if (receiverBizProfile) {
          console.log('  タイプ: 企業')
          console.log('  名前:', receiverBizProfile.biz_company_name)
          console.log('  アバター:', receiverBizProfile.avatar_url || '🏢')
        } else {
          console.log('  ⚠️ 受信者のプロフィール情報が見つかりません')
        }
      }
      
      console.log('\n' + '='.repeat(60))
    }
    
    // 3. 会話一覧APIのテスト（messagesから導出）
    console.log('\n🗂️ 会話一覧の検証...')
    
    // 全ユーザーを取得してテスト用ユーザーIDを確定
    const allUserIds = Array.from(new Set([
      ...messages.map(m => m.sender_id),
      ...messages.map(m => m.receiver_id)
    ]))
    
    if (allUserIds.length > 0) {
      const testUserId = allUserIds[0]
      console.log(`テストユーザーID: ${testUserId}`)
      
      // 会話一覧をmessagesテーブルから導出
      const conversationMap = new Map()
      
      for (const message of messages) {
        const otherUserId = message.sender_id === testUserId ? message.receiver_id : message.sender_id
        
        // このユーザーに関連するメッセージのみ処理
        if (message.sender_id === testUserId || message.receiver_id === testUserId) {
          const conversationId = [testUserId, otherUserId].sort().join('_')
          
          if (!conversationMap.has(conversationId) || 
              new Date(message.sent_at) > new Date(conversationMap.get(conversationId).last_message_at)) {
            conversationMap.set(conversationId, {
              id: conversationId,
              otherUserId: otherUserId,
              lastMessage: message.body,
              last_message_at: message.sent_at
            })
          }
        }
      }
      
      console.log(`\n📋 ${testUserId}の会話一覧 (${conversationMap.size}件):`)
      
      for (const [conversationId, conversation] of conversationMap) {
        console.log(`\n🗨️ 会話ID: ${conversationId}`)
        console.log('  相手ユーザーID:', conversation.otherUserId)
        console.log('  最後のメッセージ:', conversation.lastMessage)
        console.log('  最終更新:', conversation.last_message_at)
        
        // 相手の情報も取得
        const { data: otherCfoProfile } = await supabase
          .from('cfo_profiles')
          .select('cfo_name, cfo_display_name')
          .eq('cfo_user_id', conversation.otherUserId)
          .single()
        
        if (otherCfoProfile) {
          console.log('  相手:', otherCfoProfile.cfo_display_name || otherCfoProfile.cfo_name, '(CFO)')
        } else {
          const { data: otherBizProfile } = await supabase
            .from('biz_profiles')
            .select('biz_company_name')
            .eq('biz_user_id', conversation.otherUserId)
            .single()
          
          if (otherBizProfile) {
            console.log('  相手:', otherBizProfile.biz_company_name, '(企業)')
          } else {
            console.log('  相手: 不明')
          }
        }
      }
    }
    
    console.log('\n✅ メッセージ送信者情報の検証完了')
    
  } catch (error) {
    console.error('❌ 検証エラー:', error)
  }
}

verifyMessageSenderInfo()