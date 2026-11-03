// ============= Full file contents =============

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DELIVERY_FEE } from "@/components/burger/data";

export interface BurgerCartItem {
  key: string;
  kind: "burger";
  name: string;
  /** Ingredient ids bottom → top. */
  layerIds: string[];
  price: number;
  qty: number;
}

export interface SideCartItem {
  key: string;
  kind: "side";
  sideId: string;
  name: string;
  price: number;
  qty: number;
}

export type CartItem = BurgerCartItem | SideCartItem;

export interface PlacedOrder {
  number: string;
  total: number;
  estimate: string;
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  drawerOpen: boolean;
  lastOrder: PlacedOrder | null;
  setDrawerOpen: (open: boolean) => void;
  addBurger: (name: string, layerIds: string[], unitPrice: number) => void;
  addSide: (sideId: string, name: string, price: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  checkout: () => PlacedOrder;
}

const CartContext = createContext<CartState | null>(null);
const CART_KEY = "dg-cart-v1";
const ORDER_KEY = "dg-last-order-v1";

function loadItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function loadLastOrder(): PlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ORDER_KEY);
    return raw ? (JSON.parse(raw) as PlacedOrder) : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadItems());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<PlacedOrder | null>(() => loadLastOrder());

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart just won't persist
    }
  }, [items]);

  const addBurger = useCallback(
    (name: string, layerIds: string[], unitPrice: number) => {
      setItems((prev) => {
        const fingerprint = layerIds.join(">");
        const existing = prev.find(
          (it) => it.kind === "burger" && it.layerIds.join(">") === fingerprint,
        );
        if (existing) {
          return prev.map((it) => (it.key === existing.key ? { ...it, qty: it.qty + 1 } : it));
        }
        return [
          ...prev,
          {
            key: `burger-${Date.now()}-${Math.floor(Math.random() * 1e5)}`,
            kind: "burger",
            name,
            layerIds,
            price: unitPrice,
            qty: 1,
          },
        ];
      });
    },
    [],
  );

  const addSide = useCallback((sideId: string, name: string, price: number) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.kind === "side" && it.sideId === sideId);
      if (existing) {
        return prev.map((it) => (it.key === existing.key ? { ...it, qty: it.qty + 1 } : it));
      }
      return [
        ...prev,
        { key: `side-${sideId}`, kind: "side", sideId, name, price, qty: 1 },
      ];
    });
  }, []);

  const increment = useCallback((key: string) => {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, qty: it.qty + 1 } : it)));
  }, []);

  const decrement = useCallback((key: string) => {
    setItems((prev) =>
      prev
        .map((it) => (it.key === key ? { ...it, qty: it.qty - 1 } : it))
        .filter((it) => it.qty > 0),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((it) => it.key !== key));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, it) => {
        return sum + it.price * it.qty;
      }, 0),
    [items],
  );

  const count = useMemo(() => items.reduce((n, it) => n + it.qty, 0), [items]);

  const checkout = useCallback((): PlacedOrder => {
    const total = subtotal + DELIVERY_FEE;
    const order: PlacedOrder = {
      number: `DG-${String(Math.floor(1000 + Math.random() * 9000))}`,
      total,
      estimate: "25–35 min",
    };
    setLastOrder(order);
    try {
      window.localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    } catch {
      // ignore
    }
    setItems([]);
    return order;
  }, [subtotal]);

  const value = useMemo<CartState>(
    () => ({
      items,
      count,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total: subtotal + DELIVERY_FEE,
      drawerOpen,
      lastOrder,
      setDrawerOpen,
      addBurger,
      addSide,
      increment,
      decrement,
      removeItem,
      clear,
      checkout,
    }),
    [items, count, subtotal, drawerOpen, lastOrder, addBurger, addSide, increment, decrement, removeItem, clear, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
