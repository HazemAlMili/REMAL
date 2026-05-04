'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminLoginForm } from '@/components/auth/AdminLoginForm'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ROUTES } from '@/lib/constants/routes'

export default function AdminLoginPage() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && accessToken) {
      router.replace(ROUTES.admin.dashboard)
    }
  }, [mounted, accessToken, router])

  if (!mounted || accessToken) {
    return null
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Admin Login</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Sign in to your administrative account.
        </p>
      </div>

      <AdminLoginForm />

      <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
        <p className="text-sm text-neutral-600">
          Are you an owner?{' '}
          <Link
            href={ROUTES.auth.ownerLogin}
            className="font-medium text-primary hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </>
  )
}
