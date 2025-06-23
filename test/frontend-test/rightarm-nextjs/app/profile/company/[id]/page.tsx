'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  MessageCircle,
  Star,
  Globe,
  Clock,
  Target,
  AlertCircle,
  CheckCircle,
  Briefcase
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface CompanyProfile {
  id: string;
  company_name: string;
  display_name: string;
  photo_url?: string;
  description: string;
  industry: string;
  company_size: string;
  funding_stage: string;
  location: string;
  website_url?: string;
  established_year: number;
  annual_revenue: string;
  employee_count: string;
  challenges: string[];
  challenge_description: string;
  cfo_requirements: string;
  budget_range: string;
  work_style_preference: {
    remote_ok: boolean;
    required_days: number;
    contract_duration: string;
  };
  urgency: string;
  contact_person: string;
  tags: string[];
}

export default function CompanyProfilePage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('sample_cfo_1'); // TODO: 認証から取得
  const [userType, setUserType] = useState<'company' | 'cfo'>('cfo'); // TODO: 認証から取得
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      // TODO: 実際のAPIコール
      // const response = await fetch(`/api/profiles/company/${profileId}`);
      
      // 開発用モックデータ
      const mockProfile: CompanyProfile = {
        id: profileId,
        company_name: 'テクノロジー株式会社',
        display_name: 'テクノロジー株式会社',
        photo_url: null,
        description: 'AI・機械学習技術を活用したSaaSプロダクトを展開するスタートアップです。主に中小企業向けの業務効率化ソリューションを提供しており、現在シリーズA調達を検討中です。急成長に伴い、財務戦略の強化が重要な課題となっています。',
        industry: 'IT・Web',
        company_size: 'startup',
        funding_stage: 'series_a',
        location: '東京都渋谷区',
        website_url: 'https://example-tech.com',
        established_year: 2020,
        annual_revenue: '1~10億円',
        employee_count: '21-50名',
        challenges: [
          '資金調達', 'IPO準備', '管理会計', '投資家対応'
        ],
        challenge_description: 'シリーズAで5億円の資金調達を予定しており、投資家との交渉や事業計画の策定、財務資料の作成についてサポートが必要です。また、急成長に対応するための管理会計システムの構築も重要な課題です。',
        cfo_requirements: '週2-3日程度の稼働で、資金調達の実務経験が豊富な方を希望します。スタートアップでの経験があり、投資家対応ができる方を優先します。',
        budget_range: '月額50-100万円',
        work_style_preference: {
          remote_ok: true,
          required_days: 2,
          contract_duration: '6ヶ月〜'
        },
        urgency: '1ヶ月以内',
        contact_person: '代表取締役 田中太郎',
        tags: [
          'スタートアップ', '資金調達中', 'リモートOK', '急募',
          'IPO準備検討中', '高成長企業', 'AI・機械学習'
        ]
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!profile) return;
    
    try {
      // 開発用リダイレクト
      router.push('/messages/550e8400-e29b-41d4-a716-446655440000');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const handleApply = async () => {
    // TODO: 応募機能
    alert('応募しました！');
  };

  const getCompanySizeLabel = (size: string) => {
    const sizeMap: { [key: string]: string } = {
      'startup': 'スタートアップ',
      'small': '中小企業',
      'medium': '中堅企業',
      'large': '大企業'
    };
    return sizeMap[size] || size;
  };

  const getFundingStageLabel = (stage: string) => {
    const stageMap: { [key: string]: string } = {
      'seed': 'シード',
      'series_a': 'シリーズA',
      'series_b': 'シリーズB',
      'series_c_later': 'シリーズC以降',
      'ipo': 'IPO準備中'
    };
    return stageMap[stage] || stage;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case '今すぐ':
        return 'text-red-600 bg-red-50';
      case '1ヶ月以内':
        return 'text-orange-600 bg-orange-50';
      case '検討中':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">企業情報が見つかりません</h2>
          <button
            onClick={() => router.back()}
            className="btn-primary"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-black mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>戻る</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左カラム - メイン情報 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 企業基本情報 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  ) : (
                    <Building2 className="h-12 w-12 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-black">{profile.company_name}</h1>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(profile.urgency)}`}>
                      {profile.urgency}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building2 className="h-4 w-4" />
                      <span>{profile.industry}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{profile.employee_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{profile.established_year}年設立</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                </div>
              </div>
            </motion.div>

            {/* 財務課題 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>解決したい財務課題</span>
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.challenges.map((challenge, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium"
                  >
                    {challenge}
                  </span>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">課題の詳細</h3>
                <p className="text-gray-700 leading-relaxed">{profile.challenge_description}</p>
              </div>
            </motion.div>

            {/* CFOへの要求 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>CFOに求めること</span>
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">{profile.cfo_requirements}</p>
              </div>
            </motion.div>

            {/* 企業詳細情報 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>企業詳細</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">企業規模</span>
                    <span className="font-medium">{getCompanySizeLabel(profile.company_size)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">資金調達段階</span>
                    <span className="font-medium">{getFundingStageLabel(profile.funding_stage)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">推定年商</span>
                    <span className="font-medium">{profile.annual_revenue}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">従業員数</span>
                    <span className="font-medium">{profile.employee_count}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">担当者</span>
                    <span className="font-medium">{profile.contact_person}</span>
                  </div>
                  
                  {profile.website_url && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ウェブサイト</span>
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Globe className="h-4 w-4" />
                        <span>サイトを見る</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 企業タグ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4">企業特徴</h2>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 右カラム - アクション・契約条件 */}
          <div className="space-y-6">
            {/* アクションボタン */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8"
            >
              <div className="space-y-4">
                <button
                  onClick={handleSendMessage}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>メッセージを送る</span>
                </button>
                
                <button
                  onClick={handleApply}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>応募する</span>
                </button>
              </div>
            </motion.div>

            {/* 契約条件 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>契約条件</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">予算</span>
                  <span className="font-medium text-lg text-green-600">
                    {profile.budget_range}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">希望稼働日数</span>
                  <span className="font-medium">週{profile.work_style_preference.required_days}日</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">リモート対応</span>
                  <span className={`font-medium ${profile.work_style_preference.remote_ok ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.work_style_preference.remote_ok ? '対応可' : '要出社'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">契約期間</span>
                  <span className="font-medium">
                    {profile.work_style_preference.contract_duration}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">開始希望</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-xs ${getUrgencyColor(profile.urgency)}`}>
                    {profile.urgency}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 募集統計 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>募集状況</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">プロフィール閲覧</span>
                  <span className="font-medium">567回</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">応募数</span>
                  <span className="font-medium text-blue-600">23件</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">面談実施数</span>
                  <span className="font-medium text-green-600">8件</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">応募締切</span>
                  <span className="font-medium text-orange-600">3日後</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}