'use client'

import { useLogout } from '@/lib/hooks/useLogout'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface LogoutButtonProps {
  variant?: 'icon' | 'full'
  className?: string
}

export function LogoutButton({ variant = 'full', className }: LogoutButtonProps) {
  const { logout, isLoading } = useLogout()

  return (
    <button
      onClick={logout}
      disabled={isLoading}
      className={cn(
        'flex items-center gap-2 text-neutral-500 hover:text-neutral-700 transition-colors',
        isLoading && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <LogOut size={18} className={isLoading ? 'animate-spin' : ''} />
      {variant === 'full' && (
        <span className="text-sm">{isLoading ? 'Signing out...' : 'Sign Out'}</span>
      )}
    </button>
  )
}
