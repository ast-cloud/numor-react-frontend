import { Link } from "react-router-dom";
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const ExpertApplicationSuccess = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-primary" />
        </div>

        {/* Header */}
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">
          Profile Under Review
        </h1>
        
        <p className="text-muted-foreground mb-8">
          Thank you for applying to join our network of financial experts. Our team will review your application and credentials within 2-3 business days.
        </p>

        {/* Status Card */}
        <div className="bg-muted/30 border border-border rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3 text-left">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Application Submitted</p>
              <p className="text-xs text-muted-foreground">You'll receive an email once your profile is approved</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/">
            <Button variant="hero" className="w-full">
              Go to Homepage
            </Button>
          </Link>
          <Link to="/ca">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to For Financial Experts
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ExpertApplicationSuccess;
