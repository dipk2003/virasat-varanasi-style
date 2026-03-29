import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StoreSettings, defaultStoreSettings } from "@/lib/commerce";
import {
  STOREFRONT_CONFIG_CUSTOM_EVENT,
  STOREFRONT_CONFIG_EVENT_KEY,
} from "@/lib/storefrontConfig";

export const useStoreSettings = () => {
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultStoreSettings);

  useEffect(() => {
    let active = true;

    const loadStoreSettings = async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error || !data) {
        setStoreSettings(defaultStoreSettings);
        return;
      }

      setStoreSettings({
        store_name: data.store_name || defaultStoreSettings.store_name,
        brand_slug: data.brand_slug || defaultStoreSettings.brand_slug,
        legal_name: data.legal_name || "",
        support_email: data.support_email || "",
        support_phone: data.support_phone || "",
        currency_code: data.currency_code || defaultStoreSettings.currency_code,
        locale_code: data.locale_code || defaultStoreSettings.locale_code,
        logo_url: data.logo_url || "",
        favicon_url: data.favicon_url || "",
        theme_config: data.theme_config || {},
      });
    };

    void loadStoreSettings();

    const handleRefresh = () => {
      void loadStoreSettings();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadStoreSettings();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STOREFRONT_CONFIG_EVENT_KEY) {
        void loadStoreSettings();
      }
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(STOREFRONT_CONFIG_CUSTOM_EVENT, handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STOREFRONT_CONFIG_CUSTOM_EVENT, handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return storeSettings;
};
