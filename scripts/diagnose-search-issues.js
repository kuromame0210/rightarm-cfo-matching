const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseSearchIssues() {
  console.log('🔍 CFO検索機能の問題診断\n');

  // 1. 構造化フィールドの設定状況を確認
  console.log('📊 構造化フィールドの設定状況:');
  const { data: structuredData, error: structuredError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, compensation_type, monthly_fee_min, monthly_fee_max, weekly_days, supported_prefectures, full_remote_available')
    .not('compensation_type', 'is', null);

  if (structuredError) {
    console.log('エラー:', structuredError.message);
  } else {
    console.log(`構造化フィールド設定済み: ${structuredData?.length || 0}件 / 7件`);
    structuredData?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: compensation_type=${cfo.compensation_type}, monthly_fee=${cfo.monthly_fee_min}-${cfo.monthly_fee_max}, weekly_days=${cfo.weekly_days}`);
    });
  }

  // 2. 実際の検索クエリをテスト
  console.log('\n🧪 実際の検索クエリテスト:');
  
  // テスト1: スキル検索（M&A）
  console.log('\n--- テスト1: スキル検索「M&A」 ---');
  const { data: skillTest, error: skillError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, cfo_skills')
    .overlaps('cfo_skills', ['M&A']);

  if (skillError) {
    console.log('スキル検索エラー:', skillError.message);
  } else {
    console.log(`M&A関連CFO: ${skillTest?.length || 0}件`);
    skillTest?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: ${JSON.stringify(cfo.cfo_skills)}`);
    });
  }

  // テスト2: スキル検索（IPO）
  console.log('\n--- テスト2: スキル検索「IPO」 ---');
  const { data: ipoTest, error: ipoError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, cfo_skills')
    .overlaps('cfo_skills', ['IPO']);

  if (ipoError) {
    console.log('IPO検索エラー:', ipoError.message);
  } else {
    console.log(`IPO関連CFO: ${ipoTest?.length || 0}件`);
    ipoTest?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: ${JSON.stringify(cfo.cfo_skills)}`);
    });
  }

  // テスト3: 月額制のCFO検索
  console.log('\n--- テスト3: 月額制CFO検索 ---');
  const { data: monthlyTest, error: monthlyError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, compensation_type, monthly_fee_min, monthly_fee_max')
    .eq('compensation_type', 'monthly');

  if (monthlyError) {
    console.log('月額制検索エラー:', monthlyError.message);
  } else {
    console.log(`月額制CFO: ${monthlyTest?.length || 0}件`);
    monthlyTest?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: ${cfo.monthly_fee_min}円〜${cfo.monthly_fee_max}円`);
    });
  }

  // テスト4: 地域検索（関東）
  console.log('\n--- テスト4: 地域検索「関東」 ---');
  const { data: regionTest, error: regionError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, cfo_location, supported_prefectures')
    .or('supported_prefectures.cs.{"kanto"},cfo_location.ilike.%関東%,cfo_location.ilike.%東京%');

  if (regionError) {
    console.log('地域検索エラー:', regionError.message);
  } else {
    console.log(`関東対応CFO: ${regionTest?.length || 0}件`);
    regionTest?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: location=${cfo.cfo_location}, prefectures=${JSON.stringify(cfo.supported_prefectures)}`);
    });
  }

  // テスト5: キーワード検索
  console.log('\n--- テスト5: キーワード検索「資金調達」 ---');
  const { data: keywordTest, error: keywordError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, cfo_possible_tasks')
    .or('cfo_name.ilike.%資金調達%,cfo_possible_tasks.ilike.%資金調達%');

  if (keywordError) {
    console.log('キーワード検索エラー:', keywordError.message);
  } else {
    console.log(`資金調達関連CFO: ${keywordTest?.length || 0}件`);
    keywordTest?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: 対応業務に資金調達関連記載`);
    });
  }

  // 6. 検索機能の問題点まとめ
  console.log('\n📋 検索機能の問題点まとめ:');
  console.log('1. 構造化フィールド設定率: 7件中1件のみ（14%）');
  console.log('2. 古いデータ（レガシーフィールド）の大量存在');
  console.log('3. 検索APIは新しい構造化フィールドに依存');
  console.log('4. 既存データの移行処理が必要');

  // 7. 解決策の提案
  console.log('\n💡 解決策:');
  console.log('A. データ移行スクリプトで既存データを構造化フィールドに移行');
  console.log('B. 検索APIを既存フィールドもサポートするように修正');
  console.log('C. UI側で構造化入力を促進');

  console.log('\n✅ 診断完了');
}

// 実行
diagnoseSearchIssues().catch(console.error);