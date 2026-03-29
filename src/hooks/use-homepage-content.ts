import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { defaultHomepageContent, extractHomepageContent } from "@/lib/commerce";
import {
  STOREFRONT_CONFIG_CUSTOM_EVENT,
  STOREFRONT_CONFIG_EVENT_KEY,
} from "@/lib/storefrontConfig";

export const useHomepageContent = () => {
  const [homepageContent, setHomepageContent] = useState(defaultHomepageContent);

  useEffect(() => {
    let active = true;

    const loadHomepageContent = async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("theme_config")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (error || !data?.theme_config) {
        setHomepageContent(defaultHomepageContent);
        return;
      }

      setHomepageContent(extractHomepageContent(data.theme_config));
    };

    void loadHomepageContent();

    const handleFocus = () => {
      void loadHomepageContent();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadHomepageContent();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STOREFRONT_CONFIG_EVENT_KEY) {
        void loadHomepageContent();
      }
    };

    const handleStorefrontConfigEvent = () => {
      void loadHomepageContent();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(STOREFRONT_CONFIG_CUSTOM_EVENT, handleStorefrontConfigEvent);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STOREFRONT_CONFIG_CUSTOM_EVENT, handleStorefrontConfigEvent);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return homepageContent;
};
