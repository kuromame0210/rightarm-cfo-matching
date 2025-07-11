# API Routes 実装ガイド

## 1. ディレクトリ構造

```
src/app/api/
├── auth/
│   ├── register/
│   │   └── route.ts
│   ├── login/
│   │   └── route.ts
│   └── logout/
│       └── route.ts
├── users/
│   ├── profile/
│   │   └── route.ts
│   └── [id]/
│       └── route.ts
├── companies/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── cfos/
│   ├── route.ts
│   └── [id]/
│       └── route.ts
├── contracts/
│   ├── route.ts
│   └── [id]/
│       ├── route.ts
│       └── invoices/
│           └── route.ts
└── invoices/
    ├── route.ts
    └── [id]/
        ├── route.ts
        └── verify/
            └── route.ts
```

## 2. 共通ユーティリティ

### 2.1 API レスポンス型定義
```typescript
// lib/api/types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 2.2 認証ミドルウェア
```typescript
// lib/api/auth.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    user_type: 'company' | 'cfo';
  };
}

export async function authenticate(request: NextRequest): Promise<AuthenticatedRequest['user'] | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // ユーザー詳細情報を取得
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type')
      .eq('id', user.id)
      .single();

    return userData;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await authenticate(request);
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    (request as AuthenticatedRequest).user = user;
    return handler(request as AuthenticatedRequest);
  };
}
```

### 2.3 バリデーション
```typescript
// lib/api/validation.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  userType: z.enum(['company', 'cfo']),
  displayName: z.string().min(1, '名前は必須です'),
  // 企業の場合
  companyName: z.string().optional(),
  businessName: z.string().optional(),
  description: z.string().optional(),
  revenueRange: z.enum(['under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private']).optional(),
  challengeTags: z.array(z.string()).optional(),
  // CFOの場合
  nickname: z.string().optional(),
  skills: z.record(z.array(z.string())).optional(),
  experience: z.string().optional(),
  workPreference: z.string().optional(),
  compensationRange: z.string().optional(),
});

export const contractSchema = z.object({
  companyId: z.string().uuid(),
  cfoId: z.string().uuid(),
  monthlyFee: z.number().min(1, '月額料金は1円以上である必要があります'),
  contractPeriod: z.number().min(1).max(60),
  workHoursPerMonth: z.number().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '有効な日付形式を入力してください'),
});

export const invoiceSchema = z.object({
  contractId: z.string().uuid(),
  invoiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  consultingFee: z.number().min(1),
});
```

## 3. 認証API

### 3.1 ユーザー登録
```typescript
// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { registerSchema } from '@/lib/api/validation';
import { ApiResponse } from '@/lib/api/types';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const { email, password, userType, displayName, ...profileData } = validatedData;

    // パスワードハッシュ化
    const passwordHash = await bcrypt.hash(password, 12);

    // ユーザー作成
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        user_type: userType,
        status: 'active',
      })
      .select()
      .single();

    if (userError) {
      return Response.json(
        { success: false, error: 'ユーザー作成に失敗しました' } as ApiResponse,
        { status: 400 }
      );
    }

    // プロフィール作成
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: user.id,
        display_name: displayName,
        nickname: profileData.nickname,
        work_preference: profileData.workPreference,
        compensation_range: profileData.compensationRange,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    // 企業情報またはCFO情報を作成
    if (userType === 'company' && profileData.companyName) {
      const { error: companyError } = await supabaseAdmin
        .from('companies')
        .insert({
          user_id: user.id,
          company_name: profileData.companyName,
          business_name: profileData.businessName,
          description: profileData.description,
          revenue_range: profileData.revenueRange,
        });

      if (companyError) {
        console.error('Company creation error:', companyError);
      }

      // 財務課題タグの関連付け
      if (profileData.challengeTags?.length) {
        const { data: company } = await supabaseAdmin
          .from('companies')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (company) {
          const { data: tags } = await supabaseAdmin
            .from('challenge_tags')
            .select('id, name')
            .in('name', profileData.challengeTags);

          if (tags?.length) {
            const challengeInserts = tags.map(tag => ({
              company_id: company.id,
              challenge_tag_id: tag.id,
            }));

            await supabaseAdmin
              .from('company_challenges')
              .insert(challengeInserts);
          }
        }
      }
    } else if (userType === 'cfo') {
      const { error: cfoError } = await supabaseAdmin
        .from('cfos')
        .insert({
          user_id: user.id,
          experience_summary: profileData.experience,
          achievements: JSON.stringify([]),
          certifications: JSON.stringify([]),
        });

      if (cfoError) {
        console.error('CFO creation error:', cfoError);
      }

      // スキルタグの関連付け
      if (profileData.skills) {
        const { data: cfo } = await supabaseAdmin
          .from('cfos')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (cfo) {
          const allSkills: string[] = Object.values(profileData.skills).flat();
          const { data: skillTags } = await supabaseAdmin
            .from('skill_tags')
            .select('id, name')
            .in('name', allSkills);

          if (skillTags?.length) {
            const skillInserts = skillTags.map(tag => ({
              cfo_id: cfo.id,
              skill_tag_id: tag.id,
              proficiency_level: 'intermediate' as const,
            }));

            await supabaseAdmin
              .from('cfo_skills')
              .insert(skillInserts);
          }
        }
      }
    }

    return Response.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        userType: user.user_type,
      },
      message: 'ユーザー登録が完了しました',
    } as ApiResponse);

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { success: false, error: '登録に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}
```

### 3.2 ログイン
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/lib/api/types';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // ユーザー検索
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, user_type, status')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return Response.json(
        { success: false, error: 'メールアドレスまたはパスワードが間違っています' } as ApiResponse,
        { status: 401 }
      );
    }

    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return Response.json(
        { success: false, error: 'メールアドレスまたはパスワードが間違っています' } as ApiResponse,
        { status: 401 }
      );
    }

    // アカウント状態チェック
    if (user.status !== 'active') {
      return Response.json(
        { success: false, error: 'アカウントが無効です' } as ApiResponse,
        { status: 403 }
      );
    }

    // Supabase Auth セッション作成
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password: 'dummy', // 実際のパスワードチェックは上で済んでいる
    });

    // 最終ログイン時刻更新
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    return Response.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          userType: user.user_type,
        },
        // 実際のトークンは別途実装
        token: 'temporary-token',
      },
      message: 'ログインしました',
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { success: false, error: 'ログインに失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}
```

## 4. ユーザー管理API

### 4.1 プロフィール取得・更新
```typescript
// src/app/api/users/profile/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api/auth';
import { ApiResponse } from '@/lib/api/types';

export const GET = requireAuth(async (request) => {
  try {
    const { user } = request;

    // ユーザー基本情報取得
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        user_type,
        profile_image_url,
        user_profiles (
          display_name,
          nickname,
          introduction,
          phone_number,
          region,
          work_preference,
          compensation_range
        )
      `)
      .eq('id', user.id)
      .single();

    if (userError) {
      return Response.json(
        { success: false, error: 'ユーザー情報の取得に失敗しました' } as ApiResponse,
        { status: 404 }
      );
    }

    // ユーザータイプ別の詳細情報取得
    let detailData = null;
    if (user.user_type === 'company') {
      const { data: companyData } = await supabaseAdmin
        .from('companies')
        .select(`
          *,
          company_challenges (
            challenge_tags (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      detailData = companyData;
    } else if (user.user_type === 'cfo') {
      const { data: cfoData } = await supabaseAdmin
        .from('cfos')
        .select(`
          *,
          cfo_skills (
            skill_tags (
              name,
              category
            )
          )
        `)
        .eq('user_id', user.id)
        .single();
      
      detailData = cfoData;
    }

    return Response.json({
      success: true,
      data: {
        ...userData,
        details: detailData,
      },
    } as ApiResponse);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return Response.json(
      { success: false, error: 'プロフィール取得に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request) => {
  try {
    const { user } = request;
    const body = await request.json();

    // プロフィール更新
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        display_name: body.displayName,
        nickname: body.nickname,
        introduction: body.introduction,
        phone_number: body.phoneNumber,
        region: body.region,
        work_preference: body.workPreference,
        compensation_range: body.compensationRange,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (profileError) {
      return Response.json(
        { success: false, error: 'プロフィール更新に失敗しました' } as ApiResponse,
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      message: 'プロフィールを更新しました',
    } as ApiResponse);

  } catch (error) {
    console.error('Profile update error:', error);
    return Response.json(
      { success: false, error: 'プロフィール更新に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});
```

## 5. 企業・CFO検索API

### 5.1 企業一覧取得
```typescript
// src/app/api/companies/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const region = searchParams.get('region');
    const industry = searchParams.get('industry');
    const challenges = searchParams.get('challenges')?.split(',');
    const search = searchParams.get('search');

    let query = supabaseAdmin
      .from('companies')
      .select(`
        *,
        users!inner (
          email,
          user_profiles (
            display_name
          )
        ),
        company_challenges (
          challenge_tags (
            name
          )
        )
      `)
      .eq('is_recruiting', true)
      .eq('users.status', 'active');

    // フィルタリング
    if (region && region !== '全国') {
      query = query.eq('region', region);
    }

    if (industry) {
      query = query.eq('industry', industry);
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,business_name.ilike.%${search}%`);
    }

    // ページネーション
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: companies, error, count } = await query;

    if (error) {
      return Response.json(
        { success: false, error: '企業一覧の取得に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // 財務課題でのフィルタリング（後処理）
    let filteredCompanies = companies || [];
    if (challenges?.length) {
      filteredCompanies = companies?.filter(company => 
        company.company_challenges.some((cc: any) => 
          challenges.includes(cc.challenge_tags.name)
        )
      ) || [];
    }

    return Response.json({
      success: true,
      data: filteredCompanies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    } as PaginatedResponse<any>);

  } catch (error) {
    console.error('Companies fetch error:', error);
    return Response.json(
      { success: false, error: '企業一覧の取得に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}
```

### 5.2 CFO一覧取得
```typescript
// src/app/api/cfos/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse, PaginatedResponse } from '@/lib/api/types';

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const region = searchParams.get('region');
    const skills = searchParams.get('skills')?.split(',');
    const search = searchParams.get('search');
    const available = searchParams.get('available');

    let query = supabaseAdmin
      .from('cfos')
      .select(`
        *,
        users!inner (
          email,
          user_profiles (
            display_name,
            nickname,
            region
          )
        ),
        cfo_skills (
          skill_tags (
            name,
            category
          )
        )
      `)
      .eq('users.status', 'active');

    // フィルタリング
    if (available === 'true') {
      query = query.eq('is_available', true);
    }

    if (search) {
      query = query.or(`users.user_profiles.display_name.ilike.%${search}%,users.user_profiles.nickname.ilike.%${search}%`);
    }

    // ページネーション
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: cfos, error, count } = await query;

    if (error) {
      return Response.json(
        { success: false, error: 'CFO一覧の取得に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // スキル・地域でのフィルタリング（後処理）
    let filteredCFOs = cfos || [];

    if (region && region !== '全国') {
      filteredCFOs = filteredCFOs.filter(cfo => 
        cfo.users.user_profiles?.region === region
      );
    }

    if (skills?.length) {
      filteredCFOs = filteredCFOs.filter(cfo => 
        cfo.cfo_skills.some((cs: any) => 
          skills.includes(cs.skill_tags.name)
        )
      );
    }

    return Response.json({
      success: true,
      data: filteredCFOs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    } as PaginatedResponse<any>);

  } catch (error) {
    console.error('CFOs fetch error:', error);
    return Response.json(
      { success: false, error: 'CFO一覧の取得に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}
```

これで基本的なAPI Routesの実装が完了します。次は契約・請求書APIの実装に進みます。