import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/api/hooks/useCart";
import { useUpdateCartItem, useRemoveFromCart } from "@/api/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loading";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/constants";
import { useAuthStore } from "@/store";
import { useGuestCart } from "@/api/hooks";

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { data: cart, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();

  // Guest cart from localStorage
  const rawGuestItems = useGuestCart();

  // Shape guest items to match CartItem so the render code works unchanged
  const guestItems = rawGuestItems.map((g) => ({
    id: g.variant_id, // stable key
    cart_id: "guest",
    variant_id: g.variant_id,
    product_id: g.product_id,
    quantity: g.quantity,
    added_at: g.added_at,
    product: g.product,
    variant: g.variant,
  }));

  // Show loader only for authenticated users fetching server cart
  if (isAuthenticated && isLoading) return <PageLoader />;

  // Which items to display
  const items = isAuthenticated ? (cart?.items ?? []) : guestItems;

  const subtotal = items.reduce((s, i) => s + i.variant.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Your cart is empty"
          description="Browse products and add items to get started."
          action={{
            label: "Shop now",
            onClick: () => navigate(ROUTES.PRODUCTS),
          }}
        />
      </div>
    );
  }

  const handleUpdateItem = (variantId: string, quantity: number) => {
    if (quantity < 1) return;
    updateItem({ variantId, quantity }); // works for both — hook checks isAuthenticated internally
  };

  const handleRemoveItem = (variantId: string) => {
    removeItem(variantId); // works for both
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Send to login, tell it to come back to checkout
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CHECKOUT } });
    } else {
      navigate(ROUTES.CHECKOUT);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Your cart <span className="text-gray-400">({items.length})</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => {
            const primaryImage =
              item.product.images?.find((i) => i.is_primary)?.url ??
              item.product.images?.[0]?.url;

            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <Link to={ROUTES.PRODUCT(item.product.slug)}>
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {primaryImage && (
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                </Link>

                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <Link
                    to={ROUTES.PRODUCT(item.product.slug)}
                    className="text-sm font-medium text-gray-900 hover:underline dark:text-gray-100 truncate"
                  >
                    {item.product.name}
                  </Link>
                  {(item.variant.size || item.variant.color) && (
                    <p className="text-xs text-gray-400">
                      {[item.variant.size, item.variant.color]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.variant.price)}
                  </p>

                  <div className="mt-auto flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() =>
                          handleUpdateItem(item.variant_id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 dark:hover:text-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateItem(item.variant_id, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(item.variant_id)}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Order summary
          </h2>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-gray-400">
                Free shipping on orders over $100
              </p>
            )}
            <div className="mt-2 flex justify-between border-t border-gray-100 pt-2 font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Button fullWidth className="mt-5" onClick={handleCheckout}>
            {isAuthenticated ? "Proceed to checkout" : "Log in to checkout →"}
          </Button>

          {!isAuthenticated && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Your cart will be saved when you log in
            </p>
          )}

          <Link
            to={ROUTES.PRODUCTS}
            className="mt-3 block text-center text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
