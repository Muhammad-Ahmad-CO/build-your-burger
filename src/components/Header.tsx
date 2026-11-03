// ============= Full file contents =============

import { Link, useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Menu, ShoppingBasket, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { goToSection } from "@/lib/nav";

const NAV: { label: string; target?: string; to?: string }[] = [
  { label: "MENU", target: "menu" },
  { label: "BUILD YOUR BURGER", target: "builder" },
  { label: "SIDES", target: "sides" },
  { label: "ABOUT", target: "about" },
  { label: "CONTACT", target: "contact" },
];

export function Header() {
  const router = useRouter();
  const cart = useCart();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  const onNavClick = (item: (typeof NAV)[number]) => {
    setMenuOpen(false);
    if (item.target) goToSection(router, item.target, !reduce);
  };

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-sun">
      <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="DOUBLE GOOD home">
          <span className="logo-stack text-[22px] text-primary sm:text-2xl">
            <span className="block">DOUBLE</span>
            <span className="block">GOOD</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="font-display text-[15px] font-extrabold tracking-wide text-foreground transition-transform hover:-translate-y-0.5"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => onNavClick(item)}
                className="font-display text-[15px] font-extrabold tracking-wide text-foreground transition-transform hover:-translate-y-0.5"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cart.setDrawerOpen(true)}
            className="pill pill-blue h-11 px-4 text-sm"
            aria-label={`Open cart, ${cart.count} items`}
          >
            <ShoppingBasket className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={cart.count}
                initial={reduce ? false : { scale: 1.6 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="min-w-6 inline-block"
              >
                {cart.count}
              </motion.span>
            </AnimatePresence>
          </button>

          <button
            type="button"
            className="pill pill-yellow h-11 w-11 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="overflow-hidden border-t-[3px] border-ink bg-sun md:hidden"
            aria-label="Mobile"
          >
            <div className="flex flex-col items-stretch gap-1 px-4 py-3">
              {NAV.map((item) =>
                item.to ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl px-4 py-3 font-display text-lg font-extrabold text-foreground hover:bg-sun-soft"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onNavClick(item)}
                    className="rounded-2xl px-4 py-3 text-left font-display text-lg font-extrabold text-foreground hover:bg-sun-soft"
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
