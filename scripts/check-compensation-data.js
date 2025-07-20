const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCompensationData() {
  console.log('🔍 CFO報酬データの現状調査\n');

  // 1. 全CFOの報酬設定状況
  console.log('📊 全CFOの報酬設定状況:');
  const { data: allCfos, error: allError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, compensation_type, monthly_fee_min, monthly_fee_max, cfo_fee_min, cfo_fee_max, cfo_compensation')
    .order('cfo_name');

  if (allError) {
    console.log('エラー:', allError.message);
    return;
  }

  console.log(`全CFO数: ${allCfos?.length || 0}件\n`);

  allCfos?.forEach((cfo, index) => {
    console.log(`${index + 1}. ${cfo.cfo_name}:`);
    console.log(`   compensation_type: ${cfo.compensation_type}`);
    console.log(`   monthly_fee: ${cfo.monthly_fee_min}円〜${cfo.monthly_fee_max}円`);
    console.log(`   legacy_fee: ${cfo.cfo_fee_min}円〜${cfo.cfo_fee_max}円`);
    console.log(`   text_compensation: "${cfo.cfo_compensation}"`);
    console.log('');
  });

  // 2. 月額制CFOの分析
  console.log('💰 月額制CFOの詳細分析:');
  const { data: monthlyCfos, error: monthlyError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, compensation_type, monthly_fee_min, monthly_fee_max')
    .eq('compensation_type', 'monthly')
    .order('monthly_fee_min');

  if (monthlyError) {
    console.log('月額制CFO取得エラー:', monthlyError.message);
  } else {
    console.log(`月額制CFO: ${monthlyCfos?.length || 0}件`);
    monthlyCfos?.forEach(cfo => {
      const feeRange = cfo.monthly_fee_max && cfo.monthly_fee_max !== cfo.monthly_fee_min 
        ? `${(cfo.monthly_fee_min/10000)}万円〜${(cfo.monthly_fee_max/10000)}万円`
        : `${(cfo.monthly_fee_min/10000)}万円`;
      console.log(`- ${cfo.cfo_name}: ${feeRange}`);
    });
  }

  // 3. 200万円以上のCFO検索テスト
  console.log('\n🧪 「月額制：200万円以上」検索テスト:');
  
  // 現在のAPI実装と同じクエリ
  const { data: highValueCfos, error: highValueError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, compensation_type, monthly_fee_min, monthly_fee_max')
    .or('and(compensation_type.eq.monthly,monthly_fee_min.gte.2000000),and(compensation_type.is.null,cfo_fee_min.gte.2000000)');

  if (highValueError) {
    console.log('高額CFO検索エラー:', highValueError.message);
  } else {
    console.log(`200万円以上を希望するCFO: ${highValueCfos?.length || 0}件`);
    highValueCfos?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: ${(cfo.monthly_fee_min/10000)}万円〜${cfo.monthly_fee_max ? (cfo.monthly_fee_max/10000) + '万円' : '上限なし'}`);
    });
  }

  // 4. 低額CFOもテスト（比較のため）
  console.log('\n🧪 「月額制：50万円以下」検索テスト:');
  const { data: lowValueCfos, error: lowValueError } = await supabase
    .from('cfo_profiles')
    .select('cfo_name, compensation_type, monthly_fee_min, monthly_fee_max')
    .or('and(compensation_type.eq.monthly,monthly_fee_min.lte.500000,or(monthly_fee_max.lte.500000,monthly_fee_max.is.null)),and(compensation_type.is.null,cfo_fee_min.lte.500000,or(cfo_fee_max.lte.500000,cfo_fee_max.is.null))');

  if (lowValueError) {
    console.log('低額CFO検索エラー:', lowValueError.message);
  } else {
    console.log(`50万円以下で対応可能なCFO: ${lowValueCfos?.length || 0}件`);
    lowValueCfos?.forEach(cfo => {
      console.log(`- ${cfo.cfo_name}: ${(cfo.monthly_fee_min/10000)}万円〜${cfo.monthly_fee_max ? (cfo.monthly_fee_max/10000) + '万円' : '上限なし'}`);
    });
  }

  console.log('\n📋 分析結果:');
  console.log('1. 構造化フィールド（compensation_type）の設定状況');
  console.log('2. 各CFOの実際の報酬範囲');
  console.log('3. 現在の検索ロジックで実際にヒットするCFO');
  console.log('4. 検索の意図と実装のズレの確認');
}

// 実行
checkCompensationData().catch(console.error);