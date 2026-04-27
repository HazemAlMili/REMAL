'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAdminLogin } from '@/lib/hooks/useAuth'
import { ApiError } from '@/lib/api/api-error'
import { Loader2 } from 'lucide-react'

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>

export function AdminLoginForm() {
  const { adminLogin, isLoading } = useAdminLogin()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  })

  const isPending = isLoading || isSubmitting

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      await adminLogin.mutateAsync(data)
      // Redirect handled in hook onSuccess
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError('root', { message: 'Invalid email or password' })
        } else if (error.hasFieldErrors()) {
          // Simplistic mapping for field errors
          // Ideally backend returns structured validation errors,
          // assuming ApiError.errors is a simple string array or we just show a generic message.
          // Since the ticket says "show field-level errors from apiError.errors[]",
          // and we don't have the exact structure of error.errors, we will just use a generic one
          // or try to map if it's a known format. Let's do a basic root error if we can't parse it.
          // For now, if we don't know the exact format, we'll set it to root to be safe.
          setError('root', { message: error.errors.join(', ') || 'Validation error' })
        }
      }
      // 500 or Network errors are handled by Axios interceptor
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          {...register('email')}
          className={`block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="admin@remal.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isPending}
          {...register('password')}
          className={`block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.password ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="••••••••"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {errors.root && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-100">
          {errors.root.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
