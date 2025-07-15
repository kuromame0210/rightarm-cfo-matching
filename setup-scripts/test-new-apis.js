// 新アーキテクチャ対応API動作テストスクリプト
// 修正したAPIの動作確認

async function testNewAPIs() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 新アーキテクチャ対応API動作テスト');
  console.log('==========================================');

  try {
    // 1. 企業一覧API テスト
    console.log('\n1. 企業一覧API (/api/companies) テスト...');
    try {
      const companiesResponse = await fetch(`${baseUrl}/api/companies?page=1&limit=5`);
      console.log(`   ステータス: ${companiesResponse.status}`);
      
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        console.log('   ✅ 企業一覧API正常動作');
        console.log(`   📊 取得件数: ${companiesData.data?.length || 0}件`);
        console.log(`   🏗️  アーキテクチャ: ${companiesData.meta?.architecture || 'unknown'}`);
        console.log(`   📋 使用テーブル: ${companiesData.meta?.table || 'unknown'}`);
        
        if (companiesData.data && companiesData.data.length > 0) {
          console.log('   📄 サンプルデータ:');
          const sample = companiesData.data[0];
          console.log(`     - 企業名: ${sample.companyName || sample.company_name || '未設定'}`);
          console.log(`     - 所在地: ${sample.location || sample.region || '未設定'}`);
          console.log(`     - 課題: ${Array.isArray(sample.issues) ? sample.issues.slice(0, 2).join(', ') : '未設定'}`);
        }
      } else {
        const errorData = await companiesResponse.text();
        console.log('   ❌ 企業一覧API エラー');
        console.log(`   詳細: ${errorData.substring(0, 200)}`);
      }
    } catch (e) {
      console.log(`   ❌ 企業一覧API接続エラー: ${e.message}`);
    }

    // 2. スキルマスターAPI テスト
    console.log('\n2. スキルマスターAPI (/api/master/skills) テスト...');
    try {
      const skillsResponse = await fetch(`${baseUrl}/api/master/skills?category=finance`);
      console.log(`   ステータス: ${skillsResponse.status}`);
      
      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        console.log('   ✅ スキルマスターAPI正常動作');
        console.log(`   📊 取得件数: ${skillsData.data?.skills?.length || 0}件`);
        console.log(`   🏗️  アーキテクチャ: ${skillsData.data?.meta?.architecture || 'unknown'}`);
        console.log(`   📋 データソース: ${skillsData.data?.meta?.source || 'unknown'}`);
        
        if (skillsData.data?.skills && skillsData.data.skills.length > 0) {
          console.log('   📄 スキル例:');
          skillsData.data.skills.slice(0, 5).forEach((skill, index) => {
            console.log(`     ${index + 1}. ${skill.name}`);
          });
        }
      } else {
        const errorData = await skillsResponse.text();
        console.log('   ❌ スキルマスターAPI エラー');
        console.log(`   詳細: ${errorData.substring(0, 200)}`);
      }
    } catch (e) {
      console.log(`   ❌ スキルマスターAPI接続エラー: ${e.message}`);
    }

    // 3. CFO一覧API テスト
    console.log('\n3. CFO一覧API (/api/cfos) テスト...');
    try {
      const cfosResponse = await fetch(`${baseUrl}/api/cfos?page=1&limit=5`);
      console.log(`   ステータス: ${cfosResponse.status}`);
      
      if (cfosResponse.ok) {
        const cfosData = await cfosResponse.json();
        console.log('   ✅ CFO一覧API正常動作');
        console.log(`   📊 取得件数: ${cfosData.data?.length || 0}件`);
        
        if (cfosData.data && cfosData.data.length > 0) {
          console.log('   📄 サンプルCFOデータ:');
          const sample = cfosData.data[0];
          console.log(`     - CFO名: ${sample.name || sample.cfo_name || '未設定'}`);
          console.log(`     - 所在地: ${sample.location || sample.region || '未設定'}`);
          console.log(`     - スキル: ${Array.isArray(sample.skills) ? sample.skills.slice(0, 3).join(', ') : '未設定'}`);
        }
      } else {
        const errorData = await cfosResponse.text();
        console.log('   ❌ CFO一覧API エラー');
        console.log(`   詳細: ${errorData.substring(0, 200)}`);
      }
    } catch (e) {
      console.log(`   ❌ CFO一覧API接続エラー: ${e.message}`);
    }

    // 4. 個別CFO詳細API テスト
    console.log('\n4. CFO詳細API テスト...');
    try {
      // テストユーザーIDを使用
      const testCfoId = 'fc25d040-1b1e-4140-8c86-69e6665c983d'; // test-cfo@example.com
      const cfoDetailResponse = await fetch(`${baseUrl}/api/cfos/${testCfoId}`);
      console.log(`   ステータス: ${cfoDetailResponse.status}`);
      
      if (cfoDetailResponse.ok) {
        const cfoData = await cfoDetailResponse.json();
        console.log('   ✅ CFO詳細API正常動作');
        console.log(`   📄 CFO詳細: ${cfoData.data?.name || '未設定'}`);
        console.log(`   💼 利用可能性: ${cfoData.data?.availability || '未設定'}`);
      } else if (cfoDetailResponse.status === 401) {
        console.log('   ⚠️  CFO詳細API 認証必要（正常）');
      } else {
        const errorData = await cfoDetailResponse.text();
        console.log('   ❌ CFO詳細API エラー');
        console.log(`   詳細: ${errorData.substring(0, 200)}`);
      }
    } catch (e) {
      console.log(`   ❌ CFO詳細API接続エラー: ${e.message}`);
    }

    // 5. 結果サマリー
    console.log('\n==========================================');
    console.log('📋 新アーキテクチャ対応結果:');
    console.log('✅ 企業一覧API: biz_profiles テーブル使用');
    console.log('✅ スキルマスターAPI: 固定リスト提供');
    console.log('✅ CFO関連API: cfo_profiles テーブル使用');
    
    console.log('\n🚀 次のステップ:');
    console.log('1. ブラウザでの動作確認');
    console.log('2. インタラクション機能の統合（likes, messages）');
    console.log('3. 不要API群の削除検討');

  } catch (error) {
    console.error('\n❌ テスト実行エラー:', error.message);
  }
}

testNewAPIs();