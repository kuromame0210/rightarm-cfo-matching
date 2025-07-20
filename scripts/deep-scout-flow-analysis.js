const { createClient } = require('@supabase/supabase-js');

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase接続情報が不足しています');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseKey);

async function deepScoutFlowAnalysis() {
  console.log('🔍 スカウト承諾・拒否フロー詳細分析開始');
  
  try {
    // 1. 特定のスカウトケースを深く分析
    console.log('\n=== 1. 承諾済みスカウトの詳細分析 ===');
    
    // スカウトID 12の詳細分析（承諾メッセージが検出されたケース）
    const scoutId = 12;
    
    const { data: scout } = await client
      .from('messages')
      .select('*')
      .eq('msg_id', scoutId)
      .eq('msg_type', 'scout')
      .single();
      
    if (scout) {
      console.log('📩 対象スカウト:', {
        id: scout.msg_id,
        sender: scout.sender_id,
        receiver: scout.receiver_id,
        sent_at: scout.sent_at,
        message: scout.body?.substring(0, 100)
      });
      
      // このスカウトに対する全ての返信を時系列で取得
      const { data: allResponses } = await client
        .from('messages')
        .select('*')
        .eq('sender_id', scout.receiver_id)
        .eq('receiver_id', scout.sender_id)
        .eq('msg_type', 'chat')
        .gt('sent_at', scout.sent_at)
        .order('sent_at', { ascending: true }); // 時系列順
        
      console.log('\n📝 返信メッセージ一覧 (時系列順):');
      allResponses?.forEach((response, i) => {
        console.log(`[${i+1}] ${response.sent_at}`);
        console.log(`    ID: ${response.msg_id}`);
        console.log(`    内容: ${response.body}`);
        
        // ステータス判定ロジックをテスト
        const body = response.body?.toLowerCase() || '';
        let detectedStatus = 'unknown';
        if (body.includes('スカウトを承諾しました') || body.includes('スカウトを承諾')) {
          detectedStatus = 'accepted';
        } else if (body.includes('スカウトをお断りしました') || body.includes('スカウトを辞退')) {
          detectedStatus = 'declined';
        }
        console.log(`    判定ステータス: ${detectedStatus}`);
        console.log('');
      });
      
      // 現在のAPI処理ロジックのシミュレーション
      console.log('\n🔄 APIステータス判定ロジックのシミュレーション:');
      
      // 最新の返信を最大5件チェック（APIと同じロジック）
      const { data: recentResponses } = await client
        .from('messages')
        .select('body, sent_at')
        .eq('sender_id', scout.receiver_id)
        .eq('receiver_id', scout.sender_id)
        .eq('msg_type', 'chat')
        .gt('sent_at', scout.sent_at)
        .order('sent_at', { ascending: false })
        .limit(5);
        
      let finalStatus = 'pending';
      let matchedMessage = null;
      
      if (recentResponses && recentResponses.length > 0) {
        console.log('最新5件の返信をチェック中...');
        for (const response of recentResponses) {
          console.log(`  チェック中: ${response.body?.substring(0, 50)}...`);
          const body = response.body?.toLowerCase() || '';
          if (body.includes('スカウトを承諾しました') || body.includes('スカウトを承諾')) {
            finalStatus = 'accepted';
            matchedMessage = response.body;
            console.log('  🟢 承諾メッセージ検出！');
            break;
          } else if (body.includes('スカウトをお断りしました') || body.includes('スカウトを辞退')) {
            finalStatus = 'declined';
            matchedMessage = response.body;
            console.log('  🔴 拒否メッセージ検出！');
            break;
          }
        }
      }
      
      console.log(`\n📊 最終判定結果: ${finalStatus}`);
      if (matchedMessage) {
        console.log(`📝 判定根拠メッセージ: ${matchedMessage}`);
      }
    }
    
    // 2. 重複メッセージ問題の分析
    console.log('\n=== 2. 重複メッセージ問題の分析 ===');
    
    // 同じ送信者・受信者間で同じ内容のメッセージが複数ある場合をチェック
    const { data: duplicateChecks } = await client
      .from('messages')
      .select('sender_id, receiver_id, body, sent_at, msg_type')
      .eq('msg_type', 'chat')
      .order('sent_at', { ascending: false });
      
    const duplicateMap = new Map();
    duplicateChecks?.forEach(msg => {
      const key = `${msg.sender_id}-${msg.receiver_id}-${msg.body?.substring(0, 50)}`;
      if (!duplicateMap.has(key)) {
        duplicateMap.set(key, []);
      }
      duplicateMap.get(key).push(msg);
    });
    
    console.log('重複メッセージの検出:');
    let duplicateFound = false;
    duplicateMap.forEach((messages, key) => {
      if (messages.length > 1) {
        duplicateFound = true;
        console.log(`🔄 重複検出: ${messages.length}件`);
        console.log(`   キー: ${key}`);
        messages.forEach((msg, i) => {
          console.log(`   [${i+1}] ${msg.sent_at}: ${msg.body?.substring(0, 30)}...`);
        });
      }
    });
    
    if (!duplicateFound) {
      console.log('✅ 明確な重複メッセージは検出されませんでした');
    }
    
    // 3. ステータス判定の問題となりうるケースの分析
    console.log('\n=== 3. ステータス判定問題の分析 ===');
    
    // 承諾・拒否メッセージの詳細パターン分析
    const { data: allChatMessages } = await client
      .from('messages')
      .select('*')
      .eq('msg_type', 'chat')
      .order('sent_at', { ascending: false });
      
    const statusMessages = {
      accepted: [],
      declined: [],
      ambiguous: []
    };
    
    allChatMessages?.forEach(msg => {
      const body = msg.body?.toLowerCase() || '';
      if (body.includes('承諾') || body.includes('受諾')) {
        if (body.includes('スカウトを承諾')) {
          statusMessages.accepted.push({
            id: msg.msg_id,
            content: msg.body,
            sent_at: msg.sent_at,
            pattern: 'explicit_accept'
          });
        } else {
          statusMessages.ambiguous.push({
            id: msg.msg_id,
            content: msg.body,
            sent_at: msg.sent_at,
            pattern: 'ambiguous_accept'
          });
        }
      }
      
      if (body.includes('お断り') || body.includes('辞退') || body.includes('拒否')) {
        if (body.includes('スカウトをお断り') || body.includes('スカウトを辞退')) {
          statusMessages.declined.push({
            id: msg.msg_id,
            content: msg.body,
            sent_at: msg.sent_at,
            pattern: 'explicit_decline'
          });
        } else {
          statusMessages.ambiguous.push({
            id: msg.msg_id,
            content: msg.body,
            sent_at: msg.sent_at,
            pattern: 'ambiguous_decline'
          });
        }
      }
    });
    
    console.log('承諾メッセージパターン:');
    statusMessages.accepted.forEach((msg, i) => {
      console.log(`  [${i+1}] ID:${msg.id} ${msg.sent_at}`);
      console.log(`      "${msg.content.substring(0, 80)}..."`);
    });
    
    console.log('\n拒否メッセージパターン:');
    statusMessages.declined.forEach((msg, i) => {
      console.log(`  [${i+1}] ID:${msg.id} ${msg.sent_at}`);
      console.log(`      "${msg.content.substring(0, 80)}..."`);
    });
    
    console.log('\n曖昧なメッセージパターン:');
    statusMessages.ambiguous.forEach((msg, i) => {
      console.log(`  [${i+1}] ID:${msg.id} ${msg.sent_at} (${msg.pattern})`);
      console.log(`      "${msg.content.substring(0, 80)}..."`);
    });
    
    // 4. 問題の原因特定
    console.log('\n=== 4. 問題の原因特定 ===');
    
    console.log('🔍 考えられる問題:');
    console.log('1. 複数の承諾メッセージが存在し、最新のものが承諾でない場合');
    console.log('2. メッセージ判定ロジックの条件が厳格すぎる');
    console.log('3. フロントエンドでのキャッシュ問題');
    console.log('4. APIの呼び出し順序やタイミングの問題');
    
    // 特定のスカウトについて、承諾後にさらに返信があるかチェック
    if (allResponses && allResponses.length > 0) {
      const acceptanceMessages = allResponses.filter(msg => {
        const body = msg.body?.toLowerCase() || '';
        return body.includes('スカウトを承諾');
      });
      
      if (acceptanceMessages.length > 0) {
        const latestAcceptance = acceptanceMessages[acceptanceMessages.length - 1];
        const messagesAfterAcceptance = allResponses.filter(msg => 
          new Date(msg.sent_at) > new Date(latestAcceptance.sent_at)
        );
        
        console.log(`\n📋 承諾後のメッセージ: ${messagesAfterAcceptance.length}件`);
        messagesAfterAcceptance.forEach((msg, i) => {
          console.log(`  [${i+1}] ${msg.sent_at}: ${msg.body?.substring(0, 50)}...`);
        });
        
        if (messagesAfterAcceptance.length > 0) {
          console.log('⚠️ 承諾後に追加のメッセージがあります。これが「承諾待ち」状態の原因かもしれません。');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 分析中にエラーが発生しました:', error);
  }
}

deepScoutFlowAnalysis().catch(console.error);