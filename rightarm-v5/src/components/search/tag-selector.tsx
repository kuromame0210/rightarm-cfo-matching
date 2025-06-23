'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, TagType } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface TagSelectorProps {
  tags: Tag[]
  selectedTags: string[]
  onChange: (selectedTags: string[]) => void
  placeholder?: string
  maxHeight?: string
}

export function TagSelector({ 
  tags, 
  selectedTags, 
  onChange, 
  placeholder = "タグを検索...",
  maxHeight = "max-h-64"
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTags = tags.filter(tag => 
    tag.isActive && 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag.id)
  )

  const skillTags = filteredTags.filter(tag => tag.type === 'skill')
  const challengeTags = filteredTags.filter(tag => tag.type === 'challenge')

  const selectedTagObjects = tags.filter(tag => selectedTags.includes(tag.id))

  const handleTagSelect = (tagId: string) => {
    onChange([...selectedTags, tagId])
  }

  const handleTagRemove = (tagId: string) => {
    onChange(selectedTags.filter(id => id !== tagId))
  }

  const clearAll = () => {
    onChange([])
  }

  return (
    <div className="relative">
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              選択中のタグ ({selectedTags.length})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs h-auto p-1"
            >
              すべて削除
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagObjects.map((tag) => (
              <Badge
                key={tag.id}
                variant={tag.type === 'skill' ? 'default' : 'secondary'}
                className="text-xs pl-2 pr-1 py-1"
              >
                {tag.name}
                <button
                  onClick={() => handleTagRemove(tag.id)}
                  className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full"
        />
        
        {/* Tag Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className={`${maxHeight} overflow-y-auto p-4`}>
              {filteredTags.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {searchTerm ? 'タグが見つかりません' : 'すべてのタグが選択されています'}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Skill Tags */}
                  {skillTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        スキルタグ
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {skillTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag.id)}
                            className="text-xs"
                          >
                            <Badge
                              variant="outline"
                              className="hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-colors"
                            >
                              {tag.name}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Challenge Tags */}
                  {challengeTags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        課題タグ
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {challengeTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag.id)}
                            className="text-xs"
                          >
                            <Badge
                              variant="outline"
                              className="hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-colors"
                            >
                              {tag.name}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-full text-xs"
              >
                閉じる
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}