import toast from 'react-hot-toast'

export interface ToastOptions {
  duration?: number
  id?: string
}

export const toastSuccess = (message: string, options?: ToastOptions) =>
  toast.success(message, {
    id: options?.id,
    duration: options?.duration ?? 3000,
    style: {
      background: 'var(--color-neutral-800)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      borderRadius: '8px',
    },
  })

export const toastError = (message: string, options?: ToastOptions) =>
  toast.error(message, {
    id: options?.id,
    duration: options?.duration ?? 4000,
    style: {
      background: 'var(--color-neutral-800)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      borderRadius: '8px',
    },
  })

export const toastLoading = (message: string, options?: { id?: string }) =>
  toast.loading(message, {
    id: options?.id,
    style: {
      background: 'var(--color-neutral-800)',
      color: '#fff',
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      borderRadius: '8px',
    },
  })
