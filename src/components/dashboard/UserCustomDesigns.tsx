import { useEffect, useState } from "react";
import { ArrowRight, Clock3, MapPin, Palette, Ruler, Send, Shirt, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CustomDesignRequest, asStringArray, asStringRecord, formatCurrency, untypedDb } from "@/lib/commerce";
import ImageUpload from "@/components/admin/ImageUpload";

const statusColors: Record<string, string> = {
  submitted: "border-blue-200 bg-blue-50 text-blue-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
  in_production: "border-indigo-200 bg-indigo-50 text-indigo-700",
  completed: "border-green-200 bg-green-50 text-green-700",
};

const productCategories = ["kurti", "saree", "lehenga", "dupatta", "blouse", "co-ord set"];
const fabricOptions = ["Banarasi Silk", "Organza", "Cotton", "Chanderi", "Georgette", "Tissue", "Crepe", "Velvet"];
const weaveOptions = ["Kadhua", "Cutwork", "Jangla", "Tanchui", "Butidar", "Handloom", "Minimal weave"];
const occasionOptions = ["Daily wear", "Office wear", "Festive", "Wedding guest", "Bridal", "Gifting", "Shoot / campaign"];
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "Custom measurements"];
const addonOptions = ["Tassels", "Hand embroidery", "Fall & pico", "Lining", "Extra dupatta", "Matching blouse piece"];

const defaultForm = {
  product_category: "kurti",
  fabric_type: "",
  weave_style: "",
  color_preference: "",
  occasion: "",
  fit_type: "",
  sleeve_style: "",
  neckline: "",
  blouse_style: "",
  length_preference: "",
  embroidery_style: "",
  size: "",
  quantity: "1",
  budget_range: "",
  deadline_date: "",
  contact_phone: "",
  delivery_city: "",
  delivery_state: "",
  design_description: "",
  inspiration_notes: "",
  reference_images: [] as string[],
  addons: [] as string[],
  measurements: { bust: "", waist: "", hip: "", shoulder: "", sleeve_length: "", kurti_length: "", blouse_length: "" },
};

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground transition-colors focus:border-accent focus:outline-none";

const UserCustomDesigns = () => {
  const db = untypedDb;
  const { user } = useAuth();
  const { toast } = useToast();
  const [designs, setDesigns] = useState<CustomDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchDesigns = async () => {
    if (!user) return;
    const { data } = await db.from("custom_designs").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setDesigns((data || []) as CustomDesignRequest[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchDesigns();
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const measurements = Object.fromEntries(Object.entries(form.measurements).filter(([, value]) => value.trim()));
    const { error } = await db.from("custom_designs").insert({
      user_id: user.id,
      product_category: form.product_category,
      fabric_type: form.fabric_type || null,
      weave_style: form.weave_style || null,
      color_preference: form.color_preference || null,
      occasion: form.occasion || null,
      fit_type: form.fit_type || null,
      sleeve_style: form.sleeve_style || null,
      neckline: form.neckline || null,
      blouse_style: form.blouse_style || null,
      length_preference: form.length_preference || null,
      embroidery_style: form.embroidery_style || null,
      size: form.size || null,
      quantity: Number(form.quantity || 1),
      budget_range: form.budget_range || null,
      deadline_date: form.deadline_date || null,
      contact_phone: form.contact_phone || null,
      delivery_city: form.delivery_city || null,
      delivery_state: form.delivery_state || null,
      design_description: form.design_description.trim(),
      inspiration_notes: form.inspiration_notes || null,
      reference_images: form.reference_images,
      measurements,
      addons: form.addons,
      priority: form.deadline_date ? "high" : "normal",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Design brief submitted", description: "Team ko full custom inquiry mil gayi." });
    setShowForm(false);
    setForm(defaultForm);
    fetchDesigns();
  };

  const toggleAddon = (addon: string) => {
    setForm((current) => ({
      ...current,
      addons: current.addons.includes(addon) ? current.addons.filter((item) => item !== addon) : [...current.addons, addon],
    }));
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading design studio...</div>;

  const activeDesigns = designs.filter((design) => ["submitted", "under_review", "approved", "in_production"].includes(design.status)).length;
  const completedDesigns = designs.filter((design) => design.status === "completed").length;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.12),transparent_36%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 shadow-[0_22px_70px_-44px_hsl(var(--gold)/0.5)] sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-accent">Custom Atelier</p>
            <h2 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">Premium Design Brief Studio</h2>
            <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
              Saree, kurti, lehenga, blouse, ya festive gifting capsule ke liye detailed brief submit karo.
              Fabric, fit, craft, measurements, aur delivery notes ek hi flow me capture honge.
            </p>
          </div>
          <button
            onClick={() => setShowForm((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark"
          >
            {showForm ? "Close Brief" : "New Brief"}
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[22px] border border-border/70 bg-background/65 p-5">
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Total Briefs</p>
            <p className="mt-3 font-display text-4xl text-foreground">{designs.length}</p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-background/65 p-5">
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">In Progress</p>
            <p className="mt-3 font-display text-4xl text-foreground">{activeDesigns}</p>
          </div>
          <div className="rounded-[22px] border border-border/70 bg-background/65 p-5">
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Completed</p>
            <p className="mt-3 font-display text-4xl text-foreground">{completedDesigns}</p>
          </div>
        </div>
      </section>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-[30px] border border-border/80 bg-card/95 p-6 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">Brief Composer</p>
              <h3 className="mt-3 font-display text-3xl text-foreground">Build Your Design Request</h3>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent sm:flex">
              <Send size={18} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <select value={form.product_category} onChange={(event) => setForm({ ...form, product_category: event.target.value })} className={inputClass}>
                  {productCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select value={form.fabric_type} onChange={(event) => setForm({ ...form, fabric_type: event.target.value })} className={inputClass}>
                  <option value="">Select fabric</option>
                  {fabricOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select value={form.weave_style} onChange={(event) => setForm({ ...form, weave_style: event.target.value })} className={inputClass}>
                  <option value="">Select weave</option>
                  {weaveOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <select value={form.occasion} onChange={(event) => setForm({ ...form, occasion: event.target.value })} className={inputClass}>
                  <option value="">Select occasion</option>
                  {occasionOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input type="text" value={form.color_preference} onChange={(event) => setForm({ ...form, color_preference: event.target.value })} placeholder="Color preference" className={inputClass} />
                <select value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} className={inputClass}>
                  <option value="">Select size</option>
                  {sizeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <input type="text" value={form.fit_type} onChange={(event) => setForm({ ...form, fit_type: event.target.value })} placeholder="Fit notes" className={inputClass} />
                <input type="text" value={form.sleeve_style} onChange={(event) => setForm({ ...form, sleeve_style: event.target.value })} placeholder="Sleeve style" className={inputClass} />
                <input type="text" value={form.neckline} onChange={(event) => setForm({ ...form, neckline: event.target.value })} placeholder="Neckline" className={inputClass} />
                <input type="text" value={form.blouse_style} onChange={(event) => setForm({ ...form, blouse_style: event.target.value })} placeholder="Blouse style" className={inputClass} />
                <input type="text" value={form.length_preference} onChange={(event) => setForm({ ...form, length_preference: event.target.value })} placeholder="Length preference" className={inputClass} />
                <input type="text" value={form.embroidery_style} onChange={(event) => setForm({ ...form, embroidery_style: event.target.value })} placeholder="Embroidery / finish" className={inputClass} />
              </div>

              <textarea value={form.design_description} onChange={(event) => setForm({ ...form, design_description: event.target.value })} required rows={5} placeholder="Design description" className={`${inputClass} resize-none`} />
              <textarea value={form.inspiration_notes} onChange={(event) => setForm({ ...form, inspiration_notes: event.target.value })} rows={4} placeholder="Reference notes" className={`${inputClass} resize-none`} />
              <div className="rounded-[24px] border border-border/70 bg-background/55 p-5">
                <ImageUpload
                  images={form.reference_images}
                  onChange={(images) => setForm((current) => ({ ...current, reference_images: images }))}
                  bucket="design-reference-images"
                  maxImages={4}
                  label="Reference Images"
                  helperText="Customer inspiration images • JPG, PNG, WebP"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input type="number" min="1" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Quantity" className={inputClass} />
                <input type="text" value={form.budget_range} onChange={(event) => setForm({ ...form, budget_range: event.target.value })} placeholder="Budget range" className={inputClass} />
                <input type="date" value={form.deadline_date} onChange={(event) => setForm({ ...form, deadline_date: event.target.value })} className={inputClass} />
                <input type="tel" value={form.contact_phone} onChange={(event) => setForm({ ...form, contact_phone: event.target.value })} placeholder="Contact phone" className={inputClass} />
                <input type="text" value={form.delivery_city} onChange={(event) => setForm({ ...form, delivery_city: event.target.value })} placeholder="Delivery city" className={inputClass} />
                <input type="text" value={form.delivery_state} onChange={(event) => setForm({ ...form, delivery_state: event.target.value })} placeholder="Delivery state" className={inputClass} />
              </div>

              <div className="rounded-[24px] border border-border/70 bg-background/55 p-5">
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Add-ons</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {addonOptions.map((addon) => (
                    <button
                      key={addon}
                      type="button"
                      onClick={() => toggleAddon(addon)}
                      className={`rounded-full px-4 py-2 font-ui text-[10px] tracking-[0.18em] uppercase ${
                        form.addons.includes(addon)
                          ? "border border-accent bg-accent/10 text-accent"
                          : "border border-border bg-background/60 text-muted-foreground"
                      }`}
                    >
                      {addon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-border/70 bg-background/55 p-5">
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Measurements</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Object.entries(form.measurements).map(([key, value]) => (
                    <input
                      key={key}
                      type="text"
                      value={value}
                      onChange={(event) => setForm((current) => ({ ...current, measurements: { ...current.measurements, [key]: event.target.value } }))}
                      placeholder={key.replace("_", " ")}
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50">
              <Send size={14} />
              {submitting ? "Submitting..." : "Submit Custom Brief"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-border px-6 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-foreground transition-colors hover:bg-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      {designs.length === 0 && !showForm ? (
        <div className="rounded-[30px] border border-dashed border-border bg-card/95 p-10 text-center">
          <Palette size={42} className="mx-auto text-muted-foreground/30" />
          <h3 className="mt-4 font-display text-3xl text-foreground">No custom briefs yet</h3>
          <p className="mx-auto mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
            Apna pehla made-to-order brief submit karo aur atelier workflow yahin se manage karo.
          </p>
          <button onClick={() => setShowForm(true)} className="mt-6 inline-flex items-center gap-2 rounded-full border border-accent/30 px-5 py-3 font-ui text-[10px] tracking-[0.22em] uppercase text-accent">
            Start Design Brief
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {designs.map((design) => {
            const measurements = Object.entries(asStringRecord(design.measurements)).slice(0, 4).map(([key, value]) => `${key.replace("_", " ")} ${value}`).join(" • ");
            return (
              <article key={design.id} className="rounded-[30px] border border-border/80 bg-card/95 p-6 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                      Submitted {new Date(design.created_at).toLocaleDateString("en-IN")}
                    </p>
                    <h3 className="mt-3 font-display text-3xl text-foreground">{design.product_category || "Custom piece"} brief</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {design.estimated_price && (
                      <span className="rounded-full border border-border bg-background/70 px-3 py-1 font-ui text-[10px] tracking-[0.18em] uppercase text-foreground">
                        Estimate {formatCurrency(design.estimated_price)}
                      </span>
                    )}
                    <span className={`rounded-full border px-3 py-1 font-ui text-[10px] tracking-[0.18em] uppercase ${statusColors[design.status] || "border-border bg-muted text-muted-foreground"}`}>
                      {design.status.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {[design.fabric_type, design.occasion, design.size, design.budget_range].filter(Boolean).map((item) => (
                    <span key={item} className="rounded-full border border-border bg-background/70 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>

                <p className="mt-5 font-body text-sm leading-7 text-foreground">{design.design_description}</p>
                {design.inspiration_notes && <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">{design.inspiration_notes}</p>}

                {asStringArray(design.reference_images).length > 0 && (
                  <div className="mt-4">
                    <p className="font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">Your reference images</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {asStringArray(design.reference_images).map((imageUrl) => (
                        <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[18px] border border-border bg-background/60">
                          <img src={imageUrl} alt="Reference design" className="h-32 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {asStringArray(design.admin_reference_images).length > 0 && (
                  <div className="mt-4">
                    <p className="font-ui text-[10px] tracking-[0.18em] uppercase text-accent">Admin suggested options</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {asStringArray(design.admin_reference_images).map((imageUrl) => (
                        <a key={imageUrl} href={imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-[18px] border border-accent/20 bg-background/60">
                          <img src={imageUrl} alt="Admin design option" className="h-32 w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-accent"><Shirt size={15} /><p className="font-ui text-[10px] tracking-[0.22em] uppercase">Style</p></div>
                    <p className="mt-3 font-body text-sm leading-6 text-foreground">{[design.weave_style, design.fit_type, design.sleeve_style, design.neckline].filter(Boolean).join(" • ") || "Pending styling details"}</p>
                  </div>
                  <div className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-accent"><Ruler size={15} /><p className="font-ui text-[10px] tracking-[0.22em] uppercase">Measurements</p></div>
                    <p className="mt-3 font-body text-sm leading-6 text-foreground">{measurements || "Measurements not shared yet"}</p>
                  </div>
                  <div className="rounded-[22px] border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center gap-2 text-accent"><Clock3 size={15} /><p className="font-ui text-[10px] tracking-[0.22em] uppercase">Delivery</p></div>
                    <p className="mt-3 font-body text-sm leading-6 text-foreground">{[design.deadline_date, design.delivery_city, design.delivery_state].filter(Boolean).join(" • ") || "Timeline not shared yet"}</p>
                  </div>
                </div>

                {(asStringArray(design.addons).length > 0 || design.admin_notes) && (
                  <div className="mt-4 rounded-[22px] border border-border/70 bg-background/60 p-4">
                    {asStringArray(design.addons).length > 0 && <p className="font-body text-sm text-muted-foreground">Add-ons: {asStringArray(design.addons).join(", ")}</p>}
                    {design.admin_notes && <p className="mt-2 font-body text-sm text-foreground">Atelier note: {design.admin_notes}</p>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <section className="rounded-[28px] border border-border/80 bg-card/95 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Need ready-to-buy pieces instead?</p>
            <h3 className="mt-2 font-display text-2xl text-foreground">Browse the main collection</h3>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 font-ui text-[10px] tracking-[0.22em] uppercase text-accent transition-colors hover:border-accent">
            Open Shop
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default UserCustomDesigns;
