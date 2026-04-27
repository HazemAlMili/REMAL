'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useClientRegister } from '@/lib/hooks/useAuth'
import { ApiError } from '@/lib/api/api-error'
import { ROUTES } from '@/lib/constants/routes'
import { Loader2 } from 'lucide-react'

const clientRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(1, 'Phone number is required'),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>

export function ClientRegisterForm() {
  const router = useRouter()
  const { register: registerClient, isLoading } = useClientRegister()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '' },
  })

  const isPending = isLoading || isSubmitting

  const onSubmit = async (data: ClientRegisterFormValues) => {
    try {
      await registerClient({
        name: data.name,
        phone: data.phone,
        // Send undefined (not empty string) when email is not provided
        email: data.email || undefined,
        password: data.password,
      })
      // Redirect is handled inside the hook on success
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 422) {
          // Try to map errors to fields — show generically if not parseable
          const messages = err.errors
          const phoneError = messages.find((m) =>
            m.toLowerCase().includes('phone')
          )
          const emailError = messages.find((m) =>
            m.toLowerCase().includes('email')
          )

          if (phoneError) {
            setError('phone', { message: 'This phone number is already registered' })
          } else if (emailError) {
            setError('email', { message: 'This email is already registered' })
          } else {
            setError('root', { message: messages.join(', ') || 'Validation failed' })
          }
        } else if (err.status === 401) {
          // Register succeeded but auto-login failed
          setError('root', {
            message:
              'Account created but login failed. Please sign in manually.',
          })
          router.push(ROUTES.auth.clientLogin)
        }
      }
      // 500 / network errors handled by Axios interceptor
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          disabled={isPending}
          {...register('name')}
          className={`block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.name ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="Ahmed Hassan"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Phone */}
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

      {/* Email (optional) */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
          Email address{' '}
          <span className="text-neutral-400 font-normal">(optional)</span>
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
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          {...register('password')}
          className={`block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.password ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          disabled={isPending}
          {...register('confirmPassword')}
          className={`block w-full rounded-md border py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            errors.confirmPassword ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder="Re-enter your password"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
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
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  )
}
