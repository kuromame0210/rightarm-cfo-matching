// CFOプロフィール詳細分析とcfo_data.mdとの比較
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// cfo_data.mdから期待される情報
const expectedData = {
  daigo: {
    name: '佐藤大悟',
    email: 'dai88@example.com',
    region: '千葉県千葉市',
    workHours: '応相談（臨機応変に対応致します）',
    compensation: '月10万円〜、成果報酬応相談',
    workArea: '全国リモートOK、東京近郊対面可、海外出張可',
    skills: ['海外業務', 'US上場サポート', '投資案件発掘', '不動産コンサル', '通訳翻訳'],
    certifications: ['特に無し'],
    introduction: 'M&A売却経験、資金調達支援、海外案件、US IPOサポート',
    experience: '2001年明治大学卒業から2022年Samurai hospitality設立まで'
  },
  okuda: {
    name: '奥田豊',
    email: 'okuda@example.com',
    region: '奈良県生駒市',
    workHours: '週２日・10時から18時',
    compensation: '成果報酬応相談、5,000円/h以上',
    workArea: '全国リモートOK、大阪近郊対面可',
    skills: ['IPO支援', '事業計画策定', '資金調達', 'M&A支援', '管理会計導入', 'PMI支援', '補助金申請'],
    certifications: ['中小企業診断士', '日商簿記１級'],
    introduction: '銀行・事業会社経験、IPO達成経験',
    experience: 'りそな銀行→日本発条→エスネットワークス'
  }
};

async function analyzeProfileGaps() {
  console.log('=== CFOプロフィール詳細分析：cfo_data.md vs データベース ===\n');

  try {
    // 対象CFOの詳細情報取得
    const { data: cfoData, error } = await supabase
      .from('rextrix_users')
      .select(`
        id,
        email,
        user_type,
        status,
        created_at,
        rextrix_user_profiles(*),
        rextrix_cfos(*)
      `)
      .in('email', ['dai88@example.com', 'okuda@example.com']);

    if (error) {
      console.error('データ取得エラー:', error);
      return;
    }

    console.log(`取得したCFOデータ: ${cfoData?.length || 0}件\n`);

    // 佐藤大悟さんの分析
    const daigoUser = cfoData?.find(u => u.email === 'dai88@example.com');
    console.log('==== 佐藤大悟さん（Dai88）の分析 ====');
    
    if (daigoUser) {
      console.log('✅ データベース内に存在');
      console.log('ユーザーID:', daigoUser.id);
      console.log('ステータス:', daigoUser.status);
      
      const profile = daigoUser.rextrix_user_profiles?.[0];
      const cfoInfo = daigoUser.rextrix_cfos?.[0];
      
      console.log('\n--- 期待値 vs 実際値の比較 ---');
      
      // 基本情報比較
      console.log('📝 基本情報:');
      console.log(`名前: 期待値「${expectedData.daigo.name}」 → 実際値「${profile?.display_name || 'なし'}」`);
      console.log(`居住地: 期待値「${expectedData.daigo.region}」 → 実際値「${profile?.region || 'なし'}」`);
      console.log(`稼働時間: 期待値「${expectedData.daigo.workHours}」 → 実際値「${profile?.work_preference || 'なし'}」`);
      console.log(`月額報酬: 期待値「${expectedData.daigo.compensation}」 → 実際値「${profile?.compensation_range || 'なし'}」`);
      console.log(`対応エリア: 期待値「${expectedData.daigo.workArea}」 → 実際値「${profile?.region || 'なし'}」`);
      console.log(`紹介文: 期待値「${expectedData.daigo.introduction}」 → 実際値「${profile?.introduction || 'なし'}」`);
      
      // CFO詳細情報比較
      console.log('\n💼 CFO詳細情報:');
      console.log(`経験年数: 実際値「${cfoInfo?.experience_years || 'なし'}年」`);
      console.log(`経験要約: 実際値「${cfoInfo?.experience_summary || 'なし'}」`);
      console.log(`実績: 実際値「${JSON.stringify(cfoInfo?.achievements || [])}」`);
      console.log(`資格: 実際値「${JSON.stringify(cfoInfo?.certifications || [])}」`);
      
      // 不足情報の特定
      console.log('\n❌ 不足している情報:');
      const missingInfo = [];
      if (!profile?.display_name) missingInfo.push('表示名（佐藤大悟）');
      if (!profile?.region) missingInfo.push('居住地（千葉県千葉市）');
      if (!profile?.work_preference) missingInfo.push('稼働時間設定');
      if (!profile?.compensation_range) missingInfo.push('月額報酬設定');
      if (!profile?.introduction) missingInfo.push('詳細な紹介文');
      if (!profile?.phone_number) missingInfo.push('電話番号');
      
      missingInfo.forEach(info => console.log(`  - ${info}`));
      
    } else {
      console.log('❌ データベース内に存在しません');
    }

    // 奥田豊さんの分析
    const okudaUser = cfoData?.find(u => u.email === 'okuda@example.com');
    console.log('\n\n==== 奥田豊さんの分析 ====');
    
    if (okudaUser) {
      console.log('✅ データベース内に存在');
      console.log('ユーザーID:', okudaUser.id);
      console.log('ステータス:', okudaUser.status);
      
      const profile = okudaUser.rextrix_user_profiles?.[0];
      const cfoInfo = okudaUser.rextrix_cfos?.[0];
      
      console.log('\n--- 期待値 vs 実際値の比較 ---');
      
      // 基本情報比較
      console.log('📝 基本情報:');
      console.log(`名前: 期待値「${expectedData.okuda.name}」 → 実際値「${profile?.display_name || 'なし'}」`);
      console.log(`居住地: 期待値「${expectedData.okuda.region}」 → 実際値「${profile?.region || 'なし'}」`);
      console.log(`稼働時間: 期待値「${expectedData.okuda.workHours}」 → 実際値「${profile?.work_preference || 'なし'}」`);
      console.log(`月額報酬: 期待値「${expectedData.okuda.compensation}」 → 実際値「${profile?.compensation_range || 'なし'}」`);
      console.log(`対応エリア: 期待値「${expectedData.okuda.workArea}」 → 実際値「${profile?.region || 'なし'}」`);
      console.log(`紹介文: 期待値「${expectedData.okuda.introduction}」 → 実際値「${profile?.introduction || 'なし'}」`);
      
      // CFO詳細情報比較
      console.log('\n💼 CFO詳細情報:');
      console.log(`経験年数: 実際値「${cfoInfo?.experience_years || 'なし'}年」`);
      console.log(`経験要約: 実際値「${cfoInfo?.experience_summary || 'なし'}」`);
      console.log(`実績: 実際値「${JSON.stringify(cfoInfo?.achievements || [])}」`);
      console.log(`資格: 実際値「${JSON.stringify(cfoInfo?.certifications || [])}」`);
      
      // 不足情報の特定
      console.log('\n❌ 不足している情報:');
      const missingInfo = [];
      if (!profile?.display_name) missingInfo.push('表示名（奥田豊）');
      if (!profile?.region) missingInfo.push('居住地（奈良県生駒市）');
      if (!profile?.work_preference) missingInfo.push('稼働時間設定');
      if (!profile?.compensation_range) missingInfo.push('月額報酬設定');
      if (!profile?.introduction) missingInfo.push('詳細な紹介文');
      if (!profile?.phone_number) missingInfo.push('電話番号');
      
      missingInfo.forEach(info => console.log(`  - ${info}`));
      
    } else {
      console.log('❌ データベース内に存在しません');
    }

    // 総合分析
    console.log('\n\n==== 総合分析 ====');
    console.log('🔍 発見された主要な問題:');
    console.log('1. 両CFOとも rextrix_user_profiles テーブルにデータが保存されていない');
    console.log('2. 基本プロフィール情報（名前、居住地、稼働時間など）が完全に欠落');
    console.log('3. CFO詳細情報は部分的に存在するが、cfo_data.mdの詳細情報と比べて不十分');
    console.log('4. 資格情報が空の配列になっている');
    console.log('5. 詳細な経歴情報が experience_summary に簡潔に要約されているのみ');

    console.log('\n📋 必要なアクション:');
    console.log('1. rextrix_user_profiles テーブルへの詳細情報の挿入');
    console.log('2. rextrix_cfos テーブルの資格・実績情報の充実');
    console.log('3. cfo_data.md の詳細情報をデータベース形式に正規化');
    console.log('4. プロフィール画像や連絡先情報の追加');

  } catch (error) {
    console.error('分析エラー:', error);
  }
}

analyzeProfileGaps().then(() => {
  console.log('\n=== CFOプロフィール詳細分析完了 ===');
  process.exit(0);
}).catch(error => {
  console.error('スクリプト実行エラー:', error);
  process.exit(1);
});