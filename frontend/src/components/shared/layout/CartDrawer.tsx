import { Link, useNavigate } from "react-router-dom";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore, useAuthStore } from "@/store";
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
} from "@/api/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/constants";

export function CartDrawer() {
  const { isOpen, closeCart, cart: guestCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { data: backendCart, isLoading } = useCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: removeItem } = useRemoveFromCart();
  const navigate = useNavigate();

  // Use guest cart if not authenticated, backend cart if authenticated
  const cart = isAuthenticated ? backendCart : guestCart;
  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.variant.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: ROUTES.CHECKOUT } });
      return;
    }
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-gray-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Your cart
            {items.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({items.length})
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading && isAuthenticated ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Your cart is empty
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Add items to get started.
              </p>
              <Button size="sm" className="mt-4" onClick={closeCart} asChild>
                <Link to={ROUTES.PRODUCTS}>Browse products</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const primaryImage =
                  item.product.images?.find((i) => i.is_primary)?.url ??
                  item.product.images?.[0]?.url;

                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
                  >
                    {/* Image */}
                    <Link
                      to={ROUTES.PRODUCT(item.product.slug)}
                      onClick={closeCart}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    >
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100" />
                      )}
                    </Link>

                    {/* Details */}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Link
                        to={ROUTES.PRODUCT(item.product.slug)}
                        onClick={closeCart}
                        className="truncate text-xs font-medium text-gray-900 hover:underline dark:text-gray-100"
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
                      <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.variant.price)}
                      </p>

                      {/* Quantity + remove */}
                      <div className="mt-auto flex items-center gap-2">
                        <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() =>
                              updateItem({
                                variantId: item.variant_id,
                                quantity: item.quantity - 1,
                              })
                            }
                            disabled={item.quantity <= 1}
                            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900 disabled:opacity-40 dark:hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateItem({
                                variantId: item.variant_id,
                                quantity: item.quantity + 1,
                              })
                            }
                            className="flex h-7 w-7 items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            removeItem(item.variant.id);
                          }}
                          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — show for all users with items */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-4 dark:border-gray-800">
            <div className="mb-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 font-semibold text-gray-900 dark:border-gray-800 dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {!isAuthenticated && (
              <p className="mb-2 text-center text-xs text-gray-400">
                You'll be asked to log in at checkout
              </p>
            )}

            <Button fullWidth onClick={handleCheckout}>
              Proceed to checkout
            </Button>

            <button
              onClick={closeCart}
              className="mt-2 w-full text-center text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
