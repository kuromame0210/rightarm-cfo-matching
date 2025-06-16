// プロフィール管理システム
// Firebase認証とSupabaseデータベースを連携したユーザープロフィール管理

import { supabase } from './supabase-config.js';
import { authFunctions } from './firebase-config.js';

export class ProfileManager {
  constructor() {
    this.currentUser = null;
    this.userProfile = null;
  }

  // 現在のユーザーを取得
  async getCurrentUser() {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        return null;
      }

      // バックエンドから認証情報とプロフィールを取得
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('プロフィール取得に失敗しました');
      }

      const userData = await response.json();
      this.currentUser = userData.user;
      this.userProfile = userData.profile;
      
      return userData;
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
      return null;
    }
  }

  // 基本プロフィールを更新
  async updateBasicProfile(profileData) {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch('/api/profile/basic', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('プロフィール更新に失敗しました');
      }

      const result = await response.json();
      this.userProfile = result.profile;
      
      return result;
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      throw error;
    }
  }

  // 企業プロフィールを作成・更新
  async updateCompanyProfile(companyData) {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch('/api/profile/company', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) {
        throw new Error('企業プロフィール更新に失敗しました');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('企業プロフィール更新エラー:', error);
      throw error;
    }
  }

  // CFOプロフィールを作成・更新
  async updateCFOProfile(cfoData) {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch('/api/profile/cfo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(cfoData)
      });

      if (!response.ok) {
        throw new Error('CFOプロフィール更新に失敗しました');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('CFOプロフィール更新エラー:', error);
      throw error;
    }
  }

  // プロフィール完了度を計算
  calculateProfileCompletion(userType) {
    if (!this.userProfile) return 0;

    const basicFields = ['display_name', 'email'];
    const completedBasic = basicFields.filter(field => 
      this.userProfile[field] && this.userProfile[field].trim() !== ''
    ).length;

    let typeSpecificCompletion = 0;
    
    if (userType === 'company') {
      const companyFields = ['company_name', 'industry', 'company_size', 'location', 'description'];
      const completedCompany = companyFields.filter(field => 
        this.userProfile.company_profile?.[field] && 
        this.userProfile.company_profile[field].trim() !== ''
      ).length;
      typeSpecificCompletion = (completedCompany / companyFields.length) * 50;
    } else if (userType === 'cfo') {
      const cfoFields = ['first_name', 'last_name', 'experience_years', 'bio'];
      const completedCFO = cfoFields.filter(field => 
        this.userProfile.cfo_profile?.[field] && 
        this.userProfile.cfo_profile[field] !== null
      ).length;
      typeSpecificCompletion = (completedCFO / cfoFields.length) * 50;
    }

    const basicCompletion = (completedBasic / basicFields.length) * 50;
    return Math.round(basicCompletion + typeSpecificCompletion);
  }

  // プロフィール削除
  async deleteProfile() {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const confirmed = confirm('プロフィールを削除しますか？この操作は取り消せません。');
      if (!confirmed) return false;

      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('プロフィール削除に失敗しました');
      }

      // Firebase認証からもログアウト
      await authFunctions.logout();
      
      this.currentUser = null;
      this.userProfile = null;
      
      return true;
    } catch (error) {
      console.error('プロフィール削除エラー:', error);
      throw error;
    }
  }

  // プロフィール検索（企業がCFOを検索、CFOが企業を検索）
  async searchProfiles(searchParams) {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const queryParams = new URLSearchParams(searchParams);
      const response = await fetch(`/api/profile/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) {
        throw new Error('検索に失敗しました');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('検索エラー:', error);
      throw error;
    }
  }

  // プロフィール画像をアップロード
  async uploadProfileImage(file) {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('画像アップロードに失敗しました');
      }

      const result = await response.json();
      
      // プロフィールの画像URLを更新
      if (this.userProfile) {
        this.userProfile.photo_url = result.imageUrl;
      }
      
      return result;
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      throw error;
    }
  }

  // プロフィール公開設定を更新
  async updateProfileVisibility(isPublic) {
    try {
      const idToken = await authFunctions.getCurrentUserIdToken();
      if (!idToken) {
        throw new Error('認証が必要です');
      }

      const response = await fetch('/api/profile/visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ is_public: isPublic })
      });

      if (!response.ok) {
        throw new Error('公開設定の更新に失敗しました');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('公開設定更新エラー:', error);
      throw error;
    }
  }
}

// シングルトンインスタンス
export const profileManager = new ProfileManager();