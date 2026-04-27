'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useClientLogin } from '@/lib/hooks/useAuth'
import { ApiError } from '@/lib/api/api-error'
import { Loader2 } from 'lucide-react'

const clientLoginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
})

type ClientLoginFormValues = z.infer<typeof clientLoginSchema>

export function ClientLoginForm() {
  const { clientLogin, isLoading } = useClientLogin()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: { phone: '', password: '' },
  })

  const isPending = isLoading || isSubmitting

  const onSubmit = async (data: ClientLoginFormValues) => {
    try {
      await clientLogin.mutateAsync(data)
      // Redirect handled in hook onSuccess
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          setError('root', { message: 'Invalid phone number or password' })
        } else if (error.hasFieldErrors()) {
          setError('root', { message: error.errors.join(', ') || 'Validation error' })
        }
      }
      // 500 or Network errors handled by Axios interceptor
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1">
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          disabled={isPending}
          {...register('phone')}
          className={`block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.phone ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="+20 10 0000 0000"
        />
        {errors.phone && (
          <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
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
