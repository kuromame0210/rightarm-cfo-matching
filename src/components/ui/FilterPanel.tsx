'use client'

import { useState, useEffect, useMemo } from 'react'
// Simple value debounce hook
function useValueDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Common filter interfaces
interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterPanelProps {
  // Search functionality
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPlaceholder?: string
  
  // Tag/Skill filtering
  availableTags?: string[]
  selectedTags?: string[]
  onTagToggle?: (tag: string) => void
  tagLabel?: string
  maxVisibleTags?: number
  
  // Dropdown filters
  regions?: FilterOption[]
  selectedRegion?: string
  onRegionChange?: (region: string) => void
  
  workStyles?: FilterOption[]
  selectedWorkStyle?: string
  onWorkStyleChange?: (style: string) => void
  
  compensationRanges?: FilterOption[]
  selectedCompensation?: string
  onCompensationChange?: (compensation: string) => void
  
  // Sort options
  sortOptions?: FilterOption[]
  sortBy?: string
  onSortChange?: (sort: string) => void
  
  // Actions
  onSearch?: () => void
  onReset?: () => void
  isSearching?: boolean
  
  // Layout
  showMobileToggle?: boolean
  isMobileOpen?: boolean
  onMobileToggle?: () => void
  layout?: 'sidebar' | 'mobile' | 'inline'
  
  // Styling
  className?: string
  compact?: boolean
}

// Search Input Component
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = '検索キーワードを入力...',
  className = '',
  debounceMs = 300
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const debouncedValue = useValueDebounce(inputValue, debounceMs)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <div className="absolute left-3 top-2.5 text-gray-400">
        🔍
      </div>
    </div>
  )
}

// Tag Selector Component
interface TagSelectorProps {
  availableTags: string[]
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  label?: string
  maxVisible?: number
  className?: string
}

export function TagSelector({ 
  availableTags, 
  selectedTags, 
  onTagToggle, 
  label = 'タグ', 
  maxVisible = 10,
  className = ''
}: TagSelectorProps) {
  const [showAll, setShowAll] = useState(false)
  
  const visibleTags = useMemo(() => {
    return showAll ? availableTags : availableTags.slice(0, maxVisible)
  }, [availableTags, showAll, maxVisible])

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                onClick={() => onTagToggle(tag)}
                className="ml-2 text-blue-600 hover:text-blue-800"
                aria-label={`${tag}を削除`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available tags */}
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagToggle(tag)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300'
            }`}
          >
            {tag}
          </button>
        ))}
        
        {availableTags.length > maxVisible && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          >
            {showAll ? '表示を減らす' : `他${availableTags.length - maxVisible}件を表示`}
          </button>
        )}
      </div>
    </div>
  )
}

// Dropdown Filter Component
interface DropdownFilterProps {
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  label: string
  placeholder?: string
  className?: string
}

export function DropdownFilter({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder = '選択してください',
  className = ''
}: DropdownFilterProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.count !== undefined && ` (${option.count})`}
          </option>
        ))}
      </select>
    </div>
  )
}

// Mobile Filter Toggle Component
interface MobileFilterToggleProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function MobileFilterToggle({ isOpen, onToggle, className = '' }: MobileFilterToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`md:hidden flex items-center justify-between w-full px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 ${className}`}
    >
      <span className="text-sm font-medium text-gray-700">フィルター</span>
      <span className="text-gray-400">
        {isOpen ? '▲' : '▼'}
      </span>
    </button>
  )
}

// Main FilterPanel Component
export function FilterPanel({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  availableTags = [],
  selectedTags = [],
  onTagToggle,
  tagLabel,
  maxVisibleTags = 10,
  regions = [],
  selectedRegion = '',
  onRegionChange,
  workStyles = [],
  selectedWorkStyle = '',
  onWorkStyleChange,
  compensationRanges = [],
  selectedCompensation = '',
  onCompensationChange,
  sortOptions = [],
  sortBy = '',
  onSortChange,
  onSearch,
  onReset,
  isSearching = false,
  showMobileToggle = true,
  isMobileOpen = false,
  onMobileToggle,
  layout = 'sidebar',
  className = '',
  compact = false
}: FilterPanelProps) {
  const hasActiveFilters = useMemo(() => {
    return selectedTags.length > 0 || 
           selectedRegion !== '' || 
           selectedWorkStyle !== '' || 
           selectedCompensation !== '' ||
           searchQuery.trim() !== ''
  }, [selectedTags, selectedRegion, selectedWorkStyle, selectedCompensation, searchQuery])

  const handleReset = () => {
    onReset?.()
  }

  const handleSearch = () => {
    onSearch?.()
  }

  const panelClasses = `
    ${layout === 'mobile' ? 'w-full' : ''}
    ${layout === 'sidebar' ? 'w-64' : ''}
    ${compact ? 'space-y-3' : 'space-y-4'}
    ${className}
  `

  const filterContent = (
    <div className={panelClasses}>
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="w-full"
      />

      {/* Tag Selector */}
      {availableTags.length > 0 && onTagToggle && (
        <TagSelector
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={onTagToggle}
          label={tagLabel}
          maxVisible={maxVisibleTags}
        />
      )}

      {/* Region Filter */}
      {regions.length > 0 && onRegionChange && (
        <DropdownFilter
          options={regions}
          value={selectedRegion}
          onChange={onRegionChange}
          label="地域"
        />
      )}

      {/* Work Style Filter */}
      {workStyles.length > 0 && onWorkStyleChange && (
        <DropdownFilter
          options={workStyles}
          value={selectedWorkStyle}
          onChange={onWorkStyleChange}
          label="勤務形態"
        />
      )}

      {/* Compensation Filter */}
      {compensationRanges.length > 0 && onCompensationChange && (
        <DropdownFilter
          options={compensationRanges}
          value={selectedCompensation}
          onChange={onCompensationChange}
          label="報酬"
        />
      )}

      {/* Sort Options */}
      {sortOptions.length > 0 && onSortChange && (
        <DropdownFilter
          options={sortOptions}
          value={sortBy}
          onChange={onSortChange}
          label="並び順"
        />
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {onSearch && (
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? '検索中...' : '検索'}
          </button>
        )}
        
        {onReset && hasActiveFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            リセット
          </button>
        )}
      </div>
    </div>
  )

  // Mobile layout with collapsible panel
  if (showMobileToggle && layout === 'mobile') {
    return (
      <div className="space-y-3">
        <MobileFilterToggle
          isOpen={isMobileOpen}
          onToggle={onMobileToggle || (() => {})}
        />
        
        {isMobileOpen && (
          <div className="border-t border-gray-200 pt-3">
            {filterContent}
          </div>
        )}
      </div>
    )
  }

  return filterContent
}

// Default filter options for common use cases
export const defaultRegions: FilterOption[] = [
  { value: 'all', label: '全国' },
  { value: 'tokyo', label: '東京' },
  { value: 'osaka', label: '大阪' },
  { value: 'aichi', label: '愛知' },
  { value: 'fukuoka', label: '福岡' },
  { value: 'hokkaido', label: '北海道' },
  { value: 'miyagi', label: '宮城' },
  { value: 'hiroshima', label: '広島' }
]

export const defaultWorkStyles: FilterOption[] = [
  { value: 'remote', label: 'リモート' },
  { value: 'hybrid', label: 'ハイブリッド' },
  { value: 'office', label: 'オフィス' },
  { value: 'flexible', label: '柔軟' }
]

export const defaultCompensationRanges: FilterOption[] = [
  { value: 'under-500', label: '500万円未満' },
  { value: '500-800', label: '500-800万円' },
  { value: '800-1200', label: '800-1200万円' },
  { value: '1200-1500', label: '1200-1500万円' },
  { value: 'over-1500', label: '1500万円以上' },
  { value: 'negotiable', label: '相談可' }
]

export const defaultSortOptions: FilterOption[] = [
  { value: 'newest', label: '新着順' },
  { value: 'compensation', label: '報酬順' },
  { value: 'rating', label: '評価順' },
  { value: 'urgent', label: '急募順' }
]