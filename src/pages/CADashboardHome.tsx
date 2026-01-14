import { AlertCircle, CheckCircle, Clock, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

type VerificationStatus = "pending" | "verified" | "action_required";

const CADashboardHome = () => {
  // Mock verification status - in production this would come from the database
  const verificationStatus = "pending" as VerificationStatus;
  const profileCompleteness = 60;

  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Verification Pending",
      description: "Your profile is under review. This usually takes 2-3 business days.",
      badge: "Pending",
      badgeVariant: "secondary" as const,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    verified: {
      icon: CheckCircle,
      title: "Verified Expert",
      description: "Your profile has been verified. You can now connect with clients.",
      badge: "Verified",
      badgeVariant: "default" as const,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    action_required: {
      icon: AlertCircle,
      title: "Action Required",
      description: "Please complete your profile and upload required documents.",
      badge: "Action Required",
      badgeVariant: "destructive" as const,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
    },
  };

  const currentStatus = statusConfig[verificationStatus];
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Welcome to Your Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile and connect with clients
        </p>
      </div>

      {/* Verification Status Card */}
      <Card className={`${currentStatus.borderColor} border-2`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${currentStatus.bgColor}`}>
                <StatusIcon className={`w-5 h-5 ${currentStatus.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{currentStatus.title}</CardTitle>
                <CardDescription className="mt-0.5">
                  {currentStatus.description}
                </CardDescription>
              </div>
            </div>
            <Badge variant={currentStatus.badgeVariant}>{currentStatus.badge}</Badge>
          </div>
        </CardHeader>
        {verificationStatus !== "verified" && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completeness</span>
                <span className="font-medium">{profileCompleteness}%</span>
              </div>
              <Progress value={profileCompleteness} className="h-2" />
              <div className="flex items-center gap-2 pt-2">
                <Button asChild size="sm">
                  <Link to="/dashboard/ca/settings">
                    Complete Profile
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Upload certifications and ID proof for verification
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/ca/settings">Manage Documents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CADashboardHome;
