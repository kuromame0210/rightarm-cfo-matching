'use client'

// 必要最小限の選択肢定義
export const COMPENSATION_TYPES = [
  { value: 'monthly', label: '月額制' },
  { value: 'negotiable', label: '応相談' }
]

export const MONTHLY_FEES = [
  { value: 50000, label: '5万円' },
  { value: 100000, label: '10万円' },
  { value: 150000, label: '15万円' },
  { value: 200000, label: '20万円' },
  { value: 300000, label: '30万円' },
  { value: 500000, label: '50万円' },
  { value: 800000, label: '80万円' },
  { value: 1000000, label: '100万円' },
  { value: 1500000, label: '150万円' },
  { value: 2000000, label: '200万円' },
  { value: 2500000, label: '250万円' }
]

export const WEEKLY_DAYS = [
  { value: 1, label: '週1日' },
  { value: 2, label: '週2日' },
  { value: 3, label: '週3日' },
  { value: 4, label: '週4日' },
  { value: 5, label: '週5日（フルタイム）' }
]

export const REGIONS = [
  { value: 'kanto', label: '関東エリア' },
  { value: 'kansai', label: '関西エリア' },
  { value: 'chubu', label: '中部エリア' },
  { value: 'tohoku', label: '東北エリア' },
  { value: 'kyushu', label: '九州エリア' },
  { value: 'nationwide', label: '全国対応' }
]

// 報酬設定（シンプル版）
export const EssentialCompensationInput = ({ formData, setFormData, isEditing, required = false }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">
        💰 報酬設定
        {required && <span className="text-red-500 ml-1">*</span>}
      </h4>
      
      {isEditing ? (
        <>
          {/* 報酬体系選択 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              報酬体系
            </label>
            <select
              value={formData.compensationType || ''}
              onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required={required}
            >
              <option value="">{required ? '必須：選択してください' : '選択してください'}</option>
              {COMPENSATION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

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
        </>
      ) : (
        // 表示モード
        <div className="text-gray-900">
          {formData.compensationType ? (
            <div>
              <span className="font-medium">
                {COMPENSATION_TYPES.find(t => t.value === formData.compensationType)?.label}
              </span>
              {formData.compensationType === 'monthly' && formData.monthlyFeeMin && (
                <span className="ml-2">
                  {formData.monthlyFeeMax && formData.monthlyFeeMax !== formData.monthlyFeeMin ? 
                    `${formData.monthlyFeeMin/10000}万円〜${formData.monthlyFeeMax/10000}万円` : 
                    `${formData.monthlyFeeMin/10000}万円`}
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-500 italic">未設定</span>
          )}
        </div>
      )}
    </div>
  )
}

// 稼働条件（シンプル版）
export const EssentialAvailabilityInput = ({ formData, setFormData, isEditing, required = false }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">
        ⏰ 稼働条件
        {required && <span className="text-red-500 ml-1">*</span>}
      </h4>
      
      {isEditing ? (
        <>
          {/* 週の稼働可能時間 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              週の稼働可能時間
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={formData.weeklyDays || ''}
              onChange={(e) => setFormData({ ...formData, weeklyDays: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required={required}
            >
              <option value="">{required ? '必須：選択してください' : '選択してください'}</option>
              {WEEKLY_DAYS.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          {/* 柔軟性チェックボックス */}
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.weeklyDaysFlexible || false}
                onChange={(e) => setFormData({ ...formData, weeklyDaysFlexible: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">日数は応相談</span>
            </label>
          </div>
        </>
      ) : (
        // 表示モード
        <div className="text-gray-900">
          {formData.weeklyDays ? (
            <div>
              <span className="font-medium">週{formData.weeklyDays}日</span>
              {formData.weeklyDaysFlexible && (
                <span className="ml-2 text-blue-600">（応相談）</span>
              )}
            </div>
          ) : (
            <span className="text-gray-500 italic">未設定</span>
          )}
        </div>
      )}
    </div>
  )
}

// 地域対応（シンプル版）
export const EssentialLocationInput = ({ formData, setFormData, isEditing, required = false }: any) => {
  return (
    <div className="structured-input-section">
      <h4 className="text-lg font-semibold mb-4">
        🗺️ 対応エリア
        {required && <span className="text-red-500 ml-1">*</span>}
      </h4>
      
      {isEditing ? (
        <>
          {/* 対応可能エリア */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対応可能エリア（複数選択可）
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map(region => (
                <label key={region.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(formData.supportedPrefectures || []).includes(region.value)}
                    onChange={(e) => {
                      const current = formData.supportedPrefectures || []
                      const updated = e.target.checked
                        ? [...current, region.value]
                        : current.filter((r: string) => r !== region.value)
                      setFormData({ ...formData, supportedPrefectures: updated })
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{region.label}</span>
                </label>
              ))}
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
        </>
      ) : (
        // 表示モード
        <div className="text-gray-900">
          {(formData.supportedPrefectures && formData.supportedPrefectures.length > 0) || formData.fullRemoteAvailable ? (
            <div className="space-y-2">
              {formData.supportedPrefectures && formData.supportedPrefectures.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.supportedPrefectures.map((regionValue: string) => {
                    const region = REGIONS.find(r => r.value === regionValue)
                    return region ? (
                      <span key={regionValue} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {region.label}
                      </span>
                    ) : null
                  })}
                </div>
              )}
              {formData.fullRemoteAvailable && (
                <div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                    完全リモート可
                  </span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-gray-500 italic">未設定</span>
          )}
        </div>
      )}
    </div>
  )
}