import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { Hand } from "lucide-react";
import { BurgerBuilder } from "@/components/burger/BurgerBuilder";

export const Route = createFileRoute("/")({
  component: Index,
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Index() {
  const reduce = useReducedMotion();

  return (
    <div className="bg-background text-foreground">
      {/* ---------- HERO — as in the reel: metal counter, text left, closed box centre-right ---------- */}
      <section id="menu" className="steel-surface">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[30%_1fr] lg:items-center">
          <div>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-[#141B2E] sm:text-6xl lg:text-7xl">
              Good things
              <br />
              come in
              <br />
              layers.
            </h1>
            <p className="mt-4 max-w-md text-base font-semibold text-[#141B2E]/80">
              Build your burger layer by layer, then watch it come together in the yellow box.
            </p>
          </div>

          <motion.div
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-full max-w-[640px]"
          >
            {/* Closed yellow takeaway box with lid, as in the reel hero */}
            <div className="relative">
              <div className="h-5 w-full -rotate-1 rounded-t-2xl border-[3px] border-b-0 border-ink bg-[#FFD400]" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-b-3xl border-[3px] border-ink bg-[#FFD400] px-6 py-10 text-center shadow-[8px_8px_0_0_var(--ink)]">
                <p className="font-display text-4xl font-extrabold leading-none text-primary sm:text-5xl">
                  DOUBLE
                  <br />
                  GOOD
                </p>
                <p className="mt-3 flex items-center justify-center gap-3 font-display text-sm font-extrabold tracking-widest text-[#E11D2E]">
                  <span className="inline-block h-3 w-6 rounded-t-full border-2 border-[#E11D2E] bg-transparent" aria-hidden="true" />
                  BUILD YOUR BURGER
                  <span className="inline-block h-3 w-6 rounded-t-full border-2 border-[#E11D2E] bg-transparent" aria-hidden="true" />
                </p>
                <Hand
                  className="mx-auto mt-4 h-10 w-10 rotate-[-20deg] text-[#E11D2E]"
                  fill="#E11D2E"
                  aria-hidden="true"
                />
              </div>
            </div>
            {/* Single blue pill centred below the box, as in the reel */}
            <div className="mt-6 text-center">
              <button type="button" onClick={() => scrollToId("builder")} className="pill pill-blue h-12 px-8">
                BUILD YOUR BURGER
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- COUNTER BUILDER ---------- */}
      <BurgerBuilder />
    </div>
  );
}
