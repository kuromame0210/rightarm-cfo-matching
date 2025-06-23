'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Award, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  MessageCircle,
  Star,
  Shield,
  Globe,
  Clock,
  Users,
  Building
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface CFOProfile {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  bio: string;
  experience_years: number;
  expertise: string[];
  industries: string[];
  work_style: {
    days_per_week: number;
    remote_ok: boolean;
    contract_type: string;
  };
  hourly_rate: number;
  certifications: string[];
  linkedin_url?: string;
  location?: string;
  achievements: string[];
  tags: string[];
}

export default function CFOProfilePage() {
  const [profile, setProfile] = useState<CFOProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('sample_company_1'); // TODO: 認証から取得
  const [userType, setUserType] = useState<'company' | 'cfo'>('company'); // TODO: 認証から取得
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;

  useEffect(() => {
    fetchProfile();
  }, [profileId]);

  const fetchProfile = async () => {
    try {
      // TODO: 実際のAPIコール
      // const response = await fetch(`/api/profiles/cfo/${profileId}`);
      
      // 開発用モックデータ
      const mockProfile: CFOProfile = {
        id: profileId,
        display_name: '山田 太郎',
        first_name: '太郎',
        last_name: '山田',
        photo_url: null,
        bio: 'スタートアップから上場企業まで幅広い経験を持つCFOです。特に資金調達とIPO準備において実績があり、これまで20社以上の企業の財務戦略をサポートしてきました。データドリブンな経営管理と効率的な業務プロセス構築を得意としています。',
        experience_years: 12,
        expertise: [
          '資金調達', 'IPO準備', '管理会計構築', '投資家対応', 
          'バリュエーション', 'M&Aアドバイザリー', 'ERP導入'
        ],
        industries: ['IT・Web', 'SaaS', '製造業', 'ヘルスケア'],
        work_style: {
          days_per_week: 2,
          remote_ok: true,
          contract_type: 'part_time'
        },
        hourly_rate: 15000,
        certifications: ['公認会計士', 'MBA', '中小企業診断士'],
        linkedin_url: 'https://linkedin.com/in/yamada-taro',
        location: '東京都',
        achievements: [
          'IPO成功: 5社',
          '資金調達総額: 50億円',
          'M&A成約: 8件',
          '上場企業CFO経験: 3社'
        ],
        tags: [
          '週1〜対応可', 'フルリモート対応可', '成果報酬型対応可',
          'スタートアップ支援経験あり', '上場企業勤務経験あり', '英語対応可'
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
      // TODO: 新規会話開始API呼び出し
      // const response = await fetch('/api/messages/start-conversation', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${idToken}`
      //   },
      //   body: JSON.stringify({
      //     target_user_id: profile.id,
      //     initial_message: `${profile.display_name}さん、こんにちは。弊社の財務についてご相談させていただきたく、ご連絡いたします。`
      //   })
      // });

      // if (response.ok) {
      //   const result = await response.json();
      //   router.push(`/messages/${result.conversation.id}`);
      // }

      // 開発用リダイレクト
      router.push('/messages/550e8400-e29b-41d4-a716-446655440000');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
    }
  };

  const handleSendScout = async () => {
    // TODO: スカウト送信機能
    alert('スカウトを送信しました！');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">プロフィールが見つかりません</h2>
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
            {/* プロフィール基本情報 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <Briefcase className="h-12 w-12 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-2xl font-bold text-black">{profile.display_name}</h1>
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>経験{profile.experience_years}年</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>時給 {profile.hourly_rate.toLocaleString()}円</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              </div>
            </motion.div>

            {/* 専門スキル */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>専門スキル</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 対応業界 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>対応業界</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.industries.map((industry, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                  >
                    {industry}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* 実績 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>主な実績</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 保有資格 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4 flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>保有資格</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* タグ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-black mb-4">特徴</h2>
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

          {/* 右カラム - アクション・詳細情報 */}
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
                  onClick={handleSendScout}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <Star className="h-5 w-5" />
                  <span>スカウトを送る</span>
                </button>

                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </motion.div>

            {/* 稼働条件 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>稼働条件</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">稼働日数</span>
                  <span className="font-medium">週{profile.work_style.days_per_week}日</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">リモート対応</span>
                  <span className={`font-medium ${profile.work_style.remote_ok ? 'text-green-600' : 'text-red-600'}`}>
                    {profile.work_style.remote_ok ? '対応可' : '要相談'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">契約形態</span>
                  <span className="font-medium">
                    {profile.work_style.contract_type === 'part_time' ? 'パートタイム' : 'フルタイム'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">時給</span>
                  <span className="font-medium text-lg">
                    ¥{profile.hourly_rate.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 統計情報 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>実績統計</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">プロフィール閲覧</span>
                  <span className="font-medium">1,234回</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">スカウト率</span>
                  <span className="font-medium text-blue-600">15.2%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">返信率</span>
                  <span className="font-medium text-green-600">92%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">契約成立率</span>
                  <span className="font-medium text-purple-600">78%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}