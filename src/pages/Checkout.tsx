import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Tag, Truck, ChevronLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CustomerAddress, formatAddressLines, isMissingRelationError, untypedDb } from "@/lib/commerce";

const FREE_SHIPPING_THRESHOLD = 2999;
const SHIPPING_COST = 199;

const Checkout = () => {
  const db = untypedDb;
  const navigate = useNavigate();
  const { items, cartTotal, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressBookReady, setAddressBookReady] = useState(true);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [saveAddressToBook, setSaveAddressToBook] = useState(false);

  const [address, setAddress] = useState({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);

  const applyAddress = (nextAddress: Partial<CustomerAddress>) => {
    setAddress({
      full_name: nextAddress.full_name || "",
      phone: nextAddress.phone || "",
      address_line1: nextAddress.address_line1 || "",
      address_line2: nextAddress.address_line2 || "",
      city: nextAddress.city || "",
      state: nextAddress.state || "",
      pincode: nextAddress.pincode || "",
    });
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true, state: { redirectTo: "/checkout" } });
      return;
    }

    if (cartLoading) return;
    if (items.length === 0 && !orderPlaced) { navigate("/shop"); return; }

    const fetchProfile = async () => {
      setAddressesLoading(true);
      const [profileRes, addressesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        db
          .from("customer_addresses")
          .select("*")
          .eq("user_id", user.id)
          .order("is_default_shipping", { ascending: false })
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.data) {
        applyAddress(profileRes.data);
      }

      if (addressesRes.error) {
        if (isMissingRelationError(addressesRes.error)) {
          setAddressBookReady(false);
        } else {
          toast({ title: "Address book unavailable", description: addressesRes.error.message, variant: "destructive" });
        }
      } else {
        const availableAddresses = (addressesRes.data || []) as CustomerAddress[];
        setAddressBookReady(true);
        setSavedAddresses(availableAddresses);

        const preferredAddress = availableAddresses.find((item) => item.is_default_shipping) || availableAddresses[0];
        if (preferredAddress) {
          setSelectedAddressId(preferredAddress.id);
          applyAddress(preferredAddress);
        } else {
          setSaveAddressToBook(true);
        }
      }

      setAddressesLoading(false);
    };
    fetchProfile();
  }, [cartLoading, db, user, items.length, navigate, orderPlaced, toast]);

  const shipping = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cartTotal - couponDiscount + shipping;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.trim().toUpperCase())
      .eq("is_active", true)
      .maybeSingle();

    if (!data) {
      toast({ title: "Invalid coupon", description: "This coupon code is not valid.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      toast({ title: "Expired", description: "This coupon has expired.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.max_uses && data.used_count >= data.max_uses) {
      toast({ title: "Limit reached", description: "This coupon has reached its usage limit.", variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    if (data.min_order_amount && cartTotal < Number(data.min_order_amount)) {
      toast({ title: "Minimum not met", description: `Minimum order of ₹${Number(data.min_order_amount).toLocaleString("en-IN")} required.`, variant: "destructive" });
      setCouponLoading(false);
      return;
    }

    const discount = data.discount_type === "percentage"
      ? Math.round(cartTotal * Number(data.discount_value) / 100)
      : Number(data.discount_value);

    setCouponDiscount(Math.min(discount, cartTotal));
    setCouponApplied(true);
    toast({ title: "Coupon applied!", description: `You saved ₹${Math.min(discount, cartTotal).toLocaleString("en-IN")}` });
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
  };

  const persistAddressToBook = async () => {
    if (!user || !addressBookReady || !saveAddressToBook || selectedAddressId) return;

    const payload = {
      user_id: user.id,
      label: savedAddresses.length === 0 ? "Primary Address" : "Checkout Address",
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: "India",
      is_default_shipping: savedAddresses.length === 0,
      is_default_billing: savedAddresses.length === 0,
    };

    const { data, error } = await db.from("customer_addresses").insert(payload).select("*").single();

    if (error) {
      toast({ title: "Address not saved", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      setSavedAddresses((current) => [data as CustomerAddress, ...current]);
      setSelectedAddressId(data.id);
      setSaveAddressToBook(false);
    }
  };

  const placeOrder = async () => {
    if (!address.full_name || !address.phone || !address.address_line1 || !address.city || !address.state || !address.pincode) {
      toast({ title: "Incomplete address", description: "Please fill in all required address fields.", variant: "destructive" });
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: "TEMP",
          subtotal: cartTotal,
          discount: couponDiscount,
          shipping_cost: shipping,
          total,
          coupon_code: couponApplied ? couponCode.toUpperCase() : null,
          shipping_address: address as Record<string, string>,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || "Product",
        quantity: item.quantity,
        price: item.product?.price || 0,
        size: item.size,
        color: item.color,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Decrement stock via security definer function
      for (const item of items) {
        await supabase.rpc("decrement_stock", { p_product_id: item.product_id, p_quantity: item.quantity });
      }

      // Send order confirmation notification
      await supabase.functions.invoke("order-notifications", {
        body: { order_id: order.id, type: "order_confirmed" },
      });

      await persistAddressToBook();
      await clearCart();
      setOrderNumber(order.order_number);
      setOrderPlaced(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order.";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 container mx-auto px-4 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
            <CheckCircle size={80} className="mx-auto text-accent mb-6" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-4xl text-foreground mb-4">
            Order Confirmed!
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-body text-lg text-muted-foreground mb-2">
            Thank you for shopping with Virasat
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="font-ui text-sm tracking-wider text-accent mb-8">
            Order #{orderNumber}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex justify-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors">
              View Orders
            </button>
            <button onClick={() => navigate("/shop")} className="px-8 py-3 border border-border text-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-muted transition-colors">
              Continue Shopping
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 container mx-auto px-4 text-center">
          <p className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground">Preparing your checkout</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 container mx-auto px-4">
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => navigate(-1)} className="flex items-center gap-1 font-ui text-xs tracking-wider text-muted-foreground hover:text-foreground mb-8">
          <ChevronLeft size={16} /> Back
        </motion.button>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-3xl text-foreground mb-10">
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Address + Coupon */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="border border-border p-6">
              <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                <Truck size={20} className="text-accent" /> Shipping Address
              </h2>

              {addressBookReady && (
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground">Saved Addresses</p>
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAddressId("");
                          setSaveAddressToBook(true);
                        }}
                        className="font-ui text-xs tracking-wider text-accent hover:underline"
                      >
                        Use a new address
                      </button>
                    )}
                  </div>

                  {addressesLoading ? (
                    <p className="font-body text-sm text-muted-foreground">Loading saved addresses...</p>
                  ) : savedAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((savedAddress) => (
                        <button
                          key={savedAddress.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(savedAddress.id);
                            setSaveAddressToBook(false);
                            applyAddress(savedAddress);
                          }}
                          className={`text-left border p-4 transition-colors ${
                            selectedAddressId === savedAddress.id
                              ? "border-accent bg-accent/5"
                              : "border-border hover:border-accent/40"
                          }`}
                        >
                          <p className="font-display text-base text-foreground mb-2">{savedAddress.label}</p>
                          {formatAddressLines(savedAddress).map((line) => (
                            <p key={line} className="font-body text-xs text-muted-foreground">
                              {line}
                            </p>
                          ))}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-sm text-muted-foreground">
                      No saved addresses yet. Current checkout address ko address book me save kar sakte ho.
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {([
                  { key: "full_name", label: "Full Name *", span: 1 },
                  { key: "phone", label: "Phone Number *", span: 1 },
                  { key: "address_line1", label: "Address Line 1 *", span: 2 },
                  { key: "address_line2", label: "Address Line 2", span: 2 },
                  { key: "city", label: "City *", span: 1 },
                  { key: "state", label: "State *", span: 1 },
                  { key: "pincode", label: "Pincode *", span: 1 },
                ] as const).map(({ key, label, span }) => (
                  <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
                    <label className="font-ui text-xs tracking-wider text-muted-foreground mb-1 block">{label}</label>
                    <input
                      type="text"
                      value={address[key]}
                      onChange={(e) => {
                        setSelectedAddressId("");
                        setAddress({ ...address, [key]: e.target.value });
                      }}
                      className="w-full px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-accent transition-colors"
                    />
                  </div>
                ))}
              </div>

              {addressBookReady && (
                <label className="mt-4 flex items-center gap-3 px-4 py-3 border border-border bg-background font-body text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={saveAddressToBook}
                    onChange={(event) => setSaveAddressToBook(event.target.checked)}
                    disabled={!!selectedAddressId}
                  />
                  Save this address to my address book
                </label>
              )}
            </motion.div>

            {/* Coupon */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="border border-border p-6">
              <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
                <Tag size={20} className="text-accent" /> Coupon Code
              </h2>
              {couponApplied ? (
                <div className="flex items-center justify-between bg-accent/10 px-4 py-3">
                  <div>
                    <span className="font-ui text-sm font-semibold text-accent">{couponCode.toUpperCase()}</span>
                    <span className="font-body text-sm text-muted-foreground ml-2">– ₹{couponDiscount.toLocaleString("en-IN")} off</span>
                  </div>
                  <button onClick={removeCoupon} className="font-ui text-xs text-destructive hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-4 py-3 border border-border bg-background font-body text-sm focus:outline-none focus:border-accent transition-colors uppercase"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="px-6 py-3 bg-accent text-accent-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right: Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:sticky lg:top-32 self-start">
            <div className="border border-border p-6">
              <h2 className="font-display text-xl text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-accent" /> Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-20 object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm text-foreground truncate">{item.product?.name}</p>
                      <p className="font-ui text-[10px] text-muted-foreground tracking-wider">
                        {item.size && `Size: ${item.size}`} {item.color && `• ${item.color}`}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-ui text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="font-ui text-sm text-foreground">₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between font-ui text-xs tracking-wider">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-ui text-xs tracking-wider">
                    <span className="text-accent">Discount</span>
                    <span className="text-accent">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-ui text-xs tracking-wider">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="font-body text-[10px] text-accent">Free shipping on orders above ₹{FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}!</p>
                )}
                <div className="flex justify-between pt-3 border-t border-border">
                  <span className="font-ui text-sm tracking-wider uppercase text-foreground">Total</span>
                  <span className="font-display text-2xl text-foreground">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="w-full mt-6 py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Placing Order..." : "Place Order"}
              </button>

              <p className="font-body text-[10px] text-muted-foreground text-center mt-3">
                By placing this order, you agree to our terms & conditions.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
