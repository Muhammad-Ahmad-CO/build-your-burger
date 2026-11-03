// ============= Full file contents =============

import { useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LayerArt } from "@/components/burger/art";
import { formatRs, ingredientById } from "@/components/burger/data";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { useCart } from "@/components/cart/CartContext";
import { X, Minus, Plus, Trash2 } from "lucide-react";

export function CartDrawer() {
  const cart = useCart();
  const router = useRouter();
  const reduce = useReducedMotion();

  const onCheckout = () => {
    cart.checkout();
    cart.setDrawerOpen(false);
    router.navigate({ to: "/order-success" });
  };

  return (
    <AnimatePresence>
      {cart.drawerOpen && (
        <>
          <motion.div
            key="overlay"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/45"
            onClick={() => cart.setDrawerOpen(false)}
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            initial={reduce ? false : { x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="fixed right-0 top-0 z-[61] flex h-dvh w-full max-w-[420px] flex-col border-l-4 border-ink bg-card"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            <div className="flex items-center justify-between border-b-[3px] border-ink bg-sun px-5 py-4">
              <h2 className="font-display text-xl font-extrabold tracking-wide">YOUR ORDER</h2>
              <button
                type="button"
                onClick={() => cart.setDrawerOpen(false)}
                className="rounded-full p-1.5 hover:bg-ink/10"
                aria-label="Close cart"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {cart.items.length === 0 && (
                <div className="mt-16 text-center">
                  <p className="font-display text-lg font-extrabold">YOUR BOX IS EMPTY!</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Build a burger or add a side to get started.
                  </p>
                </div>
              )}

              {cart.items.map((item) => (
                <div key={item.key} className="chunk-card flex items-center gap-3 p-3">
                  {item.kind === "burger" ? (
                    <div className="flex h-16 w-14 shrink-0 flex-col-reverse items-center justify-end overflow-hidden rounded-xl border-2 border-ink bg-sun-soft">
                      {item.layerIds.slice(0, 4).map((id, i) => (
                        <LayerArt key={i} id={id} width={48} />
                      ))}
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-sun-soft"
                      aria-hidden="true"
                    >
                      {item.sideId === "fries" ? "🍟" : item.sideId === "onion-rings" ? "🧅" : "🍗"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-extrabold">
                      {item.kind === "burger"
                        ? item.name
                        : item.name}
                    </p>
                    {item.kind === "burger" && (
                      <p className="truncate text-xs font-semibold text-muted-foreground">
                        {item.layerIds.map((id) => ingredientById(id).name).join(" · ")}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm font-bold">{formatRs(item.price * item.qty)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => cart.decrement(item.key)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-sun-soft"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span className="w-5 text-center font-display font-extrabold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => cart.increment(item.key)}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-sun-soft"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => cart.removeItem(item.key)}
                        className="ml-1 rounded-full p-1 text-ketchup hover:bg-ketchup/10"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-[3px] border-ink bg-sun-soft px-5 py-4">
              <div className="flex justify-between text-sm font-bold">
                <span>SUBTOTAL</span>
                <AnimatedNumber value={cart.subtotal} />
              </div>
              <div className="mt-1 flex justify-between text-sm font-bold">
                <span>DELIVERY FEE</span>
                <span>{formatRs(cart.deliveryFee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t-2 border-dashed border-ink/30 pt-2 font-display text-lg font-extrabold">
                <span>TOTAL</span>
                <AnimatedNumber value={cart.total} />
              </div>
              <button
                type="button"
                onClick={onCheckout}
                disabled={cart.items.length === 0}
                className="pill pill-blue mt-3 h-12 w-full text-base"
              >
                CHECKOUT
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
