import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { BurgerBuilder } from "@/components/burger/BurgerBuilder";
import { BoxWordmark, LayerArt } from "@/components/burger/art";
import { defaultStack } from "@/components/burger/data";

export const Route = createFileRoute("/")({
  component: Index,
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Index() {
  const reduce = useReducedMotion();
  const heroLayers = defaultStack();

  return (
    <div className="bg-background text-foreground">
      {/* ---------- HERO ---------- */}
      <section id="menu" className="mx-auto grid w-full max-w-[1440px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="font-display text-sm font-extrabold tracking-widest text-primary">
            BUILD YOUR BURGER
          </p>
          <h1 className="mt-3 font-display text-5xl font-extrabold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
            Good things
            <br />
            come in
            <br />
            layers.
          </h1>
          <p className="mt-4 max-w-md text-base font-semibold text-muted-foreground">
            A burger is only as good as its layers — so build yours exactly how you like it,
            drag it together, and add it to your order.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollToId("builder")} className="pill pill-blue h-12 px-6">
              OPEN THE BURGER BOX
            </button>
            <button type="button" onClick={() => scrollToId("builder")} className="pill pill-yellow h-12 px-6">
              SEE PRESETS
            </button>
            <button type="button" onClick={() => scrollToId("sides")} className="pill pill-purple h-12 px-6">
              TODAY'S SIDES
            </button>
          </div>
        </div>

        <motion.div
          animate={reduce ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto w-full max-w-[520px]"
        >
          <div className="chunk-surface relative overflow-hidden p-6">
            <BoxWordmark size={26} />
            <p className="mt-1 text-center font-display text-sm font-extrabold tracking-widest">
              BUILD YOUR BURGER
            </p>
            <div className="mx-auto mt-4 w-full max-w-[280px]">
              {[...heroLayers].reverse().map((layer) => (
                <div key={layer.uid} className="mx-auto -my-[1px] w-full">
                  <LayerArt id={layer.ingredientId} width={260} />
                </div>
              ))}
            </div>
            {/* Red cartoon hands reaching in — flat shapes, part of the hero art. */}
            <div aria-hidden="true" className="pointer-events-none absolute left-2 top-1/2 h-16 w-10 -translate-y-1/2 rotate-[-18deg] rounded-full border-[3px] border-ink bg-[#E11D2E]" />
            <div aria-hidden="true" className="pointer-events-none absolute right-2 top-1/2 h-16 w-10 -translate-y-1/2 rotate-[18deg] rounded-full border-[3px] border-ink bg-[#E11D2E]" />
          </div>
          <button
            type="button"
            onClick={() => scrollToId("builder")}
            className="pill pill-blue mt-4 h-12 w-full"
          >
            OPEN THE BURGER BOX
          </button>
        </motion.div>
      </section>

      {/* ---------- BUILDER + SIDES ---------- */}
      <BurgerBuilder />

      {/* ---------- ABOUT / CONTACT ---------- */}
      <section id="about" className="mx-auto w-full max-w-[1440px] px-4 pb-6 sm:px-6">
        <div className="chunk-card p-6">
          <h2 className="font-display text-3xl font-extrabold">ABOUT DOUBLE GOOD</h2>
          <p className="mt-2 max-w-2xl font-semibold text-muted-foreground">
            Double Good is a build-your-own-burger kitchen: fresh layers, stacked in front of
            you, delivered in the yellow box. No boring menu — you are the chef.
          </p>
        </div>
      </section>
      <section id="contact" className="mx-auto w-full max-w-[1440px] px-4 pb-12 sm:px-6">
        <div className="chunk-card p-6">
          <h2 className="font-display text-3xl font-extrabold">CONTACT</h2>
          <p className="mt-2 font-semibold text-muted-foreground">
            Open daily · 12:00 PM – 12:00 AM · Call / WhatsApp and delivery areas coming soon
            (TODO 3 — real details to be supplied before publishing).
          </p>
        </div>
      </section>
    </div>
  );
}
