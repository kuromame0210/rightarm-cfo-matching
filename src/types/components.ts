import { ReactNode } from 'react'
import { CFOProfile, CompanyProfile, UserType } from './api'

// Common Component Props
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
}

// Header Component Props
export interface AppHeaderProps {
  userName?: string
  userAvatar?: string
  isLoggedIn?: boolean
}

export interface UserDropdownProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  showUserMenu: boolean
  onToggleUserMenu: () => void
  onCloseUserMenu: () => void
  onLogout?: () => void
}

// Card Component Props
export interface ProfileCardProps {
  profile: CFOProfile | CompanyProfile
  userType: UserType
  onViewDetails: (_id: string) => void
  onInterested: (_id: string) => void
  onScout: (_profile: CFOProfile | CompanyProfile) => void
  isInterested?: boolean
}

export interface CFOCardProps {
  cfo: CFOProfile
  onViewDetails: (_id: string) => void
  onInterested: (_id: string) => void
  onScout: (_cfo: CFOProfile) => void
  isInterested?: boolean
}

export interface CompanyCardProps {
  company: CompanyProfile
  onViewDetails: (_id: string) => void
  onInterested: (_id: string) => void
  onScout: (_company: CompanyProfile) => void
  isInterested?: boolean
}

// Modal Component Props
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export interface ScoutModalProps {
  isOpen: boolean
  onClose: () => void
  targetProfile: CFOProfile | CompanyProfile | null
  onSubmit: (_message: string) => Promise<void>
}

// Toast Component Props
export interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export interface ToastContextType {
  showToast: (_message: string, _type?: 'success' | 'error' | 'warning' | 'info') => void
}

// Filter Component Props
export interface FilterPanelProps {
  filters: {
    searchQuery: string
    selectedSkills: string[]
    selectedRegion: string
    selectedWorkStyle: string
    selectedCompensation: string
  }
  onFiltersChange: (_filters: any) => void
  availableSkills: string[]
  availableRegions: string[]
  showMobile?: boolean
  onCloseMobile?: () => void
}

export interface SkillSelectorProps {
  selectedSkills: string[]
  availableSkills: string[]
  onSkillToggle: (_skill: string) => void
  maxVisible?: number
}

// Loading Component Props
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export interface ButtonLoadingProps {
  loading: boolean
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  className?: string
}

// Form Component Props
export interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (_value: string) => void
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  error?: string
  options?: Array<{ value: string; label: string }>
}

export interface AuthFormProps {
  mode: 'login' | 'register'
  onSubmit: (_data: any) => Promise<void>
  loading?: boolean
  error?: string
}

// Search Component Props
export interface SearchBarProps {
  value: string
  onChange: (_value: string) => void
  placeholder?: string
  onSubmit?: () => void
  loading?: boolean
}

// Pagination Component Props
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (_page: number) => void
  showPageNumbers?: boolean
  showPrevNext?: boolean
}

// Navigation Component Props
export interface NavigationProps {
  currentPath: string
  userType?: UserType
  isAuthenticated: boolean
}

// File Upload Component Props
export interface FileUploadProps {
  accept?: string
  maxSize?: number
  onUpload: (_file: File) => Promise<string>
  currentUrl?: string
  placeholder?: string
  error?: string
}

// Status Badge Props
export interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

// Event Handler Types
export type ClickHandler = () => void
export type SubmitHandler<T> = (_data: T) => Promise<void> | void
export type ChangeHandler<T> = (_value: T) => void