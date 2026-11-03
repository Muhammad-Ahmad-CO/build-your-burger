import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dices, RotateCcw, X } from "lucide-react";
import { LayerArt } from "@/components/burger/art";
import {
  CATEGORY_STEPS,
  INGREDIENTS,
  PRESETS,
  SIDES,
  defaultStack,
  formatRs,
  ingredientById,
  insertIndex,
  layersPrice,
  makeLayer,
  stackHeightLabel,
  type Category,
  type StackLayer,
} from "@/components/burger/data";
import { useCart } from "@/components/cart/CartContext";

type View = "stack" | "counter";

function StackArt({ layers, width = 260 }: { layers: StackLayer[]; width?: number }) {
  // Render top-to-bottom in the DOM so the bottom bun lands at the bottom.
  const topDown = [...layers].reverse();
  return (
    <div className="mx-auto w-full max-w-[300px]" style={{ width }}>
      {topDown.map((layer) => (
        <motion.div
          key={layer.uid}
          initial={{ y: -24, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mx-auto -my-[1px] w-full"
        >
          <LayerArt id={layer.ingredientId} width={width} />
        </motion.div>
      ))}
      {layers.length === 0 && (
        <p className="py-10 text-center font-display font-extrabold text-muted-foreground">
          YOUR BURGER STARTS HERE
        </p>
      )}
    </div>
  );
}

export function BurgerBuilder() {
  const cart = useCart();
  const reduce = useReducedMotion();
  const [layers, setLayers] = useState<StackLayer[]>(() => defaultStack());
  const [view, setView] = useState<View>("stack");
  const [stepIndex, setStepIndex] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  const step = CATEGORY_STEPS[stepIndex];
  const layerIds = useMemo(() => layers.map((l) => l.ingredientId), [layers]);
  const price = layersPrice(layers);
  const presetMatch = PRESETS.find((p) => p.layerIds.join(">") === layerIds.join(">"));
  const countOf = (id: string) => layers.filter((l) => l.ingredientId === id).length;

  const addIngredient = (id: string) => {
    setLayers((prev) => {
      const at = insertIndex(prev, id);
      const next = [...prev];
      next.splice(at, 0, makeLayer(id));
      return next;
    });
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 1500);
  };

  const toggleIngredient = (id: string) => {
    const ing = ingredientById(id);
    if (ing.category === "bread") {
      if (countOf(id) > 0) {
        setLayers((prev) => prev.filter((l) => l.ingredientId !== id));
      } else {
        addIngredient(id);
      }
      return;
    }
    if (countOf(id) > 0) {
      setLayers((prev) => {
        const idx = prev.map((l) => l.ingredientId).lastIndexOf(id);
        if (idx < 0) return prev;
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
    } else {
      addIngredient(id);
    }
  };

  const removeLayer = (uid: string) => setLayers((prev) => prev.filter((l) => l.uid !== uid));

  const loadPreset = (ids: string[]) =>
    setLayers(ids.map((ingredientId, i) => ({ uid: `preset-${Date.now()}-${i}`, ingredientId })));

  const clearStack = () =>
    setLayers([
      { uid: `bun-${Date.now()}-bottom`, ingredientId: "bottom-bun" },
      { uid: `bun-${Date.now()}-top`, ingredientId: "top-bun" },
    ]);

  const randomStack = () => {
    const pick = (cat: Category) => {
      const opts = INGREDIENTS.filter((i) => i.category === cat);
      return opts[Math.floor(Math.random() * opts.length)].id;
    };
    const veggies = INGREDIENTS.filter((i) => i.category === "veggies");
    const v1 = veggies[Math.floor(Math.random() * veggies.length)].id;
    const v2 = veggies[Math.floor(Math.random() * veggies.length)].id;
    loadPreset(["bottom-bun", pick("patty"), pick("cheese"), v1, v2, pick("sauce"), "top-bun"]);
  };

  const addToOrder = () => {
    cart.addBurger(presetMatch ? presetMatch.name : "CUSTOM BURGER", layerIds, price);
    cart.setDrawerOpen(true);
    setLayers(defaultStack());
  };

  const stepIngredients = INGREDIENTS.filter((i) => i.category === step.category);

  const tile = (id: string, label: string, priceText: string) => {
    const n = countOf(id);
    return (
      <button
        key={id}
        type="button"
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", id)}
        onClick={() => toggleIngredient(id)}
        aria-label={`${label}, ${priceText}${n > 0 ? `, selected ${n}` : ""}`}
        className={`relative shrink-0 rounded-3xl border-[3px] border-ink bg-card px-3 py-3 text-center transition-transform hover:-translate-y-1 ${
          n > 0 ? "ring-4 ring-primary" : ""
        }`}
      >
        {n > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-primary text-xs font-extrabold text-white">
            {n}
          </span>
        )}
        <LayerArt id={id} width={72} />
        <span className="mt-1 block font-display text-xs font-extrabold">{label}</span>
        <span className="block text-xs font-bold text-muted-foreground">{priceText}</span>
      </button>
    );
  };

  return (
    <div>
      {/* ---------- BUILDER ---------- */}
      <section id="builder" className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-3xl font-extrabold sm:text-4xl">BUILD YOUR BURGER</h2>
          <div className="flex gap-2" role="group" aria-label="Builder view">
            <button
              type="button"
              onClick={() => setView("stack")}
              className={`pill ${view === "stack" ? "pill-blue" : "pill-yellow"} h-11 px-4 text-sm`}
              aria-pressed={view === "stack"}
            >
              STACK VIEW
            </button>
            <button
              type="button"
              onClick={() => setView("counter")}
              className={`pill ${view === "counter" ? "pill-blue" : "pill-yellow"} h-11 px-4 text-sm`}
              aria-pressed={view === "counter"}
            >
              COUNTER VIEW
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr_300px]">
          {/* Left: presets + categories */}
          <div className="chunk-card p-4">
            <h3 className="font-display text-lg font-extrabold">BURGERS</h3>
            <div className="mt-3 space-y-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => loadPreset(p.layerIds)}
                  className={`w-full rounded-2xl border-2 border-ink px-3 py-2 text-left font-display font-extrabold transition-transform hover:-translate-y-0.5 ${
                    presetMatch?.id === p.id ? "bg-sun" : "bg-sun-soft"
                  }`}
                >
                  {p.name}
                  <span className="block text-xs font-semibold text-muted-foreground">{p.blurb}</span>
                </button>
              ))}
            </div>
            <h3 className="mt-6 font-display text-lg font-extrabold">STEPS</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_STEPS.map((s, i) => (
                <button
                  key={s.category}
                  type="button"
                  onClick={() => setStepIndex(i)}
                  className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-extrabold ${
                    i === stepIndex ? "bg-primary text-white" : "bg-sun-soft"
                  }`}
                >
                  {i + 1}. {s.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={randomStack} className="pill pill-purple h-10 flex-1 text-xs">
                <Dices className="h-4 w-4" aria-hidden="true" /> RANDOM
              </button>
              <button type="button" onClick={clearStack} className="pill pill-yellow h-10 flex-1 text-xs">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> CLEAR
              </button>
            </div>
          </div>

          {/* Centre: live stack or counter */}
          <div
            className={`chunk-surface p-4 sm:p-6 ${dragOver ? "drop-glow" : ""} ${
              view === "counter" ? "steel-surface" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const id = e.dataTransfer.getData("text/plain");
              if (id) addIngredient(id);
            }}
          >
            {view === "stack" ? (
              <>
                <p className="text-center font-display text-sm font-extrabold tracking-wide">
                  DRAG OR CLICK INGREDIENTS TO BUILD
                </p>
                <div className="mt-4 rounded-3xl border-[3px] border-ink bg-sun px-4 py-6 shadow-[6px_6px_0_0_var(--ink)]">
                  <StackArt layers={layers} />
                </div>
                <p className="mt-4 text-center text-sm font-bold">
                  Layers: {layers.length} · Height: {stackHeightLabel(layers.length)}
                  {addedFlash ? " · ADDED!" : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-center font-display text-sm font-extrabold tracking-wide">
                  TOP-DOWN COUNTER — CLICK A TRAY, BOTTLE OR CARTON
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1.4fr_1fr]">
                  <div className="space-y-2">
                    <p className="font-display text-xs font-extrabold">INGREDIENT TRAYS</p>
                    {INGREDIENTS.map((ing) => (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => toggleIngredient(ing.id)}
                        className="flex w-full items-center justify-between rounded-2xl border-2 border-ink bg-card px-3 py-1.5 text-left text-xs font-extrabold"
                      >
                        <span>{ing.name}</span>
                        <span>{formatRs(ing.price)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-3xl border-[3px] border-ink bg-sun px-4 py-4">
                    <p className="text-center font-display text-xs font-extrabold">YOUR BOX</p>
                    <div className="mt-2">
                      <StackArt layers={layers} width={200} />
                    </div>
                    <div className="mt-3 flex justify-center gap-3">
                      {[
                        { id: "mustard", label: "MUSTARD", cls: "bg-[#F2C200]" },
                        { id: "ketchup", label: "KETCHUP", cls: "bg-[#E11D2E] text-white" },
                        { id: "mayo", label: "MAYO", cls: "bg-[#F5E7BE]" },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => toggleIngredient(b.id)}
                          className={`rounded-full border-2 border-ink px-3 py-2 text-xs font-extrabold ${b.cls}`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-display text-xs font-extrabold">SIDES CARTONS</p>
                    {SIDES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => cart.addSide(s.id, s.name, s.price)}
                        className="w-full rounded-2xl border-2 border-ink bg-sun px-3 py-3 text-left"
                      >
                        <span className="block font-display text-sm font-extrabold">{s.name}</span>
                        <span className="block text-xs font-bold">{s.blurb}</span>
                        <span className="mt-1 block text-xs font-extrabold">{formatRs(s.price)} — ADD</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: order summary */}
          <div className="chunk-card p-4">
            <h3 className="font-display text-lg font-extrabold">YOUR ORDER</h3>
            {layers.length === 0 ? (
              <p className="mt-3 text-sm font-semibold text-muted-foreground">
                Add a layer to start your burger.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {layers.map((layer) => (
                  <li key={layer.uid} className="flex items-center justify-between gap-2 text-sm font-bold">
                    <span>{ingredientById(layer.ingredientId).name}</span>
                    <span className="flex items-center gap-2">
                      <span>{formatRs(ingredientById(layer.ingredientId).price)}</span>
                      <button
                        type="button"
                        onClick={() => removeLayer(layer.uid)}
                        aria-label={`Remove ${ingredientById(layer.ingredientId).name}`}
                        className="rounded-full p-1 hover:bg-ink/10"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 border-t-2 border-dashed border-ink/30 pt-3">
              <div className="flex justify-between font-display text-xl font-extrabold">
                <span>TOTAL</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={price}
                    initial={reduce ? false : { scale: 1.25 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {formatRs(price)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">
                Base {formatRs(150)} included · Delivery Rs 120 at checkout
              </p>
            </div>
            <button type="button" onClick={addToOrder} className="pill pill-blue mt-4 h-12 w-full">
              ADD TO ORDER
            </button>
            <p className="mt-2 text-center text-xs font-semibold text-muted-foreground">
              {presetMatch ? `Preset: ${presetMatch.name}` : "Custom burger — built by you"}
            </p>
          </div>
        </div>

        {/* Bottom selector strip */}
        <div className="chunk-card mt-6 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-xl font-extrabold">{step.stepLabel}</h3>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                className="pill pill-yellow h-10 px-4 text-xs"
              >
                ← BACK
              </button>
              <button
                type="button"
                disabled={stepIndex === CATEGORY_STEPS.length - 1}
                onClick={() => setStepIndex((i) => Math.min(CATEGORY_STEPS.length - 1, i + 1))}
                className="pill pill-blue h-10 px-4 text-xs"
              >
                NEXT STEP →
              </button>
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            {CATEGORY_STEPS.map((s, i) => (
              <span
                key={s.category}
                className={`h-2 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-ink/20"}`}
                aria-hidden="true"
              />
            ))}
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {stepIngredients.map((ing) => tile(ing.id, ing.name, formatRs(ing.price)))}
          </div>
          <p className="mt-3 text-sm font-semibold text-muted-foreground">
            Click a tile to add or remove it — or drag it onto the burger. Step {stepIndex + 1} of{" "}
            {CATEGORY_STEPS.length}.
          </p>
        </div>
      </section>

      {/* ---------- SIDES ---------- */}
      <section id="sides" className="mx-auto w-full max-w-[1440px] px-4 pb-12 sm:px-6">
        <h2 className="font-display text-3xl font-extrabold sm:text-4xl">SIDES</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {SIDES.map((s) => (
            <div key={s.id} className="chunk-surface p-5 text-center">
              <p className="font-display text-xl font-extrabold">{s.name}</p>
              <p className="mt-1 text-sm font-semibold">{s.blurb}</p>
              <p className="mt-2 font-display text-lg font-extrabold">{formatRs(s.price)}</p>
              <button
                type="button"
                onClick={() => cart.addSide(s.id, s.name, s.price)}
                className="pill pill-blue mt-3 h-11 w-full"
              >
                ADD
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
