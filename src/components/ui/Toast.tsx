'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, isVisible, onClose, duration = 5000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onClose, 300) // アニメーション完了後にクローズ
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
    }
  }

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-200/50'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 shadow-red-200/50'
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-200/50'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-200/50'
    }
  }

  const getIconColorClass = () => {
    switch (type) {
      case 'success':
        return 'text-emerald-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-amber-500'
      case 'info':
        return 'text-blue-500'
    }
  }

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 min-w-[320px] max-w-md
        transform transition-all duration-300 ease-in-out
        ${isAnimating 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      <div
        className={`
          ${getColorClasses()}
          border rounded-xl p-4 shadow-lg backdrop-blur-sm
          flex items-start gap-3
        `}
      >
        <div className={`flex-shrink-0 ${getIconColorClass()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5">
            {message}
          </p>
        </div>
        
        <button
          onClick={() => {
            setIsAnimating(false)
            setTimeout(onClose, 300)
          }}
          className={`
            flex-shrink-0 p-1 rounded-lg transition-colors
            hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${type === 'success' ? 'focus:ring-emerald-500' : ''}
            ${type === 'error' ? 'focus:ring-red-500' : ''}
            ${type === 'warning' ? 'focus:ring-amber-500' : ''}
            ${type === 'info' ? 'focus:ring-blue-500' : ''}
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Context for global toast management
import { createContext, useContext, ReactNode } from 'react'

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    isVisible: boolean
  } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  )
}