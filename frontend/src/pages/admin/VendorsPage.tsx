import { useState } from 'react'
import { useAdminVendors, useApproveVendor, useRejectVendor, useSuspendVendor } from '@/api/hooks'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Pagination } from '@/components/ui/Pagination'
import {  TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDisclosure, usePagination, useDebounce } from '@/hooks'
import { VENDOR_STATUS_COLORS, VENDOR_STATUS_LABELS, formatDate } from '@/lib/utils'
import { VendorStatus, type Vendor } from '@/types'
import { Search, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

export default function AdminVendorsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<VendorStatus | undefined>()
  const debouncedSearch = useDebounce(search, 350)
  const { page, limit, goToPage } = usePagination({ initialLimit: 25 })

  const { data, isLoading } = useAdminVendors({ search: debouncedSearch || undefined, status: statusFilter, page, limit })
  const { mutate: approve, isPending: approving } = useApproveVendor()
  const { mutate: reject, isPending: rejecting } = useRejectVendor()
  const { mutate: suspend } = useSuspendVendor()

  const rejectModal = useDisclosure()
  const [targetVendor, setTargetVendor] = useState<Vendor | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const vendors = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Vendors</h1>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {([undefined, VendorStatus.PENDING, VendorStatus.APPROVED, VendorStatus.REJECTED, VendorStatus.SUSPENDED] as const).map((s) => (
          <button
            key={s ?? 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            {s ? VENDOR_STATUS_LABELS[s] : 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Business', 'Owner', 'Email', 'Applied', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading
              ? [...Array(8)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : !vendors.length
              ? (
                <tr><td colSpan={6}><EmptyState title="No vendors found" /></td></tr>
              )
              : vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{vendor.business_name}</p>
                      {vendor.store && (
                        <Link
                          to={ROUTES.STORE(vendor.store.slug)}
                          target="_blank"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {vendor.user?.first_name} {vendor.user?.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{vendor.business_email}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(vendor.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={VENDOR_STATUS_COLORS[vendor.status]}>
                      {VENDOR_STATUS_LABELS[vendor.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {vendor.status === VendorStatus.PENDING && (
                        <>
                          <button
                            disabled={approving}
                            onClick={() => approve(vendor.id)}
                            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950 dark:text-emerald-400"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setTargetVendor(vendor); rejectModal.open() }}
                            className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {vendor.status === VendorStatus.APPROVED && (
                        <button
                          onClick={() => suspend(vendor.id)}
                          className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-400"
                        >
                          Suspend
                        </button>
                      )}
                      {vendor.status === VendorStatus.SUSPENDED && (
                        <button
                          disabled={approving}
                          onClick={() => approve(vendor.id)}
                          className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        >
                          Reinstate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination meta={meta} onPageChange={goToPage} />
        </div>
      )}

      {/* Reject modal */}
      <ConfirmModal
        isOpen={rejectModal.isOpen}
        onClose={() => { rejectModal.close(); setRejectReason('') }}
        onConfirm={() => {
          if (targetVendor) {
            reject({ id: targetVendor.id, reason: rejectReason }, {
              onSuccess: () => { rejectModal.close(); setRejectReason('') },
            })
          }
        }}
        title={`Reject ${targetVendor?.business_name}?`}
        confirmLabel="Reject vendor"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={rejecting}
      >
        <Textarea
          label="Reason (shown to vendor)"
          placeholder="Explain why this application is being rejected…"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      </ConfirmModal>
    </div>
  )
}
