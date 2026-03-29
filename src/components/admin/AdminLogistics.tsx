import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DeliveryProvider, isMissingRelationError, untypedDb } from "@/lib/commerce";

const AdminLogistics = () => {
  const db = untypedDb;
  const { toast } = useToast();
  const [providers, setProviders] = useState<DeliveryProvider[]>([]);
  const [providersReady, setProvidersReady] = useState(true);
  const [providersLoading, setProvidersLoading] = useState(true);
  const [providerDrafts, setProviderDrafts] = useState<Record<string, string>>({});
  const [savingProviderId, setSavingProviderId] = useState<string | null>(null);

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

  useEffect(() => {
    void fetchProviders();
  }, []);

  const saveProvider = async (provider: DeliveryProvider, nextIsActive = provider.is_active) => {
    let parsedConfig: Record<string, unknown> = {};

    try {
      parsedConfig = providerDrafts[provider.id]?.trim() ? JSON.parse(providerDrafts[provider.id]) : {};
    } catch {
      toast({
        title: "Invalid JSON",
        description: `${provider.name} config JSON valid hona chahiye.`,
        variant: "destructive",
      });
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
    void fetchProviders();
  };

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Truck size={20} />
        </div>
        <div>
          <h3 className="font-display text-xl text-foreground">Logistics Control</h3>
          <p className="font-body text-sm text-muted-foreground">
            Shiprocket, Delhivery, manual fulfillment, ya kisi bhi partner ki config yahan se separately manage karo.
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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {providers.map((provider) => (
            <div key={provider.id} className="border border-border bg-background p-4">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-display text-lg text-foreground">{provider.name}</h4>
                  <p className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                    {provider.code} • {provider.provider_type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveProvider(provider, !provider.is_active)}
                  disabled={savingProviderId === provider.id}
                  className={`px-3 py-2 font-ui text-[10px] uppercase tracking-wider ${
                    provider.is_active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {provider.is_active ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="mb-3">
                <p className="mb-2 font-ui text-[10px] uppercase tracking-wider text-muted-foreground">Capabilities</p>
                <p className="font-body text-sm text-foreground">
                  {Object.keys(provider.capabilities || {}).length > 0
                    ? Object.keys(provider.capabilities || {}).join(", ")
                    : "Tracking, label generation, reverse pickup"}
                </p>
              </div>

              <label className="mb-2 block font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
                Provider Config JSON
              </label>
              <textarea
                value={providerDrafts[provider.id] || "{}"}
                onChange={(event) =>
                  setProviderDrafts((current) => ({ ...current, [provider.id]: event.target.value }))
                }
                rows={8}
                className="w-full resize-none border border-border bg-card px-4 py-3 font-body text-sm text-foreground focus:border-accent focus:outline-none"
              />

              <button
                type="button"
                onClick={() => saveProvider(provider)}
                disabled={savingProviderId === provider.id}
                className="mt-3 bg-foreground px-5 py-2 font-ui text-[10px] uppercase tracking-wider text-background disabled:opacity-50"
              >
                {savingProviderId === provider.id ? "Saving..." : "Save Partner Config"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLogistics;
