'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { skillCategories, SkillCategory } from '@/lib/skill-categories'
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface SkillCategorySelectorProps {
  selectedSkills: string[]
  onChange: (selectedSkills: string[]) => void
}

export function SkillCategorySelector({ selectedSkills, onChange }: SkillCategorySelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSkillToggle = (skillId: string) => {
    onChange(
      selectedSkills.includes(skillId)
        ? selectedSkills.filter(id => id !== skillId)
        : [...selectedSkills, skillId]
    )
  }

  const getSelectedSkillsInCategory = (category: SkillCategory) => {
    return category.skills.filter(skill => selectedSkills.includes(skill.id))
  }

  const clearAllSkills = () => {
    onChange([])
  }

  const getSkillName = (skillId: string) => {
    for (const category of skillCategories) {
      const skill = category.skills.find(s => s.id === skillId)
      if (skill) return skill.name
    }
    return skillId
  }

  return (
    <div className="space-y-4">
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              選択中のスキル ({selectedSkills.length})
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllSkills}
              className="text-xs h-auto p-1"
            >
              すべて削除
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map((skillId) => (
              <Badge
                key={skillId}
                variant="default"
                className="text-xs pl-2 pr-1 py-1 bg-orange-100 text-orange-800 border-orange-200"
              >
                {getSkillName(skillId)}
                <button
                  type="button"
                  onClick={() => handleSkillToggle(skillId)}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-3">
        {skillCategories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id)
          const selectedInCategory = getSelectedSkillsInCategory(category)
          
          return (
            <div key={category.id} className="border rounded-lg">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {selectedInCategory.length > 0 && (
                    <span className="ml-2 text-sm text-orange-600">
                      ({selectedInCategory.length}個選択中)
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="border-t px-4 py-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {category.skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.id)
                      return (
                        <label
                          key={skill.id}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSkillToggle(skill.id)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="text-sm text-gray-700">{skill.name}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}