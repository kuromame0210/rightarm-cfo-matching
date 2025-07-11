'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    scoutNotifications: true,
    messageNotifications: true,
    meetingReminders: true,
    weeklyDigest: false,
    profileVisibility: 'public',
    showContact: true,
    showCompany: true,
    showSalary: false,
    language: 'ja',
    timezone: 'Asia/Tokyo',
    autoReply: false,
    autoReplyMessage: '',
    twoFactorAuth: false
  })

  const [showToast, setShowToast] = useState(false)
  const [activeSection, setActiveSection] = useState('notifications')

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const sections = [
    { id: 'notifications', name: '通知設定', icon: '🔔' },
    { id: 'privacy', name: 'プライバシー', icon: '🔒' },
    { id: 'account', name: 'アカウント', icon: '👤' },
    { id: 'advanced', name: '高度な設定', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">設定</h2>
          <p className="text-gray-600 text-sm md:text-base">アカウントの設定と環境設定を管理できます</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* サイドバー */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              
              {/* 通知設定 */}
              {activeSection === 'notifications' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">通知設定</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">メール通知</h4>
                        <p className="text-sm text-gray-500">重要な更新をメールで受信</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">スカウト通知</h4>
                        <p className="text-sm text-gray-500">新しいスカウトが届いた時</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.scoutNotifications}
                          onChange={(e) => handleSettingChange('scoutNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">メッセージ通知</h4>
                        <p className="text-sm text-gray-500">新しいメッセージが届いた時</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.messageNotifications}
                          onChange={(e) => handleSettingChange('messageNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">面談リマインダー</h4>
                        <p className="text-sm text-gray-500">面談の1時間前にお知らせ</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.meetingReminders}
                          onChange={(e) => handleSettingChange('meetingReminders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">週次ダイジェスト</h4>
                        <p className="text-sm text-gray-500">週1回の活動サマリー</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.weeklyDigest}
                          onChange={(e) => handleSettingChange('weeklyDigest', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* プライバシー設定 */}
              {activeSection === 'privacy' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">プライバシー設定</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プロフィールの公開範囲
                      </label>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="public">すべてのユーザーに公開</option>
                        <option value="verified">認証済みユーザーのみ</option>
                        <option value="private">非公開</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">連絡先情報を表示</h4>
                          <p className="text-sm text-gray-500">電話番号・メールアドレス</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showContact}
                            onChange={(e) => handleSettingChange('showContact', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">現在の勤務先を表示</h4>
                          <p className="text-sm text-gray-500">会社名・役職</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showCompany}
                            onChange={(e) => handleSettingChange('showCompany', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">希望報酬を表示</h4>
                          <p className="text-sm text-gray-500">報酬レンジ</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.showSalary}
                            onChange={(e) => handleSettingChange('showSalary', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* アカウント設定 */}
              {activeSection === 'account' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">アカウント設定</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        言語
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        タイムゾーン
                      </label>
                      <select
                        value={settings.timezone}
                        onChange={(e) => handleSettingChange('timezone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                      >
                        <option value="Asia/Tokyo">東京 (UTC+9)</option>
                        <option value="Asia/Seoul">ソウル (UTC+9)</option>
                        <option value="America/New_York">ニューヨーク (UTC-5)</option>
                        <option value="Europe/London">ロンドン (UTC+0)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">二段階認証</h4>
                        <p className="text-sm text-gray-500">セキュリティを強化</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.twoFactorAuth}
                          onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        <Link href="/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          プロフィールを編集
                        </Link>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          パスワードを変更
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                          アカウントを削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 高度な設定 */}
              {activeSection === 'advanced' && (
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">高度な設定</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">自動返信機能</h4>
                        <p className="text-sm text-gray-500">メッセージに自動で返信</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoReply}
                          onChange={(e) => handleSettingChange('autoReply', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                      </label>
                    </div>

                    {settings.autoReply && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          自動返信メッセージ
                        </label>
                        <textarea
                          value={settings.autoReplyMessage}
                          onChange={(e) => handleSettingChange('autoReplyMessage', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                          placeholder="お忙しい中ご連絡いただき、ありがとうございます。確認次第、お返事いたします。"
                        />
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-4">
                      <div className="space-y-2">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          データをエクスポート
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          アクティビティログ
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                          APIキー管理
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 保存ボタン */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
                >
                  設定を保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          設定が保存されました ✓
        </div>
      )}
    </div>
  )
}