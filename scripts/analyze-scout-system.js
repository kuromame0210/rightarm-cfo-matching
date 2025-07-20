const { createClient } = require('@supabase/supabase-js');

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase接続情報が不足しています');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey);

async function analyzeScoutSystem() {
  console.log('🔍 スカウト管理システム分析開始');
  
  try {
    // 1. messagesテーブルの構造確認
    console.log('\n=== 1. messagesテーブル構造 ===');
    const { data: tableInfo } = await client
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'messages')
      .eq('table_schema', 'public')
      .order('ordinal_position');
    
    if (tableInfo && tableInfo.length > 0) {
      console.table(tableInfo);
    } else {
      console.log('⚠️ messagesテーブル構造の取得に失敗');
    }
    
    // 2. スカウトメッセージの確認
    console.log('\n=== 2. スカウトメッセージ（msg_type=scout）===');
    const { data: scouts, error: scoutError } = await client
      .from('messages')
      .select('*')
      .eq('msg_type', 'scout')
      .order('sent_at', { ascending: false })
      .limit(5);
      
    if (scoutError) {
      console.error('❌ スカウト取得エラー:', scoutError);
    } else {
      console.log('スカウト件数:', scouts?.length || 0);
      scouts?.forEach((scout, i) => {
        console.log(`[${i+1}] ID: ${scout.msg_id}, From: ${scout.sender_id}, To: ${scout.receiver_id}`);
        console.log(`     送信日: ${scout.sent_at}`);
        console.log(`     内容: ${scout.body?.substring(0, 50)}...`);
      });
    }
    
    // 3. チャットメッセージの確認
    console.log('\n=== 3. チャットメッセージ（msg_type=chat）===');
    const { data: chats, error: chatError } = await client
      .from('messages')
      .select('*')
      .eq('msg_type', 'chat')
      .order('sent_at', { ascending: false })
      .limit(10);
      
    if (chatError) {
      console.error('❌ チャット取得エラー:', chatError);
    } else {
      console.log('チャット件数:', chats?.length || 0);
      chats?.forEach((chat, i) => {
        console.log(`[${i+1}] ID: ${chat.msg_id}, From: ${chat.sender_id}, To: ${chat.receiver_id}`);
        console.log(`     送信日: ${chat.sent_at}`);
        console.log(`     内容: ${chat.body?.substring(0, 80)}...`);
      });
    }
    
    // 4. スカウト-返信の関連性を分析
    if (scouts && scouts.length > 0) {
      console.log('\n=== 4. スカウト-返信関連性分析 ===');
      for (const scout of scouts.slice(0, 3)) {
        console.log(`\n📩 スカウトID: ${scout.msg_id} (${scout.sender_id} → ${scout.receiver_id})`);
        console.log(`   送信日時: ${scout.sent_at}`);
        
        // このスカウト後の返信を確認
        const { data: responses } = await client
          .from('messages')
          .select('*')
          .eq('sender_id', scout.receiver_id)
          .eq('receiver_id', scout.sender_id)
          .eq('msg_type', 'chat')
          .gt('sent_at', scout.sent_at)
          .order('sent_at', { ascending: false });
          
        console.log(`   返信件数: ${responses?.length || 0}`);
        responses?.forEach((res, i) => {
          console.log(`   [返信${i+1}] ${res.sent_at}: ${res.body?.substring(0, 60)}...`);
          
          // ステータス判定
          const body = res.body?.toLowerCase() || '';
          if (body.includes('スカウトを承諾')) {
            console.log('   🟢 → 承諾メッセージ検出');
          } else if (body.includes('スカウトをお断り') || body.includes('スカウトを辞退')) {
            console.log('   🔴 → 拒否メッセージ検出');
          }
        });
      }
    }
    
    // 5. メッセージタイプ別統計
    console.log('\n=== 5. メッセージタイプ別統計 ===');
    const { data: allMessages } = await client
      .from('messages')
      .select('msg_type');
      
    const stats = allMessages?.reduce((acc, msg) => {
      acc[msg.msg_type] = (acc[msg.msg_type] || 0) + 1;
      return acc;
    }, {}) || {};
    
    console.table(stats);
    
    // 6. enum型の確認
    console.log('\n=== 6. ENUM型定義確認 ===');
    const { data: enumData } = await client
      .from('information_schema.enum_types')
      .select('*')
      .in('typname', ['msg_type', 'user_role']);
      
    console.log('ENUM型:', enumData?.length || 0, '件');
    enumData?.forEach(enumType => {
      console.log(`- ${enumType.typname}: ${enumType.enumlabel}`);
    });
    
    // 7. 承諾/拒否パターンの分析
    console.log('\n=== 7. 承諾/拒否メッセージパターン分析 ===');
    const { data: allChats } = await client
      .from('messages')
      .select('body')
      .eq('msg_type', 'chat');
      
    const acceptancePatterns = [];
    const rejectionPatterns = [];
    
    allChats?.forEach(chat => {
      const body = chat.body?.toLowerCase() || '';
      if (body.includes('承諾') || body.includes('受諾')) {
        acceptancePatterns.push(chat.body);
      }
      if (body.includes('お断り') || body.includes('辞退') || body.includes('拒否')) {
        rejectionPatterns.push(chat.body);
      }
    });
    
    console.log('承諾パターン検出:', acceptancePatterns.length, '件');
    acceptancePatterns.slice(0, 3).forEach((pattern, i) => {
      console.log(`  [${i+1}] ${pattern.substring(0, 80)}...`);
    });
    
    console.log('拒否パターン検出:', rejectionPatterns.length, '件');
    rejectionPatterns.slice(0, 3).forEach((pattern, i) => {
      console.log(`  [${i+1}] ${pattern.substring(0, 80)}...`);
    });
    
  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
  }
}

analyzeScoutSystem().catch(console.error);