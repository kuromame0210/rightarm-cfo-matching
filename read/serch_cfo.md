# CFO検索機能 - 実装ガイド

## 概要

CFOマッチングプラットフォームにおける包括的な検索機能の設計・実装ガイド。
現在のデータベース構造、PostgreSQLの最適化手法を活用した高速検索の実現。

**最終更新**: 2025-01-19  
**対象テーブル**: `cfo_profiles`  
**現在のCFO数**: 6名程度

---

## 検索項目一覧

| 検索項目 | データ型 | 検索方法 | 実装 | 優先度 |
|---------|---------|---------|-------|---------|
| **スキル検索** | `jsonb` | JSONB配列、GIN索引最適化 | 複数項目 | 最重要 |
| **キーワード検索** | `text` | 全文検索、部分一致 | 複数項目 | 最重要 |
| **地域検索** | `text` | 都道府県別、ILIKE | 単一項目 | 最重要 |
| **報酬検索** | `text/int` | 数値範囲、正規表現 | 単一項目 | 最重要 |
| **稼働条件検索** | `text` | 都道府県別 | 単一項目 | 重要 |
| **経験年数検索** | `text` | 全文検索、数値抽出 | 単一項目 | 重要 |
| **業務内容検索** | `text` | 全文検索 | 単一項目 | 重要 |

---

## 詳細検索項目と実装

### 1. **スキル検索** - 最重要機能

**対象フィールド**: `cfo_skills` (jsonb)  
**索引最適化**: `gin_cfo_skills` (GIN)

#### **データ例**
```json
["IPO/上場","資金調達","財務改善","M&A/買収","株主総会運営"]
["海外業務","クロスボーダーM&A","USでのIPOサポート","フィリピン業務"]
["VC対応","資本政策"]
```

#### **検索方法**
```sql
-- 1. 単一スキル完全一致
WHERE cfo_skills @> '["IPO/上場"]'::jsonb

-- 2. 複数スキル AND検索
WHERE cfo_skills @> '["IPO/上場","M&A/買収"]'::jsonb

-- 3. 複数スキル OR検索  
WHERE cfo_skills ?| array['IPO/上場','M&A/買収']

-- 4. 部分一致検索
WHERE cfo_skills::text ILIKE '%IPO%'
```

#### **API実装**
```typescript
// URL: /api/cfos?skills=IPO/上場,M&A/買収&searchType=and
const skills = searchParams.get('skills')?.split(',') || []
const searchType = searchParams.get('searchType') || 'or'

if (skills.length > 0) {
  if (searchType === 'and') {
    query = query.contains('cfo_skills', skills)
  } else {
    query = query.overlaps('cfo_skills', skills)
  }
}
```

#### **パフォーマンス**
- **索引最適化**: GIN 索引により高速検索
- **計算量**: O(log n) レベルの検索
- **スケーラビリティ**: 1万名のCFOでも高速

---

### 2. **キーワード検索** - 全文検索機能

**対象フィールド**: 
- `cfo_name` (CFO名)
- `cfo_possible_tasks` (業務内容)
- `cfo_introduction` (自己紹介)
- `cfo_raw_profile` (詳細情報)

#### **検索方法**
```sql
-- 1. 全文検索（多言語対応）
WHERE to_tsvector('japanese', 
       cfo_name || ' ' || 
       cfo_possible_tasks || ' ' || 
       cfo_introduction || ' ' || 
       cfo_raw_profile
      ) @@ to_tsquery('japanese', :keyword)

-- 2. 部分一致検索（簡単）
WHERE cfo_name ILIKE '%' || :keyword || '%'
   OR cfo_possible_tasks ILIKE '%' || :keyword || '%'
   OR cfo_introduction ILIKE '%' || :keyword || '%'

-- 3. 複数キーワード AND検索
WHERE to_tsvector('japanese', cfo_possible_tasks) 
      @@ to_tsquery('japanese', 'IPO & 上場')

-- 4. 複数キーワード OR検索
WHERE to_tsvector('japanese', cfo_possible_tasks) 
      @@ to_tsquery('japanese', 'IPO | M&A')
```

#### **実装**
```typescript
// URL: /api/cfos?search=IPO 上場&searchMode=fulltext
const keyword = searchParams.get('search')
const searchMode = searchParams.get('searchMode') || 'partial'

if (keyword) {
  if (searchMode === 'fulltext') {
    // PostgreSQL全文検索
    query = query.textSearch('fts', keyword, { 
      type: 'websearch', 
      config: 'japanese' 
    })
  } else {
    // 部分一致検索
    query = query.or(`cfo_name.ilike.%${keyword}%,cfo_possible_tasks.ilike.%${keyword}%`)
  }
}
```

---

### 3. **地域検索** - 都道府県・リモート対応

**対象フィールド**: 
- `cfo_location` (在住地)
- `cfo_working_areas` (稼働地域)

#### **データ例**
```
"東京都港区"
"大阪府大阪市"
"全国対応可能・リモート可"
"関東一都三県、オンライン対応可能"
"全国出張可能OK"
```

#### **検索方法**
```sql
-- 1. 完全都道府県検索
WHERE cfo_location ILIKE '%東京%' 
   OR cfo_working_areas ILIKE '%東京%'

-- 2. 地域別検索
WHERE cfo_location ILIKE '%関東%' 
   OR cfo_working_areas ILIKE '%関東%'
   OR cfo_working_areas ILIKE '%全国%'

-- 3. 複数地域検索（配列）
WHERE cfo_location = ANY(array['東京都','神奈川県','千葉県','埼玉県'])
   OR cfo_working_areas ILIKE '%関東%'

-- 4. 海外対応検索
WHERE cfo_location ILIKE '%海外%'
   OR cfo_location ILIKE '%海外%'
   OR cfo_working_areas ILIKE '%海外%'
```

#### **地域分類マスター**
```typescript
// 地域別検索の定義
const regionGroups = {
  'kanto': ['東京都', '神奈川県', '千葉県', '埼玉県', '群馬県', '栃木県', '茨城県'],
  'kansai': ['大阪府', '京都府', '兵庫県', '大阪府', '奈良県', '滋賀県'],
  'remote': ['リモート', '全国', 'オンライン', '出張可能']
}
```

---

### 4. **報酬検索** - 複雑な報酬体系対応

**対象フィールド**: 
- `cfo_fee_min`, `cfo_fee_max` (正規化済みNULL多数)
- `cfo_compensation` (テキスト形式の報酬詳細)

#### **データ例**
```
"月10万円～月額報酬応相談"
"月額報酬応相談5,000円/時間"  
"時給4,000～10,000円（経験・専門性によって相談）"
"月15万円～月14万円 1回/週 16時間/月 その他条件"
```

#### **検索方法**
```sql
-- 1. 正規化フィールド検索（NULLが多いため検索優先）
WHERE (cfo_fee_min IS NULL OR cfo_fee_min <= :max_budget)
  AND (cfo_fee_max IS NULL OR cfo_fee_max >= :min_budget)

-- 2. テキスト内の数値抽出検索
WHERE cfo_compensation ~ '月[0-9]+万円'
  AND (regexp_match(cfo_compensation, '月([0-9]+)万円'))[1]::int * 10000 
      BETWEEN :min_budget AND :max_budget

-- 3. 時給検索
WHERE cfo_compensation ~ '時給[0-9,]+円'
   OR cfo_compensation ~ '[0-9,]+円/時'

-- 4. 月額報酬検索
WHERE cfo_compensation ILIKE '%月額報酬%'
   OR cfo_compensation ILIKE '%応相談%'

-- 5. 報酬形態分類
CASE 
  WHEN cfo_compensation ILIKE '%月%万円%' THEN 'monthly'
  WHEN cfo_compensation ILIKE '%時給%' THEN 'hourly'
  WHEN cfo_compensation ILIKE '%月額報酬%' THEN 'performance'
  ELSE 'negotiable'
END as compensation_type
```

#### **報酬範囲分類**
```typescript
const compensationRanges = [
  { value: '0-100000', label: '～10万円/月', type: 'monthly' },
  { value: '100000-300000', label: '10～30万円/月', type: 'monthly' },
  { value: '300000-500000', label: '30～50万円/月', type: 'monthly' },
  { value: '3000-5000', label: '3,000～5,000円/時', type: 'hourly' },
  { value: 'performance', label: '月額報酬', type: 'performance' }
]
```

---

### 5. **稼働条件検索** - 働き方都道府県別

**対象フィールド**: `cfo_availability`

#### **データ例**
```
"週２日程度・月曜から金曜"
"週２日・10時から18時"
"月4回 4時間程度"
"月5～10時間程度（夕方・深夜問わず）"
```

#### **検索方法**
```sql
-- 1. 週回数都道府県検索
WHERE cfo_availability ~ '週[0-9]+日'

-- 2. 時間数都道府県検索  
WHERE cfo_availability ~ '[0-9]+時間'

-- 3. 時間帯検索
WHERE cfo_availability ~ '[0-9]+時から[0-9]+時'

-- 4. 曜日検索
WHERE cfo_availability ILIKE '%月曜%'
   OR cfo_availability ILIKE '%平日%'
   OR cfo_availability ILIKE '%土日祝%'

-- 5. 勤務時間検索
WHERE cfo_availability ILIKE '%勤務時間%'
   OR cfo_availability ~ '週[4-7]日'
```

---

### 6. **経験年数検索** - 職歴詳細から推定

**対象フィールド**: `cfo_raw_profile`

#### **データ例**
```
2001,03 早稲田大学政治経済学部政治学科卒業
2001,04 全国各地の会社財務課に従事、管理会計、予実管理
2006,03 日本証券アナリスト協会検定会員資格取得、国際部門移管
2016,12 フィリピンのパートナー会社Firstwellness English Academy IncのM&Aに携わる
```

#### **検索方法**
```sql
-- 1. 業界名検索
WHERE cfo_raw_profile ILIKE '%銀行%'
   OR cfo_raw_profile ILIKE '%コンサル%'

-- 2. 会社規模検索
WHERE cfo_raw_profile ILIKE '%IT%'
   OR cfo_raw_profile ILIKE '%製造%'
   OR cfo_raw_profile ILIKE '%商社%'

-- 3. 学歴検索
WHERE cfo_raw_profile ILIKE '%大学%'
   OR cfo_raw_profile ILIKE '%MBA%'

-- 4. M&A経験検索
WHERE cfo_raw_profile ILIKE '%M&A%'
   OR cfo_raw_profile ILIKE '%買収%'
   OR cfo_raw_profile ILIKE '%売却%'

-- 5. 経験年数推定
WITH experience_calc AS (
  SELECT *,
    EXTRACT(YEAR FROM CURRENT_DATE) - 
    (regexp_match(cfo_raw_profile, '([0-9]{4}),[0-9]{2}'))[1]::int as years_experience
  FROM cfo_profiles
)
SELECT * FROM experience_calc 
WHERE years_experience >= :min_years
```

---

### 7. **業務内容検索** - 対応可能業務

**対象フィールド**: `cfo_possible_tasks`

#### **検索方法**
```sql
-- 1. 全文検索（基本）
WHERE to_tsvector('japanese', cfo_possible_tasks) 
      @@ to_tsquery('japanese', :search_term)

-- 2. 部分一致検索
WHERE cfo_possible_tasks ILIKE '%' || :keyword || '%'

-- 3. 複数業務AND検索
WHERE cfo_possible_tasks ILIKE '%IPO%'
  AND cfo_possible_tasks ILIKE '%M&A%'
```

---

## 統合検索関数の実装

### Phase 1: 基本検索機能（すぐに実装可能）

```sql
-- 検索関数定義
CREATE OR REPLACE FUNCTION search_cfos_basic(
  p_skills jsonb DEFAULT '[]',
  p_location text DEFAULT '',
  p_keyword text DEFAULT '',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
) 
RETURNS TABLE(
  cfo_user_id uuid,
  cfo_name text,
  cfo_display_name text,
  cfo_skills jsonb,
  cfo_location text,
  cfo_compensation text,
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.cfo_user_id,
    cp.cfo_name,
    cp.cfo_display_name,
    cp.cfo_skills,
    cp.cfo_location,
    cp.cfo_compensation,
    -- 関連度スコア計算
    (
      CASE WHEN jsonb_array_length(p_skills) = 0 OR cp.cfo_skills @> p_skills THEN 3.0 ELSE 0.0 END +
      CASE WHEN p_location = '' OR cp.cfo_location ILIKE '%' || p_location || '%' THEN 2.0 ELSE 0.0 END +
      CASE WHEN p_keyword = '' OR 
                to_tsvector('japanese', 
                  coalesce(cp.cfo_name, '') || ' ' ||
                  coalesce(cp.cfo_possible_tasks, '') || ' ' || 
                  coalesce(cp.cfo_introduction, '')
                ) @@ to_tsquery('japanese', p_keyword) THEN 1.0 ELSE 0.0 END
    ) as relevance_score
  FROM cfo_profiles cp
  WHERE 
    -- スキル検索
    (jsonb_array_length(p_skills) = 0 OR cp.cfo_skills @> p_skills)
    -- 地域検索  
    AND (p_location = '' OR 
         cp.cfo_location ILIKE '%' || p_location || '%' OR
         cp.cfo_working_areas ILIKE '%' || p_location || '%')
    -- キーワード検索
    AND (p_keyword = '' OR 
         to_tsvector('japanese', 
           coalesce(cp.cfo_name, '') || ' ' ||
           coalesce(cp.cfo_possible_tasks, '') || ' ' || 
           coalesce(cp.cfo_introduction, '')
         ) @@ to_tsquery('japanese', p_keyword))
  ORDER BY relevance_score DESC, cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

### Phase 2: 詳細検索機能

```sql
-- 報酬検索の組み込み
CREATE OR REPLACE FUNCTION search_cfos_advanced(
  p_skills jsonb DEFAULT '[]',
  p_location text DEFAULT '',
  p_keyword text DEFAULT '',
  p_min_monthly_fee int DEFAULT 0,
  p_max_monthly_fee int DEFAULT 999999999,
  p_availability_pattern text DEFAULT '',
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
) 
RETURNS TABLE(
  cfo_user_id uuid,
  cfo_name text,
  cfo_skills jsonb,
  cfo_location text,
  cfo_compensation text,
  monthly_fee_estimated int,
  relevance_score float
) AS $$
BEGIN
  RETURN QUERY
  WITH compensation_parsed AS (
    SELECT *,
      CASE 
        WHEN cfo_compensation ~ '月([0-9]+)万円' 
        THEN (regexp_match(cfo_compensation, '月([0-9]+)万円'))[1]::int * 10000
        ELSE NULL
      END as monthly_amount
    FROM cfo_profiles
  )
  SELECT 
    cp.cfo_user_id,
    cp.cfo_name,
    cp.cfo_skills,
    cp.cfo_location,
    cp.cfo_compensation,
    cp.monthly_amount,
    -- 詳細関連度スコア
    (
      CASE WHEN jsonb_array_length(p_skills) = 0 OR cp.cfo_skills @> p_skills THEN 3.0 ELSE 0.0 END +
      CASE WHEN p_location = '' OR cp.cfo_location ILIKE '%' || p_location || '%' THEN 2.0 ELSE 0.0 END +
      CASE WHEN p_keyword = '' OR 
                to_tsvector('japanese', coalesce(cp.cfo_possible_tasks, '')) 
                @@ to_tsquery('japanese', p_keyword) THEN 1.0 ELSE 0.0 END +
      CASE WHEN cp.monthly_amount IS NOT NULL AND 
                cp.monthly_amount BETWEEN p_min_monthly_fee AND p_max_monthly_fee THEN 1.0 ELSE 0.0 END
    ) as relevance_score
  FROM compensation_parsed cp
  WHERE 
    -- 基本フィルタ
    (jsonb_array_length(p_skills) = 0 OR cp.cfo_skills @> p_skills)
    AND (p_location = '' OR cp.cfo_location ILIKE '%' || p_location || '%')
    AND (p_keyword = '' OR 
         to_tsvector('japanese', coalesce(cp.cfo_possible_tasks, '')) 
         @@ to_tsquery('japanese', p_keyword))
    -- 報酬フィルタ
    AND (cp.monthly_amount IS NULL OR 
         cp.monthly_amount BETWEEN p_min_monthly_fee AND p_max_monthly_fee)
    -- 稼働条件フィルタ
    AND (p_availability_pattern = '' OR 
         cp.cfo_availability ILIKE '%' || p_availability_pattern || '%')
  ORDER BY relevance_score DESC, cp.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
```

---

## 検索 API実装

### 推奨実装方法

```typescript
// /api/cfos/search
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // パラメータ取得
  const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []
  const location = searchParams.get('location') || ''
  const keyword = searchParams.get('search') || ''
  const minFee = parseInt(searchParams.get('minFee') || '0')
  const maxFee = parseInt(searchParams.get('maxFee') || '999999999')
  const availability = searchParams.get('availability') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit
  
  try {
    // PostgreSQL関数呼び出し
    const { data, error } = await supabaseAdmin.rpc('search_cfos_advanced', {
      p_skills: JSON.stringify(skills),
      p_location: location,
      p_keyword: keyword,
      p_min_monthly_fee: minFee,
      p_max_monthly_fee: maxFee,
      p_availability_pattern: availability,
      p_limit: limit,
      p_offset: offset
    })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0,
        hasMore: data?.length === limit
      },
      searchParams: {
        skills,
        location,
        keyword,
        minFee,
        maxFee,
        availability
      }
    })
    
  } catch (error) {
    console.error('CFO search error:', error)
    return NextResponse.json(
      { success: false, error: 'CFO検索でエラーが発生しました' },
      { status: 500 }
    )
  }
}
```

### フロントエンド実装

```typescript
// 検索フック
export function useCFOSearch() {
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: '',
    keyword: '',
    minFee: 0,
    maxFee: 999999999,
    availability: ''
  })
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  
  const search = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        skills: filters.skills.join(','),
        location: filters.location,
        search: filters.keyword,
        minFee: filters.minFee.toString(),
        maxFee: filters.maxFee.toString(),
        availability: filters.availability
      })
      
      const response = await fetch(`/api/cfos/search?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])
  
  return { filters, setFilters, results, loading, search }
}
```

---

## パフォーマンス最適化

### 必要索引一覧

```sql
-- スキル検索用
CREATE INDEX gin_cfo_skills ON cfo_profiles USING gin (cfo_skills jsonb_path_ops);
CREATE INDEX idx_cfo_profiles_working_area ON cfo_profiles USING gin(to_tsvector('japanese', cfo_working_area));
CREATE INDEX idx_cfo_profiles_possible_tasks ON cfo_profiles USING gin(to_tsvector('japanese', cfo_possible_tasks));

-- 部分一致索引
CREATE INDEX idx_cfo_location ON cfo_profiles USING gin (cfo_location gin_trgm_ops);
CREATE INDEX idx_cfo_compensation ON cfo_profiles USING gin (cfo_compensation gin_trgm_ops);
CREATE INDEX idx_cfo_availability ON cfo_profiles USING gin (cfo_availability gin_trgm_ops);

-- 複合索引（高頻度な組み合わせ）
CREATE INDEX idx_cfo_skills_location ON cfo_profiles USING gin (cfo_skills, cfo_location gin_trgm_ops);
```

### キャッシュ機能

```typescript
// Redis キャッシュ実装
import { createClient } from 'redis'

const redis = createClient({ url: process.env.REDIS_URL })

export async function getCachedCFOSearch(searchKey: string) {
  const cached = await redis.get(`cfo_search:${searchKey}`)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedCFOSearch(searchKey: string, results: any) {
  await redis.setex(`cfo_search:${searchKey}`, 300, JSON.stringify(results)) // 5分間キャッシュ
}
```

---

## 検索機能拡張ロードマップ

### Phase 3: AI機能

1. **スキル推薦検索**: ユーザー検索からAI推薦
2. **意図理解機能**: 自然言語CFO検索
3. **精度向上**: 業界知識、CFO専門性の学習データ

### Phase 4: 詳細分析

1. **検索分析**: 検索条件、頻度の分析
2. **A/Bテスト**: 検索UI体験の改善測定
3. **パフォーマンス**: 検索速度の詳細測定

---

## 実装チェックリスト

### 最優先実装（Phase 1）

- [ ] PostgreSQL検索関数 `search_cfos_basic()` 作成
- [ ] API エンドポイント `/api/cfos/search` 実装
- [ ] スキル検索（JSONB）機能
- [ ] キーワード検索機能
- [ ] 地域検索機能

### 第二優先実装（Phase 2）

- [ ] 報酬検索（テキスト解析）機能
- [ ] 稼働条件検索機能
- [ ] 関連度スコア計算改善
- [ ] ページネーション機能
- [ ] 検索結果キャッシュ機能

### 第三優先実装（Phase 3）

- [ ] 経験年数検索機能
- [ ] ソート条件（フィルタ表示順）
- [ ] 検索結果エクスポート機能
- [ ] 詳細分析機能

---

**実装者**: Claude Code  
**参考**: `/Users/kurosawaryoufutoshi/MyDocument/anken/cfo_maching/read/new_architecture.md`  
**データベース**: PostgreSQL 15 (Supabase)