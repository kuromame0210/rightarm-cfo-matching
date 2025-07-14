// 既存データから5テーブル最適化設計への移行スクリプト
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

async function migrateToOptimizedSchema() {
  try {
    console.log('\n=== 5テーブル最適化設計へのデータ移行開始 ===');
    
    // Step 1: 既存データの取得・検証
    console.log('\n1. 既存データの取得・検証');
    
    const { data: existingCfos, error: cfosError } = await supabase
      .from('rextrix_cfos')
      .select('*');
    
    const { data: existingUserProfiles, error: profilesError } = await supabase
      .from('rextrix_user_profiles')
      .select('*');
      
    const { data: existingCompanies, error: companiesError } = await supabase
      .from('rextrix_companies')
      .select('*');
      
    const { data: existingMessages, error: messagesError } = await supabase
      .from('rextrix_messages')
      .select('*');
    
    console.log(`📊 既存データ件数:`);
    console.log(`   - rextrix_cfos: ${existingCfos?.length || 0}件`);
    console.log(`   - rextrix_user_profiles: ${existingUserProfiles?.length || 0}件`);
    console.log(`   - rextrix_companies: ${existingCompanies?.length || 0}件`);
    console.log(`   - rextrix_messages: ${existingMessages?.length || 0}件`);
    
    // Step 2: 新テーブルの存在確認
    console.log('\n2. 新テーブルの存在確認');
    
    const newTables = [
      'rextrix_cfo_profiles_new',
      'rextrix_company_profiles_new',
      'rextrix_projects_new', 
      'rextrix_interactions_new'
    ];
    
    let allTablesExist = true;
    
    for (const tableName of newTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${tableName}: 存在しません`);
          allTablesExist = false;
        } else {
          console.log(`✅ ${tableName}: 存在確認`);
        }
      } catch (error) {
        console.log(`❌ ${tableName}: 確認エラー`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n⚠️  新テーブルが作成されていません。');
      console.log('📋 以下の手順で進めてください:');
      console.log('1. Supabase Dashboard → SQL Editor を開く');
      console.log('2. scripts/create-optimized-schema.sql の内容をコピー');
      console.log('3. SQL Editorで実行してテーブルを作成');
      console.log('4. このスクリプトを再実行');
      return;
    }
    
    // Step 3: CFOプロフィールデータの移行
    console.log('\n3. CFOプロフィールデータの移行');
    
    if (existingCfos && existingCfos.length > 0) {
      console.log(`📊 ${existingCfos.length}件のCFOデータを移行中...`);
      
      for (const cfo of existingCfos) {
        try {
          // 対応するユーザープロフィールを取得
          const userProfile = existingUserProfiles?.find(p => p.user_id === cfo.user_id);
          
          // CFO統合プロフィールデータを構築
          const migratedCfoData = {
            id: cfo.id, // 既存IDを維持
            user_id: cfo.user_id,
            display_name: cfo.name || userProfile?.full_name || 'Unknown',
            nickname: userProfile?.nickname,
            email: cfo.email || userProfile?.email || '',
            title: cfo.title || userProfile?.bio,
            experience_years: cfo.experience_years || 0,
            experience_summary: cfo.experience_summary,
            introduction: cfo.introduction || userProfile?.bio,
            is_available: cfo.is_available !== false,
            availability_status: cfo.availability_status || 'available',
            rating: parseFloat(cfo.rating) || 0.0,
            review_count: parseInt(cfo.review_count) || 0,
            completed_projects: parseInt(cfo.completed_projects) || 0,
            
            // JSONBデータの構築
            location_data: JSON.stringify({
              prefecture: cfo.location || userProfile?.location,
              remote_work: cfo.remote_work_available || false,
              travel_available: cfo.travel_available || false
            }),
            
            work_conditions: JSON.stringify({
              work_style: cfo.work_style,
              availability_hours: cfo.availability_hours,
              min_engagement_period: cfo.min_engagement_period
            }),
            
            compensation_data: JSON.stringify({
              hourly_rate: cfo.hourly_rate,
              daily_rate: cfo.daily_rate,
              monthly_rate: cfo.monthly_rate,
              currency: 'JPY'
            }),
            
            specialties: JSON.stringify(cfo.specialties || []),
            certifications: JSON.stringify(cfo.certifications || []),
            achievements: JSON.stringify(cfo.achievements || []),
            skills: JSON.stringify(cfo.skills || {}),
            languages: JSON.stringify(cfo.languages || ['ja']),
            
            // 検索用データ
            tags_for_search: cfo.tags || [],
            indexed_skills: Array.isArray(cfo.specialties) ? cfo.specialties : [],
            indexed_locations: [cfo.location].filter(Boolean),
            
            profile_completion_score: calculateCompletionScore(cfo, userProfile),
            profile_visibility: 'public',
            featured: cfo.featured || false,
            
            metadata: JSON.stringify({
              migrated_from: 'rextrix_cfos',
              original_created_at: cfo.created_at,
              migration_date: new Date().toISOString()
            })
          };
          
          // 新テーブルに挿入
          const { error: insertError } = await supabase
            .from('rextrix_cfo_profiles_new')
            .insert(migratedCfoData);
            
          if (insertError) {
            console.error(`❌ CFO移行エラー (${cfo.id}):`, insertError.message);
          } else {
            console.log(`✅ CFO移行完了: ${cfo.name || cfo.id}`);
          }
          
        } catch (error) {
          console.error(`❌ CFO処理エラー (${cfo.id}):`, error.message);
        }
      }
    }
    
    // Step 4: 企業プロフィールデータの移行  
    console.log('\n4. 企業プロフィールデータの移行');
    
    if (existingCompanies && existingCompanies.length > 0) {
      console.log(`📊 ${existingCompanies.length}件の企業データを移行中...`);
      
      for (const company of existingCompanies) {
        try {
          // 対応するユーザープロフィールを取得
          const userProfile = existingUserProfiles?.find(p => p.user_id === company.user_id);
          
          // 企業統合プロフィールデータを構築
          const migratedCompanyData = {
            id: company.id, // 既存IDを維持
            user_id: company.user_id,
            company_name: company.company_name || company.name || 'Unknown Company',
            display_name: userProfile?.full_name || company.contact_person,
            email: company.email || userProfile?.email || '',
            industry: company.industry,
            company_type: company.company_type || company.entity_type,
            description: company.description || userProfile?.bio,
            website_url: company.website,
            logo_url: company.logo_url,
            is_hiring: company.is_hiring !== false,
            hiring_status: company.hiring_status || 'active',
            verification_status: company.verification_status || 'pending',
            rating: parseFloat(company.rating) || 0.0,
            review_count: parseInt(company.review_count) || 0,
            completed_projects: parseInt(company.completed_projects) || 0,
            
            // JSONBデータの構築
            company_details: JSON.stringify({
              employee_count: company.employee_count,
              founded_year: company.founded_year,
              revenue: company.revenue,
              funding_stage: company.funding_stage
            }),
            
            cfo_requirements: JSON.stringify({
              required_experience: company.required_experience,
              preferred_skills: company.preferred_skills,
              min_experience_years: company.min_experience_years,
              project_type: company.project_type
            }),
            
            location_data: JSON.stringify({
              headquarters: company.location || company.headquarters,
              remote_work_available: company.remote_work_available,
              office_locations: company.office_locations || []
            }),
            
            compensation_budget: JSON.stringify({
              budget_min: company.budget_min,
              budget_max: company.budget_max,
              payment_terms: company.payment_terms,
              currency: 'JPY'
            }),
            
            // 検索用データ
            tags_for_search: company.tags || [],
            industry_tags: [company.industry].filter(Boolean),
            
            profile_completion_score: calculateCompanyCompletionScore(company, userProfile),
            profile_visibility: 'public',
            priority_level: company.priority_level || 'normal',
            
            metadata: JSON.stringify({
              migrated_from: 'rextrix_companies',
              original_created_at: company.created_at,
              migration_date: new Date().toISOString()
            })
          };
          
          // 新テーブルに挿入
          const { error: insertError } = await supabase
            .from('rextrix_company_profiles_new')
            .insert(migratedCompanyData);
            
          if (insertError) {
            console.error(`❌ 企業移行エラー (${company.id}):`, insertError.message);
          } else {
            console.log(`✅ 企業移行完了: ${company.company_name || company.id}`);
          }
          
        } catch (error) {
          console.error(`❌ 企業処理エラー (${company.id}):`, error.message);
        }
      }
    }
    
    // Step 5: メッセージ・インタラクションデータの移行
    console.log('\n5. メッセージ・インタラクションデータの移行');
    
    if (existingMessages && existingMessages.length > 0) {
      console.log(`📊 ${existingMessages.length}件のメッセージを移行中...`);
      
      for (const message of existingMessages) {
        try {
          // インタラクションデータを構築
          const migratedInteractionData = {
            id: message.id, // 既存IDを維持
            project_id: message.project_id,
            sender_id: message.sender_id,
            recipient_id: message.recipient_id,
            interaction_type: 'message',
            interaction_subtype: message.message_type || 'direct_message',
            subject: message.subject,
            content: message.content || message.message,
            content_format: 'plain',
            status: message.status || 'active',
            priority: 'normal',
            is_read: message.is_read || false,
            read_at: message.read_at,
            delivered_at: message.created_at,
            
            metadata: JSON.stringify({
              migrated_from: 'rextrix_messages',
              original_created_at: message.created_at,
              migration_date: new Date().toISOString(),
              original_type: message.message_type
            }),
            
            attachments: JSON.stringify(message.attachments || []),
            thread_id: message.thread_id,
            parent_interaction_id: message.parent_message_id
          };
          
          // 新テーブルに挿入
          const { error: insertError } = await supabase
            .from('rextrix_interactions_new')
            .insert(migratedInteractionData);
            
          if (insertError) {
            console.error(`❌ メッセージ移行エラー (${message.id}):`, insertError.message);
          } else {
            console.log(`✅ メッセージ移行完了: ${message.id}`);
          }
          
        } catch (error) {
          console.error(`❌ メッセージ処理エラー (${message.id}):`, error.message);
        }
      }
    }
    
    // Step 6: 移行結果の検証
    console.log('\n6. 移行結果の検証');
    
    const { data: newCfos } = await supabase
      .from('rextrix_cfo_profiles_new')
      .select('id')
      .limit(1000);
      
    const { data: newCompanies } = await supabase
      .from('rextrix_company_profiles_new') 
      .select('id')
      .limit(1000);
      
    const { data: newInteractions } = await supabase
      .from('rextrix_interactions_new')
      .select('id')
      .limit(1000);
    
    console.log(`📊 移行完了データ件数:`);
    console.log(`   - CFOプロフィール: ${newCfos?.length || 0}件`);
    console.log(`   - 企業プロフィール: ${newCompanies?.length || 0}件`);
    console.log(`   - インタラクション: ${newInteractions?.length || 0}件`);
    
    console.log('\n✅ データ移行完了！');
    console.log('📋 次のステップ:');
    console.log('1. 動作確認・テスト実行');
    console.log('2. API エンドポイントの更新');
    console.log('3. 旧テーブルの削除');
    
  } catch (error) {
    console.error('移行処理エラー:', error);
  }
}

// プロフィール完成度計算（CFO用）
function calculateCompletionScore(cfo, userProfile) {
  let score = 0;
  const maxScore = 100;
  
  // 基本情報（30点）
  if (cfo.name || userProfile?.full_name) score += 10;
  if (cfo.email || userProfile?.email) score += 10;
  if (cfo.introduction || userProfile?.bio) score += 10;
  
  // 専門情報（40点）
  if (cfo.specialties && cfo.specialties.length > 0) score += 15;
  if (cfo.experience_years > 0) score += 10;
  if (cfo.experience_summary) score += 15;
  
  // 条件設定（20点）
  if (cfo.hourly_rate || cfo.daily_rate || cfo.monthly_rate) score += 10;
  if (cfo.availability_status) score += 10;
  
  // その他（10点）
  if (cfo.location) score += 5;
  if (cfo.skills && Object.keys(cfo.skills).length > 0) score += 5;
  
  return Math.min(score, maxScore);
}

// プロフィール完成度計算（企業用）
function calculateCompanyCompletionScore(company, userProfile) {
  let score = 0;
  const maxScore = 100;
  
  // 基本情報（40点）
  if (company.company_name || company.name) score += 15;
  if (company.email || userProfile?.email) score += 10;
  if (company.description || userProfile?.bio) score += 15;
  
  // 業界・規模（30点）
  if (company.industry) score += 15;
  if (company.employee_count) score += 10;
  if (company.website) score += 5;
  
  // CFO要求（30点）
  if (company.required_experience) score += 15;
  if (company.budget_min || company.budget_max) score += 15;
  
  return Math.min(score, maxScore);
}

migrateToOptimizedSchema();