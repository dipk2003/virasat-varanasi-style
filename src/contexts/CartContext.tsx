import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  product?: {
    name: string;
    price: number;
    images: string[];
    stock_quantity: number;
  };
  variant_price?: number;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, size?: string, color?: string) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

type StoredCartItem = Pick<CartItem, "product_id" | "quantity" | "size" | "color">;

const GUEST_CART_STORAGE_KEY = "virasat:guest-cart";

const buildCartItemKey = (productId: string, size?: string, color?: string) =>
  `${productId}::${size || ""}::${color || ""}`;

const buildGuestCartItemId = (item: StoredCartItem) =>
  `guest:${buildCartItemKey(item.product_id, item.size, item.color)}`;

const normalizeStoredCartItem = (item: Partial<StoredCartItem>): StoredCartItem | null => {
  if (!item.product_id || typeof item.product_id !== "string") return null;

  const quantity = Number(item.quantity);
  if (!Number.isFinite(quantity) || quantity < 1) return null;

  return {
    product_id: item.product_id,
    quantity,
    size: item.size || undefined,
    color: item.color || undefined,
  };
};

const readGuestCart = (): StoredCartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => normalizeStoredCartItem(item))
      .filter((item): item is StoredCartItem => Boolean(item));
  } catch {
    return [];
  }
};

const writeGuestCart = (items: StoredCartItem[]) => {
  if (typeof window === "undefined") return;

  if (items.length === 0) {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
};

const clearGuestCartStorage = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
};

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  cartCount: 0,
  cartTotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const enrichCartItems = async (cartItems: CartItem[]) => {
    if (cartItems.length === 0) return [];

    const productIds = Array.from(new Set(cartItems.map((item) => item.product_id)));
    const { data: productData } = await supabase
      .from("products")
      .select("id, name, price, images, stock_quantity")
      .in("id", productIds);

    const productMap = new Map(
      ((productData || []) as Array<CartItem["product"] & { id: string }>).map((product) => [product.id, product])
    );

    return Promise.all(
      cartItems.map(async (item) => {
        let variantPrice: number | undefined;

        if (item.size || item.color) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("price_override")
            .eq("product_id", item.product_id)
            .eq("size", item.size || "")
            .eq("color", item.color || "")
            .eq("is_active", true)
            .maybeSingle();

          if (typeof variant?.price_override === "number") {
            variantPrice = variant.price_override;
          }
        }

        const product = productMap.get(item.product_id);

        return {
          ...item,
          product: product
            ? {
                name: product.name,
                price: product.price,
                images: product.images,
                stock_quantity: product.stock_quantity,
              }
            : undefined,
          variant_price: variantPrice,
        };
      })
    );
  };

  const fetchUserCart = async (userId: string) => {
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, size, color")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return enrichCartItems(((data || []) as CartItem[]));
  };

  const fetchGuestCart = async () => {
    const guestItems = readGuestCart().map((item) => ({
      id: buildGuestCartItemId(item),
      product_id: item.product_id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    return enrichCartItems(guestItems);
  };

  const syncGuestCartToUser = async (userId: string) => {
    const guestItems = readGuestCart();
    if (guestItems.length === 0) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, size, color")
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    const existingItems = (data || []) as CartItem[];
    const existingByKey = new Map(
      existingItems.map((item) => [buildCartItemKey(item.product_id, item.size, item.color), item])
    );

    for (const item of guestItems) {
      const existing = existingByKey.get(buildCartItemKey(item.product_id, item.size, item.color));

      if (existing) {
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existing.quantity + item.quantity })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }

        continue;
      }

      const { error: insertError } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      });

      if (insertError) {
        throw insertError;
      }
    }

    clearGuestCartStorage();
  };

  const refreshCart = async () => {
    setLoading(true);

    try {
      if (user?.id) {
        await syncGuestCartToUser(user.id);
        setItems(await fetchUserCart(user.id));
        return;
      }

      setItems(await fetchGuestCart());
    } catch (error: any) {
      toast({
        title: "Cart unavailable",
        description: error?.message || "We could not load your bag right now.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, [user?.id]);

  const addToCart = async (productId: string, size?: string, color?: string) => {
    if (user?.id) {
      const existing = items.find((item) => item.product_id === productId && item.size === size && item.color === color);

      if (existing) {
        await updateQuantity(existing.id, existing.quantity + 1);
        return;
      }

      const { error } = await supabase.from("cart_items").insert({
        user_id: user.id,
        product_id: productId,
        quantity: 1,
        size,
        color,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Added to cart!", description: "Item has been added to your bag." });
      await refreshCart();
      return;
    }

    const guestItems = readGuestCart();
    const existingGuestItem = guestItems.find(
      (item) => item.product_id === productId && item.size === size && item.color === color
    );

    const nextGuestItems = existingGuestItem
      ? guestItems.map((item) =>
          item.product_id === productId && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...guestItems, { product_id: productId, quantity: 1, size, color }];

    writeGuestCart(nextGuestItems);
    toast({ title: "Added to cart!", description: "Item has been added to your bag." });
    await refreshCart();
  };

  const removeFromCart = async (id: string) => {
    if (user?.id) {
      await supabase.from("cart_items").delete().eq("id", id);
      await refreshCart();
      return;
    }

    const nextGuestItems = readGuestCart().filter((item) => buildGuestCartItemId(item) !== id);
    writeGuestCart(nextGuestItems);
    await refreshCart();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) { await removeFromCart(id); return; }

    if (user?.id) {
      await supabase.from("cart_items").update({ quantity }).eq("id", id);
      await refreshCart();
      return;
    }

    const nextGuestItems = readGuestCart().map((item) =>
      buildGuestCartItemId(item) === id ? { ...item, quantity } : item
    );

    writeGuestCart(nextGuestItems);
    await refreshCart();
  };

  const clearCart = async () => {
    if (user?.id) {
      await supabase.from("cart_items").delete().eq("user_id", user.id);
      setItems([]);
      return;
    }

    clearGuestCartStorage();
    setItems([]);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => {
    const price = i.variant_price ?? i.product?.price ?? 0;
    return sum + price * i.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};
