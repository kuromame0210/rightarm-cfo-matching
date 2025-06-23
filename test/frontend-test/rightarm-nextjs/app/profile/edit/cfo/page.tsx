'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Plus, 
  X,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CFOProfileData {
  display_name: string;
  first_name: string;
  last_name: string;
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
  linkedin_url: string;
  location: string;
  achievements: string[];
  is_public: boolean;
}

const expertiseOptions = [
  '資金調達', 'IPO準備', '管理会計構築', '投資家対応', 
  'バリュエーション', 'M&Aアドバイザリー', 'ERP導入',
  '内部統制構築', '事業再生', '財務DD対応', '原価計算',
  '月次決算早期化', 'BIツール導入', '経理部門構築'
];

const industryOptions = [
  'IT・Web', 'SaaS', '製造業', 'ヘルスケア', '金融',
  '小売・EC', '不動産', '建設', '物流', '教育',
  'エンターテイメント', '飲食', '農業', 'エネルギー'
];

const certificationOptions = [
  '公認会計士', 'MBA', '中小企業診断士', 'FP1級',
  'USCPA', '税理士', '社会保険労務士', 'CIA',
  'CISA', 'PMP', '日商簿記1級'
];

export default function CFOProfileEditPage() {
  const [profile, setProfile] = useState<CFOProfileData>({
    display_name: '',
    first_name: '',
    last_name: '',
    bio: '',
    experience_years: 0,
    expertise: [],
    industries: [],
    work_style: {
      days_per_week: 1,
      remote_ok: true,
      contract_type: 'part_time'
    },
    hourly_rate: 10000,
    certifications: [],
    linkedin_url: '',
    location: '',
    achievements: [],
    is_public: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAchievement, setNewAchievement] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    calculateCompletion();
  }, [profile]);

  const fetchProfile = async () => {
    try {
      // TODO: 実際のAPIコール
      // 開発用モックデータ
      const mockProfile: CFOProfileData = {
        display_name: '山田 太郎',
        first_name: '太郎',
        last_name: '山田',
        bio: 'スタートアップから上場企業まで幅広い経験を持つCFOです。',
        experience_years: 12,
        expertise: ['資金調達', 'IPO準備', '管理会計構築'],
        industries: ['IT・Web', 'SaaS'],
        work_style: {
          days_per_week: 2,
          remote_ok: true,
          contract_type: 'part_time'
        },
        hourly_rate: 15000,
        certifications: ['公認会計士', 'MBA'],
        linkedin_url: 'https://linkedin.com/in/yamada-taro',
        location: '東京都',
        achievements: ['IPO成功: 5社', '資金調達総額: 50億円'],
        is_public: true
      };

      setProfile(mockProfile);
    } catch (error) {
      console.error('プロフィール取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      profile.display_name,
      profile.first_name,
      profile.last_name,
      profile.bio,
      profile.experience_years > 0,
      profile.expertise.length > 0,
      profile.industries.length > 0,
      profile.hourly_rate > 0,
      profile.location,
      profile.achievements.length > 0
    ];

    const completed = fields.filter(Boolean).length;
    const completion = Math.round((completed / fields.length) * 100);
    setProfileCompletion(completion);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // TODO: 実際のAPIコール
      // const response = await fetch('/api/profiles/cfo/update', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${idToken}`
      //   },
      //   body: JSON.stringify(profile)
      // });

      // if (!response.ok) {
      //   throw new Error('プロフィール保存に失敗しました');
      // }

      alert('プロフィールを保存しました！');
      router.push('/dashboard/cfo');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleExpertiseChange = (expertise: string) => {
    setProfile(prev => ({
      ...prev,
      expertise: prev.expertise.includes(expertise)
        ? prev.expertise.filter(e => e !== expertise)
        : [...prev.expertise, expertise]
    }));
  };

  const handleIndustryChange = (industry: string) => {
    setProfile(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleCertificationChange = (cert: string) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfile(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">プロフィール編集</h1>
              <p className="text-gray-600 mt-1">CFOプロフィール情報を更新</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* プロフィール完了度 */}
              <div className="text-right">
                <div className="text-sm text-gray-600">完了度</div>
                <div className="text-lg font-bold text-black">{profileCompletion}%</div>
              </div>
              
              {/* 公開設定 */}
              <button
                onClick={() => setProfile(prev => ({ ...prev, is_public: !prev.is_public }))}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  profile.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {profile.is_public ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span>{profile.is_public ? '公開中' : '非公開'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* 基本情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">基本情報</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.display_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在地 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="東京都"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  経験年数 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={profile.experience_years}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望時給 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={profile.hourly_rate}
                  onChange={(e) => setProfile(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profile.linkedin_url}
                  onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="https://linkedin.com/in/your-profile"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="あなたの経験やスキル、得意分野について記載してください..."
              />
            </div>
          </motion.div>

          {/* 専門スキル */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">専門スキル</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {expertiseOptions.map((expertise, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.expertise.includes(expertise)}
                    onChange={() => handleExpertiseChange(expertise)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{expertise}</span>
                </label>
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
            <h2 className="text-xl font-semibold text-black mb-4">対応業界</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industryOptions.map((industry, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.industries.includes(industry)}
                    onChange={() => handleIndustryChange(industry)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* 稼働条件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">稼働条件</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望稼働日数
                </label>
                <select
                  value={profile.work_style.days_per_week}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    work_style: { ...prev.work_style, days_per_week: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value={1}>週1日</option>
                  <option value={2}>週2日</option>
                  <option value={3}>週3日</option>
                  <option value={4}>週4日</option>
                  <option value={5}>週5日</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  契約形態
                </label>
                <select
                  value={profile.work_style.contract_type}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    work_style: { ...prev.work_style, contract_type: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="part_time">パートタイム</option>
                  <option value="full_time">フルタイム</option>
                  <option value="project">プロジェクト単位</option>
                </select>
              </div>

              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.work_style.remote_ok}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      work_style: { ...prev.work_style, remote_ok: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">リモート対応可</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* 保有資格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">保有資格</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {certificationOptions.map((cert, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.certifications.includes(cert)}
                    onChange={() => handleCertificationChange(cert)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{cert}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* 実績 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">主な実績</h2>
            
            <div className="space-y-3">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="flex-1 px-3 py-2 bg-gray-50 rounded-lg">{achievement}</span>
                  <button
                    onClick={() => removeAchievement(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  placeholder="新しい実績を追加..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAchievement();
                    }
                  }}
                />
                <button
                  onClick={addAchievement}
                  className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* 保存ボタン */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end space-x-4"
          >
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              <span>{saving ? '保存中...' : '保存する'}</span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}