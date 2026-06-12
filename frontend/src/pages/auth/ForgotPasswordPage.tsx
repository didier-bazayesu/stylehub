import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ROUTES } from '@/config/constants'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { mutate, isPending, isSuccess } = useForgotPassword()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm">
        <Link to={ROUTES.HOME} className="mb-8 block text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Style<span className="text-gray-400">Hub</span>
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Check your email</h1>
              <p className="text-sm text-gray-500">We sent a reset link. It expires in 1 hour.</p>
              <Link to={ROUTES.LOGIN} className="mt-4 block text-sm font-medium text-gray-900 hover:underline dark:text-white">
                Back to log in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">Reset your password</h1>
              <p className="mb-6 text-sm text-gray-500">Enter your email and we'll send a reset link.</p>
              <form onSubmit={handleSubmit((v) => mutate(v))} className="flex flex-col gap-4" noValidate>
                <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email?.message} required {...register('email')} />
                <Button type="submit" isLoading={isPending} fullWidth>Send reset link</Button>
              </form>
              <Link to={ROUTES.LOGIN} className="mt-4 block text-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
                Back to log in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
