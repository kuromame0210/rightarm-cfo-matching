// 重要データバックアップスクリプト
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function backupCriticalData() {
  try {
    console.log('\n=== 重要データバックアップ開始 ===');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const backupDir = `backup_${timestamp}`;
    
    // バックアップディレクトリ作成
    await fs.mkdir(backupDir, { recursive: true });
    console.log(`📁 バックアップディレクトリ作成: ${backupDir}`);

    // 1. rextrix_cfos バックアップ
    console.log('\n1. rextrix_cfos バックアップ');
    const { data: cfosData, error: cfosError } = await supabase
      .from('rextrix_cfos')
      .select('*');
    
    if (cfosError) {
      console.error('CFOデータ取得エラー:', cfosError);
    } else {
      await fs.writeFile(
        `${backupDir}/rextrix_cfos.json`, 
        JSON.stringify(cfosData, null, 2)
      );
      console.log(`✅ rextrix_cfos: ${cfosData.length}件 バックアップ完了`);
    }

    // 2. rextrix_user_profiles バックアップ
    console.log('\n2. rextrix_user_profiles バックアップ');
    const { data: profilesData, error: profilesError } = await supabase
      .from('rextrix_user_profiles')
      .select('*');
    
    if (profilesError) {
      console.error('プロフィールデータ取得エラー:', profilesError);
    } else {
      await fs.writeFile(
        `${backupDir}/rextrix_user_profiles.json`, 
        JSON.stringify(profilesData, null, 2)
      );
      console.log(`✅ rextrix_user_profiles: ${profilesData.length}件 バックアップ完了`);
    }

    // 3. rextrix_companies バックアップ
    console.log('\n3. rextrix_companies バックアップ');
    const { data: companiesData, error: companiesError } = await supabase
      .from('rextrix_companies')
      .select('*');
    
    if (companiesError) {
      console.error('企業データ取得エラー:', companiesError);
    } else {
      await fs.writeFile(
        `${backupDir}/rextrix_companies.json`, 
        JSON.stringify(companiesData, null, 2)
      );
      console.log(`✅ rextrix_companies: ${companiesData.length}件 バックアップ完了`);
    }

    // 4. rextrix_users バックアップ（参照用）
    console.log('\n4. rextrix_users バックアップ');
    const { data: usersData, error: usersError } = await supabase
      .from('rextrix_users')
      .select('*');
    
    if (usersError) {
      console.error('ユーザーデータ取得エラー:', usersError);
    } else {
      await fs.writeFile(
        `${backupDir}/rextrix_users.json`, 
        JSON.stringify(usersData, null, 2)
      );
      console.log(`✅ rextrix_users: ${usersData.length}件 バックアップ完了`);
    }

    // 5. rextrix_messages バックアップ
    console.log('\n5. rextrix_messages バックアップ');
    const { data: messagesData, error: messagesError } = await supabase
      .from('rextrix_messages')
      .select('*');
    
    if (messagesError) {
      console.error('メッセージデータ取得エラー:', messagesError);
    } else {
      await fs.writeFile(
        `${backupDir}/rextrix_messages.json`, 
        JSON.stringify(messagesData, null, 2)
      );
      console.log(`✅ rextrix_messages: ${messagesData.length}件 バックアップ完了`);
    }

    // 6. バックアップサマリー作成
    const summary = {
      backup_date: new Date().toISOString(),
      tables_backed_up: {
        rextrix_users: usersData?.length || 0,
        rextrix_cfos: cfosData?.length || 0,
        rextrix_user_profiles: profilesData?.length || 0,
        rextrix_companies: companiesData?.length || 0,
        rextrix_messages: messagesData?.length || 0
      },
      total_records: (usersData?.length || 0) + (cfosData?.length || 0) + 
                     (profilesData?.length || 0) + (companiesData?.length || 0) + 
                     (messagesData?.length || 0),
      backup_directory: backupDir
    };

    await fs.writeFile(
      `${backupDir}/backup_summary.json`, 
      JSON.stringify(summary, null, 2)
    );

    console.log('\n📋 バックアップサマリー:');
    console.log(`📁 ディレクトリ: ${backupDir}`);
    console.log(`📊 総レコード数: ${summary.total_records}件`);
    console.log('📄 バックアップファイル:');
    Object.entries(summary.tables_backed_up).forEach(([table, count]) => {
      console.log(`  - ${table}.json: ${count}件`);
    });

    console.log('\n✅ 重要データバックアップ完了');
    console.log(`💾 バックアップ場所: ./${backupDir}/`);

  } catch (error) {
    console.error('バックアップエラー:', error);
  }
}

backupCriticalData();