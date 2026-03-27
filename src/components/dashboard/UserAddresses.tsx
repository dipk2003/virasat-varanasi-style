import { FormEvent, useEffect, useState } from "react";
import {
  Check,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CustomerAddress,
  formatAddressLines,
  isMissingRelationError,
  normalizeAddress,
  untypedDb,
} from "@/lib/commerce";

type AddressFormState = {
  label: string;
  full_name: string;
  phone: string;
  company_name: string;
  address_line1: string;
  address_line2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
};

const defaultFormState: AddressFormState = {
  label: "Home",
  full_name: "",
  phone: "",
  company_name: "",
  address_line1: "",
  address_line2: "",
  landmark: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
  is_default_shipping: true,
  is_default_billing: true,
};

const textInputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground transition-colors focus:border-accent focus:outline-none";

const UserAddresses = () => {
  const db = untypedDb;
  const { user } = useAuth();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [relationReady, setRelationReady] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(defaultFormState);

  const fetchAddresses = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await db
      .from("customer_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelationError(error)) {
        setRelationReady(false);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setAddresses([]);
      setLoading(false);
      return;
    }

    setRelationReady(true);
    setAddresses((data || []) as CustomerAddress[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const resetForm = () => {
    const shouldDefault = addresses.length === 0;
    setForm({
      ...defaultFormState,
      is_default_shipping: shouldDefault,
      is_default_billing: shouldDefault,
    });
    setEditingId(null);
  };

  const startEdit = (address: CustomerAddress) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      company_name: address.company_name || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      landmark: address.landmark || "",
      city: address.city,
      state: address.state,
      country: address.country || "India",
      pincode: address.pincode,
      is_default_shipping: address.is_default_shipping,
      is_default_billing: address.is_default_billing,
    });
  };

  const clearDefaults = async (field: "is_default_shipping" | "is_default_billing") => {
    if (!user) return;
    await db.from("customer_addresses").update({ [field]: false }).eq("user_id", user.id);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    if (form.is_default_shipping) await clearDefaults("is_default_shipping");
    if (form.is_default_billing) await clearDefaults("is_default_billing");

    const normalized = normalizeAddress(form);
    const payload = {
      user_id: user.id,
      label: form.label.trim() || "Address",
      full_name: normalized.full_name,
      phone: normalized.phone,
      company_name: normalized.company_name || null,
      address_line1: normalized.address_line1,
      address_line2: normalized.address_line2 || null,
      landmark: normalized.landmark || null,
      city: normalized.city,
      state: normalized.state,
      country: normalized.country || "India",
      pincode: normalized.pincode,
      is_default_shipping: form.is_default_shipping,
      is_default_billing: form.is_default_billing,
    };

    const query = editingId
      ? db.from("customer_addresses").update(payload).eq("id", editingId)
      : db.from("customer_addresses").insert(payload);

    const { error } = await query;
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: editingId ? "Address updated" : "Address saved" });
    resetForm();
    fetchAddresses();
  };

  const setDefault = async (addressId: string, field: "is_default_shipping" | "is_default_billing") => {
    if (!user) return;

    setSaving(true);
    await clearDefaults(field);
    const { error } = await db.from("customer_addresses").update({ [field]: true }).eq("id", addressId);
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Default updated" });
    fetchAddresses();
  };

  const removeAddress = async (addressId: string) => {
    const { error } = await db.from("customer_addresses").delete().eq("id", addressId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Address removed" });
    if (editingId === addressId) resetForm();
    fetchAddresses();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading addresses...</div>;

  if (!relationReady) {
    return (
      <div className="rounded-[28px] border border-border/80 bg-card/95 p-6">
        <h2 className="font-display text-2xl text-foreground">Saved Addresses</h2>
        <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
          Address book UI ready hai, but `customer_addresses` table abhi database me apply nahi hui.
          Foundation migration run karte hi ye premium address desk live ho jayega.
        </p>
      </div>
    );
  }

  const shippingDefaults = addresses.filter((address) => address.is_default_shipping).length;
  const billingDefaults = addresses.filter((address) => address.is_default_billing).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.1),transparent_34%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 shadow-[0_22px_70px_-44px_hsl(var(--gold)/0.45)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="font-ui text-[10px] tracking-[0.28em] uppercase text-accent">
              Delivery Book
            </p>
            <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Saved Addresses</h2>
            <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
              Checkout ko faster aur dependable banane ke liye shipping aur billing addresses yahan se
              manage karo. Primary address set hone ke baad repeat orders me friction kam ho jata hai.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark"
          >
            <Plus size={14} />
            New Address
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/70 bg-background/65 p-5">
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Saved Locations
            </p>
            <p className="mt-3 font-display text-4xl text-foreground">{addresses.length}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">Home, work, gifting, ya alternate delivery spots.</p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-background/65 p-5">
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Shipping Defaults
            </p>
            <p className="mt-3 font-display text-4xl text-foreground">{shippingDefaults}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">Checkout ke time preferred delivery location auto-select hota hai.</p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-background/65 p-5">
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
              Billing Defaults
            </p>
            <p className="mt-3 font-display text-4xl text-foreground">{billingDefaults}</p>
            <p className="mt-2 font-body text-sm text-muted-foreground">Invoices aur repeat orders ke liye clean default setup rakho.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border bg-card/95 p-10 text-center">
              <MapPin size={36} className="mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 font-display text-2xl text-foreground">No saved addresses yet</h3>
              <p className="mx-auto mt-3 max-w-lg font-body text-sm leading-7 text-muted-foreground">
                Pehla delivery address add karo. Phir checkout aur address selection dono premium aur faster feel honge.
              </p>
              <button
                onClick={resetForm}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 px-5 py-3 font-ui text-[10px] tracking-[0.22em] uppercase text-accent"
              >
                <Plus size={14} />
                Add Your First Address
              </button>
            </div>
          ) : (
            addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-2xl text-foreground">{address.label}</h3>
                      {address.is_default_shipping && (
                        <span className="rounded-full bg-accent/10 px-3 py-1 font-ui text-[10px] tracking-[0.18em] uppercase text-accent">
                          Default Shipping
                        </span>
                      )}
                      {address.is_default_billing && (
                        <span className="rounded-full bg-primary/10 px-3 py-1 font-ui text-[10px] tracking-[0.18em] uppercase text-primary">
                          Default Billing
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-1.5">
                      {formatAddressLines(address).map((line) => (
                        <p key={line} className="font-body text-sm leading-6 text-muted-foreground">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(address)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => removeAddress(address.id)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/70 text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {!address.is_default_shipping && (
                    <button
                      onClick={() => setDefault(address.id, "is_default_shipping")}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-ui text-[10px] tracking-[0.18em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <Star size={12} />
                      Make Shipping Default
                    </button>
                  )}
                  {!address.is_default_billing && (
                    <button
                      onClick={() => setDefault(address.id, "is_default_billing")}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 font-ui text-[10px] tracking-[0.18em] uppercase text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Star size={12} />
                      Make Billing Default
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[30px] border border-border/80 bg-card/95 p-6 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)] sm:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">
                {editingId ? "Edit Address" : "New Address"}
              </p>
              <h3 className="mt-3 font-display text-3xl text-foreground">
                {editingId ? "Update Delivery Details" : "Add Address"}
              </h3>
              <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
                Ye address checkout, invoice, aur future repeat shopping me reuse ho payegi.
              </p>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent sm:flex">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <section className="space-y-4">
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Contact & Label
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "label", label: "Label", required: true, placeholder: "Home / Studio / Gifting" },
                  { key: "full_name", label: "Full Name", required: true, placeholder: "Receiver name" },
                  { key: "phone", label: "Phone", required: true, placeholder: "Mobile number" },
                  { key: "company_name", label: "Company Name", required: false, placeholder: "Optional" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key as keyof AddressFormState] as string}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      className={textInputClass}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Street Details
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { key: "address_line1", label: "Address Line 1", required: true, placeholder: "House no, street, area" },
                  { key: "address_line2", label: "Address Line 2", required: false, placeholder: "Apartment, floor, locality" },
                  { key: "landmark", label: "Landmark", required: false, placeholder: "Opposite school / near temple" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key as keyof AddressFormState] as string}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      className={textInputClass}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  City & Delivery Zone
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "city", label: "City", required: true, placeholder: "City" },
                  { key: "state", label: "State", required: true, placeholder: "State" },
                  { key: "pincode", label: "Pincode", required: true, placeholder: "Postal code" },
                  { key: "country", label: "Country", required: false, placeholder: "Country" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={form[field.key as keyof AddressFormState] as string}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      placeholder={field.placeholder}
                      className={textInputClass}
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[22px] border border-border bg-background/60 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.is_default_shipping}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, is_default_shipping: event.target.checked }))
                  }
                  className="accent-[hsl(var(--gold))]"
                />
                <span className="font-body text-sm text-foreground">Use as default shipping address</span>
              </label>
              <label className="flex items-center gap-3 rounded-[22px] border border-border bg-background/60 px-4 py-4">
                <input
                  type="checkbox"
                  checked={form.is_default_billing}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, is_default_billing: event.target.checked }))
                  }
                  className="accent-[hsl(var(--gold))]"
                />
                <span className="font-body text-sm text-foreground">Use as default billing address</span>
              </label>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-foreground transition-colors hover:bg-muted"
              >
                <Check size={14} />
                Cancel Editing
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserAddresses;
