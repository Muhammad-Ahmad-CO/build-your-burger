// ============= Full file contents =============

export type Category = "bread" | "patty" | "cheese" | "veggies" | "sauce" | "extras";

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  price: number;
  /** Only for bread: where the bun sits in the stack. */
  slot?: "bottom" | "top";
}

export interface Preset {
  id: string;
  name: string;
  blurb: string;
  /** Ingredient ids, bottom → top. */
  layerIds: string[];
}

export interface Side {
  id: string;
  name: string;
  blurb: string;
  price: number;
}

/** Placeholder prices until TODO 2 (real menu prices) is supplied. Currency: Rs. */
export const BASE_PRICE = 150;
export const DELIVERY_FEE = 120;

export const CATEGORY_STEPS: { category: Category; label: string; stepLabel: string }[] = [
  { category: "bread", label: "BREAD", stepLabel: "SELECT YOUR BREAD" },
  { category: "patty", label: "PATTY", stepLabel: "PICK YOUR PATTY" },
  { category: "cheese", label: "CHEESE", stepLabel: "CHOOSE YOUR CHEESE" },
  { category: "veggies", label: "VEGGIES", stepLabel: "STACK YOUR VEGGIES" },
  { category: "sauce", label: "SAUCE", stepLabel: "DRIZZLE THE SAUCE" },
  { category: "extras", label: "EXTRAS", stepLabel: "ADD THE EXTRAS" },
];

export const INGREDIENTS: Ingredient[] = [
  // BREAD
  { id: "bottom-bun", name: "BOTTOM BUN", category: "bread", price: 40, slot: "bottom" },
  { id: "top-bun", name: "SESAME TOP BUN", category: "bread", price: 40, slot: "top" },
  // PATTY
  { id: "beef-patty", name: "BEEF PATTY", category: "patty", price: 180 },
  { id: "chicken-patty", name: "CRISPY CHICKEN", category: "patty", price: 170 },
  { id: "veggie-patty", name: "VEGGIE PATTY", category: "patty", price: 150 },
  // CHEESE
  { id: "cheddar", name: "CHEDDAR MELT", category: "cheese", price: 60 },
  { id: "smoked-cheese", name: "SMOKED CHEESE", category: "cheese", price: 70 },
  // VEGGIES
  { id: "tomato", name: "TOMATO", category: "veggies", price: 30 },
  { id: "lettuce", name: "LETTUCE", category: "veggies", price: 30 },
  { id: "onion", name: "ONIONS", category: "veggies", price: 25 },
  { id: "jalapeno", name: "JALAPEÑOS", category: "veggies", price: 40 },
  { id: "pickle", name: "PICKLES", category: "veggies", price: 35 },
  // SAUCE
  { id: "ketchup", name: "KETCHUP", category: "sauce", price: 20 },
  { id: "mustard", name: "MUSTARD", category: "sauce", price: 20 },
  { id: "mayo", name: "MAYO", category: "sauce", price: 25 },
  { id: "hot-sauce", name: "HOT SAUCE", category: "sauce", price: 30 },
  // EXTRAS
  { id: "crispy-onions", name: "CRISPY ONIONS", category: "extras", price: 45 },
  { id: "fried-egg", name: "FRIED EGG", category: "extras", price: 60 },
];

export const PRESETS: Preset[] = [
  {
    id: "double-good",
    name: "DOUBLE GOOD",
    blurb: "The signature stack",
    layerIds: ["bottom-bun", "beef-patty", "cheddar", "tomato", "lettuce", "top-bun"],
  },
  {
    id: "classic-beef",
    name: "CLASSIC BEEF",
    blurb: "Simple, honest, beefy",
    layerIds: ["bottom-bun", "beef-patty", "cheddar", "lettuce", "tomato", "top-bun"],
  },
  {
    id: "fiery-double",
    name: "FIERY DOUBLE",
    blurb: "Two patties, one warning",
    layerIds: [
      "bottom-bun",
      "beef-patty",
      "beef-patty",
      "smoked-cheese",
      "jalapeno",
      "hot-sauce",
      "top-bun",
    ],
  },
  {
    id: "garden-stack",
    name: "GARDEN STACK",
    blurb: "Veggie patty, full garden",
    layerIds: [
      "bottom-bun",
      "veggie-patty",
      "cheddar",
      "tomato",
      "onion",
      "lettuce",
      "mayo",
      "top-bun",
    ],
  },
];

export const SIDES: Side[] = [
  { id: "fries", name: "FRIES", blurb: "Golden, salty, impossible to share.", price: 180 },
  { id: "onion-rings", name: "ONION RINGS", blurb: "Crunchy golden hoops of joy.", price: 200 },
  { id: "nuggets", name: "NUGGETS (6)", blurb: "Six crispy bites, zero regrets.", price: 250 },
];

// ---- Pure stack logic (shared by builder, counter view and tests) ----

export interface StackLayer {
  uid: string;
  ingredientId: string;
}

function rankOf(id: string): number {
  const ing = INGREDIENTS.find((i) => i.id === id);
  if (!ing) return 5;
  if (ing.category === "bread") return ing.slot === "top" ? 6 : 0;
  return { bread: 0, patty: 1, cheese: 2, veggies: 3, sauce: 4, extras: 5 }[ing.category];
}

/**
 * Index where a new layer of `ingredientId` should be inserted, so that
 * bread-bottom < patty < cheese < veggies < sauce < extras < bread-top.
 * Same-rank layers stack on top of each other (double patty, double cheese).
 */
export function insertIndex(layers: StackLayer[], ingredientId: string): number {
  const r = rankOf(ingredientId);
  return layers.filter((l) => rankOf(l.ingredientId) <= r).length;
}

export function layersPrice(layers: StackLayer[]): number {
  return (
    BASE_PRICE +
    layers.reduce((sum, l) => {
      const ing = INGREDIENTS.find((i) => i.id === l.ingredientId);
      return sum + (ing ? ing.price : 0);
    }, 0)
  );
}

export function stackHeightLabel(count: number): "SHORT" | "TALL" | "EXTRA TALL" {
  if (count < 4) return "SHORT";
  if (count < 8) return "TALL";
  return "EXTRA TALL";
}

export function formatRs(n: number): string {
  return `Rs ${Math.round(n).toLocaleString("en-PK")}`;
}

/** The default builder stack (DOUBLE GOOD preset). */
export function defaultStack(): StackLayer[] {
  return PRESETS[0].layerIds.map((ingredientId, i) => ({
    uid: `seed-${i}-${ingredientId}`,
    ingredientId,
  }));
}

let uidCounter = 0;
export function makeLayer(ingredientId: string): StackLayer {
  uidCounter += 1;
  return { uid: `l${uidCounter}-${ingredientId}`, ingredientId };
}

export function ingredientById(id: string): Ingredient {
  const ing = INGREDIENTS.find((i) => i.id === id);
  if (!ing) throw new Error(`Unknown ingredient: ${id}`);
  return ing;
}
