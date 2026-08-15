import { config } from "@/lib/config";

export interface FeatureFlags {
  FF_CA_CORE: boolean;
  FF_AI_CHATBOT: boolean;
}

export async function fetchFeatureFlags(): Promise<FeatureFlags> {
  const res = await fetch(`${config.backendHost}/api/config/feature-flags`);
  if (!res.ok) throw new Error("Failed to fetch feature flags");
  const json = await res.json();
  return json.data ?? json;
}
