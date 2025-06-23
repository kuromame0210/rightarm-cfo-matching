'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'

export default function AdminTagsPage() {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [modalType, setModalType] = useState<'challenge' | 'skill' | 'category'>('challenge')
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // サンプルデータ
  const [challengeTags, setChallengeTags] = useState([
    { id: 1, name: '資金調達', usageCount: 156, isActive: true },
    { id: 2, name: 'IPO準備', usageCount: 134, isActive: true },
    { id: 3, name: 'M&A', usageCount: 98, isActive: true },
    { id: 4, name: '管理会計強化', usageCount: 123, isActive: true },
    { id: 5, name: '財務分析', usageCount: 87, isActive: true },
    { id: 6, name: 'ERP導入', usageCount: 76, isActive: true },
    { id: 7, name: '銀行融資', usageCount: 145, isActive: true },
    { id: 8, name: 'VC調達', usageCount: 92, isActive: true },
    { id: 9, name: '事業再生', usageCount: 34, isActive: false },
    { id: 10, name: '補助金活用', usageCount: 67, isActive: true },
    { id: 11, name: '原価計算', usageCount: 89, isActive: true },
    { id: 12, name: '予実管理', usageCount: 112, isActive: true }
  ])

  const [skillCategories, setSkillCategories] = useState([
    {
      id: 1,
      name: '資金調達',
      skills: [
        { id: 101, name: 'VC調達', usageCount: 89, isActive: true },
        { id: 102, name: '銀行融資', usageCount: 76, isActive: true },
        { id: 103, name: '補助金申請', usageCount: 45, isActive: true },
        { id: 104, name: '投資家対応', usageCount: 67, isActive: true },
        { id: 105, name: 'クラウドファンディング', usageCount: 23, isActive: true },
        { id: 106, name: '社債発行', usageCount: 12, isActive: false }
      ]
    },
    {
      id: 2,
      name: 'IPO・M&A関連',
      skills: [
        { id: 201, name: 'IPO準備', usageCount: 134, isActive: true },
        { id: 202, name: 'M&A戦略', usageCount: 56, isActive: true },
        { id: 203, name: '企業価値評価', usageCount: 78, isActive: true },
        { id: 204, name: 'DD対応', usageCount: 43, isActive: true },
        { id: 205, name: 'IR活動', usageCount: 67, isActive: true },
        { id: 206, name: '上場審査対応', usageCount: 89, isActive: true }
      ]
    },
    {
      id: 3,
      name: '財務DX・システム導入',
      skills: [
        { id: 301, name: 'ERP導入', usageCount: 98, isActive: true },
        { id: 302, name: '管理会計システム', usageCount: 87, isActive: true },
        { id: 303, name: 'BI導入', usageCount: 54, isActive: true },
        { id: 304, name: 'API連携', usageCount: 32, isActive: true },
        { id: 305, name: 'RPA導入', usageCount: 41, isActive: true },
        { id: 306, name: 'SaaS選定', usageCount: 28, isActive: true }
      ]
    }
  ])

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAddChallenge = () => {
    if (newTagName.trim().length < 2) {
      showToastMessage('タグ名は2文字以上入力してください')
      return
    }

    const newTag = {
      id: Math.max(...challengeTags.map(t => t.id)) + 1,
      name: newTagName.trim(),
      usageCount: 0,
      isActive: true
    }

    setChallengeTags(prev => [...prev, newTag])
    setNewTagName('')
    setShowAddModal(false)
    showToastMessage('財務課題タグを追加しました')
  }

  const handleAddSkill = () => {
    if (newTagName.trim().length < 2) {
      showToastMessage('スキル名は2文字以上入力してください')
      return
    }

    if (!selectedCategory) {
      showToastMessage('カテゴリを選択してください')
      return
    }

    const categoryId = parseInt(selectedCategory)
    const category = skillCategories.find(c => c.id === categoryId)
    
    if (!category) return

    const newSkill = {
      id: Math.max(...category.skills.map(s => s.id)) + 1,
      name: newTagName.trim(),
      usageCount: 0,
      isActive: true
    }

    setSkillCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, skills: [...cat.skills, newSkill] }
        : cat
    ))

    setNewTagName('')
    setSelectedCategory('')
    setShowAddModal(false)
    showToastMessage('スキルタグを追加しました')
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim().length < 2) {
      showToastMessage('カテゴリ名は2文字以上入力してください')
      return
    }

    const newCategory = {
      id: Math.max(...skillCategories.map(c => c.id)) + 1,
      name: newCategoryName.trim(),
      skills: []
    }

    setSkillCategories(prev => [...prev, newCategory])
    setNewCategoryName('')
    setShowAddModal(false)
    showToastMessage('スキルカテゴリを追加しました')
  }

  const handleEdit = (type: 'challenge' | 'skill', item: any) => {
    setModalType(type)
    setSelectedItem(item)
    setNewTagName(item.name)
    setShowEditModal(true)
  }

  const handleEditSave = () => {
    if (newTagName.trim().length < 2) {
      showToastMessage('名前は2文字以上入力してください')
      return
    }

    if (modalType === 'challenge') {
      setChallengeTags(prev => prev.map(tag => 
        tag.id === selectedItem.id 
          ? { ...tag, name: newTagName.trim() }
          : tag
      ))
      showToastMessage('財務課題タグを更新しました')
    } else if (modalType === 'skill') {
      setSkillCategories(prev => prev.map(cat => ({
        ...cat,
        skills: cat.skills.map(skill => 
          skill.id === selectedItem.id 
            ? { ...skill, name: newTagName.trim() }
            : skill
        )
      })))
      showToastMessage('スキルタグを更新しました')
    }

    setShowEditModal(false)
    setSelectedItem(null)
    setNewTagName('')
  }

  const handleDelete = (type: 'challenge' | 'skill', item: any) => {
    setModalType(type)
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = () => {
    if (modalType === 'challenge') {
      setChallengeTags(prev => prev.filter(tag => tag.id !== selectedItem.id))
      showToastMessage('財務課題タグを削除しました')
    } else if (modalType === 'skill') {
      setSkillCategories(prev => prev.map(cat => ({
        ...cat,
        skills: cat.skills.filter(skill => skill.id !== selectedItem.id)
      })))
      showToastMessage('スキルタグを削除しました')
    }

    setShowDeleteModal(false)
    setSelectedItem(null)
  }

  const toggleActive = (type: 'challenge' | 'skill', id: number) => {
    if (type === 'challenge') {
      setChallengeTags(prev => prev.map(tag => 
        tag.id === id ? { ...tag, isActive: !tag.isActive } : tag
      ))
      showToastMessage('財務課題タグの状態を変更しました')
    } else if (type === 'skill') {
      setSkillCategories(prev => prev.map(cat => ({
        ...cat,
        skills: cat.skills.map(skill => 
          skill.id === id ? { ...skill, isActive: !skill.isActive } : skill
        )
      })))
      showToastMessage('スキルタグの状態を変更しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
          >
            ← 管理画面に戻る
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">タグ管理</h1>
          <p className="text-gray-600">財務課題タグとスキルタグの管理・編集</p>
        </div>

        <div className="space-y-8">
          {/* 財務課題タグ管理 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">財務課題タグ</h2>
                <p className="text-sm text-gray-600">企業が抱える財務課題のタグを管理します</p>
              </div>
              <button 
                onClick={() => {
                  setModalType('challenge')
                  setShowAddModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                + 新規タグ追加
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">タグ名</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">利用数</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">状態</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {challengeTags.map((tag) => (
                    <tr key={tag.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{tag.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">{tag.usageCount}件</span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => toggleActive('challenge', tag.id)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            tag.isActive 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {tag.isActive ? '有効' : '無効'}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit('challenge', tag)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            編集
                          </button>
                          <button 
                            onClick={() => handleDelete('challenge', tag)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            disabled={tag.usageCount > 0}
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* スキルタグ管理 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">スキルタグ</h2>
                <p className="text-sm text-gray-600">CFOの専門スキルをカテゴリ別に管理します</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setModalType('category')
                    setShowAddModal(true)
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  + カテゴリ追加
                </button>
                <button 
                  onClick={() => {
                    setModalType('skill')
                    setShowAddModal(true)
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  + スキル追加
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {skillCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">({category.skills.length}スキル)</span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">スキル名</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">利用数</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">状態</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700 text-sm">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.skills.map((skill) => (
                          <tr key={skill.id} className="border-b border-gray-50">
                            <td className="py-2 px-3">
                              <span className="text-sm text-gray-900">{skill.name}</span>
                            </td>
                            <td className="py-2 px-3">
                              <span className="text-xs text-gray-600">{skill.usageCount}件</span>
                            </td>
                            <td className="py-2 px-3">
                              <button
                                onClick={() => toggleActive('skill', skill.id)}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  skill.isActive 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {skill.isActive ? '有効' : '無効'}
                              </button>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEdit('skill', skill)}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  編集
                                </button>
                                <button 
                                  onClick={() => handleDelete('skill', skill)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                  disabled={skill.usageCount > 0}
                                >
                                  削除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modalType === 'challenge' && '新規財務課題タグ追加'}
              {modalType === 'skill' && '新規スキルタグ追加'}
              {modalType === 'category' && '新規スキルカテゴリ追加'}
            </h3>
            
            <div className="space-y-4">
              {modalType === 'category' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="例：財務戦略・計画"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {modalType === 'challenge' ? 'タグ名' : 'スキル名'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder={modalType === 'challenge' ? '例：財務戦略' : '例：予算策定'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {modalType === 'skill' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        カテゴリ <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">カテゴリを選択</option>
                        {skillCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewTagName('')
                  setNewCategoryName('')
                  setSelectedCategory('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (modalType === 'challenge') handleAddChallenge()
                  else if (modalType === 'skill') handleAddSkill()
                  else if (modalType === 'category') handleAddCategory()
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {modalType === 'challenge' ? '財務課題タグ編集' : 'スキルタグ編集'}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalType === 'challenge' ? 'タグ名' : 'スキル名'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedItem(null)
                  setNewTagName('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">削除確認</h3>
            
            <p className="text-gray-600 mb-6">
              「{selectedItem.name}」を削除しますか？<br />
              {selectedItem.usageCount > 0 && (
                <span className="text-red-600 text-sm">
                  このタグは{selectedItem.usageCount}件で利用されているため削除できません。
                </span>
              )}
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedItem(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={selectedItem.usageCount > 0}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  selectedItem.usageCount > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  )
}