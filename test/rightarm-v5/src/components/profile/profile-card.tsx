import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CfoWithProfile, CompanyWithProfile } from '@/types'
import { MapPinIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface ProfileCardProps {
  profile: CfoWithProfile | CompanyWithProfile
  variant: 'cfo' | 'company'
  onScout?: () => void
  showScoutButton?: boolean
}

export function ProfileCard({ profile, variant, onScout, showScoutButton = true }: ProfileCardProps) {
  const isCfo = variant === 'cfo'
  const cfoProfile = isCfo ? (profile as CfoWithProfile) : null
  const companyProfile = !isCfo ? (profile as CompanyWithProfile) : null

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => {
      const filled = i < Math.floor(rating)
      const Icon = filled ? StarIconSolid : StarIcon
      return (
        <Icon
          key={i}
          className={`h-4 w-4 ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      )
    })
  }

  const displayTags = profile.tags.slice(0, 4)
  const remainingCount = profile.tags.length - 4

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white border border-gray-200">
      <Link href={`/${variant}/${profile.id}`}>
        <CardContent className="p-4">
          {/* Header Section */}
          <div className="border-b border-gray-100 pb-3 mb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-gray-700">
                    {isCfo 
                      ? `${cfoProfile!.firstName[0]}${cfoProfile!.lastName[0]}`
                      : companyProfile!.companyName[0]
                    }
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base text-gray-900 truncate">
                    {isCfo 
                      ? cfoProfile!.displayName || `${cfoProfile!.firstName} ${cfoProfile!.lastName}`
                      : companyProfile!.companyName
                    }
                  </h3>
                  {isCfo && (
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {renderStars(cfoProfile!.ratingAverage)}
                      </div>
                      <span className="text-xs text-gray-600">
                        {cfoProfile!.ratingAverage.toFixed(1)} ({cfoProfile!.ratingCount}件)
                      </span>
                    </div>
                  )}
                  {!isCfo && companyProfile!.industry && (
                    <p className="text-xs text-gray-600 mt-1">{companyProfile!.industry}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content based on card type */}
          {isCfo ? (
            // CFO Card Content
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">可能な業務/スキル</h4>
                <div className="flex flex-wrap gap-1">
                  {displayTags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {profile.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 text-gray-600">
                      +{profile.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">実績・経歴</h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {cfoProfile!.bio || '経歴情報が設定されていません'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">稼働希望形態</span>
                  <p className="font-medium text-gray-900">
                    {profile.tags.some(tag => tag.name.includes('リモート')) ? 'フルリモート可' : '応相談'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">希望報酬イメージ</span>
                  <p className="font-medium text-gray-900">
                    {cfoProfile!.hourlyRateMin && cfoProfile!.hourlyRateMax 
                      ? `¥${cfoProfile!.hourlyRateMin.toLocaleString()}-${cfoProfile!.hourlyRateMax.toLocaleString()}/時`
                      : '応相談'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-600">
                <MapPinIcon className="h-3 w-3 mr-1" />
                <span>
                  {`${cfoProfile!.locationPrefecture || ''} ${cfoProfile!.locationCity || ''}`.trim() || '場所未設定'}
                </span>
                {cfoProfile!.yearsExperience && (
                  <>
                    <span className="mx-2">•</span>
                    <span>経験{cfoProfile!.yearsExperience}年</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Company Card Content
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">会社概要</h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {companyProfile!.companyDescription || '会社概要が設定されていません'}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">抱えている財務課題</h4>
                <div className="flex flex-wrap gap-1">
                  {displayTags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="outline"
                      className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {profile.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5 text-gray-600">
                      +{profile.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">従業員数</span>
                  <p className="font-medium text-gray-900">
                    {companyProfile!.companySize || '未設定'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">業界</span>
                  <p className="font-medium text-gray-900">
                    {companyProfile!.industry || '未設定'}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-xs text-gray-600">
                <MapPinIcon className="h-3 w-3 mr-1" />
                <span>
                  {`${companyProfile!.locationPrefecture || ''} ${companyProfile!.locationCity || ''}`.trim() || '場所未設定'}
                </span>
                {companyProfile!.establishedYear && (
                  <>
                    <span className="mx-2">•</span>
                    <span>設立{companyProfile!.establishedYear}年</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Link>
      
      {showScoutButton && (
        <CardFooter className="px-4 py-3 pt-0 flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={(e) => {
              e.preventDefault()
              // Handle bookmark/favorite
            }}
          >
            気になる
          </Button>
          <Button 
            size="sm"
            className="flex-1 text-xs h-8 bg-orange-500 hover:bg-orange-600"
            onClick={(e) => {
              e.preventDefault()
              onScout?.()
            }}
          >
            {isCfo ? 'スカウト' : '応募'}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}