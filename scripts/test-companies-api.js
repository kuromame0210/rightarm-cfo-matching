const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 環境変数を.env.localから読み込み
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function testCompaniesAPI() {
  console.log('=== 企業一覧API修正テスト ===\n');

  try {
    // 1. 修正前のエラーが出るクエリ（biz_revenue_range）を模倣
    console.log('1. 年商範囲フィルタリングテスト:');
    
    // 修正後のロジックをテスト（min/maxカラム使用）
    const revenueRangeMap = {
      'under_100m': [0, 100000000],
      '100m_1b': [100000000, 1000000000],
      '1b_10b': [1000000000, 10000000000],
      '10b_30b': [10000000000, 30000000000],
      '30b_50b': [30000000000, 50000000000],
      'over_50b': [50000000000, Number.MAX_SAFE_INTEGER]
    };

    for (const [rangeKey, [minRevenue, maxRevenue]] of Object.entries(revenueRangeMap)) {
      console.log(`\n🔍 ${rangeKey}範囲テスト:`, { minRevenue, maxRevenue });
      
      const { data, error, count } = await supabase
        .from('biz_profiles')
        .select('biz_company_name, biz_revenue_min, biz_revenue_max', { count: 'exact' })
        .gte('biz_revenue_min', minRevenue)
        .lte('biz_revenue_max', maxRevenue)
        .limit(3);

      if (error) {
        console.log(`❌ ${rangeKey}でエラー:`, error.message);
      } else {
        console.log(`✅ ${rangeKey}: ${count}件見つかりました`);
        if (data && data.length > 0) {
          data.forEach(company => {
            console.log(`  - ${company.biz_company_name}: ${company.biz_revenue_min}円 〜 ${company.biz_revenue_max}円`);
          });
        }
      }
    }

    // 2. 実際のデータで正しくフィルタリングできているか確認
    console.log('\n2. 実際のデータ確認:');
    
    const { data: allCompanies, error: allError } = await supabase
      .from('biz_profiles')
      .select('biz_company_name, biz_revenue_min, biz_revenue_max')
      .not('biz_revenue_min', 'is', null)
      .not('biz_revenue_max', 'is', null)
      .limit(5);

    if (allError) {
      console.log('❌ 全データ取得エラー:', allError.message);
    } else {
      console.log('✅ 年商データ設定済み企業:');
      allCompanies?.forEach(company => {
        const min = (company.biz_revenue_min / 100000000).toFixed(1);
        const max = (company.biz_revenue_max / 100000000).toFixed(1);
        console.log(`  - ${company.biz_company_name}: ${min}億円 〜 ${max}億円`);
      });
    }

    // 3. API経由でのテスト（可能であれば）
    console.log('\n3. API経由テスト (修正後)');
    console.log('注意: 実際のAPIテストには認証が必要です');
    console.log('修正内容: biz_revenue_range → biz_revenue_min/max使用');
    console.log('修正ファイル: src/app/api/companies/route.ts');

  } catch (error) {
    console.error('テスト中にエラーが発生:', error.message);
  }
}

testCompaniesAPI();