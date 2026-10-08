"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import {
  addCartItem,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/api/cart";
import { EMPTY_CART, type CartItem, type CartSummary } from "@/types/cart";

interface QuantitySync {
  confirmed: number;
  desired: number;
  inFlightTarget: number | null;
  syncing: boolean;
  timer: ReturnType<typeof setTimeout> | null;
  promise: Promise<void> | null;
}

function summarize(items: CartItem[]): CartSummary {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + item.subtotal, 0);

  return {
    items,
    totalItems,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
}

function withItemQuantity(
  cart: CartSummary,
  cartItemId: number,
  quantity: number,
) {
  return summarize(
    cart.items.map((item) =>
      item.id === cartItemId
        ? {
            ...item,
            quantity,
            subtotal: Math.round(item.unitPrice * quantity * 100) / 100,
          }
        : item,
    ),
  );
}

interface CustomerCartContextValue {
  cart: CartSummary;
  loading: boolean;
  loadError: string | null;
  refreshCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItemOptimistically: (cartItemId: number, quantity: number) => void;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CustomerCartContext = createContext<CustomerCartContextValue | null>(null);

export function CustomerCartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const [loadedUserId, setLoadedUserId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const cartRef = useRef<CartSummary>(EMPTY_CART);
  const quantitySyncs = useRef(new Map<number, QuantitySync>());

  const replaceCart = useCallback((nextCart: CartSummary) => {
    cartRef.current = nextCart;
    setCart(nextCart);
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      const nextCart = await getCart();
      replaceCart(nextCart);
      setLoadError(null);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load your cart",
      );
      throw error;
    }
  }, [replaceCart]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let cancelled = false;

    void getCart()
      .then((nextCart) => {
        if (!cancelled) {
          replaceCart(nextCart);
          setLoadedUserId(user.id);
          setLoadError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          replaceCart(EMPTY_CART);
          setLoadedUserId(user.id);
          setLoadError(
            error instanceof Error ? error.message : "Unable to load your cart",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, replaceCart, user]);

  const addItem = useCallback(
    async (productId: number, quantity = 1) => {
      const createdItem = await addCartItem(productId, quantity);
      const otherItems = cartRef.current.items.filter(
        (item) => item.id !== createdItem.id,
      );
      replaceCart(summarize([...otherItems, createdItem]));
    },
    [replaceCart],
  );

  const syncOptimisticQuantity = useCallback(
    async (cartItemId: number) => {
      const sync = quantitySyncs.current.get(cartItemId);

      if (!sync || sync.syncing) {
        return;
      }

      sync.syncing = true;
      sync.timer = null;

      const work = (async () => {
        try {
          while (true) {
            const target = sync.desired;
            sync.inFlightTarget = target;
            await updateCartItem(cartItemId, target);
            sync.confirmed = target;

            if (sync.desired === target) {
              quantitySyncs.current.delete(cartItemId);
              return;
            }
          }
        } catch (error) {
          quantitySyncs.current.delete(cartItemId);

          try {
            const authoritativeCart = await getCart();
            replaceCart(authoritativeCart);
          } catch {
            replaceCart(
              withItemQuantity(
                cartRef.current,
                cartItemId,
                sync.confirmed,
              ),
            );
          }

          toast.error(
            error instanceof Error
              ? `${error.message}. Quantity was restored.`
              : "Unable to update quantity. The previous quantity was restored.",
          );
        } finally {
          sync.syncing = false;
          sync.inFlightTarget = null;
        }
      })();

      sync.promise = work;
      await work;
    },
    [replaceCart],
  );

  const updateItemOptimistically = useCallback(
    (cartItemId: number, quantity: number) => {
      const currentItem = cartRef.current.items.find(
        (item) => item.id === cartItemId,
      );

      if (!currentItem) {
        return;
      }

      const nextQuantity = Math.max(
        1,
        Math.min(quantity, currentItem.stockQuantity),
      );
      let sync = quantitySyncs.current.get(cartItemId);

      if (!sync) {
        sync = {
          confirmed: currentItem.quantity,
          desired: nextQuantity,
          inFlightTarget: null,
          syncing: false,
          timer: null,
          promise: null,
        };
        quantitySyncs.current.set(cartItemId, sync);
      } else {
        sync.desired = nextQuantity;
      }

      replaceCart(withItemQuantity(cartRef.current, cartItemId, nextQuantity));

      if (!sync.syncing) {
        if (sync.timer) {
          clearTimeout(sync.timer);
        }

        sync.timer = setTimeout(() => {
          void syncOptimisticQuantity(cartItemId);
        }, 180);
      }
    },
    [replaceCart, syncOptimisticQuantity],
  );

  const settleQuantitySync = useCallback(async (cartItemId: number) => {
    const sync = quantitySyncs.current.get(cartItemId);

    if (!sync) {
      return;
    }

    if (sync.timer && !sync.syncing) {
      clearTimeout(sync.timer);
      quantitySyncs.current.delete(cartItemId);
      return;
    }

    if (sync.syncing) {
      sync.desired = sync.inFlightTarget ?? sync.confirmed;
      await sync.promise;
    }
  }, []);

  const removeItem = useCallback(
    async (cartItemId: number) => {
      await settleQuantitySync(cartItemId);
      await removeCartItem(cartItemId);
      replaceCart(
        summarize(
          cartRef.current.items.filter((item) => item.id !== cartItemId),
        ),
      );
    },
    [replaceCart, settleQuantitySync],
  );

  const clearCart = useCallback(async () => {
    for (const sync of quantitySyncs.current.values()) {
      if (sync.timer) {
        clearTimeout(sync.timer);
      }
    }
    quantitySyncs.current.clear();
    await clearCartRequest();
    replaceCart(EMPTY_CART);
  }, [replaceCart]);

  const value = useMemo(
    () => ({
      cart: user && loadedUserId === user.id ? cart : EMPTY_CART,
      loading: authLoading || Boolean(user && loadedUserId !== user.id),
      loadError: user ? loadError : null,
      refreshCart,
      addItem,
      updateItemOptimistically,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      authLoading,
      cart,
      clearCart,
      loadedUserId,
      loadError,
      refreshCart,
      removeItem,
      updateItemOptimistically,
      user,
    ],
  );

  return (
    <CustomerCartContext.Provider value={value}>
      {children}
    </CustomerCartContext.Provider>
  );
}

export function useCustomerCart() {
  const context = useContext(CustomerCartContext);

  if (!context) {
    throw new Error("useCustomerCart must be used inside CustomerCartProvider");
  }

  return context;
}
