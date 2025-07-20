// CFO登録フォームとプロフィール編集項目の違いを分析

console.log('🔍 CFO登録フォームとプロフィール編集項目の分析\n');

console.log('📊 CFO登録フォーム（register/page.tsx）の現在の項目:');
console.log('基本情報:');
console.log('- email (必須)');
console.log('- password (必須)');
console.log('- displayName (必須)');
console.log('- nickname (任意)');
console.log('');
console.log('CFO固有情報（全て任意）:');
console.log('- location: テキスト入力（居住地）');
console.log('- workingHours: テキスト入力（週の稼働可能時間）');
console.log('- selectedSkills: 6大分類のスキルチェックボックス');
console.log('- experience: テキストエリア（経歴）');
console.log('- possibleTasks: テキストエリア（可能な業務）');
console.log('- certifications: テキストエリア（保有資格）');
console.log('- monthlyCompensation: テキストエリア（想定月額報酬）');
console.log('- workingArea: テキストエリア（対応可能エリア）');
console.log('- introduction: テキストエリア（紹介文）');
console.log('- workPreference: セレクト（稼働希望）');
console.log('- compensationRange: テキスト（希望報酬）');
console.log('');

console.log('🎯 CFOプロフィール編集項目（EssentialProfileInputs + StructuredProfileInputs）:');
console.log('');
console.log('【EssentialProfileInputs（シンプル版・必須項目）】:');
console.log('💰 報酬設定:');
console.log('- compensationType: "monthly" | "negotiable"');
console.log('- monthlyFeeMin: 5万円〜250万円（選択式）');
console.log('- monthlyFeeMax: 5万円〜250万円（選択式）');
console.log('');
console.log('⏰ 稼働条件:');
console.log('- weeklyDays: 1〜5日（選択式）');
console.log('- weeklyDaysFlexible: boolean（応相談）');
console.log('');
console.log('🗺️ 対応エリア:');
console.log('- supportedPrefectures: 関東・関西等6エリア（複数選択）');
console.log('- fullRemoteAvailable: boolean（完全リモート対応）');
console.log('');

console.log('【StructuredProfileInputs（詳細版・任意項目）】:');
console.log('💰 報酬設定（詳細）:');
console.log('- compensationType: 5種類（時給制・月額制・プロジェクト単位・成果報酬・応相談）');
console.log('- hourlyRateMin/Max: 3,000円〜15,000円（選択式）');
console.log('- monthlyFeeMin/Max: 5万円〜50万円（選択式）');
console.log('- compensationNegotiable: boolean');
console.log('');
console.log('⏰ 稼働条件（詳細）:');
console.log('- weeklyDays: 1〜5日（選択式）');
console.log('- weeklyDaysFlexible: boolean');
console.log('- dailyHours: 2〜10時間（選択式）');
console.log('- dailyHoursFlexible: boolean');
console.log('- preferredTimeSlots: 朝・昼・夕方・時間帯問わず（複数選択）');
console.log('- workStyles: フルリモート・ハイブリッド・オンサイト（複数選択）');
console.log('');
console.log('🗺️ 地域・対応エリア（詳細）:');
console.log('- supportedPrefectures: 9都道府県（複数選択）');
console.log('- businessTripLevel: 出張不可・国内出張可・海外出張可');
console.log('- fullRemoteAvailable: boolean');
console.log('');
console.log('🎓 経験・レベル:');
console.log('- cfoExperienceYears: 0〜20年（選択式）');
console.log('- cfoLevel: 5段階（アシスタント〜フラクショナル）');
console.log('- industryExperience: 9業界（複数選択）');
console.log('- companySizeExperience: 5段階（複数選択）');
console.log('- projectExperience: 7種類（複数選択）');

console.log('');
console.log('⚠️  問題点の特定:');
console.log('');
console.log('1. 【項目の不整合】');
console.log('登録フォーム → プロフィール編集での変換が不可能:');
console.log('- location（テキスト） → supportedPrefectures（選択式エリア）');
console.log('- workingHours（テキスト） → weeklyDays（選択式日数）');
console.log('- monthlyCompensation（テキスト） → monthlyFeeMin/Max（選択式金額）');
console.log('- workingArea（テキスト） → supportedPrefectures（選択式）');
console.log('');

console.log('2. 【新規必須項目が登録時に未設定】');
console.log('EssentialProfileInputsの必須項目が登録時に収集されていない:');
console.log('- compensationType（月額制 or 応相談）');
console.log('- monthlyFeeMin/Max（具体的な金額）');
console.log('- weeklyDays（週稼働日数）');
console.log('- supportedPrefectures（対応エリア）');
console.log('');

console.log('3. 【レガシーフィールドの問題】');
console.log('登録時のテキスト項目が後から活用しにくい:');
console.log('- selectedSkills → 検索・絞り込みで活用可能');
console.log('- experience, possibleTasks等 → 検索困難なテキストデータ');
console.log('');

console.log('💡 修正方針:');
console.log('');
console.log('A. 【登録フォームをEssentialProfileInputsに統一】');
console.log('- 必須項目: compensationType, monthlyFeeMin/Max, weeklyDays, supportedPrefectures');
console.log('- 任意項目: 既存のテキスト項目は残す（後方互換性）');
console.log('');
console.log('B. 【登録APIの対応】');
console.log('- 新しい構造化フィールドをcfo_profilesテーブルに保存');
console.log('- 既存のテキストフィールドも並行保存');
console.log('');
console.log('C. 【段階的移行】');
console.log('- 新規登録: 構造化フィールド必須');
console.log('- 既存ユーザー: プロフィール編集で段階的に構造化データ追加');

console.log('\n✅ 分析完了');