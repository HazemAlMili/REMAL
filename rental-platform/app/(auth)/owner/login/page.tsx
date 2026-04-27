'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { OwnerLoginForm } from '@/components/auth/OwnerLoginForm'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ROUTES } from '@/lib/constants/routes'

export default function OwnerLoginPage() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const subjectType = useAuthStore((state) => state.subjectType)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !accessToken) return
    // Redirect based on who is already logged in
    if (subjectType === 'Admin') {
      router.replace(ROUTES.admin.dashboard)
    } else {
      // Owner or Client — send to owner dashboard
      router.replace(ROUTES.owner.dashboard)
    }
  }, [mounted, accessToken, subjectType, router])

  if (!mounted || accessToken) {
    return null
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Owner Login</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Sign in to your owner portal.
        </p>
      </div>

      <OwnerLoginForm />

      <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
        <p className="text-sm text-neutral-600">
          Are you an admin?{' '}
          <Link
            href={ROUTES.auth.adminLogin}
            className="font-medium text-primary hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </>
  )
}
