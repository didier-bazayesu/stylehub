import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react'
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Address } from '@/types'

const schema = z.object({
  full_name: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  postal_code: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

export default function AddressesPage() {
  const { data: addresses, isLoading } = useAddresses()
  const { mutate: create, isPending: creating } = useCreateAddress()
  const { mutate: update, isPending: updating } = useUpdateAddress()
  const { mutate: remove } = useDeleteAddress()
  const { mutate: setDefault } = useSetDefaultAddress()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const openAdd = () => { setEditingId(null); reset({}); setShowForm(true) }

  const openEdit = (addr: Address) => {
    setEditingId(addr.id)
    reset({
      full_name: addr.full_name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 ?? '',
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      country: addr.country,
    })
    setShowForm(true)
  }

  const onSubmit = (values: FormValues) => {
    if (editingId) {
      update({ id: editingId, payload: values }, { onSuccess: () => setShowForm(false) })
    } else {
      create(values, { onSuccess: () => setShowForm(false) })
    }
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Addresses</h1>
        {!showForm && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>
            Add address
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            {editingId ? 'Edit address' : 'New address'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
            <Input label="Full name" error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
            <Input label="Address line 1" wrapperClassName="col-span-2" error={errors.line1?.message} {...register('line1')} />
            <Input label="Address line 2 (optional)" wrapperClassName="col-span-2" {...register('line2')} />
            <Input label="City" error={errors.city?.message} {...register('city')} />
            <Input label="State / Region" error={errors.state?.message} {...register('state')} />
            <Input label="Postal code" error={errors.postal_code?.message} {...register('postal_code')} />
            <Input label="Country" error={errors.country?.message} {...register('country')} />
            <div className="col-span-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={creating || updating}>
                {editingId ? 'Save changes' : 'Add address'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {!addresses?.length ? (
        <EmptyState
          icon={<MapPin className="h-6 w-6" />}
          title="No saved addresses"
          description="Add a shipping address to speed up checkout."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={cn(
                'rounded-xl border p-4 transition-colors',
                addr.is_default
                  ? 'border-gray-900 dark:border-white'
                  : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {addr.full_name}
                    {addr.is_default && (
                      <Badge variant="success" className="ml-2">Default</Badge>
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}<br />
                    {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                  </p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                </div>

                <div className="flex items-center gap-1">
                  {!addr.is_default && (
                    <button
                      onClick={() => setDefault(addr.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-emerald-600 dark:hover:bg-gray-800"
                      title="Set as default"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(addr)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(addr.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
