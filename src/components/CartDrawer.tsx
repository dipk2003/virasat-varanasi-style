import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-warm-black/50 z-50"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-background z-50 shadow-luxury flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-xl text-foreground">Shopping Bag ({cartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-display text-lg text-foreground mb-2">Your bag is empty</p>
                  <p className="font-body text-sm text-muted-foreground">Add some beautiful kurtis to your collection.</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 border-b border-border pb-4"
                  >
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-24 object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-sm text-foreground truncate">{item.product?.name}</h4>
                      {(item.size || item.color) && (
                        <p className="font-ui text-[10px] tracking-wider text-muted-foreground mt-0.5">
                          {item.size && `Size: ${item.size}`} {item.color && `• ${item.color}`}
                        </p>
                      )}
                      <p className="font-ui text-sm font-medium text-foreground mt-1">₹{(item.variant_price ?? item.product?.price)?.toLocaleString("en-IN")}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center border border-border hover:border-accent transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="font-ui text-sm w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center border border-border hover:border-accent transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-ui text-sm tracking-wider uppercase text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl text-foreground">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}
                  className="w-full py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3 border border-border text-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-muted transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
