// 詳細データギャップ分析スクリプト
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

async function detailedDataGapAnalysis() {
  try {
    console.log('\n=== 詳細データギャップ分析 ===');

    // cfo.mdの期待データ構造
    const cfoMdExpectedData = {
      'tomohiko.sato@example.com': {
        name: '佐藤智彦',
        nickname: 'tomo',
        region: '東京都新宿区',
        work_preference: '週5〜10時間、日数は応相談',
        compensation_range: '月5万円〜、単発での資金調達等について成果報酬応相談(上限は調達額4%上限)',
        title: '地方銀行融資業務14年・資金調達支援専門家',
        detailed_experience: '2007年〜2021年:都内の地方銀行で法人への融資業務、個人への資産運用提案業務\n2021年〜現在:ゴルフ場の運営会社で経理総務労務業務',
        specialties: ['資金調達', '融資業務', '補助金助成金相談', '個人資産運用相談', '創業融資', '地方銀行業務', '法人融資', '資産運用提案'],
        certifications: ['FP2級', '銀行業務検定財務2級', '証券外務員一種'],
        service_area: '全国リモートOK、東京近郊は対面可',
        introduction: '現在副業で資金調達支援を行っており、直近で創業融資の調達に成功。実務に強くスピード感を持って対応できます。また補助金助成金に関するリサーチや相談も行っております。'
      },
      'taigen.sugawara@example.com': {
        name: '菅原大源',
        nickname: 'Taigen',
        region: 'アメリカ・カリフォルニア州',
        work_preference: '週4日 4時間程度',
        compensation_range: '月15万円〜、週4日 1時間/日 16時間/月　稼働想定',
        title: '住友商事・KPMG出身・米国公認会計士',
        detailed_experience: '2017年〜2023年:住友商事株式会社でアルミ業界における海外新規事業投資業務\n2023年〜2024年:KPMG FASでM&Aアドバイザリー業務\n2025年〜: Air Water Americaにて海外事業会社の経営管理・経営支援業務、新規事業投資業務',
        specialties: ['事業計画作成', '財務モデル作成', '資金調達戦略支援', '補助金申請支援', 'M&A支援', '経営指標管理', '財務分析', '操業改善提言', '海外新規事業投資', 'M&Aアドバイザリー', '経営管理', '経営支援'],
        certifications: ['米国公認会計士', '簿記2級', 'FP2級'],
        service_area: '全国リモートOK',
        introduction: '戦略と財務両輪の視点で事業成長を支援させて頂きます。'
      },
      'nanalysts@example.com': {
        name: 'nanalysts',
        nickname: 'nanalysts',
        region: '関西',
        work_preference: '週2日・5時間程度',
        compensation_range: '月5万円〜',
        title: '金融機関16年・VC業務・海外駐在経験',
        detailed_experience: '2004年〜現在:大手金融機関勤務\n主な業務:\n・海外駐在にて海外進出業務・現地通貨建て融資業務(8年)\n・ベンチャーキャピタル業務（6年）\nなどを中心として法人営業を16年実施。',
        specialties: ['資金調達支援', 'デット', 'エクイティー', 'ピッチブック作成', 'ピッチブック添削', '海外進出支援', 'ベンチャーキャピタル業務', '海外駐在業務', '現地通貨建て融資', '法人営業', 'スタートアップ投資', 'ハンズオン支援'],
        certifications: ['証券アナリスト', 'FP２級'],
        service_area: 'リモートにて全国',
        introduction: '５０社以上のスタートアップへ投資を行いハンズオンをして参りましたので、ステージに合わせた企業価値向上支援が可能です'
      },
      'ibkipu@example.com': {
        name: '田中',
        nickname: 'ibkipu',
        region: '北米在住',
        work_preference: '週5〜10時間程度（柔軟に調整可能）',
        compensation_range: '時給4,000〜10,000円（内容・条件により応相談）※成果報酬・月額固定契約など柔軟にご相談可能',
        title: '総合商社財務部・Big4コンサル・北米MBA',
        detailed_experience: '・大手総合商社 財務部（2016〜2019）\n　− 予実管理／経営レポート／本社経理連携\n・Big4系コンサル（2019〜2023）\n　− 上場・非上場企業向けの財務業務改革\n　− 決算早期化・グループ連結対応・管理会計導入支援',
        specialties: ['経営陣向け報告資料作成', 'ストーリーテリング', '資金繰り管理', '資金調達', '金融機関対応', '予実管理の仕組み化', 'KPI設計', '決算早期化', '経理業務可視化', '経理業務効率化', '管理会計導入支援', '部門別損益', 'プロジェクト別採算', 'M&A財務DD', 'PMI初期フェーズ支援'],
        certifications: ['MBA（北米）', '日商簿記2級'],
        service_area: '北米在住／日本時間対応可（フルリモート）',
        introduction: '北米進出中の日本企業数社にて、リモートCFO的立場での支援実績あり。日本時間での対応・コミュニケーションに支障なし。経営者・現場間の"翻訳"と意思決定支援が得意です'
      }
    };

    // 対象CFOのデータを取得
    const targetEmails = Object.keys(cfoMdExpectedData);
    
    const { data: currentCfos, error: cfosError } = await supabase
      .from('rextrix_cfos')
      .select(`
        *,
        rextrix_users!inner(
          email,
          rextrix_user_profiles(*)
        )
      `)
      .in('rextrix_users.email', targetEmails);

    if (cfosError) {
      console.error('CFOデータ取得エラー:', cfosError);
      return;
    }

    console.log(`\n対象CFO ${currentCfos.length}名のデータギャップ分析:\n`);

    // 各CFOのデータギャップを詳細分析
    currentCfos.forEach(currentCfo => {
      const email = currentCfo.rextrix_users.email;
      const currentProfile = currentCfo.rextrix_users.rextrix_user_profiles[0];
      const expectedData = cfoMdExpectedData[email];

      console.log(`\n🔍 === ${expectedData.name} (${email}) ===`);

      // rextrix_user_profiles テーブルのギャップ
      console.log('\n📋 USER PROFILES テーブル分析:');
      const profileGaps = {
        display_name: {
          current: currentProfile?.display_name || 'NULL',
          expected: expectedData.name,
          missing: !currentProfile?.display_name
        },
        nickname: {
          current: currentProfile?.nickname || 'NULL',
          expected: expectedData.nickname,
          missing: !currentProfile?.nickname
        },
        region: {
          current: currentProfile?.region || 'NULL',
          expected: expectedData.region,
          missing: !currentProfile?.region
        },
        work_preference: {
          current: currentProfile?.work_preference || 'NULL',
          expected: expectedData.work_preference,
          missing: !currentProfile?.work_preference
        },
        compensation_range: {
          current: currentProfile?.compensation_range || 'NULL',
          expected: expectedData.compensation_range,
          missing: !currentProfile?.compensation_range
        },
        introduction: {
          current: currentProfile?.introduction || 'NULL',
          expected: expectedData.introduction,
          missing: !currentProfile?.introduction
        }
      };

      Object.entries(profileGaps).forEach(([field, data]) => {
        const status = data.missing ? '❌ 未設定' : '✅ 設定済み';
        console.log(`  ${field}: ${status}`);
        console.log(`    現在値: "${data.current}"`);
        console.log(`    期待値: "${data.expected}"`);
      });

      // rextrix_cfos テーブルのギャップ
      console.log('\n💼 CFO テーブル分析:');
      const cfoGaps = {
        title: {
          current: currentCfo.title || 'NULL',
          expected: expectedData.title,
          missing: !currentCfo.title
        },
        experience_summary: {
          current: currentCfo.experience_summary || 'NULL',
          expected: expectedData.detailed_experience,
          missing: !currentCfo.experience_summary || currentCfo.experience_summary.length < 100
        },
        specialties: {
          current: currentCfo.specialties || [],
          expected: expectedData.specialties,
          missing: !currentCfo.specialties || currentCfo.specialties.length === 0
        },
        certifications: {
          current: currentCfo.certifications || [],
          expected: expectedData.certifications,
          missing: !currentCfo.certifications || currentCfo.certifications.length === 0
        }
      };

      Object.entries(cfoGaps).forEach(([field, data]) => {
        const status = data.missing ? '❌ 未設定' : '✅ 設定済み';
        console.log(`  ${field}: ${status}`);
        if (field === 'specialties' || field === 'certifications') {
          console.log(`    現在数: ${Array.isArray(data.current) ? data.current.length : 0}項目`);
          console.log(`    期待数: ${data.expected.length}項目`);
        } else {
          const currentStr = typeof data.current === 'string' ? data.current.substring(0, 50) + '...' : String(data.current);
          console.log(`    現在値: "${currentStr}"`);
        }
      });

      // 緊急度判定
      const criticalMissing = Object.values({...profileGaps, ...cfoGaps}).filter(gap => gap.missing).length;
      const urgencyLevel = criticalMissing >= 6 ? '🔴 高' : criticalMissing >= 3 ? '🟡 中' : '🟢 低';
      console.log(`\n🎯 データ完成度: ${((12 - criticalMissing) / 12 * 100).toFixed(1)}%`);
      console.log(`🚨 更新緊急度: ${urgencyLevel} (${criticalMissing}/12項目が未設定)`);
    });

    // 全体サマリー
    console.log('\n\n📊 === 全体データギャップサマリー ===');
    
    const totalGaps = currentCfos.map(cfo => {
      const email = cfo.rextrix_users.email;
      const profile = cfo.rextrix_users.rextrix_user_profiles[0];
      const expectedData = cfoMdExpectedData[email];
      
      const missing = [
        !profile?.display_name,
        !profile?.nickname, 
        !profile?.region,
        !profile?.work_preference,
        !profile?.compensation_range,
        !profile?.introduction,
        !cfo.title,
        !cfo.experience_summary || cfo.experience_summary.length < 100,
        !cfo.specialties || cfo.specialties.length === 0,
        !cfo.certifications || cfo.certifications.length === 0
      ].filter(Boolean).length;

      return {
        name: expectedData.name,
        email: email,
        missing: missing,
        completion: ((10 - missing) / 10 * 100).toFixed(1)
      };
    });

    totalGaps.forEach(gap => {
      const urgency = gap.missing >= 6 ? '🔴' : gap.missing >= 3 ? '🟡' : '🟢';
      console.log(`${urgency} ${gap.name}: ${gap.completion}% 完成 (${gap.missing}/10項目不足)`);
    });

    console.log('\n🎯 推奨更新順序:');
    totalGaps
      .sort((a, b) => b.missing - a.missing)
      .forEach((gap, index) => {
        console.log(`${index + 1}. ${gap.name} (${gap.missing}項目不足)`);
      });

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

detailedDataGapAnalysis();