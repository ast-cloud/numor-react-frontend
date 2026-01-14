import { useNavigate } from "react-router-dom";
import { useCAProfile } from "@/hooks/use-ca-profile";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CADashboardHome = () => {
  const navigate = useNavigate();
  const { isProfileComplete, profileData } = useCAProfile();
  const showBanner = !profileData.isSubmitted;

  return (
    <div className="space-y-6">
      {/* Profile Completion Banner */}
      {showBanner && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Complete your profile to start connecting with clients</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isProfileComplete() 
                ? "Your profile is complete! Submit it for review to get verified and start accepting clients."
                : "Please fill in all your professional details, upload certifications, and ID proof to submit your profile for review."
              }
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
              onClick={() => navigate("/dashboard/ca/settings")}
            >
              {isProfileComplete() ? "Submit for Review" : "Complete Profile"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-4xl font-display font-bold text-foreground">
          CA Dashboard
        </h1>
      </div>
    </div>
  );
};

export default CADashboardHome;
