// パフォーマンス最適化ユーティリティ
// Phase 5: Performance Optimization

import { useCallback, useMemo, useRef, useEffect, useState } from 'react'

// デバウンス関数
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay]
  )
}

// スロットル関数
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const isThrottledRef = useRef(false)

  return useCallback(
    ((...args: Parameters<T>) => {
      if (isThrottledRef.current) return
      
      isThrottledRef.current = true
      callback(...args)
      
      setTimeout(() => {
        isThrottledRef.current = false
      }, delay)
    }) as T,
    [callback, delay]
  )
}

// 前の値をメモ化する
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  })
  
  return ref.current
}

// 値の変更検知
export function useChangedValue<T>(
  value: T,
  compare?: (prev: T, next: T) => boolean
): boolean {
  const prevValue = usePrevious(value)
  
  return useMemo(() => {
    if (prevValue === undefined) return false
    
    if (compare) {
      return !compare(prevValue, value)
    }
    
    return prevValue !== value
  }, [prevValue, value, compare])
}

// 配列の浅い比較
export function shallowArrayEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false
  
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  
  return true
}

// オブジェクトの浅い比較
export function shallowObjectEqual<T extends Record<string, any>>(
  a: T, 
  b: T
): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!(key in b) || a[key] !== b[key]) return false
  }
  
  return true
}

// メモ化されたオブジェクト
export function useMemoizedObject<T extends Record<string, any>>(
  obj: T,
  deps?: React.DependencyList
): T {
  return useMemo(() => obj, deps || [JSON.stringify(obj)])
}

// メモ化された配列
export function useMemoizedArray<T>(
  array: T[],
  deps?: React.DependencyList
): T[] {
  return useMemo(() => array, deps || [JSON.stringify(array)])
}

// パフォーマンス測定
export class PerformanceProfiler {
  private static measurements: Map<string, number[]> = new Map()
  
  static start(label: string): string {
    const id = `${label}_${Date.now()}_${Math.random()}`
    performance.mark(`${id}_start`)
    return id
  }
  
  static end(id: string): number {
    const endMark = `${id}_end`
    performance.mark(endMark)
    
    const measureName = `${id}_measure`
    performance.measure(measureName, `${id}_start`, endMark)
    
    const measure = performance.getEntriesByName(measureName)[0]
    const duration = measure.duration
    
    // 結果を保存
    const baseLabel = id.split('_')[0]
    if (!this.measurements.has(baseLabel)) {
      this.measurements.set(baseLabel, [])
    }
    this.measurements.get(baseLabel)!.push(duration)
    
    // クリーンアップ
    performance.clearMarks(`${id}_start`)
    performance.clearMarks(endMark)
    performance.clearMeasures(measureName)
    
    return duration
  }
  
  static getStats(label: string): {
    count: number
    average: number
    min: number
    max: number
    total: number
  } | null {
    const measurements = this.measurements.get(label)
    if (!measurements || measurements.length === 0) return null
    
    const total = measurements.reduce((sum, duration) => sum + duration, 0)
    const average = total / measurements.length
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)
    
    return {
      count: measurements.length,
      average: Math.round(average * 100) / 100,
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      total: Math.round(total * 100) / 100
    }
  }
  
  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {}
    
    for (const [label] of Array.from(this.measurements)) {
      stats[label] = this.getStats(label)
    }
    
    return stats
  }
  
  static clear(): void {
    this.measurements.clear()
  }
}

// パフォーマンス測定フック
export function usePerformanceProfiler(label: string, enabled = true) {
  const measurementId = useRef<string>()
  
  const start = useCallback(() => {
    if (!enabled) return
    measurementId.current = PerformanceProfiler.start(label)
  }, [label, enabled])
  
  const end = useCallback((): number | null => {
    if (!enabled || !measurementId.current) return null
    
    const duration = PerformanceProfiler.end(measurementId.current)
    measurementId.current = undefined
    return duration
  }, [enabled])
  
  return { start, end, getStats: () => PerformanceProfiler.getStats(label) }
}

// 遅延実行
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList
): void {
  useEffect(() => {
    const handle = typeof requestIdleCallback !== 'undefined' ? 
      requestIdleCallback(callback) : 
      setTimeout(callback, 0)
    
    return () => {
      if (typeof requestIdleCallback !== 'undefined') {
        cancelIdleCallback(handle as number)
      } else {
        clearTimeout(handle as NodeJS.Timeout)
      }
    }
  }, deps ? [...deps, callback] : [callback])
}

// 画面外要素の検知
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
): IntersectionObserverEntry | null {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      options
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [elementRef, options])
  
  return entry
}

// メモリリーク防止のためのクリーンアップ
export function useCleanup(cleanup: () => void): void {
  useEffect(() => cleanup, [cleanup])
}

// 高頻度更新の最適化
export function useBatchedUpdates<T>(
  values: T[],
  batchSize: number = 10,
  delay: number = 16
): T[] {
  const [batchedValues, setBatchedValues] = useState<T[]>([])
  const timeoutRef = useRef<NodeJS.Timeout>()
  const pendingValues = useRef<T[]>([])
  
  useEffect(() => {
    pendingValues.current = values
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setBatchedValues([...pendingValues.current])
    }, delay)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [values, delay])
  
  return batchedValues
}

// キャッシュ機能付きの計算
export function useMemoizedComputation<T, U>(
  computation: (input: T) => U,
  input: T,
  maxCacheSize: number = 10
): U {
  const cache = useRef<Map<string, U>>(new Map())
  
  return useMemo(() => {
    const key = JSON.stringify(input)
    
    if (cache.current.has(key)) {
      return cache.current.get(key)!
    }
    
    const result = computation(input)
    
    // キャッシュサイズ制限
    if (cache.current.size >= maxCacheSize) {
      const firstKey = cache.current.keys().next().value
      if (firstKey !== undefined) {
        cache.current.delete(firstKey)
      }
    }
    
    cache.current.set(key, result)
    return result
  }, [input, computation, maxCacheSize])
}