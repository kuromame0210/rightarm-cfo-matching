const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function investigateDatabase() {
  console.log('🔍 CFOプロフィールデータベース調査開始\n');

  // 1. テーブル一覧を確認
  console.log('📋 利用可能なテーブル一覧:');
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_table_names');
  
  if (tablesError) {
    console.log('テーブル情報取得に失敗、直接確認します');
  } else {
    console.log(tables);
  }

  // 2. cfo_profiles テーブルの構造を確認
  console.log('\n🏗️ cfo_profiles テーブル構造確認:');
  const { data: schema, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'cfo_profiles')
    .order('ordinal_position');

  if (schemaError) {
    console.log('スキーマ取得エラー:', schemaError.message);
    console.log('代替方法でデータを確認します...\n');
  } else {
    console.table(schema);
  }

  // 3. 実際のCFOデータ数を確認
  console.log('\n📊 CFOプロフィールデータ数:');
  const { count, error: countError } = await supabase
    .from('cfo_profiles')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.log('データ数取得エラー:', countError.message);
  } else {
    console.log(`総CFOプロフィール数: ${count}件`);
  }

  // 4. サンプルデータを取得（最大5件）
  console.log('\n📝 実際のCFOプロフィールデータ（サンプル5件）:');
  const { data: samples, error: samplesError } = await supabase
    .from('cfo_profiles')
    .select('*')
    .limit(5);

  if (samplesError) {
    console.log('サンプルデータ取得エラー:', samplesError.message);
  } else {
    console.log(`取得件数: ${samples?.length || 0}件`);
    samples?.forEach((cfo, index) => {
      console.log(`\n--- CFO ${index + 1} ---`);
      console.log('Raw data:', JSON.stringify(cfo, null, 2));
      // 個別フィールドも確認
      Object.keys(cfo).forEach(key => {
        console.log(`${key}:`, cfo[key]);
      });
    });
  }

  // 5. compensation_type の値分布を確認
  console.log('\n💰 Compensation Type の値分布:');
  const { data: compTypes, error: compError } = await supabase
    .from('cfo_profiles')
    .select('compensation_type')
    .not('compensation_type', 'is', null);

  if (compError) {
    console.log('Compensation Type取得エラー:', compError.message);
  } else {
    const distribution = {};
    compTypes?.forEach(item => {
      const type = item.compensation_type || 'null';
      distribution[type] = (distribution[type] || 0) + 1;
    });
    console.table(distribution);
  }

  // 6. 月額報酬の範囲を確認
  console.log('\n💵 月額報酬の範囲:');
  const { data: fees, error: feesError } = await supabase
    .from('cfo_profiles')
    .select('monthly_fee_min, monthly_fee_max')
    .not('monthly_fee_min', 'is', null)
    .not('monthly_fee_max', 'is', null);

  if (feesError) {
    console.log('月額報酬取得エラー:', feesError.message);
  } else {
    console.log(`報酬設定済みCFO数: ${fees?.length || 0}件`);
    if (fees && fees.length > 0) {
      const minValues = fees.map(f => f.monthly_fee_min).filter(v => v !== null);
      const maxValues = fees.map(f => f.monthly_fee_max).filter(v => v !== null);
      
      console.log('最小報酬の範囲:', {
        min: Math.min(...minValues),
        max: Math.max(...minValues),
        avg: Math.round(minValues.reduce((a, b) => a + b, 0) / minValues.length)
      });
      
      console.log('最大報酬の範囲:', {
        min: Math.min(...maxValues),
        max: Math.max(...maxValues),
        avg: Math.round(maxValues.reduce((a, b) => a + b, 0) / maxValues.length)
      });
    }
  }

  // 7. users テーブルとの関連も確認
  console.log('\n👥 Users テーブルとの関連確認:');
  const { data: usersWithCfo, error: usersError } = await supabase
    .from('users')
    .select(`
      id, 
      email, 
      name,
      cfo_profiles(*)
    `)
    .not('cfo_profiles', 'is', null)
    .limit(3);

  if (usersError) {
    console.log('Users関連取得エラー:', usersError.message);
  } else {
    console.log(`CFOプロフィールを持つユーザー数: ${usersWithCfo?.length || 0}件`);
    usersWithCfo?.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('- Email:', user.email);
      console.log('- Name:', user.name);
      console.log('- CFO Profile ID:', user.cfo_profiles?.[0]?.id || 'なし');
    });
  }

  console.log('\n✅ データベース調査完了');
}

// 実行
investigateDatabase().catch(console.error);