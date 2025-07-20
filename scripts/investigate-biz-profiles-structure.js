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

async function investigateDatabase() {
  try {
    console.log('=== BIZ_PROFILES テーブル構造調査 ===\n');
    
    // 1. 実際のテーブルから構造を推測
    const { data: sampleData, error: sampleError } = await supabase
      .from('biz_profiles')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.log('テーブルアクセスエラー:', sampleError.message);
      return;
    }
    
    console.log('BIZ_PROFILES テーブルのカラム構造:');
    if (sampleData && sampleData.length > 0) {
      Object.keys(sampleData[0]).forEach(key => {
        const value = sampleData[0][key];
        const type = typeof value;
        console.log(`- ${key}: ${type}${value === null ? ' (NULL)' : ''}`);
      });
    } else {
      console.log('テーブルは空です');
    }

    // 2. 年商関連カラムの特定検索
    console.log('\n=== 年商関連カラムの検索 ===');
    if (sampleData && sampleData.length > 0) {
      const revenueColumns = Object.keys(sampleData[0]).filter(col => 
        col.toLowerCase().includes('revenue') ||
        col.toLowerCase().includes('annual') ||
        col.toLowerCase().includes('sales') ||
        col.toLowerCase().includes('income')
      );
      
      if (revenueColumns.length > 0) {
        console.log('年商関連カラム:');
        revenueColumns.forEach(col => {
          console.log(`- ${col}`);
        });
      } else {
        console.log('年商関連カラムが見つかりません');
      }
    }

    // 3. 実際のデータ確認
    console.log('\n=== 実際のデータサンプル (最新5件) ===');
    const { data: actualData, error: dataError } = await supabase
      .from('biz_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (dataError) {
      console.log('データ取得エラー:', dataError.message);
    } else if (actualData && actualData.length > 0) {
      console.log(`レコード数: ${actualData.length}件`);
      console.log('サンプルレコード:');
      actualData.forEach((record, index) => {
        console.log(`\nレコード${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
            console.log(`  ${key}: ${displayValue}`);
          }
        });
      });
    } else {
      console.log('データが存在しません');
    }

    // 4. SQLファイルで定義されているスキーマとの比較
    console.log('\n=== SQLファイルとの比較分析 ===');
    try {
      const sqlFiles = fs.readdirSync('sql').filter(file => file.endsWith('.sql'));
      console.log('見つかったSQLファイル:');
      sqlFiles.forEach(file => console.log(`- ${file}`));
    } catch (err) {
      console.log('SQLディレクトリが見つかりません');
    }

  } catch (error) {
    console.error('調査中にエラーが発生:', error.message);
  }
}

investigateDatabase();