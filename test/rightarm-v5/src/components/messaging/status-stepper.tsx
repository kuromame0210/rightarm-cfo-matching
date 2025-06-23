'use client'

import { ConversationStage } from '@/types'
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'

interface StatusStepperProps {
  currentStage: ConversationStage
  className?: string
}

const stages = [
  { id: 'inquiry', name: '気軽の相談', description: '最初の連絡' },
  { id: 'shortlist', name: '応募・スカウト', description: '正式な申し込み' },
  { id: 'negotiation', name: '条件交渉', description: '詳細な条件調整' },
  { id: 'meeting', name: '面談', description: 'オンライン面談実施' },
  { id: 'contracted', name: '契約', description: '契約成立' }
] as const

export function StatusStepper({ currentStage, className }: StatusStepperProps) {
  const currentIndex = stages.findIndex(stage => stage.id === currentStage)

  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {stages.map((stage, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isUpcoming = index > currentIndex

            return (
              <li key={stage.id} className={cn("relative", index !== stages.length - 1 && "flex-1")}>
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold",
                        isCompleted && "border-orange-500 bg-orange-500 text-white",
                        isCurrent && "border-orange-500 bg-white text-orange-500",
                        isUpcoming && "border-gray-300 bg-white text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-4 w-4" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isCompleted && "text-orange-600",
                        isCurrent && "text-orange-600",
                        isUpcoming && "text-gray-400"
                      )}
                    >
                      {stage.name}
                    </p>
                    <p className="text-xs text-gray-500">{stage.description}</p>
                  </div>
                  {index !== stages.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-4 left-8 h-0.5 w-full",
                        isCompleted ? "bg-orange-500" : "bg-gray-300"
                      )}
                    />
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
      
      {/* Mobile version - simplified */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
          <span>ステップ {currentIndex + 1} / {stages.length}</span>
          <span className="font-medium text-orange-600">
            {stages[currentIndex]?.name}
          </span>
        </div>
      </div>
    </div>
  )
}