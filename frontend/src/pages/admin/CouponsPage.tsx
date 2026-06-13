import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Tag } from 'lucide-react'
import { useAdminCoupons, useCreateCoupon, useDeleteCoupon } from '@/api/hooks'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDisclosure } from '@/hooks'
import { formatCurrency, formatDate } from '@/lib/utils'

const schema = z.object({
  code: z.string().min(3, 'Min 3 characters').toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.coerce.number().min(0.01),
  min_order: z.coerce.number().optional(),
  max_uses: z.coerce.number().int().optional(),
  expires_at: z.string().optional(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof schema>

export default function AdminCouponsPage() {
  const { data: coupons, isLoading } = useAdminCoupons()
  const { mutate: create, isPending: creating } = useCreateCoupon()
  const { mutate: remove } = useDeleteCoupon()
  const modal = useDisclosure()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { discount_type: 'percentage', is_active: true },
  })

  const onSubmit = (values: FormValues) => {
    create(
      {
        ...values,
        expires_at: values.expires_at || null,
        min_order: values.min_order ?? null,
        max_uses: values.max_uses ?? null,
      } as any,
      { onSuccess: () => { modal.close(); reset() } },
    )
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Coupons</h1>
        <Button leftIcon={<Plus className="h-4 w-4" />} size="sm" onClick={modal.open}>
          New coupon
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Code', 'Discount', 'Min order', 'Uses', 'Expires', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {!coupons?.length ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon={<Tag className="h-6 w-6" />} title="No coupons yet" />
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {coupon.code}
                    </code>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {coupon.discount_type === 'percentage'
                      ? `${coupon.discount_value}%`
                      : formatCurrency(coupon.discount_value)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {coupon.min_order ? formatCurrency(coupon.min_order) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {coupon.uses_count}
                    {coupon.max_uses ? ` / ${coupon.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {coupon.expires_at ? formatDate(coupon.expires_at) : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={coupon.is_active ? 'success' : 'default'}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => confirm('Delete this coupon?') && remove(coupon.id)}
                      className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create coupon modal */}
      <Modal isOpen={modal.isOpen} onClose={modal.close} title="New coupon" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Code" placeholder="SUMMER20" error={errors.code?.message} required {...register('code')} />
            <Select
              label="Type"
              options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed ($)' }]}
              {...register('discount_type')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount value" type="number" step="0.01" required error={errors.discount_value?.message} {...register('discount_value')} />
            <Input label="Min order amount ($)" type="number" step="0.01" placeholder="None" {...register('min_order')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Max uses" type="number" placeholder="Unlimited" {...register('max_uses')} />
            <Input label="Expires at" type="date" {...register('expires_at')} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" size="sm" onClick={modal.close}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={creating}>Create coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
