import { createFileRoute, Link } from "@tanstack/react-router";
import { formatRs } from "@/components/burger/data";
import { useCart } from "@/components/cart/CartContext";

export const Route = createFileRoute("/order-success")({
  component: OrderSuccess,
});

function OrderSuccess() {
  const cart = useCart();
  const order = cart.lastOrder;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col items-center px-4 py-16 text-center sm:px-6">
      <div className="chunk-card w-full p-8">
        <h1 className="font-display text-4xl font-extrabold">ORDER PLACED!</h1>
        <p className="mt-2 font-semibold text-muted-foreground">
          Your burger is being built, layer by layer.
        </p>
        {order ? (
          <div className="mt-6 space-y-2 text-left font-bold">
            <p className="flex justify-between">
              <span>ORDER NUMBER</span>
              <span>{order.number}</span>
            </p>
            <p className="flex justify-between">
              <span>ESTIMATED TIME</span>
              <span>{order.estimate}</span>
            </p>
            <p className="flex justify-between border-t-2 border-dashed border-ink/30 pt-2 font-display text-xl font-extrabold">
              <span>TOTAL PAID</span>
              <span>{formatRs(order.total)}</span>
            </p>
          </div>
        ) : (
          <p className="mt-6 font-semibold text-muted-foreground">
            No recent order found — your cart may have been cleared. Build a fresh burger below.
          </p>
        )}
        <Link to="/" className="pill pill-blue mt-8 inline-flex h-12 items-center px-6">
          BUILD ANOTHER
        </Link>
      </div>
    </div>
  );
}
