import { FormEvent, useEffect, useState } from "react";
import { Settings2, Store, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DeliveryProvider,
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
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [providersReady, setProvidersReady] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providerDrafts, setProviderDrafts] = useState<Record<string, string>>({});
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);

    const { data, error } = await db.from("store_settings").select("*").limit(1).maybeSingle();

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
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setProvidersLoading(true);

    const { data, error } = await db.from("delivery_providers").select("*").order("code", { ascending: true });

    if (error) {
      if (isMissingRelationError(error)) {
        setProvidersReady(false);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setProvidersLoading(false);
      return;
    }

    const rows = (data || []) as DeliveryProvider[];
    setProviders(rows);
    setProvidersReady(true);
    setProviderDrafts(
      rows.reduce<Record<string, string>>((acc, provider) => {
        acc[provider.id] = JSON.stringify(provider.config || {}, null, 2);
        return acc;
      }, {})
    );
    setProvidersLoading(false);
  };

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
      ? db.from("store_settings").update(payload).eq("id", settingsId)
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
    fetchSettings();
  };

  const saveProvider = async (provider: DeliveryProvider, nextIsActive = provider.is_active) => {
    let parsedConfig: Record<string, unknown> = {};

    try {
      parsedConfig = providerDrafts[provider.id]?.trim() ? JSON.parse(providerDrafts[provider.id]) : {};
    } catch {
      toast({ title: "Invalid JSON", description: `${provider.name} config JSON valid hona chahiye.`, variant: "destructive" });
      return;
    }

    setSavingProviderId(provider.id);
    const { error } = await db
      .from("delivery_providers")
      .update({ config: parsedConfig, is_active: nextIsActive })
      .eq("id", provider.id);
    setSavingProviderId(null);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: `${provider.name} updated` });
    fetchProviders();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading settings...</div>;

  if (!relationReady) {
    return (
      <div className="border border-border bg-card p-6">
        <h2 className="font-display text-3xl font-light text-foreground mb-3">Store Settings</h2>
        <p className="font-body text-muted-foreground">
          `store_settings` table abhi database me available nahi hai. Foundation migration apply karte hi brand settings yahan se manage ho jayengi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-light text-foreground">Store Settings</h2>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Ye screen white-label productization ka first admin surface hai.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,320px] gap-6">
        <form onSubmit={handleSubmit} className="border border-border bg-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">
                {field.label}
              </label>
              <input
                type="text"
                value={settings[field.key as keyof StoreSettings] || ""}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, [field.key]: event.target.value }))
                }
                className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>

        <div className="border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Store size={20} />
            </div>
            <div>
              <p className="font-ui text-xs tracking-[0.2em] uppercase text-muted-foreground">Preview</p>
              <h3 className="font-display text-xl text-foreground">{settings.store_name || "Brand Store"}</h3>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Settings2 size={16} className="text-accent mt-0.5" />
              <div>
                <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">Brand Slug</p>
                <p className="font-body text-foreground">{settings.brand_slug || "brand-store"}</p>
              </div>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">Support</p>
              <p className="font-body text-foreground">{settings.support_email || "Not set"}</p>
              <p className="font-body text-muted-foreground">{settings.support_phone || "No phone configured"}</p>
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">Locale</p>
              <p className="font-body text-foreground">
                {settings.currency_code || "INR"} / {settings.locale_code || "en-IN"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="font-display text-xl text-foreground">Delivery Partners</h3>
            <p className="font-body text-sm text-muted-foreground">
              Shiprocket, Delhivery, manual fulfillment, ya kisi bhi partner ki config yahin store kar sakte ho.
            </p>
          </div>
        </div>

        {providersLoading && <p className="font-body text-muted-foreground">Loading delivery partners...</p>}

        {!providersLoading && !providersReady && (
          <p className="font-body text-muted-foreground">
            `delivery_providers` table abhi database me available nahi hai. Foundation migration apply karte hi partner config yahan se manage ho jayegi.
          </p>
        )}

        {!providersLoading && providersReady && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div key={provider.id} className="border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h4 className="font-display text-lg text-foreground">{provider.name}</h4>
                    <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground">
                      {provider.code} • {provider.provider_type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => saveProvider(provider, !provider.is_active)}
                    disabled={savingProviderId === provider.id}
                    className={`px-3 py-2 font-ui text-[10px] tracking-wider uppercase ${
                      provider.is_active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {provider.is_active ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="mb-3">
                  <p className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground mb-2">Capabilities</p>
                  <p className="font-body text-sm text-foreground">
                    {Object.keys(provider.capabilities || {}).length > 0
                      ? Object.keys(provider.capabilities || {}).join(", ")
                      : "Tracking, label generation, reverse pickup"}
                  </p>
                </div>

                <label className="font-ui text-[10px] tracking-wider uppercase text-muted-foreground block mb-2">
                  Provider Config JSON
                </label>
                <textarea
                  value={providerDrafts[provider.id] || "{}"}
                  onChange={(event) =>
                    setProviderDrafts((current) => ({ ...current, [provider.id]: event.target.value }))
                  }
                  rows={8}
                  className="w-full px-4 py-3 bg-card border border-border font-body text-sm text-foreground focus:outline-none focus:border-accent resize-none"
                />

                <button
                  type="button"
                  onClick={() => saveProvider(provider)}
                  disabled={savingProviderId === provider.id}
                  className="mt-3 px-5 py-2 bg-foreground text-background font-ui text-[10px] tracking-wider uppercase disabled:opacity-50"
                >
                  {savingProviderId === provider.id ? "Saving..." : "Save Partner Config"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
