'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClientLoginForm } from '@/components/auth/ClientLoginForm'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ROUTES } from '@/lib/constants/routes'

export default function ClientLoginPage() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const subjectType = useAuthStore((state) => state.subjectType)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !accessToken) return
    // Route already-authenticated users to their respective dashboards
    if (subjectType === 'Admin') {
      router.replace(ROUTES.admin.dashboard)
    } else if (subjectType === 'Owner') {
      router.replace(ROUTES.owner.dashboard)
    } else {
      // Client (or any other session) → account
      router.replace(ROUTES.client.account)
    }
  }, [mounted, accessToken, subjectType, router])

  if (!mounted || accessToken) {
    return null
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Sign In</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Welcome back. Sign in to your account.
        </p>
      </div>

      <ClientLoginForm />

      <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
        <p className="text-sm text-neutral-600">
          Don&apos;t have an account?{' '}
          <Link
            href={ROUTES.auth.register}
            className="font-medium text-primary hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </>
  )
}
