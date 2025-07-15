// 気になる機能 API Route - 新アーキテクチャ対応版 (likesテーブル)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth'

// GET: 気になるリストを取得（新アーキテクチャ: likesテーブル）
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('❤️ お気に入り一覧API - 新アーキテクチャ版')

    const userId = session.user.id

    // 新アーキテクチャ: likes テーブルから取得（設計書準拠）
    const { data: likes, error: dbError } = await supabaseAdmin
      .from(TABLES.LIKES)
      .select('liker_id, target_id, created_at')
      .eq('liker_id', userId)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('🚨 お気に入り取得エラー:', dbError)
      return NextResponse.json(
        { success: false, error: 'お気に入りリストの取得に失敗しました' },
        { status: 500 }
      )
    }

    console.log(`✅ お気に入り取得成功: ${likes?.length || 0}件`)

    // お気に入り対象の詳細情報を取得（設計書準拠）
    const enrichedLikes = await Promise.all(
      (likes || []).map(async (like) => {
        let targetInfo = { name: '不明', type: 'unknown', avatar: '❓' }
        
        // CFOプロフィールを確認
        const { data: cfoProfile } = await supabaseAdmin
          .from(TABLES.CFO_PROFILES)
          .select('cfo_name, cfo_display_name, avatar_url')
          .eq('cfo_user_id', like.target_id)
          .single()

        if (cfoProfile) {
          targetInfo = {
            name: cfoProfile.cfo_display_name || cfoProfile.cfo_name || 'CFO',
            type: 'cfo',
            avatar: cfoProfile.avatar_url || '👤'
          }
        } else {
          // 企業プロフィールを確認
          const { data: bizProfile } = await supabaseAdmin
            .from(TABLES.BIZ_PROFILES)
            .select('biz_company_name, avatar_url')
            .eq('biz_user_id', like.target_id)
            .single()

          if (bizProfile) {
            targetInfo = {
              name: bizProfile.biz_company_name || '企業',
              type: 'company',
              avatar: bizProfile.avatar_url || '🏢'
            }
          }
        }

        return {
          // 設計書準拠: 複合主キーなのでユニークIDは liker_id + target_id の組み合わせ
          likerId: like.liker_id,
          targetId: like.target_id,
          createdAt: like.created_at,
          
          // 表示用情報
          targetName: targetInfo.name,
          targetType: targetInfo.type,
          targetAvatar: targetInfo.avatar,
          
          // 新アーキテクチャメタ情報
          meta: {
            architecture: 'new',
            table: TABLES.LIKES
          }
        }
      })
    )

    // CFO・企業別に分類
    const cfoLikes = enrichedLikes.filter(like => like.targetType === 'cfo')
    const companyLikes = enrichedLikes.filter(like => like.targetType === 'company')

    const response = {
      success: true,
      data: {
        likes: enrichedLikes,
        cfoLikes,
        companyLikes,
        total: enrichedLikes.length
      },
      meta: {
        architecture: 'new',
        table: TABLES.LIKES,
        stats: {
          totalCount: enrichedLikes.length,
          cfoCount: cfoLikes.length,
          companyCount: companyLikes.length
        }
      }
    }

    console.log(`📊 お気に入り統計: CFO${cfoLikes.length}件, 企業${companyLikes.length}件`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 お気に入り一覧API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'お気に入りリストの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 気になるを追加（新アーキテクチャ: likesテーブル）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { targetUserId } = body

    // バリデーション（設計書準拠: target_typeは不要）
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: '受信者IDは必須です' },
        { status: 400 }
      )
    }

    // 自分自身を気になるに追加しようとしていないかチェック
    if (targetUserId === userId) {
      return NextResponse.json(
        { success: false, error: '自分自身を気になるに追加することはできません' },
        { status: 400 }
      )
    }

    console.log('❤️ お気に入り追加:', { from: userId, to: targetUserId })

    // 新アーキテクチャ: likes テーブルに追加（設計書準拠）
    const { data: newLike, error: insertError } = await supabaseAdmin
      .from(TABLES.LIKES)
      .insert({
        liker_id: userId,
        target_id: targetUserId
      })
      .select('liker_id, target_id, created_at')
      .single()

    if (insertError) {
      console.error('🚨 お気に入り追加エラー:', insertError)
      
      // PostgreSQLの一意制約違反エラー（複合主キーによる重複エラー）
      if (insertError.code === '23505') {
        return NextResponse.json(
          { success: false, error: '既にお気に入りに追加されています' },
          { status: 409 }
        )
      }
      
      return NextResponse.json(
        { success: false, error: 'お気に入りの追加に失敗しました' },
        { status: 500 }
      )
    }

    console.log('✅ お気に入り追加成功:', `${newLike.liker_id} → ${newLike.target_id}`)

    return NextResponse.json({
      success: true,
      data: {
        likerId: newLike.liker_id,
        targetId: newLike.target_id,
        message: 'お気に入りに追加しました'
      },
      meta: {
        architecture: 'new',
        table: TABLES.LIKES
      }
    })

  } catch (error) {
    console.error('🚨 お気に入り追加API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'お気に入りの追加に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 気になるを削除（新アーキテクチャ: likesテーブル）
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'targetUserIdパラメータが必要です' },
        { status: 400 }
      )
    }

    console.log('❤️ お気に入り削除:', { from: userId, to: targetUserId })

    // 新アーキテクチャ: likes テーブルから削除（設計書準拠: 複合主キーで削除）
    const { error: deleteError } = await supabaseAdmin
      .from(TABLES.LIKES)
      .delete()
      .eq('liker_id', userId)
      .eq('target_id', targetUserId)

    if (deleteError) {
      console.error('🚨 お気に入り削除エラー:', deleteError)
      return NextResponse.json(
        { success: false, error: 'お気に入りの削除に失敗しました' },
        { status: 500 }
      )
    }

    console.log('✅ お気に入り削除成功')

    return NextResponse.json({
      success: true,
      data: {
        message: 'お気に入りから削除しました'
      },
      meta: {
        architecture: 'new',
        table: TABLES.LIKES
      }
    })

  } catch (error) {
    console.error('🚨 お気に入り削除API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'お気に入りの削除に失敗しました' },
      { status: 500 }
    )
  }
}