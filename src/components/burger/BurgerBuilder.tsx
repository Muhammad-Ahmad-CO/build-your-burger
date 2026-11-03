import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dices, RotateCcw } from "lucide-react";
import {
  INGREDIENTS,
  SIDES,
  defaultStack,
  formatRs,
  ingredientById,
  insertIndex,
  layersPrice,
  makeLayer,
  type StackLayer,
} from "@/components/burger/data";
import { useCart } from "@/components/cart/CartContext";
import {
  PHOTO_BURGER_TOP,
  PHOTO_FRIES,
  PHOTO_NUGGETS,
  PHOTO_ONION_RINGS,
} from "@/components/burger/photos";

const SIDE_PHOTOS: Record<string, string> = {
  fries: PHOTO_FRIES,
  "onion-rings": PHOTO_ONION_RINGS,
  nuggets: PHOTO_NUGGETS,
};

import {
  TRAY_BEEF_PATTY,
  TRAY_CHEDDAR,
  TRAY_LETTUCE,
  TRAY_TOMATO,
} from "@/components/burger/photos-trays";

import {
  LAYER_BEEF_COOKED,
  LAYER_BUN,
  LAYER_CHICKEN,
  LAYER_LETTUCE_TEX,
  LAYER_TOMATO_TEX,
  LAYER_VEGGIE,
} from "@/components/burger/photos-layers";

const TRAY_PHOTOS: Record<string, string> = {
  "beef-patty": TRAY_BEEF_PATTY,
  lettuce: TRAY_LETTUCE,
  tomato: TRAY_TOMATO,
  cheddar: TRAY_CHEDDAR,
};

const LAYER_COLOURS: Record<string, string> = {
  "bottom-bun": "#E08E24",
  "top-bun": "#F5A83C",
  "beef-patty": "#6B3E1E",
  "chicken-patty": "#E8A13C",
  "veggie-patty": "#7A8F3A",
  cheddar: "#FFAD1F",
  "smoked-cheese": "#E89005",
  tomato: "#E8473B",
  lettuce: "#55B33C",
  onion: "#E58BB0",
  jalapeno: "#37A24A",
  pickle: "#97A83B",
  ketchup: "#E11D2E",
  mustard: "#F2C200",
  mayo: "#F5E7BE",
  "hot-sauce": "#C1121F",
  "crispy-onions": "#C97B2D",
  "fried-egg": "#FFFFFF",
};

/** Small food visual for a tray, seen from above — not a side-stack drawing. */
function TrayVisual({ id }: { id: string }) {
  if (id === "lettuce") {
    return (
      <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="block h-1.5 w-5 rounded-full bg-[#55B33C]" />
        ))}
      </div>
    );
  }
  if (id === "tomato") {
    return (
      <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className="block h-4 w-4 rounded-[3px] bg-[#E8473B]" />
        ))}
      </div>
    );
  }
  if (id === "cheddar" || id === "smoked-cheese") {
    return (
      <div className="flex flex-wrap justify-center gap-1" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="block h-4 w-4 rounded-[3px]"
            style={{ background: LAYER_COLOURS[id] }}
          />
        ))}
      </div>
    );
  }
  if (id === "onion" || id === "jalapeno" || id === "pickle") {
    return (
      <div className="flex justify-center gap-1" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className="block h-5 w-5 rounded-full border-2 border-black/10"
            style={{ background: LAYER_COLOURS[id] }}
          />
        ))}
      </div>
    );
  }
  if (id.endsWith("sauce") || id === "ketchup" || id === "mustard" || id === "mayo") {
    return (
      <div className="h-2 w-16 rounded-full" style={{ background: LAYER_COLOURS[id] }} aria-hidden="true" />
    );
  }
  return (
    <div
      className="mx-auto h-9 w-16 rounded-full border-2 border-black/10"
      style={{ background: LAYER_COLOURS[id] ?? "#999" }}
      aria-hidden="true"
    />
  );
}

/** Top-down burger as the reel shows it: a glossy sesame bun on top, with
 *  the other layers only peeking out around its edge — never full discs. */
function TopViewBurger({ layers }: { layers: StackLayer[] }) {
  const ids = layers.map((l) => l.ingredientId);
  const has = (id: string) => ids.includes(id);
  const count = (id: string) => ids.filter((x) => x === id).length;
  return (
    <motion.div
      key={layers.length + ids.join(",")}
      initial={{ scale: 0.985 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="relative mx-auto h-[300px] w-[300px]"
    >
      {/* bottom bun edge peeking at the bottom */}
      {has("bottom-bun") && (
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute left-1/2 top-1/2 h-[262px] w-[262px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#e8a94e] to-[#c97f2e] shadow-[0_8px_16px_rgba(0,0,0,0.3)]" />
      )}
      {/* patty: cooked beef photo */}
      {has("beef-patty") && (
        <motion.div initial={{ scale: 0.5, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute left-1/2 top-1/2 h-[252px] w-[252px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.3)]" style={{ borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%" }}>
          <img src={LAYER_BEEF_COOKED} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {has("chicken-patty") && (
        <motion.div initial={{ scale: 0.5, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.3)]" style={{ borderRadius: "52% 48% 50% 50% / 48% 52% 48% 52%" }}>
          <img src={LAYER_CHICKEN} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {has("veggie-patty") && (
        <motion.div initial={{ scale: 0.5, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute left-1/2 top-1/2 h-[248px] w-[248px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_6px_12px_rgba(0,0,0,0.3)]">
          <img src={LAYER_VEGGIE} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {/* cheddar: photographic cheese square peeking out */}
      {has("cheddar") && (
        <motion.div initial={{ rotate: -16, scale: 0.5, opacity: 0 }} animate={{ rotate: -10, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute left-1/2 top-1/2 h-[205px] w-[205px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[18px] shadow-[0_6px_12px_rgba(0,0,0,0.3)]">
          <img src={TRAY_CHEDDAR} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {/* tomato: photographic tomato disc peeking out */}
      {has("tomato") && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute left-1/2 top-1/2 ml-[-10px] mt-[6px] h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-95">
          <img src={LAYER_TOMATO_TEX} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {/* lettuce: photographic green blob peeking out on all sides */}
      {has("lettuce") && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} className="absolute left-1/2 top-1/2 ml-[8px] mt-[-4px] h-[272px] w-[272px] -translate-x-1/2 -translate-y-1/2 overflow-hidden" style={{ borderRadius: "55% 45% 52% 48% / 48% 55% 45% 52%" }}>
          <img src={LAYER_LETTUCE_TEX} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {/* onion rings peeking */}
      {has("onion") && (
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute left-1/2 top-1/2 h-[244px] w-[244px] -translate-x-1/2 -translate-y-1/2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="absolute rounded-full border-[7px] border-[#c98bb0] bg-transparent" style={{ inset: 18 + i * 22, opacity: 0.9 }} />
          ))}
        </motion.div>
      )}
      {/* top bun: sesame bun photo on top, covering the centre */}
      {has("top-bun") && (
        <motion.div initial={{ scale: 0.5, opacity: 0, y: -16 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 15 }} className="absolute left-1/2 top-1/2 h-[224px] w-[224px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full shadow-[0_14px_24px_rgba(0,0,0,0.35)]">
          <img src={LAYER_BUN} alt="" className="h-full w-full object-cover" />
        </motion.div>
      )}
      {/* empty state: no layers yet */}
      {layers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed border-black/20 bg-white/40 text-center text-sm font-bold text-black/50">
          Tap a tray to start building
        </div>
      )}
      {/* double-layer badge */}
      {count("beef-patty") > 1 && (
        <span className="absolute bottom-2 right-6 z-10 rounded-full bg-blue-700 px-2 py-0.5 text-xs font-bold text-white shadow">DOUBLE</span>
      )}
    </motion.div>
  );
}
function PatternPaper() {
  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-4 content-start gap-3 overflow-hidden p-3 opacity-25" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="text-center text-[9px] font-extrabold leading-tight text-primary">
          DOUBLE
          <br />
          GOOD
        </span>
      ))}
    </div>
  );
}

export function BurgerBuilder() {
  const cart = useCart();
  const reduce = useReducedMotion();
  const [layers, setLayers] = useState<StackLayer[]>(() => defaultStack());
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastAddedName, setLastAddedName] = useState("CUSTOM BURGER");

  const layerIds = useMemo(() => layers.map((l) => l.ingredientId), [layers]);
  const price = layersPrice(layers);
  const countOf = (id: string) => layers.filter((l) => l.ingredientId === id).length;

  const addIngredient = (id: string) =>
    setLayers((prev) => {
      const next = [...prev];
      next.splice(insertIndex(prev, id), 0, makeLayer(id));
      return next;
    });

  const toggleIngredient = (id: string) => {
    const ing = ingredientById(id);
    if (ing.category === "bread" || countOf(id) === 0) {
      if (ing.category === "bread" && countOf(id) > 0) {
        setLayers((prev) => prev.filter((l) => l.ingredientId !== id));
      } else {
        addIngredient(id);
      }
      return;
    }
    setLayers((prev) => {
      const idx = prev.map((l) => l.ingredientId).lastIndexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const clearStack = () =>
    setLayers([
      { uid: `bun-${Date.now()}-bottom`, ingredientId: "bottom-bun" },
      { uid: `bun-${Date.now()}-top`, ingredientId: "top-bun" },
    ]);

  const randomStack = () => {
    const pick = (cat: string) => {
      const opts = INGREDIENTS.filter((i) => i.category === cat);
      return opts[Math.floor(Math.random() * opts.length)].id;
    };
    const veggies = INGREDIENTS.filter((i) => i.category === "veggies");
    const v1 = veggies[Math.floor(Math.random() * veggies.length)].id;
    const v2 = veggies[Math.floor(Math.random() * veggies.length)].id;
    const ids = ["bottom-bun", pick("patty"), pick("cheese"), v1, v2, pick("sauce"), "top-bun"];
    setLayers(ids.map((ingredientId, i) => ({ uid: `rand-${Date.now()}-${i}`, ingredientId })));
  };

  const addToOrder = () => {
    const name = "CUSTOM BURGER";
    cart.addBurger(name, layerIds, price);
    setLastAddedName(name);
    setShowReceipt(true);
  };

  const bottles = [
    { id: "mustard", label: "MUSTARD", body: "#F2C200", cap: "#E8B800" },
    { id: "ketchup", label: "KETCHUP", body: "#E11D2E", cap: "#B90F22" },
    { id: "mayo", label: "MAYO", body: "#F5E7BE", cap: "#1E40E6" },
  ];

  return (
    <section id="builder" className="steel-surface border-y-[3px] border-ink">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6">
        <h2 className="text-center font-display text-3xl font-extrabold sm:text-4xl">
          BUILD YOUR BURGER
        </h2>
        <p className="mt-1 text-center text-sm font-bold text-muted-foreground">
          Tap a tray, a bottle or a carton — your burger builds itself in the box.
        </p>

        {/* Sauce bottles — across the top, as in the reel */}
        <div className="mt-8 flex justify-center gap-4 sm:gap-8">
          {bottles.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => toggleIngredient(b.id)}
              aria-label={`Add ${b.label}`}
              className={`flex w-[84px] flex-col items-center bg-transparent transition-transform hover:-translate-y-1 ${
                countOf(b.id) > 0 ? "drop-shadow-[0_0_0_rgba(30,64,230,0.6)]" : ""
              }`}
            >
              {/* Real squeeze bottle: cap, narrow neck, tall body — no white capsule */}
              <span className="block h-[14px] w-[26px] rounded-t-md" style={{ background: b.cap }} aria-hidden="true" />
              <span className="block h-[10px] w-[18px]" style={{ background: b.body, filter: "brightness(0.92)" }} aria-hidden="true" />
              <span
                className="flex h-[104px] w-[62px] flex-col items-center justify-center rounded-[26px_26px_18px_18px] text-center text-[10px] font-extrabold leading-tight text-primary shadow-[0_10px_18px_rgba(0,0,0,0.35)]"
                style={{ background: `linear-gradient(135deg, ${b.body} 0%, ${b.body} 75%, rgba(0,0,0,0.22) 100%)` }}
                aria-hidden="true"
              >
                DOUBLE
                <br />
                GOOD
              </span>
              <span className="mt-2 rounded bg-sun px-2 py-0.5 text-[10px] font-extrabold shadow">{b.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[24%_1fr_16%]">
          {/* Left: trays, or receipt once an order is added — as in the reel loop */}
          <div>
            {showReceipt ? (
              <div className="rotate-[-2deg] rounded-2xl border-2 border-ink bg-[#FFF8E1] p-4 shadow-[4px_4px_0_0_var(--ink)]">
                <p className="text-center font-display text-sm font-extrabold text-primary">
                  DOUBLE GOOD
                </p>
                <p className="mt-2 font-display font-extrabold">{lastAddedName}</p>
                <ul className="mt-2 space-y-1 text-xs font-bold text-muted-foreground">
                  {layers.map((l) => (
                    <li key={l.uid}>· {ingredientById(l.ingredientId).name}</li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t-2 border-dashed border-ink/30 pt-2 font-display font-extrabold">
                  <span>TOTAL</span>
                  <span>{formatRs(price)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => cart.setDrawerOpen(true)}
                  className="pill pill-blue mt-4 h-11 w-full text-sm"
                >
                  VIEW ORDER
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReceipt(false);
                    setLayers(defaultStack());
                  }}
                  className="pill pill-yellow mt-2 h-11 w-full text-sm"
                >
                  BUILD ANOTHER
                </button>
              </div>
            ) : (
              <>
                <div className="mb-3 flex gap-2">
                  <button type="button" onClick={randomStack} className="pill pill-purple h-9 flex-1 text-xs">
                    <Dices className="h-4 w-4" aria-hidden="true" /> RANDOM
                  </button>
                  <button type="button" onClick={clearStack} className="pill pill-yellow h-9 flex-1 text-xs">
                    <RotateCcw className="h-4 w-4" aria-hidden="true" /> CLEAR
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {INGREDIENTS.map((ing) => {
                    const n = countOf(ing.id);
                    return (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleIngredient(ing.id)}
                        aria-label={`${ing.name}, ${formatRs(ing.price)}${n > 0 ? `, selected ${n}` : ""}`}
                        className={`relative rounded-2xl border border-black/10 bg-white/75 p-2 shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1 ${
                          n > 0 ? "ring-2 ring-primary bg-[#FFFBEA]" : ""
                        }`}
                      >
                        {n > 0 && (
                          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-primary text-xs font-extrabold text-white">
                            {n}
                          </span>
                        )}
                        <span className="flex h-20 items-center justify-center overflow-hidden rounded-lg">
                          {TRAY_PHOTOS[ing.id] ? (
                            <img
                              src={TRAY_PHOTOS[ing.id]}
                              alt={ing.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <TrayVisual id={ing.id} />
                          )}
                        </span>
                        <span className="mt-1 block rounded bg-sun px-1 py-0.5 text-center text-[10px] font-extrabold">
                          {ing.name}
                        </span>
                        <span className="mt-1 block text-center text-[11px] font-bold text-muted-foreground">
                          {formatRs(ing.price)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Centre: open two-compartment box */}
          <div className="relative">
            {/* Lid flap open at the back — attached to the box, not floating */}
            <div className="mx-auto h-[18px] w-[94%] rounded-t-2xl bg-[#FFE066] shadow-[0_-4px_10px_rgba(0,0,0,0.2)]" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-b-3xl bg-sun shadow-[0_14px_28px_rgba(0,0,0,0.35)]">
              <div className="relative flex">
                <div className="relative flex-1 overflow-hidden bg-[#FFF8E1] p-4">
                  <PatternPaper />
                  <div className="relative">
                    {/* Dynamic burger: every tray click adds/removes a layer here, as in the reel */}
                    <TopViewBurger layers={layers} />
                  </div>
                  <p className="relative mt-2 text-center">
                    <span className="rounded bg-sun px-2 py-0.5 text-[11px] font-extrabold">
                      YOUR BURGER · {formatRs(price)}
                    </span>
                  </p>
                </div>
                <div className="relative hidden w-[38%] overflow-hidden border-l border-black/10 bg-[#FFF8E1] sm:block">
                  <PatternPaper />
                  <div className="relative p-3">
                    <span className="rounded bg-sun px-2 py-0.5 text-[10px] font-extrabold shadow-sm">
                      SECOND HALF
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-bold">
              Layers: {layers.length}
              {layers.length > 0 ? ` · ${layers.map((l) => ingredientById(l.ingredientId).name).join(" · ")}` : ""}
            </p>
          </div>

          {/* Right: fry cartons, vertical */}
          <div id="sides" className="flex flex-row gap-4 lg:flex-col">
            {SIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => cart.addSide(s.id, s.name, s.price)}
                aria-label={`Add ${s.name}, ${formatRs(s.price)}`}
                className="flex-1 rounded-2xl border border-black/10 bg-white/75 p-3 text-center shadow-[0_8px_18px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-1 lg:flex-none"
              >
                <img
                  src={SIDE_PHOTOS[s.id] ?? PHOTO_FRIES}
                  alt={s.name}
                  className="mx-auto aspect-[4/5] w-full max-w-[180px] rounded-xl object-cover shadow-md"
                />
                <span className="mt-2 block rounded bg-sun px-1 py-0.5 text-[11px] font-extrabold">
                  {s.name}
                </span>
                <span className="block text-[11px] font-bold text-muted-foreground">
                  {formatRs(s.price)} — ADD
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: centred blue pill, yellow tag to its left — as in the reel */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={price}
              initial={reduce ? false : { scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="rounded bg-sun px-3 py-2 text-sm font-extrabold shadow"
            >
              {formatRs(price)}
            </motion.span>
          </AnimatePresence>
          <button type="button" onClick={addToOrder} className="pill pill-blue h-12 px-8">
            ADD TO ORDER
          </button>
        </div>
      </div>
      <div className="h-3 bg-sun" aria-hidden="true" />
    </section>
  );
}
