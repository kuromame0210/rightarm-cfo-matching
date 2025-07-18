// 手動でお気に入り機能をデバッグ

// 1. NextAuth.js セッションをシミュレート
const mockSession = {
  user: {
    id: '1276e9f8-4894-488b-8344-f6f46760af66',
    email: 'test@example.com',
    userType: 'company'
  }
}

// 2. interests-context.tsx のロジックをテスト
console.log('🔍 お気に入り機能のデバッグ開始')

// 3. api-client.ts のロジックをテスト
console.log('📝 API Client のテスト')

// 4. 実際のAPI呼び出しフロー
console.log('\n🚀 実際のAPI呼び出しフロー:')
console.log('1. CFO一覧画面でお気に入りボタンをクリック')
console.log('2. handleInterested 関数が呼び出される')
console.log('3. toggleInterest(cfo.id, "cfo") が呼び出される')
console.log('4. interests-context.tsx の toggleInterest が実行される')
console.log('5. isInterested(targetUserId) をチェック')
console.log('6. addInterest または removeInterest を呼び出し')
console.log('7. api.interests.add または api.interests.remove を呼び出し')
console.log('8. API が NextAuth.js セッションを確認')
console.log('9. likes テーブルに INSERT または DELETE')

// 5. 考えられるエラー原因
console.log('\n❌ 考えられるエラー原因:')
console.log('1. 認証エラー (401 Unauthorized)')
console.log('   - NextAuth.js セッションが無効')
console.log('   - セッションクッキーが送信されない')
console.log('   - getServerSession() が null を返す')

console.log('\n2. データベースエラー')
console.log('   - 外部キー制約違反')
console.log('   - 重複キー制約違反')
console.log('   - Supabase RLS ポリシー違反')

console.log('\n3. フロントエンドエラー')
console.log('   - interests-context の状態管理エラー')
console.log('   - API レスポンスの形式エラー')
console.log('   - 非同期処理の競合状態')

console.log('\n4. ネットワークエラー')
console.log('   - API エンドポイントに到達できない')
console.log('   - CORS エラー')
console.log('   - タイムアウトエラー')

// 6. デバッグ手順
console.log('\n🛠️ デバッグ手順:')
console.log('1. ブラウザの開発者ツールでネットワークタブを確認')
console.log('2. API リクエストのステータスコードを確認')
console.log('3. NextAuth.js セッションの状態を確認')
console.log('4. コンソールログでエラーメッセージを確認')
console.log('5. データベースのlikesテーブルを直接確認')

// 7. 修正方法
console.log('\n🔧 修正方法:')
console.log('1. 認証エラーの場合:')
console.log('   - NextAuth.js セッションの再取得')
console.log('   - api-client.ts の認証ヘッダー修正')
console.log('   - クッキーの設定確認')

console.log('\n2. データベースエラーの場合:')
console.log('   - 外部キー制約の確認')
console.log('   - RLS ポリシーの修正')
console.log('   - 重複処理の改善')

console.log('\n3. フロントエンドエラーの場合:')
console.log('   - エラーハンドリングの改善')
console.log('   - 状態管理の見直し')
console.log('   - ユーザーフィードバックの改善')

console.log('\n✅ 次のステップ: 実際のエラーを再現してログを収集')