// 既存CFOデータと重複確認スクリプト
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkExistingCfoData() {
  try {
    console.log('\n=== 既存CFOデータと重複確認 ===');

    // 全CFOデータを取得
    const { data: existingCfos, error: cfosError } = await supabase
      .from('rextrix_cfos')
      .select(`
        *,
        rextrix_users!inner(
          email,
          rextrix_user_profiles(display_name, nickname, region)
        )
      `);

    if (cfosError) {
      console.error('CFOデータ取得エラー:', cfosError);
      return;
    }

    console.log(`\n現在データベースに登録されているCFO: ${existingCfos.length}名\n`);

    // cfo.mdから確認したい候補者リスト
    const cfoMdCandidates = [
      {
        name: '佐藤大悟',
        nickname: 'Dai88',
        email_pattern: 'dai88',
        region: '千葉県千葉市',
        title_keywords: ['M&A', '海外', 'US']
      },
      {
        name: '佐藤智彦',
        nickname: 'tomo',
        email_pattern: 'tomo',
        region: '東京都新宿区',
        title_keywords: ['銀行', '融資', '資金調達']
      },
      {
        name: '菅原大源',
        nickname: 'Taigen',
        email_pattern: 'taigen',
        region: 'アメリカ・カリフォルニア州',
        title_keywords: ['住友商事', 'KPMG', 'M&A']
      },
      {
        name: 'nanalysts',
        nickname: 'nanalysts',
        email_pattern: 'nanalysts',
        region: '関西',
        title_keywords: ['ベンチャーキャピタル', '投資', 'VC']
      },
      {
        name: '田中',
        nickname: 'ibkipu',
        email_pattern: 'ibkipu',
        region: '北米在住',
        title_keywords: ['総合商社', 'Big4', 'MBA']
      }
    ];

    // 既存データとの照合
    existingCfos.forEach((existingCfo, index) => {
      const profile = existingCfo.rextrix_users.rextrix_user_profiles[0];
      console.log(`--- 既存CFO ${index + 1} ---`);
      console.log(`Email: ${existingCfo.rextrix_users.email}`);
      console.log(`表示名: ${profile?.display_name || '不明'}`);
      console.log(`ニックネーム: ${profile?.nickname || '不明'}`);
      console.log(`地域: ${profile?.region || '不明'}`);
      console.log(`タイトル: ${existingCfo.title || '不明'}`);
      console.log(`経験年数: ${existingCfo.experience_years || '不明'}年`);
      console.log(`経歴要約: ${existingCfo.experience_summary?.substring(0, 100) || '不明'}...`);
      console.log('');
    });

    console.log('\n=== cfo.mdの候補者との照合結果 ===\n');

    cfoMdCandidates.forEach(candidate => {
      console.log(`--- ${candidate.name} (${candidate.nickname}) ---`);
      
      // 重複チェック
      const duplicates = existingCfos.filter(existing => {
        const profile = existing.rextrix_users.rextrix_user_profiles[0];
        const email = existing.rextrix_users.email;
        
        // メール、表示名、地域での重複チェック
        const emailMatch = email.includes(candidate.email_pattern);
        const nameMatch = profile?.display_name === candidate.name;
        const regionMatch = profile?.region?.includes(candidate.region.split('・')[0]) || 
                           profile?.region?.includes(candidate.region.split('県')[0]);
        
        return emailMatch || nameMatch || regionMatch;
      });

      if (duplicates.length > 0) {
        console.log('🔄 重複の可能性あり:');
        duplicates.forEach(dup => {
          const profile = dup.rextrix_users.rextrix_user_profiles[0];
          console.log(`  - Email: ${dup.rextrix_users.email}`);
          console.log(`  - 表示名: ${profile?.display_name}`);
          console.log(`  - 地域: ${profile?.region}`);
          console.log(`  - タイトル: ${dup.title}`);
        });
      } else {
        console.log('✅ 重複なし - 新規追加候補');
      }
      console.log('');
    });

    // 特別チェック: 佐藤大悟さん（Dai88）
    console.log('\n=== 佐藤大悟さん (Dai88) 特別確認 ===');
    const dai88Check = existingCfos.find(cfo => 
      cfo.rextrix_users.email.includes('dai88') ||
      cfo.rextrix_users.rextrix_user_profiles[0]?.display_name === '佐藤大悟'
    );

    if (dai88Check) {
      const profile = dai88Check.rextrix_users.rextrix_user_profiles[0];
      console.log('✅ 佐藤大悟さんは既に登録済み:');
      console.log(`  - Email: ${dai88Check.rextrix_users.email}`);
      console.log(`  - タイトル: ${dai88Check.title}`);
      console.log(`  - 専門分野数: ${dai88Check.specialties?.length || 0}`);
      console.log(`  - 地域: ${profile?.region}`);
      console.log('  → cfo.mdの情報は既にcfo_data.mdから投入済み');
    } else {
      console.log('⚠️  佐藤大悟さんが見つかりません');
    }

    console.log('\n=== 推奨アクション ===');
    console.log('1. ✅ 佐藤大悟さん: 既存データ確認済み（追加不要）');
    console.log('2. 佐藤智彦さん (tomo): 重複確認後、新規追加検討');
    console.log('3. 菅原大源さん (Taigen): 重複確認後、新規追加検討');
    console.log('4. nanalystsさん: 重複確認後、新規追加検討');
    console.log('5. 田中さん (ibkipu): 重複確認後、新規追加検討');

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

checkExistingCfoData();