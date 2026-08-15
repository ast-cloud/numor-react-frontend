import { Loader2 } from "lucide-react";
import { useFeatureFlags } from "@/hooks/use-feature-flags";
import NotFound from "@/pages/NotFound";

const FeatureFlagGuard = ({ flag, children }: { flag: "FF_CA_CORE" | "FF_AI_CHATBOT"; children: React.ReactNode }) => {
  const { flags, isLoading } = useFeatureFlags();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!flags[flag]) {
    return <NotFound />;
  }

  return <>{children}</>;
};

export default FeatureFlagGuard;
