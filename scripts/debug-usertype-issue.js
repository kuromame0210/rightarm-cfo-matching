// CFOユーザーがCFO一覧を見ている問題のデバッグ

console.log('🔍 CFOユーザーがCFO一覧を見ている問題の調査\n');

console.log('📊 考えられる原因:');

console.log('\n1. 🔄 userTypeの値が期待と異なる:');
console.log('   - データベースの user_type カラムが "cfo" 以外の値になっている');
console.log('   - 例: "CFO", "Cfo", "cfo ", null, undefined など');
console.log('   - 厳密な文字列比較で一致しない');

console.log('\n2. 🚫 リダイレクト処理が無効化されている:');
console.log('   - useEffect の依存配列に問題がある');
console.log('   - isAuthenticated の状態が false のまま');
console.log('   - userType の取得が遅れている');

console.log('\n3. 🔀 直接URLアクセス:');
console.log('   - /discover/cfos に直接アクセスしている');
console.log('   - ブラウザバック/フォワードでリダイレクトをバイパス');
console.log('   - ブックマークから直接アクセス');

console.log('\n4. 🗄️ セッション/認証の問題:');
console.log('   - NextAuth.jsのセッションにuserTypeが正しく格納されていない');
console.log('   - JWTトークンの更新タイミングの問題');
console.log('   - セッションの読み込み順序の問題');

console.log('\n5. 🎯 デフォルト値の影響:');
console.log('   - const userType = user?.userType || "company"');
console.log('   - userTypeがnull/undefinedの場合、"company"にフォールバック');
console.log('   - 期待: cfo → 企業一覧、実際: company → CFO一覧');

console.log('\n📋 デバッグ手順:');
console.log('1. コンソールでuserTypeの実際の値を確認');
console.log('2. データベースのuser_typeカラムの値を直接確認');
console.log('3. home/page.tsxのリダイレクト処理にconsole.logを追加');
console.log('4. セッション情報の詳細を確認');

console.log('\n🔧 推奨される修正:');
console.log('1. デバッグログの追加（一時的）');
console.log('2. データベースのuser_type値の正規化');
console.log('3. より厳密なリダイレクト条件の実装');
console.log('4. CFO検索ページでのユーザータイプチェック追加');

console.log('\n⚠️  最も可能性が高い原因:');
console.log('userTypeの値が期待される "cfo" と異なっている');
console.log('（大文字小文字、スペース、null値など）');