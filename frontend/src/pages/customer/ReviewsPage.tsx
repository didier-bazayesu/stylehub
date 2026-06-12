import { useState } from 'react'
import { Star, StarOff } from 'lucide-react'
import { useOrders } from '@/api/hooks/useOrders'
import { useCreateReview, useDeleteReview } from '@/api/hooks'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Loading'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDisclosure } from '@/hooks'
import { cn, formatDate, getProductPrimaryImage } from '@/lib/utils'
import { OrderStatus, type OrderItem } from '@/types'

// ─── Star Rating Input ────────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-gray-300 transition-colors hover:text-amber-400"
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              star <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200',
            )}
          />
        </button>
      ))}
      <span className="ml-1 text-sm text-gray-500">
        {value > 0 ? `${value} / 5` : 'Select rating'}
      </span>
    </div>
  )
}

// ─── Review modal ─────────────────────────────────────────────────────────────

function ReviewModal({
  item,
  isOpen,
  onClose,
}: {
  item: OrderItem | null
  isOpen: boolean
  onClose: () => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const { mutate: createReview, isPending } = useCreateReview(item?.product_id ?? '')

  const handleSubmit = () => {
    if (!rating) return
    createReview(
      { rating, comment: comment || undefined },
      {
        onSuccess: () => {
          onClose()
          setRating(0)
          setComment('')
        },
      },
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Write a review"
      description={item?.product?.name}
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Product image + name */}
        {item?.product && (
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={getProductPrimaryImage(item.product.images ?? [])}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.product.name}
            </p>
          </div>
        )}

        {/* Star rating */}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Your rating <span className="text-red-500">*</span>
          </p>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* Comment */}
        <Textarea
          label="Review (optional)"
          rows={4}
          placeholder="Share your thoughts about this product…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!rating}
            isLoading={isPending}
            onClick={handleSubmit}
          >
            Submit review
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'pending' | 'submitted'

export default function CustomerReviewsPage() {
  const [tab, setTab] = useState<Tab>('pending')
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null)
  const reviewModal = useDisclosure()

  // Load all delivered orders to find reviewable items
  const { data: ordersData, isLoading } = useOrders({
    status: OrderStatus.DELIVERED,
    limit: 100,
  })

  const { mutate: deleteReview } = useDeleteReview()

  const allItems: OrderItem[] = ordersData?.data?.flatMap((o) => o.items) ?? []

  // Pending = delivered items with no review yet
  const pendingItems = allItems.filter(
    (item) => !item.product?.reviews?.some((r) => r.product_id === item.product_id),
  )

  // Submitted = items that have a review
  const reviewedItems = allItems.filter((item) =>
    item.product?.reviews?.some((r) => r.product_id === item.product_id),
  )

  if (isLoading) return <PageLoader />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Reviews</h1>

      {/* Tabs */}
      <div className="mb-6 flex rounded-lg border border-gray-200 dark:border-gray-700 w-fit">
        {(['pending', 'submitted'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              'first:rounded-l-lg last:rounded-r-lg',
              tab === t
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {t}
            {t === 'pending' && pendingItems.length > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                {pendingItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Pending reviews */}
      {tab === 'pending' && (
        <>
          {!pendingItems.length ? (
            <EmptyState
              icon={<StarOff className="h-6 w-6" />}
              title="No pending reviews"
              description="Products you've purchased will appear here once delivered."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {pendingItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={getProductPrimaryImage(item.product?.images ?? [])}
                      alt={item.product?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.variant?.size && `Size: ${item.variant.size}`}
                      {item.variant?.color && ` · ${item.variant.color}`}
                    </p>
                    <Badge variant="success" size="sm" className="mt-1">
                      Verified purchase
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedItem(item)
                      reviewModal.open()
                    }}
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Submitted reviews */}
      {tab === 'submitted' && (
        <>
          {!reviewedItems.length ? (
            <EmptyState
              icon={<Star className="h-6 w-6" />}
              title="No reviews yet"
              description="Your submitted reviews will appear here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {reviewedItems.map((item) => {
                const review = item.product?.reviews?.[0]
                if (!review) return null
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={getProductPrimaryImage(item.product?.images ?? [])}
                          alt={item.product?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.product?.name}
                        </p>
                        <div className="mt-1 flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                'h-3.5 w-3.5',
                                s <= review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-200 text-gray-200',
                              )}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-400">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {review.comment}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Review modal */}
      <ReviewModal
        item={selectedItem}
        isOpen={reviewModal.isOpen}
        onClose={reviewModal.close}
      />
    </div>
  )
}
