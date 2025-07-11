# 契約・請求書API実装ガイド

## 📋 概要

RightArmの決済システムの中核となる契約管理と請求書APIの実装方法を詳しく説明します。
現在のv3フロントエンドの実装に基づいて、実際のビジネスロジックをAPI化します。

## 🏗️ アーキテクチャ

```
フロントエンド → API Routes → Supabase → 外部サービス
     ↓              ↓           ↓           ↓
  画面表示       ビジネスロジック  データ永続化   通知・ファイル
```

## 1. 契約管理API

### 1.1 契約作成API
```typescript
// src/app/api/contracts/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api/auth';
import { contractSchema } from '@/lib/api/validation';
import { ApiResponse } from '@/lib/api/types';

export const POST = requireAuth(async (request) => {
  try {
    const { user } = request;
    const body = await request.json();
    const validatedData = contractSchema.parse(body);

    const { companyId, cfoId, monthlyFee, contractPeriod, workHoursPerMonth, startDate } = validatedData;

    // 契約権限チェック
    const hasPermission = await checkContractPermission(user.id, user.user_type, companyId, cfoId);
    if (!hasPermission) {
      return Response.json(
        { success: false, error: '契約作成の権限がありません' } as ApiResponse,
        { status: 403 }
      );
    }

    // 既存契約の重複チェック
    const { data: existingContract } = await supabaseAdmin
      .from('contracts')
      .select('id')
      .eq('company_id', companyId)
      .eq('cfo_id', cfoId)
      .in('status', ['draft', 'active'])
      .single();

    if (existingContract) {
      return Response.json(
        { success: false, error: '既に契約が存在します' } as ApiResponse,
        { status: 400 }
      );
    }

    // 契約終了日の計算
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + contractPeriod);

    // 契約作成
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        company_id: companyId,
        cfo_id: cfoId,
        monthly_fee: monthlyFee,
        contract_period: contractPeriod,
        work_hours_per_month: workHoursPerMonth,
        start_date: startDate,
        end_date: endDate.toISOString().split('T')[0],
        status: 'draft'
      })
      .select()
      .single();

    if (contractError) {
      return Response.json(
        { success: false, error: '契約作成に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // 初回請求書の自動生成
    await generateInitialInvoice(contract.id, monthlyFee, startDate);

    return Response.json({
      success: true,
      data: contract,
      message: '契約が作成されました'
    } as ApiResponse);

  } catch (error) {
    console.error('Contract creation error:', error);
    return Response.json(
      { success: false, error: '契約作成に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

// 契約権限チェック関数
async function checkContractPermission(
  userId: string, 
  userType: string, 
  companyId: string, 
  cfoId: string
): Promise<boolean> {
  if (userType === 'company') {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('user_id')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single();
    return !!company;
  } else if (userType === 'cfo') {
    const { data: cfo } = await supabaseAdmin
      .from('cfos')
      .select('user_id')
      .eq('id', cfoId)
      .eq('user_id', userId)
      .single();
    return !!cfo;
  }
  return false;
}

// 初回請求書生成関数
async function generateInitialInvoice(contractId: string, monthlyFee: number, startDate: string) {
  const invoiceDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30日後

  const periodStart = new Date(startDate);
  const periodEnd = new Date(startDate);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const platformFeeRate = 0.05; // 5%
  const platformFee = Math.floor(monthlyFee * platformFeeRate);
  const totalAmount = monthlyFee + platformFee;

  await supabaseAdmin
    .from('invoices')
    .insert({
      contract_id: contractId,
      invoice_date: invoiceDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      consulting_fee: monthlyFee,
      platform_fee_rate: platformFeeRate,
      platform_fee: platformFee,
      total_amount: totalAmount,
      status: 'pending'
    });
}
```

### 1.2 契約詳細取得API
```typescript
// src/app/api/contracts/[id]/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api/auth';
import { ApiResponse } from '@/lib/api/types';

export const GET = requireAuth(async (request, { params }) => {
  try {
    const { user } = request;
    const contractId = params.id;

    // 契約詳細取得（関連データ含む）
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('contracts')
      .select(`
        *,
        companies (
          id,
          company_name,
          business_name,
          users (
            id,
            email,
            user_profiles (
              display_name,
              phone_number
            )
          )
        ),
        cfos (
          id,
          users (
            id,
            email,
            user_profiles (
              display_name,
              nickname,
              phone_number
            )
          )
        ),
        invoices (
          id,
          invoice_date,
          due_date,
          period_start,
          period_end,
          consulting_fee,
          platform_fee,
          total_amount,
          status,
          paid_at,
          verified_at,
          payment_proof_urls
        )
      `)
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return Response.json(
        { success: false, error: '契約が見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    // アクセス権限チェック
    const companyUserId = contract.companies.users.id;
    const cfoUserId = contract.cfos.users.id;
    
    if (user.id !== companyUserId && user.id !== cfoUserId) {
      return Response.json(
        { success: false, error: 'アクセス権限がありません' } as ApiResponse,
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      data: contract
    } as ApiResponse);

  } catch (error) {
    console.error('Contract fetch error:', error);
    return Response.json(
      { success: false, error: '契約情報の取得に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request, { params }) => {
  try {
    const { user } = request;
    const contractId = params.id;
    const body = await request.json();

    // 契約の存在と権限チェック
    const { data: contract } = await supabaseAdmin
      .from('contracts')
      .select(`
        id,
        status,
        companies (
          users (id)
        ),
        cfos (
          users (id)
        )
      `)
      .eq('id', contractId)
      .single();

    if (!contract) {
      return Response.json(
        { success: false, error: '契約が見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    const companyUserId = contract.companies.users.id;
    const cfoUserId = contract.cfos.users.id;
    
    if (user.id !== companyUserId && user.id !== cfoUserId) {
      return Response.json(
        { success: false, error: 'アクセス権限がありません' } as ApiResponse,
        { status: 403 }
      );
    }

    // 契約更新
    const { error: updateError } = await supabaseAdmin
      .from('contracts')
      .update({
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) {
      return Response.json(
        { success: false, error: '契約更新に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: '契約が更新されました'
    } as ApiResponse);

  } catch (error) {
    console.error('Contract update error:', error);
    return Response.json(
      { success: false, error: '契約更新に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});
```

## 2. 請求書管理API

### 2.1 請求書一覧・作成API
```typescript
// src/app/api/invoices/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api/auth';
import { invoiceSchema } from '@/lib/api/validation';
import { ApiResponse } from '@/lib/api/types';

export const GET = requireAuth(async (request) => {
  try {
    const { user } = request;
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contract_id');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('invoices')
      .select(`
        *,
        contracts (
          id,
          companies (
            id,
            company_name,
            users (id)
          ),
          cfos (
            id,
            users (
              id,
              user_profiles (
                display_name,
                nickname
              )
            )
          )
        )
      `);

    // 契約IDでフィルタ
    if (contractId) {
      query = query.eq('contract_id', contractId);
    }

    // ステータスでフィルタ
    if (status) {
      query = query.eq('status', status);
    }

    // ユーザーに関連する請求書のみ取得
    const { data: invoices, error } = await query;

    if (error) {
      return Response.json(
        { success: false, error: '請求書一覧の取得に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // アクセス権限でフィルタリング
    const filteredInvoices = invoices?.filter(invoice => {
      const companyUserId = invoice.contracts.companies.users.id;
      const cfoUserId = invoice.contracts.cfos.users.id;
      return user.id === companyUserId || user.id === cfoUserId;
    }) || [];

    return Response.json({
      success: true,
      data: filteredInvoices
    } as ApiResponse);

  } catch (error) {
    console.error('Invoices fetch error:', error);
    return Response.json(
      { success: false, error: '請求書一覧の取得に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request) => {
  try {
    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);

    const { contractId, invoiceDate, dueDate, periodStart, periodEnd, consultingFee } = validatedData;

    // プラットフォーム手数料計算（5%固定）
    const platformFeeRate = 0.05;
    const platformFee = Math.floor(consultingFee * platformFeeRate);
    const totalAmount = consultingFee + platformFee;

    // 請求書作成
    const { data: invoice, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .insert({
        contract_id: contractId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        period_start: periodStart,
        period_end: periodEnd,
        consulting_fee: consultingFee,
        platform_fee_rate: platformFeeRate,
        platform_fee: platformFee,
        total_amount: totalAmount,
        status: 'pending'
      })
      .select()
      .single();

    if (invoiceError) {
      return Response.json(
        { success: false, error: '請求書作成に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // TODO: メール通知送信
    await sendInvoiceNotification(invoice.id);

    return Response.json({
      success: true,
      data: invoice,
      message: '請求書が作成されました'
    } as ApiResponse);

  } catch (error) {
    console.error('Invoice creation error:', error);
    return Response.json(
      { success: false, error: '請求書作成に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

// 請求書通知送信（今後実装）
async function sendInvoiceNotification(invoiceId: string) {
  // Resend を使ったメール送信
  // 実装例は後述
}
```

### 2.2 請求書詳細・更新API
```typescript
// src/app/api/invoices/[id]/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api/auth';
import { ApiResponse } from '@/lib/api/types';

export const GET = requireAuth(async (request, { params }) => {
  try {
    const { user } = request;
    const invoiceId = params.id;

    // 請求書詳細取得
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        *,
        contracts (
          id,
          monthly_fee,
          companies (
            id,
            company_name,
            business_name,
            users (
              id,
              email,
              user_profiles (
                display_name,
                phone_number
              )
            )
          ),
          cfos (
            id,
            users (
              id,
              email,
              user_profiles (
                display_name,
                nickname
              )
            )
          )
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return Response.json(
        { success: false, error: '請求書が見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    // アクセス権限チェック
    const companyUserId = invoice.contracts.companies.users.id;
    const cfoUserId = invoice.contracts.cfos.users.id;
    
    if (user.id !== companyUserId && user.id !== cfoUserId) {
      return Response.json(
        { success: false, error: 'アクセス権限がありません' } as ApiResponse,
        { status: 403 }
      );
    }

    // RightArmの振込先情報を追加
    const bankInfo = {
      bankName: '三井住友銀行',
      branchName: '渋谷支店',
      accountType: '普通',
      accountNumber: '1234567',
      accountHolder: 'RightArm株式会社'
    };

    return Response.json({
      success: true,
      data: {
        ...invoice,
        bankInfo
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Invoice fetch error:', error);
    return Response.json(
      { success: false, error: '請求書の取得に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request, { params }) => {
  try {
    const { user } = request;
    const invoiceId = params.id;
    const body = await request.json();

    // 請求書の存在と権限チェック
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select(`
        id,
        status,
        contracts (
          companies (users (id)),
          cfos (users (id))
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (!invoice) {
      return Response.json(
        { success: false, error: '請求書が見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    const companyUserId = invoice.contracts.companies.users.id;
    const cfoUserId = invoice.contracts.cfos.users.id;
    
    if (user.id !== companyUserId && user.id !== cfoUserId) {
      return Response.json(
        { success: false, error: 'アクセス権限がありません' } as ApiResponse,
        { status: 403 }
      );
    }

    // 更新可能なフィールドの準備
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // ステータス更新
    if (body.status) {
      updateData.status = body.status;
      
      if (body.status === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }
    }

    // 証憑URL更新
    if (body.paymentProofUrls) {
      updateData.payment_proof_urls = JSON.stringify(body.paymentProofUrls);
    }

    // 請求書更新
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update(updateData)
      .eq('id', invoiceId);

    if (updateError) {
      return Response.json(
        { success: false, error: '請求書更新に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: '請求書が更新されました'
    } as ApiResponse);

  } catch (error) {
    console.error('Invoice update error:', error);
    return Response.json(
      { success: false, error: '請求書更新に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});
```

## 3. 支払い報告API

### 3.1 支払い報告API
```typescript
// src/app/api/invoices/[id]/report-payment/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api/auth';
import { ApiResponse } from '@/lib/api/types';

export const POST = requireAuth(async (request, { params }) => {
  try {
    const { user } = request;
    const invoiceId = params.id;
    const body = await request.json();

    // 請求書の存在確認
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select(`
        id,
        status,
        contracts (
          companies (users (id)),
          cfos (users (id))
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return Response.json(
        { success: false, error: '請求書が見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    // 企業ユーザーのみ支払い報告可能
    const companyUserId = invoice.contracts.companies.users.id;
    if (user.id !== companyUserId) {
      return Response.json(
        { success: false, error: '支払い報告の権限がありません' } as ApiResponse,
        { status: 403 }
      );
    }

    // 既に支払い済みの場合はエラー
    if (invoice.status === 'paid' || invoice.status === 'verified') {
      return Response.json(
        { success: false, error: '既に支払い済みです' } as ApiResponse,
        { status: 400 }
      );
    }

    // 証憑URLのバリデーション
    if (!body.paymentProofUrls || body.paymentProofUrls.length === 0) {
      return Response.json(
        { success: false, error: '証憑をアップロードしてください' } as ApiResponse,
        { status: 400 }
      );
    }

    // 請求書ステータスを「支払い済み」に更新
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        payment_proof_urls: JSON.stringify(body.paymentProofUrls)
      })
      .eq('id', invoiceId);

    if (updateError) {
      return Response.json(
        { success: false, error: '支払い報告に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // 管理者に通知送信
    await notifyAdminOfPayment(invoiceId, body.paymentProofUrls);

    return Response.json({
      success: true,
      message: '支払い報告を送信しました。管理者の確認をお待ちください。'
    } as ApiResponse);

  } catch (error) {
    console.error('Payment report error:', error);
    return Response.json(
      { success: false, error: '支払い報告に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});

// 管理者通知送信関数
async function notifyAdminOfPayment(invoiceId: string, proofUrls: string[]) {
  // TODO: 管理者にSlack通知またはメール送信
  console.log(`Payment reported for invoice ${invoiceId}`, proofUrls);
}
```

## 4. 管理者による入金確認API

### 4.1 入金確認API
```typescript
// src/app/api/admin/invoices/[id]/verify/route.ts
import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ApiResponse } from '@/lib/api/types';

// 管理者認証ミドルウェア（簡易版）
async function requireAdminAuth(request: NextRequest) {
  // TODO: 実際の管理者認証を実装
  const adminToken = request.headers.get('X-Admin-Token');
  return adminToken === process.env.ADMIN_SECRET_TOKEN;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 管理者認証チェック
    const isAdmin = await requireAdminAuth(request);
    if (!isAdmin) {
      return Response.json(
        { success: false, error: '管理者権限が必要です' } as ApiResponse,
        { status: 403 }
      );
    }

    const invoiceId = params.id;
    const body = await request.json();

    // 請求書の存在確認
    const { data: invoice, error } = await supabaseAdmin
      .from('invoices')
      .select('id, status')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
      return Response.json(
        { success: false, error: '請求書が見つかりません' } as ApiResponse,
        { status: 404 }
      );
    }

    // 支払い済みステータスの場合のみ確認可能
    if (invoice.status !== 'paid') {
      return Response.json(
        { success: false, error: 'まだ支払い報告されていません' } as ApiResponse,
        { status: 400 }
      );
    }

    // 入金確認（ステータスをverifiedに更新）
    const { error: updateError } = await supabaseAdmin
      .from('invoices')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', invoiceId);

    if (updateError) {
      return Response.json(
        { success: false, error: '入金確認に失敗しました' } as ApiResponse,
        { status: 500 }
      );
    }

    // 関係者に入金確認完了通知
    await notifyPaymentVerified(invoiceId);

    return Response.json({
      success: true,
      message: '入金確認が完了しました'
    } as ApiResponse);

  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json(
      { success: false, error: '入金確認に失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
}

// 入金確認完了通知
async function notifyPaymentVerified(invoiceId: string) {
  // TODO: 企業・CFO双方に入金確認完了メール送信
  console.log(`Payment verified for invoice ${invoiceId}`);
}
```

## 5. ファイルアップロード API

### 5.1 証憑アップロードAPI
```typescript
// src/app/api/files/upload/route.ts
import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { requireAuth } from '@/lib/api/auth';
import { ApiResponse } from '@/lib/api/types';

export const POST = requireAuth(async (request) => {
  try {
    const { user } = request;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const invoiceId = formData.get('invoice_id') as string;

    if (!file) {
      return Response.json(
        { success: false, error: 'ファイルが選択されていません' } as ApiResponse,
        { status: 400 }
      );
    }

    // ファイルサイズチェック（10MB制限）
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { success: false, error: 'ファイルサイズは10MB以下にしてください' } as ApiResponse,
        { status: 400 }
      );
    }

    // ファイルタイプチェック
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel' // xls
    ];

    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { success: false, error: '対応していないファイル形式です' } as ApiResponse,
        { status: 400 }
      );
    }

    // ファイル名の生成（重複防止）
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop();
    const fileName = `payment-proof/${invoiceId}/${timestamp}-${randomString}.${fileExtension}`;

    // Vercel Blob Storageにアップロード
    const blob = await put(fileName, file, {
      access: 'public',
    });

    return Response.json({
      success: true,
      data: {
        url: blob.url,
        fileName: file.name,
        fileSize: file.size,
        contentType: file.type
      },
      message: 'ファイルがアップロードされました'
    } as ApiResponse);

  } catch (error) {
    console.error('File upload error:', error);
    return Response.json(
      { success: false, error: 'ファイルアップロードに失敗しました' } as ApiResponse,
      { status: 500 }
    );
  }
});
```

## 6. フロントエンドとの連携

### 6.1 API クライアント
```typescript
// lib/api/client.ts
interface ApiClient {
  baseURL: string;
  token?: string;
}

class RightArmApiClient {
  private baseURL = '/api';
  private token?: string;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // 契約関連
  async createContract(data: any) {
    return this.request('/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContract(id: string) {
    return this.request(`/contracts/${id}`);
  }

  // 請求書関連
  async getInvoices(contractId?: string) {
    const params = contractId ? `?contract_id=${contractId}` : '';
    return this.request(`/invoices${params}`);
  }

  async getInvoice(id: string) {
    return this.request(`/invoices/${id}`);
  }

  async reportPayment(invoiceId: string, paymentProofUrls: string[]) {
    return this.request(`/invoices/${invoiceId}/report-payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentProofUrls }),
    });
  }

  // ファイルアップロード
  async uploadFile(file: File, invoiceId: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoice_id', invoiceId);

    return fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    }).then(res => res.json());
  }
}

export const apiClient = new RightArmApiClient();
```

### 6.2 React Hooks for API
```typescript
// hooks/useInvoice.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export function useInvoice(invoiceId: string) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const response = await apiClient.getInvoice(invoiceId);
        if (response.success) {
          setInvoice(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('請求書の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  return { invoice, loading, error };
}
```

## 7. 実装の優先順位

### Phase 1: 基本機能（1週間）
1. ✅ 契約作成API
2. ✅ 請求書詳細取得API
3. ✅ 支払い報告API
4. ✅ ファイルアップロードAPI

### Phase 2: 管理機能（3日）
1. ✅ 管理者による入金確認API
2. ✅ 契約・請求書一覧API

### Phase 3: 通知機能（1週間）
1. 🔄 Resend統合
2. 🔄 メール通知テンプレート
3. 🔄 Slack通知（管理者用）

この実装により、現在のv3フロントエンドで表示されている請求書機能が完全に動作するようになります。