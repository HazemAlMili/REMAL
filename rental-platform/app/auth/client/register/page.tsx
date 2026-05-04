'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClientRegisterForm } from '@/components/auth/ClientRegisterForm'
import { useAuthStore } from '@/lib/stores/auth.store'
import { ROUTES } from '@/lib/constants/routes'

export default function ClientRegisterPage() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const subjectType = useAuthStore((state) => state.subjectType)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !accessToken) return
    if (subjectType === 'Admin') {
      router.replace(ROUTES.admin.dashboard)
    } else if (subjectType === 'Owner') {
      router.replace(ROUTES.owner.dashboard)
    } else {
      router.replace(ROUTES.client.account)
    }
  }, [mounted, accessToken, subjectType, router])

  if (!mounted || accessToken) {
    return null
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Create an account</h2>
        <p className="text-sm text-neutral-500 mt-1">
          Sign up to start booking your stay.
        </p>
      </div>

      <ClientRegisterForm />

      <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
        <p className="text-sm text-neutral-600">
          Already have an account?{' '}
          <Link
            href={ROUTES.auth.clientLogin}
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  )
}
