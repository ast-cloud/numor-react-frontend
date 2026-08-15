import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { fetchFeatureFlags, FeatureFlags } from "@/lib/api/config";

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  isLoading: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  FF_CA_CORE: false,
  FF_AI_CHATBOT: false,
};

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeatureFlags()
      .then(setFlags)
      .catch(() => setFlags(DEFAULT_FLAGS))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, isLoading }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) throw new Error("useFeatureFlags must be used within FeatureFlagsProvider");
  return context;
};
