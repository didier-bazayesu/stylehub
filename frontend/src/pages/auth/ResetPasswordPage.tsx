import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useResetPassword } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/config/constants'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Include one uppercase').regex(/[0-9]/, 'Include one number'),
})
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const { mutate, isPending } = useResetPassword()
  const [show, setShow] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Invalid or expired reset link.</p>
          <Link to={ROUTES.FORGOT_PASSWORD} className="mt-2 block text-sm font-medium text-gray-900 hover:underline">Request a new link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <Link to={ROUTES.HOME} className="mb-8 block text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Style<span className="text-gray-400">Hub</span>
        </Link>
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Set new password</h1>
          <p className="mb-6 text-sm text-gray-500">Choose a strong password for your account.</p>
          <form onSubmit={handleSubmit((v) => mutate({ token, password: v.password }))} className="flex flex-col gap-4" noValidate>
            <Input
              label="New password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              error={errors.password?.message}
              required
              rightAddon={
                <button type="button" onClick={() => setShow((v) => !v)} className="text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register('password')}
            />
            <Button type="submit" isLoading={isPending} fullWidth>Update password</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
