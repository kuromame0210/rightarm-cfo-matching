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
  Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CompanyProfileData {
  company_name: string;
  display_name: string;
  description: string;
  industry: string;
  company_size: string;
  funding_stage: string;
  location: string;
  website_url: string;
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
  is_public: boolean;
}

const industryOptions = [
  'IT・Web', 'SaaS', '製造業', 'ヘルスケア', '金融',
  '小売・EC', '不動産', '建設', '物流', '教育',
  'エンターテイメント', '飲食', '農業', 'エネルギー'
];

const companySizeOptions = [
  { value: 'startup', label: 'スタートアップ' },
  { value: 'small', label: '中小企業' },
  { value: 'medium', label: '中堅企業' },
  { value: 'large', label: '大企業' }
];

const fundingStageOptions = [
  { value: 'seed', label: 'シード' },
  { value: 'series_a', label: 'シリーズA' },
  { value: 'series_b', label: 'シリーズB' },
  { value: 'series_c_later', label: 'シリーズC以降' },
  { value: 'ipo', label: 'IPO準備中' }
];

const revenueOptions = [
  '1億円未満', '1~10億円', '10~30億円', '30~50億円', '50億円以上', '非公開'
];

const employeeOptions = [
  '1-10名', '11-20名', '21-50名', '51-100名', '101-300名', '301名以上'
];

const challengeOptions = [
  '資金調達', 'IPO準備', 'M&A準備', '再生・事業継承',
  '管理会計', '経営管理DX', '内部統制', '投資家対応'
];

const budgetOptions = [
  '月額20万円未満', '月額20-50万円', '月額50-100万円',
  '月額100-200万円', '月額200万円以上', '成果報酬型', '応相談'
];

const urgencyOptions = [
  '今すぐ', '1ヶ月以内', '3ヶ月以内', '検討中', 'その他'
];

export default function CompanyProfileEditPage() {
  const [profile, setProfile] = useState<CompanyProfileData>({
    company_name: '',
    display_name: '',
    description: '',
    industry: '',
    company_size: '',
    funding_stage: '',
    location: '',
    website_url: '',
    established_year: new Date().getFullYear(),
    annual_revenue: '',
    employee_count: '',
    challenges: [],
    challenge_description: '',
    cfo_requirements: '',
    budget_range: '',
    work_style_preference: {
      remote_ok: true,
      required_days: 2,
      contract_duration: '6ヶ月〜'
    },
    urgency: '',
    contact_person: '',
    is_public: true
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const mockProfile: CompanyProfileData = {
        company_name: 'テクノロジー株式会社',
        display_name: 'テクノロジー株式会社',
        description: 'AI・機械学習技術を活用したSaaSプロダクトを展開するスタートアップです。',
        industry: 'IT・Web',
        company_size: 'startup',
        funding_stage: 'series_a',
        location: '東京都渋谷区',
        website_url: 'https://example-tech.com',
        established_year: 2020,
        annual_revenue: '1~10億円',
        employee_count: '21-50名',
        challenges: ['資金調達', '管理会計'],
        challenge_description: 'シリーズAで5億円の資金調達を予定しており、サポートが必要です。',
        cfo_requirements: '週2-3日程度の稼働で、資金調達の実務経験が豊富な方を希望します。',
        budget_range: '月額50-100万円',
        work_style_preference: {
          remote_ok: true,
          required_days: 2,
          contract_duration: '6ヶ月〜'
        },
        urgency: '1ヶ月以内',
        contact_person: '代表取締役 田中太郎',
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
      profile.company_name,
      profile.description,
      profile.industry,
      profile.company_size,
      profile.location,
      profile.challenges.length > 0,
      profile.challenge_description,
      profile.cfo_requirements,
      profile.budget_range,
      profile.urgency,
      profile.contact_person
    ];

    const completed = fields.filter(Boolean).length;
    const completion = Math.round((completed / fields.length) * 100);
    setProfileCompletion(completion);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // TODO: 実際のAPIコール
      alert('プロフィールを保存しました！');
      router.push('/dashboard/company');
    } catch (error) {
      console.error('保存エラー:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleChallengeChange = (challenge: string) => {
    setProfile(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
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
              <h1 className="text-3xl font-bold text-black">企業プロフィール編集</h1>
              <p className="text-gray-600 mt-1">企業情報とCFO募集要項を更新</p>
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
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.company_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="株式会社◯◯"
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
                  placeholder="東京都渋谷区"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  業界 <span className="text-red-500">*</span>
                </label>
                <select
                  value={profile.industry}
                  onChange={(e) => setProfile(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {industryOptions.map((industry, index) => (
                    <option key={index} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  企業規模 <span className="text-red-500">*</span>
                </label>
                <select
                  value={profile.company_size}
                  onChange={(e) => setProfile(prev => ({ ...prev, company_size: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {companySizeOptions.map((size, index) => (
                    <option key={index} value={size.value}>{size.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  資金調達段階
                </label>
                <select
                  value={profile.funding_stage}
                  onChange={(e) => setProfile(prev => ({ ...prev, funding_stage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {fundingStageOptions.map((stage, index) => (
                    <option key={index} value={stage.value}>{stage.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  設立年
                </label>
                <input
                  type="number"
                  value={profile.established_year}
                  onChange={(e) => setProfile(prev => ({ ...prev, established_year: parseInt(e.target.value) || new Date().getFullYear() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  推定年商
                </label>
                <select
                  value={profile.annual_revenue}
                  onChange={(e) => setProfile(prev => ({ ...prev, annual_revenue: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {revenueOptions.map((revenue, index) => (
                    <option key={index} value={revenue}>{revenue}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  従業員数
                </label>
                <select
                  value={profile.employee_count}
                  onChange={(e) => setProfile(prev => ({ ...prev, employee_count: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {employeeOptions.map((count, index) => (
                    <option key={index} value={count}>{count}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ウェブサイト
                </label>
                <input
                  type="url"
                  value={profile.website_url}
                  onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  担当者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile.contact_person}
                  onChange={(e) => setProfile(prev => ({ ...prev, contact_person: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="代表取締役 田中太郎"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                会社概要 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={profile.description}
                onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="事業内容、特徴、強みなどを記載してください..."
              />
            </div>
          </motion.div>

          {/* 財務課題 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">解決したい財務課題</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {challengeOptions.map((challenge, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.challenges.includes(challenge)}
                    onChange={() => handleChallengeChange(challenge)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-gray-700">{challenge}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                課題の詳細説明 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={profile.challenge_description}
                onChange={(e) => setProfile(prev => ({ ...prev, challenge_description: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="具体的な課題の背景や状況、解決したいことを詳しく記載してください..."
              />
            </div>
          </motion.div>

          {/* CFO要件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">CFOに求めること</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                業務内容・経験・スキル要件 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={profile.cfo_requirements}
                onChange={(e) => setProfile(prev => ({ ...prev, cfo_requirements: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="希望する業務内容、必要な経験・スキル、稼働条件などを記載してください..."
              />
            </div>
          </motion.div>

          {/* 契約条件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-semibold text-black mb-4">契約条件</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  予算範囲 <span className="text-red-500">*</span>
                </label>
                <select
                  value={profile.budget_range}
                  onChange={(e) => setProfile(prev => ({ ...prev, budget_range: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {budgetOptions.map((budget, index) => (
                    <option key={index} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始希望時期 <span className="text-red-500">*</span>
                </label>
                <select
                  value={profile.urgency}
                  onChange={(e) => setProfile(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {urgencyOptions.map((urgency, index) => (
                    <option key={index} value={urgency}>{urgency}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  希望稼働日数
                </label>
                <select
                  value={profile.work_style_preference.required_days}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    work_style_preference: { ...prev.work_style_preference, required_days: parseInt(e.target.value) }
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
                  契約期間
                </label>
                <select
                  value={profile.work_style_preference.contract_duration}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    work_style_preference: { ...prev.work_style_preference, contract_duration: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="3ヶ月〜">3ヶ月〜</option>
                  <option value="6ヶ月〜">6ヶ月〜</option>
                  <option value="1年〜">1年〜</option>
                  <option value="長期">長期</option>
                  <option value="プロジェクト単位">プロジェクト単位</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.work_style_preference.remote_ok}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      work_style_preference: { ...prev.work_style_preference, remote_ok: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                  <span className="text-sm font-medium text-gray-700">リモート勤務OK</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* 保存ボタン */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
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