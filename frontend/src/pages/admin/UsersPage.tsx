import { useState } from 'react'
import { useAdminUsers, useUpdateUserStatus } from '@/api/hooks'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePagination, useDebounce } from '@/hooks'
import { formatDate } from '@/lib/utils'
import { Role,  } from '@/types'
import { Search } from 'lucide-react'

const ROLE_COLORS: Record<Role, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
  [Role.GUEST]: 'default',
  [Role.CUSTOMER]: 'info',
  [Role.VENDOR]: 'warning',
  [Role.ADMIN]: 'success',
  [Role.SUPER_ADMIN]: 'danger',
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | undefined>()
  const debouncedSearch = useDebounce(search, 350)
  const { page, limit, goToPage } = usePagination({ initialLimit: 25 })

  const { data, isLoading } = useAdminUsers({
    search: debouncedSearch || undefined,
    role: roleFilter,
    page,
    limit,
  })
  const { mutate: updateStatus } = useUpdateUserStatus()

  const users = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Users</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {([undefined, Role.CUSTOMER, Role.VENDOR, Role.ADMIN] as const).map((r) => (
          <button
            key={r ?? 'all'}
            onClick={() => setRoleFilter(r)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              roleFilter === r
                ? 'border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900'
                : 'border-gray-200 text-gray-600 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400'
            }`}
          >
            {r ?? 'All'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Name', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading
              ? [...Array(10)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : !users.length
              ? <tr><td colSpan={6}><EmptyState title="No users found" /></td></tr>
              : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROLE_COLORS[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_active ? 'success' : 'danger'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateStatus({ id: user.id, is_active: !user.is_active })}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        user.is_active
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}
                    >
                      {user.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
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
    </div>
  )
}
