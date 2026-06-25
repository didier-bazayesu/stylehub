import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart } from "@/api/hooks/useCart";
import { useCreateOrder } from "@/api/hooks/useOrders";
import { useCreatePaymentIntent } from "@/api/hooks";
import { useAddresses } from "@/api/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/Loading";
import { formatCurrency } from "@/lib/utils";
import { ROUTES } from "@/config/constants";


const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string,
);

// ─── Payment form (inside Stripe Elements) ────────────────────────────────────

function StripePaymentForm({
  orderId,
  onSuccess,
}: {
  orderId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}${ROUTES.CUSTOMER.ORDER(orderId)}`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed.");
      setPaying(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button isLoading={paying} fullWidth onClick={handlePay}>
        Pay now
      </Button>
    </div>
  );
}

// ─── Main checkout page ───────────────────────────────────────────────────────

type CheckoutStep = "address" | "payment";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { mutate: createOrder, isPending: creatingOrder } = useCreateOrder();
  const { mutate: createIntent } = useCreatePaymentIntent();



  const [step, setStep] = useState<CheckoutStep>("address");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [couponCode, setCouponCode] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Guard: Show loader while cart is being merged after login

  if (cartLoading || addressesLoading) return <PageLoader />;

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.variant.price * i.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 9.99;

  const defaultAddress = addresses?.find((a) => a.is_default);
  const activeAddressId = selectedAddressId ?? defaultAddress?.id ?? null;

  const handlePlaceOrder = () => {
    if (!activeAddressId) return;
    createOrder(
      { address_id: activeAddressId, coupon_code: couponCode || undefined },
      {
        onSuccess: (order) => {
          setOrderId(order.id);
          createIntent(order.id, {
            onSuccess: ({ client_secret }) => {
              setClientSecret(client_secret);
              setStep("payment");
            },
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
        Checkout
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main panel */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {step === "address" ? (
            <>
              {/* Address selection */}
              <section className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Shipping address
                </h2>
                {!addresses?.length ? (
                  <p className="text-sm text-gray-500">
                    No saved addresses.{" "}
                    <a
                      href={ROUTES.CUSTOMER.ADDRESSES}
                      className="text-gray-900 underline"
                    >
                      Add one first.
                    </a>
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                          (selectedAddressId ?? defaultAddress?.id) === addr.id
                            ? "border-gray-900 dark:border-white"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={
                            (selectedAddressId ?? defaultAddress?.id) ===
                            addr.id
                          }
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-0.5"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {addr.full_name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {addr.line1}, {addr.city}, {addr.state}{" "}
                            {addr.postal_code}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              {/* Coupon */}
              <section className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Coupon code
                </h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) =>
                      setCouponCode(e.target.value.toUpperCase())
                    }
                    className="flex-1"
                  />
                  <Button variant="outline" size="md">
                    Apply
                  </Button>
                </div>
              </section>

              <Button
                fullWidth
                isLoading={creatingOrder}
                disabled={!activeAddressId || !items.length}
                onClick={handlePlaceOrder}
              >
                Continue to payment
              </Button>
            </>
          ) : (
            clientSecret &&
            orderId && (
              <section className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
                  Payment details
                </h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    orderId={orderId}
                    onSuccess={() => navigate(ROUTES.CUSTOMER.ORDER(orderId))}
                  />
                </Elements>
              </section>
            )
          )}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
            Order summary
          </h2>
          <div className="mb-4 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  {item.product.images?.[0]?.url && (
                    <img
                      src={item.product.images[0].url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                  {item.product.name}
                  <span className="text-gray-400"> ×{item.quantity}</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(item.variant.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-3 text-sm dark:border-gray-800">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between pt-1.5 font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(subtotal + shipping)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
