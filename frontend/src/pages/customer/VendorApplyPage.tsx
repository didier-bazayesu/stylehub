import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Store, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { useApplyVendor, useVendorMe } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { PageLoader } from '@/components/ui/Loading'
import { useAuthStore } from '@/store'
import { ROUTES } from '@/config/constants'
import { VendorStatus } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_email: z.string().email('Enter a valid business email'),
  description: z
    .string()
    .min(20, 'Tell us a bit more — at least 20 characters')
    .max(500, 'Max 500 characters'),
})

type FormValues = z.infer<typeof schema>

// ─── Status screens ───────────────────────────────────────────────────────────

function StatusScreen({
  icon,
  iconBg,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {action}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VendorApplyPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: vendor, isLoading: vendorLoading } = useVendorMe()
  const { mutate: apply, isPending } = useApplyVendor()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      business_email: user?.email ?? '',
    },
  })

  const onSubmit = (values: FormValues) => {
    apply(values, {
      onSuccess: () => {
        // Reload to show pending status
        window.location.reload()
      },
    })
  }

  if (vendorLoading) return <PageLoader />

  // ── Already has a vendor record — show status ──────────────────────────────

  if (vendor) {
    if (vendor.status === VendorStatus.APPROVED) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <StatusScreen
            icon={<CheckCircle className="h-8 w-8 text-emerald-600" />}
            iconBg="bg-emerald-50 dark:bg-emerald-950"
            title="You're an approved vendor!"
            description="Your store is live and you can start adding products and managing orders."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild>
                  <Link to={ROUTES.VENDOR.DASHBOARD}>Go to dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={ROUTES.VENDOR.PRODUCTS}>Manage products</Link>
                </Button>
              </div>
            }
          />
        </div>
      )
    }

    if (vendor.status === VendorStatus.PENDING) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <StatusScreen
            icon={<Clock className="h-8 w-8 text-amber-600" />}
            iconBg="bg-amber-50 dark:bg-amber-950"
            title="Application under review"
            description="We've received your application for StyleHub vendor access. Our team typically reviews applications within 1–2 business days. We'll notify you by email."
            action={
              <div className="w-full rounded-xl border border-amber-100 bg-amber-50 p-4 text-left dark:border-amber-900/30 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {vendor.business_name}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {vendor.business_email}
                </p>
                {vendor.description && (
                  <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                    {vendor.description}
                  </p>
                )}
              </div>
            }
          />
        </div>
      )
    }

    if (vendor.status === VendorStatus.REJECTED) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <StatusScreen
            icon={<XCircle className="h-8 w-8 text-red-600" />}
            iconBg="bg-red-50 dark:bg-red-950"
            title="Application not approved"
            description={
              vendor.rejection_reason
                ? `Your application was not approved: ${vendor.rejection_reason}`
                : 'Your application was not approved at this time. Please contact support for more information.'
            }
            action={
              <Button variant="outline" asChild>
                <Link to={ROUTES.HOME}>Back to home</Link>
              </Button>
            }
          />
        </div>
      )
    }

    if (vendor.status === VendorStatus.SUSPENDED) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <StatusScreen
            icon={<AlertCircle className="h-8 w-8 text-gray-600" />}
            iconBg="bg-gray-100 dark:bg-gray-800"
            title="Account suspended"
            description="Your vendor account has been suspended. Please contact support for assistance."
            action={
              <Button variant="outline" asChild>
                <Link to={ROUTES.HOME}>Back to home</Link>
              </Button>
            }
          />
        </div>
      )
    }
  }

  // ── No vendor record yet — show application form ───────────────────────────

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 dark:bg-white">
          <Store className="h-7 w-7 text-white dark:text-gray-900" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Become a StyleHub vendor
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Reach thousands of fashion-forward customers. Applications are reviewed within 1–2 business days.
        </p>
      </div>

      {/* Benefits strip */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          { emoji: '🛍️', label: 'Your own store page' },
          { emoji: '📦', label: 'Full product management' },
          { emoji: '📊', label: 'Revenue analytics' },
        ].map(({ emoji, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3 text-center dark:border-gray-800 dark:bg-gray-900"
          >
            <span className="text-xl">{emoji}</span>
            <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">
          Business details
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            label="Business / store name"
            placeholder="e.g. Luna Boutique"
            required
            error={errors.business_name?.message}
            hint="This will be your public store name on StyleHub"
            {...register('business_name')}
          />

          <Input
            label="Business email"
            type="email"
            placeholder="orders@yourbusiness.com"
            required
            error={errors.business_email?.message}
            hint="We'll send order notifications to this address"
            {...register('business_email')}
          />

          <Textarea
            label="Tell us about your business"
            placeholder="Describe what you sell, your brand style, target customers, and any relevant experience…"
            rows={4}
            required
            error={errors.description?.message}
            hint={`20–500 characters`}
            {...register('description')}
          />

          {/* Terms note */}
          <p className="text-xs text-gray-400">
            By applying you agree to StyleHub's{' '}
            <span className="cursor-pointer underline hover:text-gray-600">
              vendor terms of service
            </span>
            . Applications are subject to review.
          </p>

          <Button type="submit" isLoading={isPending} fullWidth>
            Submit application
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Already a vendor?{' '}
        <Link
          to={ROUTES.VENDOR.DASHBOARD}
          className="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Go to dashboard
        </Link>
      </p>
    </div>
  )
}
