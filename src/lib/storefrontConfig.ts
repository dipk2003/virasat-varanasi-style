export const STOREFRONT_CONFIG_EVENT_KEY = "storefront-config-updated-at";
export const STOREFRONT_CONFIG_CUSTOM_EVENT = "storefront-config-updated";

export const notifyStorefrontConfigUpdated = () => {
  if (typeof window === "undefined") {
    return;
  }

  const timestamp = `${Date.now()}`;

  try {
    window.localStorage.setItem(STOREFRONT_CONFIG_EVENT_KEY, timestamp);
  } catch {
    // Ignore storage failures in private browsing or restricted environments.
  }

  window.dispatchEvent(
    new CustomEvent(STOREFRONT_CONFIG_CUSTOM_EVENT, {
      detail: timestamp,
    })
  );
};
