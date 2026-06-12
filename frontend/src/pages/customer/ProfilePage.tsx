import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProfile, useUpdateProfile, useChangePassword } from '@/api/hooks'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Loading'

// ─── Profile form ─────────────────────────────────────────────────────────────

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  phone: z.string().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

// ─── Password form ────────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Required'),
    new_password: z.string().min(8, 'At least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })

type PasswordValues = z.infer<typeof passwordSchema>

export default function CustomerProfilePage() {
  const { data: user, isLoading } = useProfile()
  const { mutate: updateProfile, isPending: updatingProfile } = useUpdateProfile()
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword()

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: '', last_name: '', phone: '' },
  })

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone ?? '',
      })
    }
  }, [user])

  if (isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-xl font-bold text-gray-900 dark:text-white">Profile</h1>

      {/* Profile info */}
      <section className="mb-8 rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">Personal information</h2>
        <form
          onSubmit={profileForm.handleSubmit((v) => updateProfile(v))}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First name"
              error={profileForm.formState.errors.first_name?.message}
              {...profileForm.register('first_name')}
            />
            <Input
              label="Last name"
              error={profileForm.formState.errors.last_name?.message}
              {...profileForm.register('last_name')}
            />
          </div>
          <Input label="Email" value={user?.email ?? ''} disabled hint="Email cannot be changed" />
          <Input
            label="Phone"
            type="tel"
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={updatingProfile} size="sm">Save changes</Button>
          </div>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">Change password</h2>
        <form
          onSubmit={passwordForm.handleSubmit((v) =>
            changePassword({ current_password: v.current_password, new_password: v.new_password })
          )}
          className="flex flex-col gap-4"
        >
          <Input
            label="Current password"
            type="password"
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
          />
          <Input
            label="New password"
            type="password"
            error={passwordForm.formState.errors.new_password?.message}
            {...passwordForm.register('new_password')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={passwordForm.formState.errors.confirm_password?.message}
            {...passwordForm.register('confirm_password')}
          />
          <div className="flex justify-end">
            <Button type="submit" isLoading={changingPassword} size="sm">Update password</Button>
          </div>
        </form>
      </section>
    </div>
  )
}
