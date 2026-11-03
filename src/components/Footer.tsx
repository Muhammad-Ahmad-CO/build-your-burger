// ============= Full file contents =============

import { Link, useRouter } from "@tanstack/react-router";
import { useReducedMotion } from "motion/react";
import { goToSection } from "@/lib/nav";

const LINKS: { label: string; target?: string; to?: string }[] = [
  { label: "MENU", target: "menu" },
  { label: "BUILD YOUR BURGER", target: "builder" },
  { label: "SIDES", target: "sides" },
  { label: "ABOUT", target: "about" },
  { label: "CONTACT", target: "contact" },
];

export function Footer() {
  const router = useRouter();
  const reduce = useReducedMotion();

  return (
    <footer className="border-t-[3px] border-ink bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <Link to="/" className="logo-stack inline-block text-3xl text-primary-foreground">
            <span className="block">DOUBLE</span>
            <span className="block">GOOD</span>
          </Link>
          <p className="mt-3 max-w-[240px] font-display font-semibold text-primary-foreground/85">
            Burgers built one layer at a time.
          </p>
        </div>

        <nav className="flex flex-col items-start gap-2 md:items-center" aria-label="Footer">
          {LINKS.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className="font-display text-base font-extrabold tracking-wide hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => goToSection(router, item.target!, !reduce)}
                className="font-display text-base font-extrabold tracking-wide hover:underline"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="font-display font-semibold md:text-right">
          {/* TODO 3 placeholders — real hours, phone/WhatsApp and address pending */}
          <p>OPEN DAILY · 12:00 PM – 12:00 AM</p>
          <p className="mt-1">CALL / WHATSAPP: COMING SOON</p>
          <p className="mt-1">DELIVERY: SELECT AREAS (COMING SOON)</p>
        </div>
      </div>

      <div className="border-t border-primary-foreground/25">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-1 px-6 py-4 text-sm font-semibold text-primary-foreground/80 sm:flex-row">
          <p>Made fresh. Built in layers.</p>
          <p>© 2026 DOUBLE GOOD. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
