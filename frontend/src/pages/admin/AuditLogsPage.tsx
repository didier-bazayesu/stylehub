import { useAuditLogs } from '@/api/hooks'
import { Pagination } from '@/components/ui/Pagination'
import { Badge } from '@/components/ui/Badge'
import { TableRowSkeleton } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePagination } from '@/hooks'
import { formatDatetime } from '@/lib/utils'
import { ScrollText } from 'lucide-react'

// Colour-code action verbs
function actionVariant(action: string): 'default' | 'success' | 'warning' | 'danger' | 'info' {
  if (action.includes('DELETE') || action.includes('REMOVE')) return 'danger'
  if (action.includes('CREATE') || action.includes('APPROVE')) return 'success'
  if (action.includes('UPDATE') || action.includes('CHANGE')) return 'info'
  if (action.includes('REJECT') || action.includes('SUSPEND')) return 'warning'
  return 'default'
}

export default function AdminAuditLogsPage() {
  const { page, limit, goToPage } = usePagination({ initialLimit: 25 })
  const { data, isLoading } = useAuditLogs({ page, limit })

  const logs = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Audit Logs</h1>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left dark:border-gray-800">
              {['Time', 'Action', 'Entity', 'Entity ID', 'Actor', 'IP'].map((h) => (
                <th key={h} className="px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading
              ? [...Array(10)].map((_, i) => <TableRowSkeleton key={i} cols={6} />)
              : !logs.length
              ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon={<ScrollText className="h-6 w-6" />} title="No audit logs yet" />
                  </td>
                </tr>
              )
              : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {formatDatetime(log.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={actionVariant(log.action)} size="sm">
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{log.entity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {log.entity_id ? log.entity_id.slice(-8) : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {log.user_id ? log.user_id.slice(-8) : 'system'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">
                    {log.ip_address ?? '—'}
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
