==========================
CFO×企業 マッチング PoC  
データベース設計書（最終版）
==========================

RDBMS　　 : PostgreSQL 15（＝Supabase）  
認証基盤 : Supabase auth.users（UUID 主キー）  
設計方針  
1. CFO と企業のプロフィールを物理的に分離（わかりやすさ優先）  
2. "履歴・紹介文" は TEXT １本、スキル／財務課題だけ可変 JSONB 配列  
3. 「ホーム／スカウト／メッセージ／気になる」を動かす最小６テーブル  
4. 添付ファイルは Storage に保存し URL を DB に保持  
5. スカウトは messages.msg_type='scout' で区別（専用テーブルを増やさない）
6. CFO詳細情報は TEXT 入力中心（報酬条件、業務内容等の複雑な情報対応） ←★追加

──────────────────────────────
1. 共通 ENUM
──────────────────────────────
```sql
-- ユーザー種別（参照用）
create type user_role as enum ('cfo','biz');

-- メッセージ種別（チャット／スカウト）
create type msg_type as enum ('chat','scout');
```

──────────────────────────────
2. テーブル定義
──────────────────────────────
(★ = NOT NULL)

【T1】cfo_profiles  … CFO 固有プロフィール  
```
| 列名               | 型        | 制約 / 説明
| cfo_user_id★       | uuid      | PK, auth.users(id) FK
| avatar_url          | text    | アイコン画像の公開 URL   ←★追加
| cfo_name           | text
| cfo_display_name   | text
| cfo_location       | text      | 例: 千葉県千葉市
| cfo_availability   | text      | 稼働メモ
| cfo_fee_min        | int       | 想定月額下限(円) ※検索用
| cfo_fee_max        | int       | 想定月額上限(円) ※検索用
| cfo_compensation   | text      | 想定報酬詳細 ←★追加 (テキスト入力)
| cfo_skills★        | jsonb default '[]' | ["IPO","M&A"]
| cfo_possible_tasks | text      | 可能な業務 ←★追加 (テキスト入力)
| cfo_certifications | text      | 保有資格 ←★追加 (テキスト入力)
| cfo_working_areas  | text      | 対応可能エリア ←★追加 (テキスト入力)
| cfo_introduction   | text      | 紹介文 ←★追加 (テキスト入力)
| cfo_raw_profile★   | text      | 経歴のみ (純粋な職歴)
| created_at         | timestamptz default now()
| updated_at         | timestamptz default now()
```
INDEX  
```sql
create index gin_cfo_skills on cfo_profiles
using gin (cfo_skills jsonb_path_ops);
```

【T2】biz_profiles  … 企業固有プロフィール  
```
| biz_user_id★       | uuid   | PK, auth.users(id) FK
| avatar_url          | text    | 企業ロゴ / アイコン URL  ←★追加
| biz_company_name★  | text
| biz_location       | text
| biz_revenue_min    | bigint | 年商下限(円)
| biz_revenue_max    | bigint | 年商上限(円)
| biz_issues★        | jsonb default '[]' | ["資金調達","管理会計"]
| biz_raw_profile★   | text
| created_at         | timestamptz default now()
| updated_at         | timestamptz default now()
```
INDEX  
```sql
create index gin_biz_issues on biz_profiles
using gin (biz_issues jsonb_path_ops);
```

【T3】likes  … 「気になる」ワンタップ  
```
| liker_id★   | uuid | auth.users FK
| target_id★  | uuid | auth.users FK
| created_at  | timestamptz default now()
PRIMARY KEY (liker_id, target_id)   -- 二重いいね不可
```

【T4】reviews  … ★1–5＋コメント  
```
| review_id   | bigserial PK
| reviewer_id | uuid  FK→auth.users
| target_id   | uuid  FK→auth.users
| rating★     | int   (1–5)
| comment     | text
| created_at  | timestamptz default now()
UNIQUE (reviewer_id, target_id)      -- １人１回
```

【T5】messages  … チャット & スカウト  
```
| msg_id★     | bigserial PK
| sender_id★  | uuid FK→auth.users
| receiver_id★| uuid FK→auth.users
| msg_type★   | msg_type default 'chat'
| body★       | text
| sent_at     | timestamptz default now()
```
※ msg_type='scout' を UI でスカウトタブ表示

【T6】attachments  … メッセージ/プロフィール添付  
```
| file_id★    | bigserial PK
| file_url★   | text  -- Storage public URL
| file_name   | text
| msg_id      | bigint FK→messages
| cfo_user_id | uuid   FK→cfo_profiles
| biz_user_id | uuid   FK→biz_profiles
| uploaded_by | uuid   FK→auth.users
| created_at  | timestamptz default now()
CHECK (
  (msg_id IS NOT NULL)::int +
  (cfo_user_id IS NOT NULL)::int +
  (biz_user_id IS NOT NULL)::int = 1
)
```

──────────────────────────────
3. 主要リレーション
──────────────────────────────
auth.users (1) ── (1) cfo_profiles  
auth.users (1) ── (1) biz_profiles  
auth.users (1) ── (N) likes / reviews / messages  
messages  (1) ── (N) attachments  

──────────────────────────────
4. RLS ひな形（Supabase）
──────────────────────────────
```sql
-- profiles：誰でも閲覧・本人だけ書き込み
alter table cfo_profiles enable row level security;
create policy cfo_read  on cfo_profiles for select using (true);
create policy cfo_write on cfo_profiles
  for insert, update with check (auth.uid() = cfo_user_id);

alter table biz_profiles enable row level security;
create policy biz_read  on biz_profiles for select using (true);
create policy biz_write on biz_profiles
  for insert, update with check (auth.uid() = biz_user_id);

-- likes
alter table likes enable row level security;
create policy likes_all   on likes for select using (true);
create policy likes_write on likes
  for insert with check (auth.uid() = liker_id);
create policy likes_del   on likes for delete using (auth.uid() = liker_id);

-- reviews
alter table reviews enable row level security;
create policy rev_read  on reviews for select using (true);
create policy rev_write on reviews
  for insert with check (auth.uid() = reviewer_id);

-- messages
alter table messages enable row level security;
create policy msg_read on messages
  for select using (sender_id = auth.uid() OR receiver_id = auth.uid());
create policy msg_write on messages
  for insert with check (sender_id = auth.uid());

-- attachments
alter table attachments enable row level security;
create policy att_read  on attachments for select using (true);
create policy att_write on attachments
  for insert with check (uploaded_by = auth.uid());
```

──────────────────────────────
5. 画面タブ別・代表クエリ
──────────────────────────────
1) ホーム（おすすめ CFO）  
```sql
select cfo.*,
       (select count(*) from likes where target_id = cfo.cfo_user_id) as like_cnt,
       (select avg(rating) from reviews where target_id = cfo.cfo_user_id) as stars
from cfo_profiles cfo
order by like_cnt desc
limit 20;
```
2) スカウト送信  
```sql
insert into messages
(sender_id, receiver_id, msg_type, body)
values (:bizId, :cfoId, 'scout', 'ぜひ一度お話しさせてください');
```
3) メッセージ一覧  
```sql
select * from messages
where sender_id = :me or receiver_id = :me
order by sent_at desc;
```
4) 気になる（自分が付けたいいね）  
```sql
select c.* from likes l
join cfo_profiles c on c.cfo_user_id = l.target_id
where l.liker_id = :me;
```

──────────────────────────────
6. 拡張余地
──────────────────────────────
• `cfo_skills` / `biz_issues` をマスタ化したくなったら  
　– skill_master, qual_master, 対応表を追加し JSONB を移行すれば OK  
• reviews に返信列を足せば相互コメント機能  
• messages に thread_id を追加すればグループチャット化
• CFO詳細項目の構造化: 将来的に報酬・資格等をJSONB化で高度検索対応

──────────────────────────────
7. CFO詳細情報の設計思想（2025-07-15追加）
──────────────────────────────
**背景**: cfo_data.mdの実際のCFO情報は複雑で多様
　・報酬: "月10万〜、成果報酬応相談" "時給5,000円〜" 等
　・業務: 自由記述での詳細な得意分野
　・資格: 有無の幅が大きく、標準化困難

**採用方針**: TEXT中心の柔軟設計
　・初期実装: 全てTEXT入力、LIKE検索で対応
　・報酬範囲検索: Phase2以降で対応（複雑すぎるため）
　・構造化: 必要に応じて段階的にJSONB化

**検索戦略**:
```sql
-- Phase1: 基本検索（LIKE検索）
WHERE cfo_possible_tasks ILIKE '%IPO%'
   OR cfo_certifications ILIKE '%診断士%'
   OR cfo_working_areas ILIKE '%リモート%'

-- Phase2: 高度検索（将来）
WHERE cfo_compensation_structured @> '{"min_monthly": 100000}'
```

──────────────────────────────
完了
──────────────────────────────
この 6 テーブル＋RLS で  
・CFO／企業を明確に分離  
・ホーム／スカウト／メッセージ／気になる の４画面をカバー  
・タグ検索・いいね・★レビュー・ファイル添付 も実装可  

Supabase では SQL を流すだけで即日公開できます。