import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Save, Sparkles, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type ProfileForm = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "full_name" | "phone" | "address_line1" | "address_line2" | "city" | "state" | "pincode"
>;

const emptyProfileForm: ProfileForm = {
  full_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  pincode: "",
};

const inputClass =
  "w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground transition-colors focus:border-accent focus:outline-none";

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfileForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone, address_line1, address_line2, city, state, pincode, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }

      setProfile({
        full_name: data?.full_name || user.user_metadata?.full_name || "",
        phone: data?.phone || "",
        address_line1: data?.address_line1 || "",
        address_line2: data?.address_line2 || "",
        city: data?.city || "",
        state: data?.state || "",
        pincode: data?.pincode || "",
      });
      setUpdatedAt(data?.updated_at || null);
      setLoading(false);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [toast, user]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    const payload = {
      user_id: user.id,
      full_name: profile.full_name || null,
      phone: profile.phone || null,
      address_line1: profile.address_line1 || null,
      address_line2: profile.address_line2 || null,
      city: profile.city || null,
      state: profile.state || null,
      pincode: profile.pincode || null,
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setUpdatedAt(new Date().toISOString());
    toast({ title: "Profile updated", description: "Your buyer profile has been refreshed." });
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading profile...</div>;

  const shopperName =
    profile.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0]?.replace(/[._-]/g, " ") ||
    "Customer";
  const shopperInitials = shopperName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
  const completionFields = Object.values(profile).filter((value) => value?.trim()).length;
  const completionPercentage = Math.round((completionFields / Object.keys(profile).length) * 100);

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.1),transparent_38%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 shadow-[0_22px_70px_-44px_hsl(var(--gold)/0.45)] sm:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div>
            <p className="font-ui text-[10px] tracking-[0.3em] uppercase text-accent">
              Buyer Identity
            </p>
            <h2 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">My Profile</h2>
            <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
              Apni contact aur delivery details polished rakho, taaki checkout smoother ho aur custom
              design conversations bhi accurate rahein.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard?tab=addresses"
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark"
              >
                Manage Addresses
              </Link>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background/70 px-5 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-display text-2xl text-accent">
                  {shopperInitials || "VS"}
                </div>
                <div>
                  <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    Account Holder
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-foreground">{shopperName}</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 font-body text-sm text-muted-foreground">
                  <Mail size={15} className="text-accent" />
                  <span>{user?.email || "No email"}</span>
                </div>
                <div className="flex items-center gap-3 font-body text-sm text-muted-foreground">
                  <Phone size={15} className="text-accent" />
                  <span>{profile.phone || "Phone not added yet"}</span>
                </div>
                <div className="flex items-center gap-3 font-body text-sm text-muted-foreground">
                  <MapPin size={15} className="text-accent" />
                  <span>{[profile.city, profile.state].filter(Boolean).join(", ") || "City not added yet"}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-border/70 bg-background/70 p-5">
              <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                Profile Completion
              </p>
              <p className="mt-3 font-display text-4xl text-foreground">{completionPercentage}%</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <p className="mt-3 font-body text-sm leading-6 text-muted-foreground">
                Complete details se delivery, profile accuracy, aur repeat checkout experience better hota hai.
              </p>
              {updatedAt && (
                <p className="mt-3 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                  Updated {new Date(updatedAt).toLocaleDateString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSave}
        className="rounded-[30px] border border-border/80 bg-card/95 p-6 shadow-[0_18px_55px_-44px_hsl(var(--foreground)/0.7)] sm:p-8"
      >
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">
              Profile Details
            </p>
            <h3 className="mt-3 font-display text-3xl text-foreground">Refine Your Buyer Details</h3>
            <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-muted-foreground">
              Ye details checkout aur customer support dono me kaam aati hain. Email account identity ke
              liye locked hai, baaki details aap yahin se update kar sakte ho.
            </p>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent sm:flex">
            <Sparkles size={18} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <section className="rounded-[24px] border border-border/70 bg-background/60 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <UserRound size={18} />
              </div>
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Identity
                </p>
                <h4 className="mt-1 font-display text-2xl text-foreground">Basic Details</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name || ""}
                  onChange={(event) => setProfile((current) => ({ ...current, full_name: event.target.value }))}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Email
                </label>
                <input type="email" value={user?.email || ""} disabled className={`${inputClass} opacity-70`} />
              </div>

              <div>
                <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile.phone || ""}
                  onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-border/70 bg-background/60 p-5">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Delivery Snapshot
                </p>
                <h4 className="mt-1 font-display text-2xl text-foreground">Address Details</h4>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Address Line 1
                </label>
                <input
                  type="text"
                  value={profile.address_line1 || ""}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, address_line1: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Address Line 2
                </label>
                <input
                  type="text"
                  value={profile.address_line2 || ""}
                  onChange={(event) =>
                    setProfile((current) => ({ ...current, address_line2: event.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.city || ""}
                    onChange={(event) => setProfile((current) => ({ ...current, city: event.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                    State
                  </label>
                  <input
                    type="text"
                    value={profile.state || ""}
                    onChange={(event) => setProfile((current) => ({ ...current, state: event.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                  Pincode
                </label>
                <input
                  type="text"
                  value={profile.pincode || ""}
                  onChange={(event) => setProfile((current) => ({ ...current, pincode: event.target.value }))}
                  className={inputClass}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            to="/dashboard?tab=orders"
            className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-ui text-[10px] tracking-[0.24em] uppercase text-foreground transition-colors hover:bg-muted"
          >
            View Orders
          </Link>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
