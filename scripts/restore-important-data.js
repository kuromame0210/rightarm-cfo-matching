/**
 * 重要データ復旧スクリプト
 * cfo.md と biz.md のデータをデータベースに復旧します
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

// CFOデータ（cfo.mdから）
const cfoData = [
  {
    email: 'daigo.sato@example.com',
    displayName: '佐藤大悟',
    nickname: 'Dai88',
    region: '千葉県千葉市',
    phoneNumber: '090-1111-0001',
    experienceYears: 20,
    experienceSummary: 'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
    achievements: [
      '7つの事業を運営',
      '2社をM&Aで売却',
      'フィリピン・セブ島での複数事業展開',
      '投資用ホテル開発',
      'USでのIPOサポート実績'
    ],
    certifications: [],
    specialties: ['海外・英語を絡めた業務', 'USへの上場サポート', '投資案件発掘', '不動産コンサルティング', '通訳・翻訳'],
    hourlyRate: 62500, // 月10万円÷週16時間を時給換算
    availabilityStatus: 'available',
    workPreference: 'リモート主体（出張対応可）'
  },
  {
    email: 'tomohiko.sato@example.com',
    displayName: '佐藤智彦',
    nickname: 'tomo',
    region: '東京都新宿区',
    phoneNumber: '090-1111-0002',
    experienceYears: 14,
    experienceSummary: '都内の地方銀行で法人への融資業務、個人への資産運用提案業務に14年従事。現在副業で資金調達支援を行っており、直近で創業融資の調達に成功。実務に強くスピード感を持って対応。',
    achievements: [
      '地方銀行14年の融資業務実績',
      '創業融資調達成功',
      '個人資産運用提案業務'
    ],
    certifications: ['FP2級', '銀行業務検定財務2級', '証券外務員一種'],
    specialties: ['資金調達', '補助金助成金相談', '個人資産運用相談'],
    hourlyRate: 12500, // 月5万円÷週10時間を時給換算
    availabilityStatus: 'available',
    workPreference: 'リモート主体（東京近郊対面可）'
  },
  {
    email: 'taigen.sugawara@example.com',
    displayName: '菅原大源',
    nickname: 'Taigen',
    region: 'アメリカ・カリフォルニア州',
    phoneNumber: '090-1111-0003',
    experienceYears: 8,
    experienceSummary: '住友商事、KPMG FAS、Air Water Americaでの豊富な海外事業経験。戦略と財務両輪の視点で事業成長を支援。M&Aアドバイザリー、海外新規事業投資業務に精通。',
    achievements: [
      '住友商事での海外新規事業投資業務',
      'KPMG FASでのM&Aアドバイザリー',
      '海外事業会社の経営管理・支援'
    ],
    certifications: ['米国公認会計士', '簿記2級', 'FP2級'],
    specialties: ['事業計画作成', '財務モデル作成', '資金調達戦略支援', '補助金申請支援', 'M&A支援', '経営管理・改善提言'],
    hourlyRate: 23400, // 月15万円÷週16時間を時給換算
    availabilityStatus: 'available',
    workPreference: 'フルリモート'
  },
  {
    email: 'nanalysts@example.com',
    displayName: 'nanalysts',
    nickname: '副島',
    region: '関西',
    phoneNumber: '090-1111-0004',
    experienceYears: 16,
    experienceSummary: '大手金融機関勤務16年。海外駐在での海外進出業務・現地通貨建て融資業務8年、ベンチャーキャピタル業務6年。50社以上のスタートアップへ投資実行とハンズオン支援。',
    achievements: [
      '海外駐在8年の海外進出支援実績',
      'VC業務6年',
      '50社以上のスタートアップ投資・支援',
      '現地通貨建て融資業務'
    ],
    certifications: ['証券アナリスト', 'FP2級'],
    specialties: ['資金調達支援（デット、エクイティー）', 'ピッチブック作成・添削', '海外進出支援', 'ステージ別企業価値向上支援'],
    hourlyRate: 12500, // 月5万円÷週10時間を時給換算
    availabilityStatus: 'available',
    workPreference: 'フルリモート'
  },
  {
    email: 'ibkipu@example.com',
    displayName: '田中（仮名）',
    nickname: 'ibkipu',
    region: '北米',
    phoneNumber: '090-1111-0005',
    experienceYears: 7,
    experienceSummary: '大手総合商社財務部、Big4系コンサルでの豊富な財務業務改革経験。北米MBA取得。北米進出中の日本企業数社にて、リモートCFO的立場での支援実績。経営者・現場間の翻訳と意思決定支援が得意。',
    achievements: [
      '総合商社財務部での予実管理・経営レポート',
      'Big4系コンサルでの財務業務改革',
      '北米MBA取得',
      '複数企業でのリモートCFO支援'
    ],
    certifications: ['MBA（北米）', '日商簿記2級'],
    specialties: ['経営レポート・ストーリーテリング', '資金繰り管理・資金調達', '予実管理・KPI設計', '決算早期化・効率化', '管理会計導入', 'M&A時のDD・PMI支援'],
    hourlyRate: 7000, // 時給4,000〜10,000円の中央値
    availabilityStatus: 'available',
    workPreference: 'フルリモート（日本時間対応可）'
  }
];

// 企業データ（biz.mdから）
const companyData = [
  {
    email: 'contact@hokuto-seimitsu.co.jp',
    companyName: '株式会社北斗精密',
    region: '新潟県長岡市',
    industry: '製造業',
    description: '電子機器向け高精度切削部品を製造。創業25年、国内Tier-1サプライヤーへの直販比率が7割。',
    employeeCount: 80,
    foundedYear: 1999,
    businessModel: 'B2B製造業',
    challenges: ['管理会計強化', '原価計算', '銀行融資'],
    estimatedRevenue: '10〜30億円'
  },
  {
    email: 'info@greengrowth-llc.jp',
    companyName: 'グリーングロース合同会社',
    region: '北海道旭川市',
    industry: 'アグリテック',
    description: '植物工場によるリーフレタスの周年栽培を行うアグリテック企業。BtoBでスーパー・外食チェーンに卸売。',
    employeeCount: 25,
    foundedYear: 2020,
    businessModel: 'B2B農業',
    challenges: ['資金調達', '補助金活用', '財務DX・システム導入'],
    estimatedRevenue: '1〜10億円'
  },
  {
    email: 'contact@sakura-holdings.co.jp',
    companyName: '株式会社さくらホールディングス',
    region: '長野県・群馬県',
    industry: '観光・宿泊業',
    description: '長野・群馬で温泉旅館4施設を運営。観光客回復に伴いM&Aで宿泊施設を拡大中。',
    employeeCount: 200,
    foundedYear: 2010,
    businessModel: 'B2C宿泊業',
    challenges: ['M&A関連', '事業承継・再生', '組織・ガバナンス'],
    estimatedRevenue: '30〜50億円'
  },
  {
    email: 'info@stratos-energy.co.jp',
    companyName: '株式会社ストラトスエナジー',
    region: '京都府',
    industry: '再生エネルギー',
    description: '京都大学発の再エネベンチャー。小型風力発電システムの研究開発とPPAモデルでの販売を推進。',
    employeeCount: 15,
    foundedYear: 2022,
    businessModel: 'B2B技術開発',
    challenges: ['IPO準備', '資金調達', '投資家対応'],
    estimatedRevenue: '1億円未満'
  },
  {
    email: 'contact@bluewave-robotics.co.jp',
    companyName: '株式会社ブルーウェーブロボティクス',
    region: '兵庫県神戸市',
    industry: 'ロボティクス',
    description: '物流倉庫向け自律走行AGVを設計・製造。サブスクリプションモデルで国内大手3PLと契約中。',
    employeeCount: 120,
    foundedYear: 2018,
    businessModel: 'B2Bサブスクリプション',
    challenges: ['財務DX・システム導入', '予実管理', '管理会計強化', '資金調達'],
    estimatedRevenue: '50億円以上'
  }
];

async function restoreImportantData(dryRun = true) {
  console.log('🔄 重要データ復旧開始');
  console.log(dryRun ? '(ドライラン - 実際の作成は行いません)' : '(実際にデータを作成します)');
  
  try {
    console.log('\\n👤 CFOデータの復旧...');
    
    for (const cfo of cfoData) {
      console.log(`\\n処理中: ${cfo.displayName} (${cfo.email})`);
      
      if (dryRun) {
        console.log(`   📧 メール: ${cfo.email}`);
        console.log(`   👤 表示名: ${cfo.displayName}`);
        console.log(`   💼 経験年数: ${cfo.experienceYears}年`);
        console.log(`   📍 地域: ${cfo.region}`);
        console.log(`   💰 時給: ${cfo.hourlyRate}円`);
        continue;
      }
      
      // 既存ユーザーチェック
      const { data: existingUser } = await supabaseAdmin
        .from('rextrix_users')
        .select('id')
        .eq('email', cfo.email)
        .single();
      
      let userId;
      
      if (existingUser) {
        console.log(`   ⚠️  既存ユーザーをスキップ: ${cfo.email}`);
        continue;
      }
      
      // ユーザー作成
      userId = uuidv4();
      const { error: userError } = await supabaseAdmin
        .from('rextrix_users')
        .insert({
          id: userId,
          email: cfo.email,
          user_type: 'cfo',
          status: 'active',
          email_verified: true
        });
        
      if (userError) {
        console.error(`   ❌ ユーザー作成エラー:`, userError);
        continue;
      }
      console.log(`   ✅ ユーザー作成完了`);
      
      // ユーザープロファイル作成
      const { error: profileError } = await supabaseAdmin
        .from('rextrix_user_profiles')
        .insert({
          user_id: userId,
          display_name: cfo.displayName,
          nickname: cfo.nickname,
          phone_number: cfo.phoneNumber,
          region: cfo.region,
          introduction: cfo.experienceSummary,
          work_preference: cfo.workPreference
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
          experience_years: cfo.experienceYears,
          experience_summary: cfo.experienceSummary,
          achievements: cfo.achievements,
          certifications: cfo.certifications,
          is_available: cfo.availabilityStatus === 'available',
          rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0
          review_count: Math.floor(Math.random() * 15) + 5 // 5-20
        });
        
      if (cfoError) {
        console.error(`   ❌ CFOプロファイル作成エラー:`, cfoError);
        continue;
      }
      console.log(`   ✅ CFOプロファイル作成完了`);
    }
    
    console.log('\\n🏢 企業データの復旧...');
    
    for (const company of companyData) {
      console.log(`\\n処理中: ${company.companyName} (${company.email})`);
      
      if (dryRun) {
        console.log(`   📧 メール: ${company.email}`);
        console.log(`   🏢 会社名: ${company.companyName}`);
        console.log(`   🏭 業界: ${company.industry}`);
        console.log(`   📍 地域: ${company.region}`);
        console.log(`   💰 推定年商: ${company.estimatedRevenue}`);
        continue;
      }
      
      // 既存ユーザーチェック
      const { data: existingUser } = await supabaseAdmin
        .from('rextrix_users')
        .select('id')
        .eq('email', company.email)
        .single();
      
      let userId;
      
      if (existingUser) {
        console.log(`   ⚠️  既存ユーザーをスキップ: ${company.email}`);
        continue;
      }
      
      // ユーザー作成
      userId = uuidv4();
      const { error: userError } = await supabaseAdmin
        .from('rextrix_users')
        .insert({
          id: userId,
          email: company.email,
          user_type: 'company',
          status: 'active',
          email_verified: true
        });
        
      if (userError) {
        console.error(`   ❌ ユーザー作成エラー:`, userError);
        continue;
      }
      console.log(`   ✅ ユーザー作成完了`);
      
      // ユーザープロファイル作成
      const { error: profileError } = await supabaseAdmin
        .from('rextrix_user_profiles')
        .insert({
          user_id: userId,
          display_name: company.companyName,
          region: company.region,
          introduction: company.description
        });
        
      if (profileError) {
        console.error(`   ❌ プロファイル作成エラー:`, profileError);
        continue;
      }
      console.log(`   ✅ プロファイル作成完了`);
      
      // 企業プロファイル作成
      const { error: companyError } = await supabaseAdmin
        .from('rextrix_companies')
        .insert({
          user_id: userId,
          company_name: company.companyName,
          industry: company.industry,
          employee_count: company.employeeCount,
          founded_year: company.foundedYear,
          description: company.description,
          business_model: company.businessModel,
          challenges: company.challenges
        });
        
      if (companyError) {
        console.error(`   ❌ 企業プロファイル作成エラー:`, companyError);
        continue;
      }
      console.log(`   ✅ 企業プロファイル作成完了`);
    }
    
  } catch (error) {
    console.error('❌ 復旧エラー:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const executeMode = args.includes('--execute');
  
  console.log('🗄️ 重要データ復旧ツール\\n');
  
  await restoreImportantData(!executeMode);
  
  if (!executeMode) {
    console.log('\\n💡 実際に作成するには --execute フラグを付けて実行してください');
  }
  
  console.log('\\n✨ 完了');
}

main().catch(console.error);