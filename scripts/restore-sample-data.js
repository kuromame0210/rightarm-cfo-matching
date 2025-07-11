/**
 * サンプルデータ復旧スクリプト
 * 削除されたCFOサンプルデータを再作成します
 */

require('dotenv').config({ path: '.env.test' });
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// サンプルCFOデータ
const sampleCFOs = [
  {
    email: 'daigo.sato@example.com',
    displayName: '佐藤大悟',
    nickname: 'CFOまるお',
    experienceYears: 15,
    experienceSummary: 'IPO準備からM&Aまで、幅広い財務戦略を手がけてきました。特にスタートアップの成長フェーズでの資金調達が得意です。',
    achievements: ['IPO準備支援: 3社', '総額50億円の資金調達実行', 'M&A案件: 8件'],
    certifications: ['公認会計士', 'MBA(財務)', 'CFO認定'],
    region: '東京都',
    phoneNumber: '090-1234-5678'
  },
  {
    email: 'tomohiko.sato@example.com',
    displayName: '佐藤智彦',
    nickname: 'トモCFO',
    experienceYears: 12,
    experienceSummary: 'AIスタートアップでの財務管理経験が豊富。データドリブンな意思決定をサポートします。',
    achievements: ['SaaS企業の財務改革', 'データ分析による業績向上', 'コスト最適化20%達成'],
    certifications: ['公認会計士', 'データサイエンティスト'],
    region: '東京都',
    phoneNumber: '090-2345-6789'
  },
  {
    email: 'taigen.sugawara@example.com',
    displayName: '菅原泰元',
    nickname: 'スガCFO',
    experienceYears: 20,
    experienceSummary: '大手企業からベンチャーまで、多様な業界での財務経験を持ちます。リスク管理と成長戦略のバランスが得意。',
    achievements: ['上場企業CFO歴5年', '投資ファンド設立', 'グローバル展開支援'],
    certifications: ['公認会計士', 'CFA', '税理士'],
    region: '大阪府',
    phoneNumber: '090-3456-7890'
  },
  {
    email: 'nanalysts@example.com',
    displayName: '田中七海',
    nickname: 'ナナCFO',
    experienceYears: 8,
    experienceSummary: 'フィンテック業界での財務管理が専門。デジタル化による業務効率化を推進します。',
    achievements: ['フィンテック企業成長支援', 'DX推進によるコスト削減', '新規事業の財務設計'],
    certifications: ['公認会計士', 'フィンテック認定'],
    region: '東京都',
    phoneNumber: '090-4567-8901'
  },
  {
    email: 'ibkipu@example.com',
    displayName: '山田一樹',
    nickname: 'イチローCFO',
    experienceYears: 18,
    experienceSummary: '製造業からサービス業まで、幅広い業界での財務戦略立案経験があります。',
    achievements: ['製造業のグローバル展開支援', 'サービス業の収益構造改革', '事業再生プロジェクト成功'],
    certifications: ['公認会計士', '中小企業診断士', 'IFRS認定'],
    region: '愛知県',
    phoneNumber: '090-5678-9012'
  }
];

async function restoreSampleData(dryRun = true) {
  console.log('🔄 サンプルCFOデータ復旧開始');
  console.log(dryRun ? '(ドライラン - 実際の作成は行いません)' : '(実際にデータを作成します)');
  
  try {
    for (const cfoData of sampleCFOs) {
      console.log(`\\n👤 処理中: ${cfoData.displayName} (${cfoData.email})`);
      
      if (dryRun) {
        console.log(`   📧 メール: ${cfoData.email}`);
        console.log(`   👤 表示名: ${cfoData.displayName}`);
        console.log(`   💼 経験年数: ${cfoData.experienceYears}年`);
        console.log(`   📍 地域: ${cfoData.region}`);
        continue;
      }
      
      // 既存のユーザーをチェック
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('rextrix_users')
        .select('id')
        .eq('email', cfoData.email)
        .single();
      
      let userId;
      
      if (existingUser) {
        console.log(`   ⚠️  既存ユーザーをスキップ: ${cfoData.email}`);
        continue;
      } else {
        // 新しいユーザーを作成
        userId = uuidv4();
        const { error: userError } = await supabaseAdmin
          .from('rextrix_users')
          .insert({
            id: userId,
            email: cfoData.email,
            user_type: 'cfo',
            status: 'active',
            email_verified: true
          });
          
        if (userError) {
          console.error(`   ❌ ユーザー作成エラー:`, userError);
          continue;
        }
        console.log(`   ✅ ユーザー作成完了`);
      }
      
      // ユーザープロファイル作成
      const { error: profileError } = await supabaseAdmin
        .from('rextrix_user_profiles')
        .insert({
          user_id: userId,
          display_name: cfoData.displayName,
          nickname: cfoData.nickname,
          phone_number: cfoData.phoneNumber,
          region: cfoData.region,
          introduction: cfoData.experienceSummary
        });
        
      if (profileError) {
        console.error(`   ❌ プロファイル作成エラー:`, profileError);
        continue;
      }
      console.log(`   ✅ プロファイル作成完了`);
      
      // CFOプロファイル作成
      const { error: cfoError } = await supabaseAdmin
        .from('rextrix_cfos')
        .insert({
          user_id: userId,
          experience_years: cfoData.experienceYears,
          experience_summary: cfoData.experienceSummary,
          achievements: cfoData.achievements,
          certifications: cfoData.certifications,
          is_available: true,
          rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // 3.0-5.0のランダム評価
          review_count: Math.floor(Math.random() * 20) + 5 // 5-25のランダムレビュー数
        });
        
      if (cfoError) {
        console.error(`   ❌ CFOプロファイル作成エラー:`, cfoError);
        continue;
      }
      console.log(`   ✅ CFOプロファイル作成完了`);
    }
    
  } catch (error) {
    console.error('❌ 復旧エラー:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');
  
  console.log('🗄️ サンプルデータ復旧ツール\\n');
  
  await restoreSampleData(!executeMode);
  
  if (!executeMode) {
    console.log('\\n💡 実際に作成するには --execute フラグを付けて実行してください');
  }
  
  console.log('\\n✨ 完了');
}

main().catch(console.error);