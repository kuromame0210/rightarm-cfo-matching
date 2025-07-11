// パフォーマンスユーティリティのテスト
// Phase 6: Test Strengthening

import { renderHook, act } from '@testing-library/react'
import {
  useDebounce,
  useThrottle,
  usePrevious,
  useChangedValue,
  shallowArrayEqual,
  shallowObjectEqual,
  useMemoizedObject,
  useMemoizedArray,
  PerformanceProfiler,
  usePerformanceProfiler,
  useIntersectionObserver,
  useBatchedUpdates,
  useMemoizedComputation
} from '../lib/performance'
import { setupMocks, cleanupMocks } from '../lib/test-utils'

// Performance APIのモック
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
  now: jest.fn(() => Date.now())
}

// IntersectionObserverのモック
const mockIntersectionObserver = jest.fn()
const mockObserve = jest.fn()
const mockDisconnect = jest.fn()

mockIntersectionObserver.mockReturnValue({
  observe: mockObserve,
  disconnect: mockDisconnect
})

// requestIdleCallbackのモック
const mockRequestIdleCallback = jest.fn()
const mockCancelIdleCallback = jest.fn()

describe('パフォーマンスユーティリティ', () => {
  beforeEach(() => {
    setupMocks()
    
    // Performance APIをモック
    Object.defineProperty(global, 'performance', {
      value: mockPerformance,
      writable: true
    })
    
    // IntersectionObserverをモック
    Object.defineProperty(global, 'IntersectionObserver', {
      value: mockIntersectionObserver,
      writable: true
    })
    
    // requestIdleCallbackをモック
    Object.defineProperty(global, 'requestIdleCallback', {
      value: mockRequestIdleCallback,
      writable: true
    })
    
    Object.defineProperty(global, 'cancelIdleCallback', {
      value: mockCancelIdleCallback,
      writable: true
    })
    
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('useDebounce', () => {
    test('指定された遅延後に関数が実行される', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useDebounce(mockCallback, 100))

      act(() => {
        result.current('test1')
        result.current('test2')
        result.current('test3')
      })

      // 初期状態では実行されていない
      expect(mockCallback).not.toHaveBeenCalled()

      // 遅延後に最後の呼び出しのみ実行される
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith('test3')
    })

    test('連続呼び出し時に前回のタイマーがキャンセルされる', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useDebounce(mockCallback, 100))

      act(() => {
        result.current('first')
      })

      // 50ms後に2回目の呼び出し
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
        result.current('second')
      })

      // さらに150ms待つ（合計200ms）
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      // 'second'のみが実行される
      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith('second')
    })
  })

  describe('useThrottle', () => {
    test('指定された間隔で関数が実行される', async () => {
      const mockCallback = jest.fn()
      const { result } = renderHook(() => useThrottle(mockCallback, 100))

      act(() => {
        result.current('test1')
        result.current('test2') // この呼び出しは無視される
        result.current('test3') // この呼び出しも無視される
      })

      expect(mockCallback).toHaveBeenCalledTimes(1)
      expect(mockCallback).toHaveBeenCalledWith('test1')

      // スロットル期間が終了するまで待つ
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      // 新しい呼び出しが可能になる
      act(() => {
        result.current('test4')
      })

      expect(mockCallback).toHaveBeenCalledTimes(2)
      expect(mockCallback).toHaveBeenLastCalledWith('test4')
    })
  })

  describe('usePrevious', () => {
    test('前回の値を正しく保持する', () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: 'initial' } }
      )

      // 最初は前回の値はundefined
      expect(result.current).toBeUndefined()

      // 値を更新
      rerender({ value: 'updated' })
      expect(result.current).toBe('initial')

      // さらに更新
      rerender({ value: 'final' })
      expect(result.current).toBe('updated')
    })
  })

  describe('useChangedValue', () => {
    test('値の変更を正しく検知する', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useChangedValue(value),
        { initialProps: { value: 'initial' } }
      )

      // 最初は変更なし
      expect(result.current).toBe(false)

      // 値を変更
      rerender({ value: 'changed' })
      expect(result.current).toBe(true)

      // 同じ値に更新（変更なし）
      rerender({ value: 'changed' })
      expect(result.current).toBe(false)
    })

    test('カスタム比較関数が正しく動作する', () => {
      const compare = (prev: number, next: number) => Math.abs(prev - next) < 2
      
      const { result, rerender } = renderHook(
        ({ value }) => useChangedValue(value, compare),
        { initialProps: { value: 10 } }
      )

      expect(result.current).toBe(false)

      // 差が2未満なので変更なしとみなされる
      rerender({ value: 11 })
      expect(result.current).toBe(false)

      // 差が2以上なので変更ありとみなされる
      rerender({ value: 13 })
      expect(result.current).toBe(true)
    })
  })

  describe('配列・オブジェクト比較関数', () => {
    describe('shallowArrayEqual', () => {
      test('同じ配列で true を返す', () => {
        const arr1 = [1, 2, 3]
        const arr2 = [1, 2, 3]
        expect(shallowArrayEqual(arr1, arr2)).toBe(true)
      })

      test('異なる配列で false を返す', () => {
        const arr1 = [1, 2, 3]
        const arr2 = [1, 2, 4]
        expect(shallowArrayEqual(arr1, arr2)).toBe(false)
      })

      test('長さが異なる配列で false を返す', () => {
        const arr1 = [1, 2, 3]
        const arr2 = [1, 2]
        expect(shallowArrayEqual(arr1, arr2)).toBe(false)
      })
    })

    describe('shallowObjectEqual', () => {
      test('同じオブジェクトで true を返す', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 2 }
        expect(shallowObjectEqual(obj1, obj2)).toBe(true)
      })

      test('異なるオブジェクトで false を返す', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, b: 3 }
        expect(shallowObjectEqual(obj1, obj2)).toBe(false)
      })

      test('キーが異なるオブジェクトで false を返す', () => {
        const obj1 = { a: 1, b: 2 }
        const obj2 = { a: 1, c: 2 }
        expect(shallowObjectEqual(obj1, obj2)).toBe(false)
      })
    })
  })

  describe('useMemoizedObject', () => {
    test('オブジェクトが正しくメモ化される', () => {
      const { result, rerender } = renderHook(
        ({ obj }) => useMemoizedObject(obj),
        { initialProps: { obj: { a: 1, b: 2 } } }
      )

      const firstResult = result.current

      // 同じ値で再レンダリング
      rerender({ obj: { a: 1, b: 2 } })
      expect(result.current).toBe(firstResult)

      // 異なる値で再レンダリング
      rerender({ obj: { a: 1, b: 3 } })
      expect(result.current).not.toBe(firstResult)
    })
  })

  describe('useMemoizedArray', () => {
    test('配列が正しくメモ化される', () => {
      const { result, rerender } = renderHook(
        ({ arr }) => useMemoizedArray(arr),
        { initialProps: { arr: [1, 2, 3] } }
      )

      const firstResult = result.current

      // 同じ要素で再レンダリング
      rerender({ arr: [1, 2, 3] })
      expect(result.current).toBe(firstResult)

      // 異なる要素で再レンダリング
      rerender({ arr: [1, 2, 4] })
      expect(result.current).not.toBe(firstResult)
    })
  })

  describe('PerformanceProfiler', () => {
    beforeEach(() => {
      PerformanceProfiler.clear()
      mockPerformance.getEntriesByName.mockReturnValue([
        { duration: 150.5 }
      ])
    })

    test('パフォーマンス測定が正しく動作する', () => {
      const id = PerformanceProfiler.start('test-operation')
      expect(mockPerformance.mark).toHaveBeenCalledWith(`${id}_start`)

      const duration = PerformanceProfiler.end(id)
      expect(mockPerformance.mark).toHaveBeenCalledWith(`${id}_end`)
      expect(mockPerformance.measure).toHaveBeenCalled()
      expect(duration).toBe(150.5)
    })

    test('統計情報が正しく計算される', () => {
      // 複数回測定
      const id1 = PerformanceProfiler.start('test-operation')
      PerformanceProfiler.end(id1)
      
      const id2 = PerformanceProfiler.start('test-operation')
      PerformanceProfiler.end(id2)

      mockPerformance.getEntriesByName
        .mockReturnValueOnce([{ duration: 100 }])
        .mockReturnValueOnce([{ duration: 200 }])

      const stats = PerformanceProfiler.getStats('test-operation')
      expect(stats).toBeTruthy()
      expect(stats?.count).toBe(2)
    })

    test('存在しないラベルで null を返す', () => {
      const stats = PerformanceProfiler.getStats('nonexistent')
      expect(stats).toBeNull()
    })
  })

  describe('usePerformanceProfiler', () => {
    test('フックが正しく動作する', () => {
      const { result } = renderHook(() => usePerformanceProfiler('test-hook'))

      act(() => {
        result.current.start()
      })

      expect(mockPerformance.mark).toHaveBeenCalled()

      act(() => {
        result.current.end()
      })

      expect(mockPerformance.measure).toHaveBeenCalled()
    })

    test('enabled=false で測定が無効化される', () => {
      const { result } = renderHook(() => usePerformanceProfiler('test-hook', false))

      act(() => {
        result.current.start()
        const duration = result.current.end()
        expect(duration).toBeNull()
      })

      expect(mockPerformance.mark).not.toHaveBeenCalled()
    })
  })

  describe('useIntersectionObserver', () => {
    test('IntersectionObserver が正しく設定される', () => {
      const mockRef = { current: document.createElement('div') }
      
      renderHook(() => useIntersectionObserver(mockRef))

      expect(mockIntersectionObserver).toHaveBeenCalled()
      expect(mockObserve).toHaveBeenCalledWith(mockRef.current)
    })

    test('要素が null の場合は observer が設定されない', () => {
      const mockRef = { current: null }
      
      renderHook(() => useIntersectionObserver(mockRef))

      expect(mockObserve).not.toHaveBeenCalled()
    })
  })

  describe('useBatchedUpdates', () => {
    test('バッチ更新が正しく動作する', async () => {
      const { result } = renderHook(
        ({ values }) => useBatchedUpdates(values, 2, 50),
        { initialProps: { values: [1, 2, 3] } }
      )

      // 初期状態では空配列
      expect(result.current).toEqual([])

      // 遅延後に値が反映される
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      expect(result.current).toEqual([1, 2, 3])
    })
  })

  describe('useMemoizedComputation', () => {
    test('計算結果がキャッシュされる', () => {
      const expensiveComputation = jest.fn((n: number) => n * 2)
      
      const { result, rerender } = renderHook(
        ({ input }) => useMemoizedComputation(expensiveComputation, input),
        { initialProps: { input: 5 } }
      )

      expect(result.current).toBe(10)
      expect(expensiveComputation).toHaveBeenCalledTimes(1)

      // 同じ入力で再計算されない
      rerender({ input: 5 })
      expect(result.current).toBe(10)
      expect(expensiveComputation).toHaveBeenCalledTimes(1)

      // 異なる入力で再計算される
      rerender({ input: 7 })
      expect(result.current).toBe(14)
      expect(expensiveComputation).toHaveBeenCalledTimes(2)
    })

    test('キャッシュサイズ制限が正しく動作する', () => {
      const computation = jest.fn((n: number) => n * 2)
      
      const { rerender } = renderHook(
        ({ input }) => useMemoizedComputation(computation, input, 2),
        { initialProps: { input: 1 } }
      )

      // キャッシュサイズを超える入力
      rerender({ input: 2 })
      rerender({ input: 3 })
      rerender({ input: 1 }) // 最初の値が削除されているので再計算される

      expect(computation).toHaveBeenCalledTimes(4) // 1, 2, 3, 1(再計算)
    })
  })
})