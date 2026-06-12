import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Trash2, Bell } from 'lucide-react'
import { useChangePassword } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/Modal'
import { useDisclosure } from '@/hooks'
import { useAuthStore } from '@/store'
import { useLogout } from '@/api/hooks/useAuth'

// ─── Password schema ──────────────────────────────────────────────────────────

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Required'),
    new_password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include one uppercase letter')
      .regex(/[0-9]/, 'Include one number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })

type PasswordValues = z.infer<typeof passwordSchema>

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CustomerSettingsPage() {
  const { user } = useAuthStore()
  const { mutate: changePassword, isPending: changingPassword } = useChangePassword()
  const { mutate: logout } = useLogout()
  const deleteModal = useDisclosure()

  // Email preferences (local state — no backend endpoint yet)
  const [emailPrefs, setEmailPrefs] = useState({
    order_updates: true,
    promotions: false,
    new_products: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) })

  const onPasswordSubmit = (values: PasswordValues) => {
    changePassword(
      {
        current_password: values.current_password,
        new_password: values.new_password,
      },
      { onSuccess: () => reset() },
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="flex flex-col gap-5">
        {/* ── Password ── */}
        <Section
          icon={<Shield className="h-4 w-4" />}
          title="Password"
          description="Use a strong password with at least 8 characters, one uppercase letter, and one number"
        >
          <form
            onSubmit={handleSubmit(onPasswordSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              error={errors.current_password?.message}
              required
              {...register('current_password')}
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              error={errors.new_password?.message}
              required
              {...register('new_password')}
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={errors.confirm_password?.message}
              required
              {...register('confirm_password')}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" isLoading={changingPassword}>
                Update password
              </Button>
            </div>
          </form>
        </Section>

        {/* ── Email preferences ── */}
        <Section
          icon={<Bell className="h-4 w-4" />}
          title="Email notifications"
          description="Choose which emails you want to receive"
        >
          <div className="flex flex-col gap-3">
            {(
              [
                { key: 'order_updates', label: 'Order updates', desc: 'Confirmations, shipping, delivery' },
                { key: 'promotions', label: 'Promotions & deals', desc: 'Sales, discount codes, special offers' },
                { key: 'new_products', label: 'New arrivals', desc: 'New products from stores you follow' },
              ] as const
            ).map(({ key, label, desc }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-100 p-3 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                {/* Toggle switch */}
                <div
                  onClick={() =>
                    setEmailPrefs((p) => ({ ...p, [key]: !p[key] }))
                  }
                  className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                    emailPrefs[key]
                      ? 'bg-gray-900 dark:bg-white'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform dark:bg-gray-900 ${
                      emailPrefs[key] ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            ))}
          </div>
        </Section>

        {/* ── Danger zone ── */}
        <Section
          icon={<Trash2 className="h-4 w-4" />}
          title="Danger zone"
          description="Permanent actions that cannot be undone"
        >
          <div className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-950/20">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Delete account
              </p>
              <p className="text-xs text-red-500 dark:text-red-500">
                This will permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={deleteModal.open}
            >
              Delete
            </Button>
          </div>
        </Section>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => {
          // TODO: call DELETE /users/me endpoint when backend implements it
          logout()
        }}
        title="Delete your account?"
        description={`This will permanently delete ${user?.email} and all your orders, reviews, and saved data. This cannot be undone.`}
        confirmLabel="Yes, delete my account"
        cancelLabel="Keep account"
        variant="danger"
      />
    </div>
  )
}
