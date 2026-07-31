"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  sku: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  spriteIndex: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "pudu-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function itemKey(item: Pick<CartItem, "sku" | "size">) {
  return `${item.sku}:${item.size}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setItems(
              parsed
                .filter(
                  (item): item is CartItem =>
                    typeof item === "object" &&
                    item !== null &&
                    typeof item.sku === "string" &&
                    typeof item.name === "string" &&
                    typeof item.price === "number" &&
                    typeof item.quantity === "number",
                )
                .slice(0, 20),
            );
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);

    return () => window.clearTimeout(hydrationTask);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [hydrated, items]);

  const addItem = useCallback((incoming: CartItem) => {
    setItems((current) => {
      const key = itemKey(incoming);
      const match = current.find((item) => itemKey(item) === key);
      const incomingQuantity = Math.max(
        1,
        Math.min(5, Math.floor(incoming.quantity)),
      );
      if (!match) {
        return [...current, { ...incoming, quantity: incomingQuantity }];
      }
      return current.map((item) =>
        itemKey(item) === key
          ? {
              ...item,
              quantity: Math.min(item.quantity + incomingQuantity, 5),
            }
          : item,
      );
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => itemKey(item) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    const normalized = Math.max(1, Math.min(5, Math.floor(quantity)));
    setItems((current) =>
      current.map((item) =>
        itemKey(item) === key ? { ...item, quantity: normalized } : item,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    }),
    [items, count, subtotal, hydrated, addItem, removeItem, updateQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe utilizarse dentro de CartProvider");
  return value;
}

export function getCartItemKey(item: Pick<CartItem, "sku" | "size">) {
  return itemKey(item);
}
