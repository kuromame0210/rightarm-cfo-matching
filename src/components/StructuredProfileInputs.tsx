'use client'

import { useState } from 'react'

// 選択肢の定数定義
export const COMPENSATION_TYPES = [
  { value: 'hourly', label: '時給制' },
  { value: 'monthly', label: '月額制' },
  { value: 'project', label: 'プロジェクト単位' },
  { value: 'performance', label: '成果報酬' },
  { value: 'negotiable', label: '応相談' }
]

export const HOURLY_RATES = [
  { value: 3000, label: '3,000円' },
  { value: 4000, label: '4,000円' },
  { value: 5000, label: '5,000円' },
  { value: 6000, label: '6,000円' },
  { value: 8000, label: '8,000円' },
  { value: 10000, label: '10,000円' },
  { value: 12000, label: '12,000円' },
  { value: 15000, label: '15,000円' }
]

export const MONTHLY_FEES = [
  { value: 50000, label: '5万円' },
  { value: 100000, label: '10万円' },
  { value: 150000, label: '15万円' },
  { value: 200000, label: '20万円' },
  { value: 300000, label: '30万円' },
  { value: 400000, label: '40万円' },
  { value: 500000, label: '50万円' }
]

export const WEEKLY_DAYS = [
  { value: 1, label: '週1日' },
  { value: 2, label: '週2日' },
  { value: 3, label: '週3日' },
  { value: 4, label: '週4日' },
  { value: 5, label: '週5日（フルタイム）' }
]

export const DAILY_HOURS = [
  { value: 2, label: '2時間' },
  { value: 4, label: '4時間' },
  { value: 6, label: '6時間' },
  { value: 8, label: '8時間（フルタイム）' },
  { value: 10, label: '10時間' }
]

export const TIME_SLOTS = [
  { value: 'morning', label: '朝（9-12時）' },
  { value: 'afternoon', label: '昼（12-18時）' },
  { value: 'evening', label: '夕方（18-21時）' },
  { value: 'flexible', label: '時間帯問わず' }
]

export const WORK_STYLES = [
  { value: 'remote', label: 'フルリモート' },
  { value: 'hybrid', label: 'ハイブリッド' },
  { value: 'onsite', label: 'オンサイト' }
]

export const PREFECTURES = [
  { value: 'tokyo', label: '東京都' },
  { value: 'kanagawa', label: '神奈川県' },
  { value: 'chiba', label: '千葉県' },
  { value: 'saitama', label: '埼玉県' },
  { value: 'osaka', label: '大阪府' },
  { value: 'kyoto', label: '京都府' },
  { value: 'aichi', label: '愛知県' },
  { value: 'fukuoka', label: '福岡県' },
  { value: 'nationwide', label: '全国対応' }
]

export const CFO_LEVELS = [
  { value: 'assistant', label: 'CFOアシスタント' },
  { value: 'manager', label: 'マネージャーレベル' },
  { value: 'director', label: 'ディレクターレベル' },
  { value: 'cfo', label: 'CFOレベル' },
  { value: 'fractional', label: 'フラクショナルCFO' }
]

export const INDUSTRIES = [
  { value: 'IT', label: 'IT・テクノロジー' },
  { value: 'healthcare', label: 'ヘルスケア・医療' },
  { value: 'manufacturing', label: '製造業' },
  { value: 'finance', label: '金融・保険' },
  { value: 'consulting', label: 'コンサルティング' },
  { value: 'retail', label: '小売・EC' },
  { value: 'education', label: '教育・研修' },
  { value: 'real_estate', label: '不動産' },
  { value: 'logistics', label: '物流・運輸' }
]

export const COMPANY_SIZES = [
  { value: 'startup', label: 'スタートアップ（〜50名）' },
  { value: 'sme', label: '中小企業（50-300名）' },
  { value: 'midsize', label: '中堅企業（300-1000名）' },
  { value: 'large', label: '大企業（1000名〜）' },
  { value: 'multinational', label: '多国籍企業' }
]

export const PROJECT_TYPES = [
  { value: 'ipo', label: 'IPO・上場支援' },
  { value: 'ma', label: 'M&A・買収' },
  { value: 'fundraising', label: '資金調達' },
  { value: 'restructuring', label: 'リストラクチャリング' },
  { value: 'internationalization', label: '国際化・海外展開' },
  { value: 'digital_transformation', label: 'DX・システム導入' },
  { value: 'cost_optimization', label: 'コスト最適化' }
]

// 報酬関連コンポーネント
export const CompensationStructuredInput = ({ formData, setFormData }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">報酬設定（選択式）</h4>
      
      {/* 報酬体系選択 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          報酬体系
        </label>
        <select
          value={formData.compensationType || ''}
          onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {COMPENSATION_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 時給制の詳細 */}
      {formData.compensationType === 'hourly' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時給（下限）
            </label>
            <select
              value={formData.hourlyRateMin || ''}
              onChange={(e) => setFormData({ ...formData, hourlyRateMin: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {HOURLY_RATES.map(rate => (
                <option key={rate.value} value={rate.value}>
                  {rate.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時給（上限）
            </label>
            <select
              value={formData.hourlyRateMax || ''}
              onChange={(e) => setFormData({ ...formData, hourlyRateMax: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {HOURLY_RATES.map(rate => (
                <option key={rate.value} value={rate.value}>
                  {rate.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 月額制の詳細 */}
      {formData.compensationType === 'monthly' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月額（下限）
            </label>
            <select
              value={formData.monthlyFeeMin || ''}
              onChange={(e) => setFormData({ ...formData, monthlyFeeMin: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {MONTHLY_FEES.map(fee => (
                <option key={fee.value} value={fee.value}>
                  {fee.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              月額（上限）
            </label>
            <select
              value={formData.monthlyFeeMax || ''}
              onChange={(e) => setFormData({ ...formData, monthlyFeeMax: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {MONTHLY_FEES.map(fee => (
                <option key={fee.value} value={fee.value}>
                  {fee.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 応相談フラグ */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.compensationNegotiable || false}
            onChange={(e) => setFormData({ ...formData, compensationNegotiable: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">詳細は応相談</span>
        </label>
      </div>
    </div>
  )
}

// 稼働条件コンポーネント
export const AvailabilityStructuredInput = ({ formData, setFormData }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">稼働条件（選択式）</h4>
      
      {/* 週稼働日数 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          週稼働日数
        </label>
        <select
          value={formData.weeklyDays || ''}
          onChange={(e) => setFormData({ ...formData, weeklyDays: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {WEEKLY_DAYS.map(day => (
            <option key={day.value} value={day.value}>
              {day.label}
            </option>
          ))}
        </select>
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={formData.weeklyDaysFlexible || false}
            onChange={(e) => setFormData({ ...formData, weeklyDaysFlexible: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">日数は応相談</span>
        </label>
      </div>

      {/* 1日稼働時間 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1日稼働時間
        </label>
        <select
          value={formData.dailyHours || ''}
          onChange={(e) => setFormData({ ...formData, dailyHours: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {DAILY_HOURS.map(hour => (
            <option key={hour.value} value={hour.value}>
              {hour.label}
            </option>
          ))}
        </select>
        <label className="flex items-center mt-2">
          <input
            type="checkbox"
            checked={formData.dailyHoursFlexible || false}
            onChange={(e) => setFormData({ ...formData, dailyHoursFlexible: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">時間は応相談</span>
        </label>
      </div>

      {/* 稼働時間帯 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          希望稼働時間帯（複数選択可）
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TIME_SLOTS.map(slot => (
            <label key={slot.value} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.preferredTimeSlots || []).includes(slot.value)}
                onChange={(e) => {
                  const current = formData.preferredTimeSlots || []
                  const updated = e.target.checked
                    ? [...current, slot.value]
                    : current.filter((s: string) => s !== slot.value)
                  setFormData({ ...formData, preferredTimeSlots: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{slot.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 稼働形態 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          稼働形態（複数選択可）
        </label>
        <div className="grid grid-cols-1 gap-2">
          {WORK_STYLES.map(style => (
            <label key={style.value} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.workStyles || []).includes(style.value)}
                onChange={(e) => {
                  const current = formData.workStyles || []
                  const updated = e.target.checked
                    ? [...current, style.value]
                    : current.filter((s: string) => s !== style.value)
                  setFormData({ ...formData, workStyles: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{style.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// 地域・対応エリアコンポーネント
export const LocationStructuredInput = ({ formData, setFormData }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">対応エリア（選択式）</h4>
      
      {/* 対応可能都道府県 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          対応可能都道府県（複数選択可）
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PREFECTURES.map(pref => (
            <label key={pref.value} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.supportedPrefectures || []).includes(pref.value)}
                onChange={(e) => {
                  const current = formData.supportedPrefectures || []
                  const updated = e.target.checked
                    ? [...current, pref.value]
                    : current.filter((p: string) => p !== pref.value)
                  setFormData({ ...formData, supportedPrefectures: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{pref.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 出張対応レベル */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          出張対応
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="businessTripLevel"
              value="none"
              checked={formData.businessTripLevel === 'none'}
              onChange={(e) => setFormData({ ...formData, businessTripLevel: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">出張不可</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="businessTripLevel"
              value="domestic"
              checked={formData.businessTripLevel === 'domestic'}
              onChange={(e) => setFormData({ ...formData, businessTripLevel: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">国内出張可</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="businessTripLevel"
              value="international"
              checked={formData.businessTripLevel === 'international'}
              onChange={(e) => setFormData({ ...formData, businessTripLevel: e.target.value })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">海外出張可</span>
          </label>
        </div>
      </div>

      {/* 完全リモート対応 */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.fullRemoteAvailable || false}
            onChange={(e) => setFormData({ ...formData, fullRemoteAvailable: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">完全リモート対応可能</span>
        </label>
      </div>
    </div>
  )
}

// 経験・レベルコンポーネント
export const ExperienceStructuredInput = ({ formData, setFormData }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">経験・レベル（選択式）</h4>
      
      {/* CFO経験年数 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CFO経験年数
        </label>
        <select
          value={formData.cfoExperienceYears || ''}
          onChange={(e) => setFormData({ ...formData, cfoExperienceYears: parseInt(e.target.value) })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {[...Array(21)].map((_, i) => (
            <option key={i} value={i}>
              {i === 0 ? '未経験' : `${i}年`}
            </option>
          ))}
        </select>
      </div>

      {/* CFOレベル */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CFOレベル
        </label>
        <select
          value={formData.cfoLevel || ''}
          onChange={(e) => setFormData({ ...formData, cfoLevel: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="">選択してください</option>
          {CFO_LEVELS.map(level => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>

      {/* 業界経験 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          業界経験（複数選択可）
        </label>
        <div className="grid grid-cols-2 gap-2">
          {INDUSTRIES.map(industry => (
            <label key={industry.value} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.industryExperience || []).includes(industry.value)}
                onChange={(e) => {
                  const current = formData.industryExperience || []
                  const updated = e.target.checked
                    ? [...current, industry.value]
                    : current.filter((i: string) => i !== industry.value)
                  setFormData({ ...formData, industryExperience: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{industry.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 企業規模経験 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          企業規模経験（複数選択可）
        </label>
        <div className="grid grid-cols-1 gap-2">
          {COMPANY_SIZES.map(size => (
            <label key={size.value} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.companySizeExperience || []).includes(size.value)}
                onChange={(e) => {
                  const current = formData.companySizeExperience || []
                  const updated = e.target.checked
                    ? [...current, size.value]
                    : current.filter((s: string) => s !== size.value)
                  setFormData({ ...formData, companySizeExperience: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{size.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* プロジェクト経験 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          プロジェクト経験（複数選択可）
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROJECT_TYPES.map(project => (
            <label key={project.value} className="flex items-center">
              <input
                type="checkbox"
                checked={(formData.projectExperience || []).includes(project.value)}
                onChange={(e) => {
                  const current = formData.projectExperience || []
                  const updated = e.target.checked
                    ? [...current, project.value]
                    : current.filter((p: string) => p !== project.value)
                  setFormData({ ...formData, projectExperience: updated })
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{project.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}