import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, ExternalLink } from 'lucide-react'
import { useVendorMe, useUpdateStore, useUploadStoreLogo, useUploadStoreBanner } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { PageLoader } from '@/components/ui/Loading'
import { slugify } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Max 500 characters').optional(),
})

type FormValues = z.infer<typeof schema>

export default function VendorStorePage() {
  const { data: vendor, isLoading } = useVendorMe()
  const { mutate: updateStore, isPending: updating } = useUpdateStore()
  const { mutate: uploadLogo, isPending: uploadingLogo } = useUploadStoreLogo()
  const { mutate: uploadBanner, isPending: uploadingBanner } = useUploadStoreBanner()

  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const storeName = watch('name')

  useEffect(() => {
    if (vendor?.store) {
      reset({
        name: vendor.store.name,
        slug: vendor.store.slug,
        description: vendor.store.description ?? '',
      })
    }
  }, [vendor])

  // Auto-generate slug from name when creating
  useEffect(() => {
    if (!vendor?.store && storeName) {
      setValue('slug', slugify(storeName), { shouldValidate: false })
    }
  }, [storeName, vendor])

  if (isLoading) return <PageLoader />

  const store = vendor?.store

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Store settings</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main form */}
        <form
          onSubmit={handleSubmit((v) => updateStore(v))}
          className="flex flex-col gap-5 lg:col-span-2"
        >
          <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              Store information
            </h2>
            <div className="flex flex-col gap-4">
              <Input
                label="Store name"
                required
                error={errors.name?.message}
                {...register('name')}
              />
              <Input
                label="Store URL slug"
                required
                hint={store ? `stylehub.com/stores/${watch('slug') || store.slug}` : undefined}
                leftAddon={<span className="text-xs">stores/</span>}
                error={errors.slug?.message}
                {...register('slug')}
              />
              <Textarea
                label="Description"
                rows={4}
                hint="Tell customers about your store (max 500 characters)"
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button type="submit" isLoading={updating}>
              Save changes
            </Button>
            {store && (
              <a
                href={`/stores/${store.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                View store <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </form>

        {/* Logo & banner uploads */}
        <div className="flex flex-col gap-4">
          {/* Logo */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Store logo
            </h2>
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
              >
                {store?.logo_url ? (
                  <img src={store.logo_url} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-200">
                    {store?.name?.charAt(0) ?? 'S'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100 rounded-2xl"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                isLoading={uploadingLogo}
                onClick={() => logoInputRef.current?.click()}
              >
                Upload logo
              </Button>
              <p className="text-center text-xs text-gray-400">PNG, JPG · max 5MB · square image recommended</p>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadLogo(file)
              }}
            />
          </div>

          {/* Banner */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              Store banner
            </h2>
            <div
              className="relative mb-3 h-24 w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
              onClick={() => bannerInputRef.current?.click()}
            >
              {store?.banner_url ? (
                <img src={store.banner_url} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Camera className="h-6 w-6 text-gray-300" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              isLoading={uploadingBanner}
              onClick={() => bannerInputRef.current?.click()}
            >
              Upload banner
            </Button>
            <p className="mt-2 text-center text-xs text-gray-400">1200×400px recommended · max 5MB</p>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadBanner(file)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
