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

  const fetchCart = async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("cart_items")
      .select("*, product:products(name, price, images, stock_quantity)")
      .eq("user_id", user.id);
    setItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId: string, size?: string, color?: string) => {
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be logged in to add items to cart.", variant: "destructive" });
      return;
    }
    const existing = items.find((i) => i.product_id === productId && i.size === size && i.color === color);
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
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Added to cart!", description: "Item has been added to your bag." });
      await fetchCart();
    }
  };

  const removeFromCart = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) { await removeFromCart(id); return; }
    await supabase.from("cart_items").update({ quantity }).eq("id", id);
    await fetchCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
};
