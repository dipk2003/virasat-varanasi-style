import { FormEvent, useEffect, useState } from "react";
import { Settings2, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  StoreSettings,
  defaultStoreSettings,
  isMissingRelationError,
  untypedDb,
} from "@/lib/commerce";

const AdminSettings = () => {
  const db = untypedDb;
  const { toast } = useToast();
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(defaultStoreSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [relationReady, setRelationReady] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);

    const { data, error } = await db
      .from("store_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (isMissingRelationError(error)) {
        setRelationReady(false);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setLoading(false);
      return;
    }

    setRelationReady(true);

    if (data) {
      setSettingsId(data.id);
      setSettings({
        store_name: data.store_name || defaultStoreSettings.store_name,
        brand_slug: data.brand_slug || defaultStoreSettings.brand_slug,
        legal_name: data.legal_name || "",
        support_email: data.support_email || "",
        support_phone: data.support_phone || "",
        currency_code: data.currency_code || "INR",
        locale_code: data.locale_code || "en-IN",
        logo_url: data.logo_url || "",
        favicon_url: data.favicon_url || "",
        theme_config: data.theme_config || {},
      });
    } else {
      setSettingsId(null);
      setSettings(defaultStoreSettings);
    }

    setLoading(false);
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      store_name: settings.store_name.trim() || defaultStoreSettings.store_name,
      brand_slug: settings.brand_slug.trim() || defaultStoreSettings.brand_slug,
      legal_name: settings.legal_name.trim() || null,
      support_email: settings.support_email.trim() || null,
      support_phone: settings.support_phone.trim() || null,
      currency_code: settings.currency_code.trim() || "INR",
      locale_code: settings.locale_code.trim() || "en-IN",
      logo_url: settings.logo_url.trim() || null,
      favicon_url: settings.favicon_url.trim() || null,
    };

    const query = settingsId
      ? db.from("store_settings").update(payload).eq("id", settingsId).select("id").single()
      : db.from("store_settings").insert(payload).select("id").single();

    const { data, error } = await query;
    setSaving(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (data?.id) {
      setSettingsId(data.id);
    }

    toast({ title: "Store settings saved" });
    void fetchSettings();
  };

  if (loading) {
    return <div className="font-body text-muted-foreground">Loading settings...</div>;
  }

  if (!relationReady) {
    return (
      <div className="border border-border bg-card p-6">
        <h2 className="mb-3 font-display text-3xl font-light text-foreground">Store Settings</h2>
        <p className="font-body text-muted-foreground">
          `store_settings` table abhi database me available nahi hai. Foundation migration apply karte hi brand settings
          yahan se manage ho jayengi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-light text-foreground">Store Settings</h2>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          Ye section brand identity, support channels, aur storefront meta settings ke liye rakha gaya hai.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr,320px]">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 border border-border bg-card p-6 sm:grid-cols-2">
          {[
            { key: "store_name", label: "Store Name" },
            { key: "brand_slug", label: "Brand Slug" },
            { key: "legal_name", label: "Legal Name" },
            { key: "support_email", label: "Support Email" },
            { key: "support_phone", label: "Support Phone" },
            { key: "currency_code", label: "Currency Code" },
            { key: "locale_code", label: "Locale Code" },
            { key: "logo_url", label: "Logo URL" },
            { key: "favicon_url", label: "Favicon URL" },
          ].map((field) => (
            <div key={field.key} className={field.key.includes("url") ? "sm:col-span-2" : ""}>
              <label className="mb-2 block font-ui text-xs uppercase tracking-wider text-muted-foreground">
                {field.label}
              </label>
              <input
                type="text"
                value={String(settings[field.key as keyof StoreSettings] || "")}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full border border-border bg-background px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent px-8 py-3 font-ui text-sm uppercase tracking-[0.2em] text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

        <div className="border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Store size={20} />
            </div>
            <div>
              <p className="font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
              <h3 className="font-display text-xl text-foreground">{settings.store_name || "Brand Store"}</h3>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Settings2 size={16} className="mt-0.5 text-accent" />
              <div>
                <p className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">Brand Slug</p>
                <p className="font-body text-foreground">{settings.brand_slug || "brand-store"}</p>
              </div>
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">Support</p>
              <p className="font-body text-foreground">{settings.support_email || "Not set"}</p>
              <p className="font-body text-muted-foreground">{settings.support_phone || "No phone configured"}</p>
            </div>
            <div>
              <p className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">Locale</p>
              <p className="font-body text-foreground">
                {settings.currency_code || "INR"} / {settings.locale_code || "en-IN"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
