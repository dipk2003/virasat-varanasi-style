import { ReactNode, useEffect, useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  HomepageContentConfig,
  defaultHomepageContent,
  defaultStoreSettings,
  extractHomepageContent,
  isMissingRelationError,
  mergeHomepageContentIntoThemeConfig,
  untypedDb,
} from "@/lib/commerce";
import { notifyStorefrontConfigUpdated } from "@/lib/storefrontConfig";

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div>
    <label className="mb-2 block font-ui text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full border border-border bg-card px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none"
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) => (
  <div>
    <label className="mb-2 block font-ui text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-none border border-border bg-card px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none"
    />
  </div>
);

const SectionCard = ({
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children: ReactNode;
}) => (
  <div className="space-y-4 border border-border bg-background p-5">
    <div className="flex items-center justify-between gap-4">
      <div>
        <h4 className="font-display text-lg text-foreground">{title}</h4>
        <p className="font-body text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="flex items-center gap-2 font-ui text-[10px] uppercase tracking-wider text-muted-foreground">
        <input type="checkbox" checked={enabled} onChange={(event) => onToggle(event.target.checked)} />
        Enabled
      </label>
    </div>
    {children}
  </div>
);

const AdminHomepageBanners = () => {
  const db = untypedDb;
  const { toast } = useToast();
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [themeConfigBase, setThemeConfigBase] = useState<Record<string, unknown>>({});
  const [homepageContent, setHomepageContent] = useState<HomepageContentConfig>(defaultHomepageContent);
  const [loading, setLoading] = useState(true);
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [relationReady, setRelationReady] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);

    const { data, error } = await db
      .from("store_settings")
      .select("id, theme_config")
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

    if (!data) {
      setSettingsId(null);
      setThemeConfigBase({});
      setHomepageContent(defaultHomepageContent);
      setLoading(false);
      return;
    }

    const nextThemeConfig =
      data.theme_config && typeof data.theme_config === "object" && !Array.isArray(data.theme_config)
        ? (data.theme_config as Record<string, unknown>)
        : {};

    setSettingsId(data.id);
    setThemeConfigBase(nextThemeConfig);
    setHomepageContent(extractHomepageContent(nextThemeConfig));
    setLoading(false);
  };

  useEffect(() => {
    void fetchSettings();
  }, []);

  const updateHomepageSection = <K extends keyof HomepageContentConfig>(
    section: K,
    patch: Partial<HomepageContentConfig[K]>
  ) => {
    setHomepageContent((current) => ({
      ...current,
      [section]: {
        ...current[section],
        ...patch,
      },
    } as HomepageContentConfig));
  };

  const saveHomepageSections = async () => {
    const nextThemeConfig = mergeHomepageContentIntoThemeConfig(themeConfigBase, homepageContent);

    setSavingHomepage(true);
    const query = settingsId
      ? db.from("store_settings").update({ theme_config: nextThemeConfig }).eq("id", settingsId).select("id").single()
      : db
          .from("store_settings")
          .insert({
            store_name: defaultStoreSettings.store_name,
            brand_slug: defaultStoreSettings.brand_slug,
            theme_config: nextThemeConfig,
          })
          .select("id")
          .single();

    const { data, error } = await query;
    setSavingHomepage(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    if (data?.id) {
      setSettingsId(data.id);
    }

    setThemeConfigBase(nextThemeConfig);
    notifyStorefrontConfigUpdated();
    toast({ title: "Homepage content saved" });
    void fetchSettings();
  };

  if (loading) {
    return <div className="font-body text-muted-foreground">Loading homepage content...</div>;
  }

  if (!relationReady) {
    return (
      <div className="border border-border bg-card p-6">
        <h2 className="mb-3 font-display text-3xl font-light text-foreground">Homepage Banner Control</h2>
        <p className="font-body text-muted-foreground">
          `store_settings` table abhi database me available nahi hai. Foundation migration apply karte hi homepage
          controls yahan se manage ho jayenge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <LayoutTemplate size={20} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-light text-foreground">Homepage Banner Control</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">
              Hero banner, announcement strip, feature story, sale block, testimonial, aur CTA ko alag se yahin se
              control karo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Hero Banner"
            description="Homepage ke top hero text, CTA, aur optional background image."
            enabled={homepageContent.hero_banner.enabled}
            onToggle={(enabled) => updateHomepageSection("hero_banner", { enabled })}
          >
            <TextField
              label="Eyebrow"
              value={homepageContent.hero_banner.eyebrow}
              onChange={(eyebrow) => updateHomepageSection("hero_banner", { eyebrow })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Native Title"
                value={homepageContent.hero_banner.title_native}
                onChange={(title_native) => updateHomepageSection("hero_banner", { title_native })}
              />
              <TextField
                label="Latin Title"
                value={homepageContent.hero_banner.title_latin}
                onChange={(title_latin) => updateHomepageSection("hero_banner", { title_latin })}
              />
            </div>
            <TextAreaField
              label="Description"
              rows={3}
              value={homepageContent.hero_banner.description}
              onChange={(description) => updateHomepageSection("hero_banner", { description })}
            />
            <TextField
              label="Background Image URL"
              value={homepageContent.hero_banner.background_image_url}
              placeholder="Optional CDN / Supabase image URL"
              onChange={(background_image_url) => updateHomepageSection("hero_banner", { background_image_url })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Primary Button Label"
                value={homepageContent.hero_banner.primary_button_label}
                onChange={(primary_button_label) =>
                  updateHomepageSection("hero_banner", { primary_button_label })
                }
              />
              <TextField
                label="Primary Button Link"
                value={homepageContent.hero_banner.primary_button_link}
                placeholder="/shop or https://..."
                onChange={(primary_button_link) => updateHomepageSection("hero_banner", { primary_button_link })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Secondary Button Label"
                value={homepageContent.hero_banner.secondary_button_label}
                onChange={(secondary_button_label) =>
                  updateHomepageSection("hero_banner", { secondary_button_label })
                }
              />
              <TextField
                label="Secondary Button Link"
                value={homepageContent.hero_banner.secondary_button_link}
                placeholder="/#new-arrivals or /shop"
                onChange={(secondary_button_link) =>
                  updateHomepageSection("hero_banner", { secondary_button_link })
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Announcement Strip"
            description="Navbar ke upar chalne wali marquee messaging."
            enabled={homepageContent.announcement_bar.enabled}
            onToggle={(enabled) => updateHomepageSection("announcement_bar", { enabled })}
          >
            <TextField
              label="Primary Message"
              value={homepageContent.announcement_bar.message_primary}
              onChange={(message_primary) => updateHomepageSection("announcement_bar", { message_primary })}
            />
            <TextField
              label="Secondary Message"
              value={homepageContent.announcement_bar.message_secondary}
              onChange={(message_secondary) => updateHomepageSection("announcement_bar", { message_secondary })}
            />
          </SectionCard>

          <SectionCard
            title="Feature Story Banner"
            description="Hero ke neeche aane wala dark feature banner jo storefront par render hota hai."
            enabled={homepageContent.feature_banner.enabled}
            onToggle={(enabled) => updateHomepageSection("feature_banner", { enabled })}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Eyebrow"
                value={homepageContent.feature_banner.eyebrow}
                onChange={(eyebrow) => updateHomepageSection("feature_banner", { eyebrow })}
              />
              <TextField
                label="Badge"
                value={homepageContent.feature_banner.badge}
                onChange={(badge) => updateHomepageSection("feature_banner", { badge })}
              />
            </div>
            <TextField
              label="Title"
              value={homepageContent.feature_banner.title}
              onChange={(title) => updateHomepageSection("feature_banner", { title })}
            />
            <TextAreaField
              label="Description"
              value={homepageContent.feature_banner.description}
              onChange={(description) => updateHomepageSection("feature_banner", { description })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Primary Button Label"
                value={homepageContent.feature_banner.primary_button_label}
                onChange={(primary_button_label) =>
                  updateHomepageSection("feature_banner", { primary_button_label })
                }
              />
              <TextField
                label="Primary Button Link"
                value={homepageContent.feature_banner.primary_button_link}
                onChange={(primary_button_link) =>
                  updateHomepageSection("feature_banner", { primary_button_link })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Secondary Button Label"
                value={homepageContent.feature_banner.secondary_button_label}
                onChange={(secondary_button_label) =>
                  updateHomepageSection("feature_banner", { secondary_button_label })
                }
              />
              <TextField
                label="Secondary Button Link"
                value={homepageContent.feature_banner.secondary_button_link}
                onChange={(secondary_button_link) =>
                  updateHomepageSection("feature_banner", { secondary_button_link })
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Sale Banner"
            description="Homepage sale section ka title, timer, aur CTA button."
            enabled={homepageContent.sale_banner.enabled}
            onToggle={(enabled) => updateHomepageSection("sale_banner", { enabled })}
          >
            <TextField
              label="Eyebrow"
              value={homepageContent.sale_banner.eyebrow}
              onChange={(eyebrow) => updateHomepageSection("sale_banner", { eyebrow })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Title Prefix"
                value={homepageContent.sale_banner.title_prefix}
                onChange={(title_prefix) => updateHomepageSection("sale_banner", { title_prefix })}
              />
              <TextField
                label="Title Highlight"
                value={homepageContent.sale_banner.title_highlight}
                onChange={(title_highlight) => updateHomepageSection("sale_banner", { title_highlight })}
              />
            </div>
            <TextAreaField
              label="Description"
              rows={3}
              value={homepageContent.sale_banner.description}
              onChange={(description) => updateHomepageSection("sale_banner", { description })}
            />
            <TextField
              label="Countdown Label"
              value={homepageContent.sale_banner.countdown_label}
              onChange={(countdown_label) => updateHomepageSection("sale_banner", { countdown_label })}
            />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <TextField
                label="Days"
                value={homepageContent.sale_banner.countdown_days}
                onChange={(countdown_days) => updateHomepageSection("sale_banner", { countdown_days })}
              />
              <TextField
                label="Hours"
                value={homepageContent.sale_banner.countdown_hours}
                onChange={(countdown_hours) => updateHomepageSection("sale_banner", { countdown_hours })}
              />
              <TextField
                label="Minutes"
                value={homepageContent.sale_banner.countdown_minutes}
                onChange={(countdown_minutes) => updateHomepageSection("sale_banner", { countdown_minutes })}
              />
              <TextField
                label="Seconds"
                value={homepageContent.sale_banner.countdown_seconds}
                onChange={(countdown_seconds) => updateHomepageSection("sale_banner", { countdown_seconds })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Button Label"
                value={homepageContent.sale_banner.button_label}
                onChange={(button_label) => updateHomepageSection("sale_banner", { button_label })}
              />
              <TextField
                label="Button Link"
                value={homepageContent.sale_banner.button_link}
                placeholder="/shop?category=banarasi-silk or #sale"
                onChange={(button_link) => updateHomepageSection("sale_banner", { button_link })}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Patron Quote Banner"
            description="Maroon testimonial section ke liye copy aur visibility."
            enabled={homepageContent.testimonial_banner.enabled}
            onToggle={(enabled) => updateHomepageSection("testimonial_banner", { enabled })}
          >
            <TextField
              label="Eyebrow"
              value={homepageContent.testimonial_banner.eyebrow}
              onChange={(eyebrow) => updateHomepageSection("testimonial_banner", { eyebrow })}
            />
            <TextAreaField
              label="Quote"
              value={homepageContent.testimonial_banner.quote}
              onChange={(quote) => updateHomepageSection("testimonial_banner", { quote })}
            />
            <TextField
              label="Author"
              value={homepageContent.testimonial_banner.author}
              onChange={(author) => updateHomepageSection("testimonial_banner", { author })}
            />
          </SectionCard>

          <SectionCard
            title="Collection CTA Block"
            description="Cream section ka headline, description, aur button target."
            enabled={homepageContent.collection_cta.enabled}
            onToggle={(enabled) => updateHomepageSection("collection_cta", { enabled })}
          >
            <TextField
              label="Eyebrow"
              value={homepageContent.collection_cta.eyebrow}
              onChange={(eyebrow) => updateHomepageSection("collection_cta", { eyebrow })}
            />
            <TextField
              label="Title"
              value={homepageContent.collection_cta.title}
              onChange={(title) => updateHomepageSection("collection_cta", { title })}
            />
            <TextAreaField
              label="Description"
              value={homepageContent.collection_cta.description}
              onChange={(description) => updateHomepageSection("collection_cta", { description })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Button Label"
                value={homepageContent.collection_cta.button_label}
                onChange={(button_label) => updateHomepageSection("collection_cta", { button_label })}
              />
              <TextField
                label="Button Link"
                value={homepageContent.collection_cta.button_link}
                placeholder="/shop or #sale"
                onChange={(button_link) => updateHomepageSection("collection_cta", { button_link })}
              />
            </div>
          </SectionCard>
        </div>

        <button
          type="button"
          onClick={saveHomepageSections}
          disabled={savingHomepage}
          className="mt-6 bg-foreground px-8 py-3 font-ui text-sm uppercase tracking-[0.2em] text-background disabled:opacity-50"
        >
          {savingHomepage ? "Saving..." : "Save Homepage Content"}
        </button>
      </div>
    </div>
  );
};

export default AdminHomepageBanners;
