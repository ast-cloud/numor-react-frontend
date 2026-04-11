import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { register } from "@/lib/api/auth";
import { config } from "@/lib/config";
import EmailVerification from "@/components/EmailVerification";
import UpgradeAccountDialog from "@/components/UpgradeAccountDialog";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const CASignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailDisabled, setEmailDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradePasswordSet, setUpgradePasswordSet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({ title: "Error", description: "Please agree to the terms and conditions", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(formData.fullName, formData.email, formData.password, "CA_USER");
      if (result.error) throw new Error(result.error);
      await refreshUser();
      toast({ title: "Account Created", description: "Your account has been created successfully!" });
      navigate("/ca/dashboard");
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error?.message || "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleCA = () => {
    const state = btoa(JSON.stringify({ user_type_for_signup: "CA_USER" }));
    const params = new URLSearchParams({
      client_id: "659218881507-babe4ar7rnd0s2hm7765rl48152bag4r.apps.googleusercontent.com",
      redirect_uri: `${config.backendHost}/api/auth/google-local-storage-based-login`,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
      state
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-14 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full flex flex-col items-center">
          {/* Heading */}
          <div className="w-full mb-8">
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">
              Register as a Financial Expert
            </h1>
            <p className="text-muted-foreground">
              Join our network of trusted CAs and financial advisors.
            </p>
          </div>

          {/* Form + Social row */}
          <div className="w-full flex flex-col md:flex-row md:gap-12 lg:gap-16 items-center md:items-center">
          {/* Left side - Social login */}
          <div className="w-full md:w-1/2 order-3 md:order-none">

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleGoogleCA}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="hidden md:flex flex-col items-center self-stretch py-8">
            <div className="w-px bg-border flex-1"></div>
            <span className="text-xs text-muted-foreground uppercase py-3">Or</span>
            <div className="w-px bg-border flex-1"></div>
          </div>

          {/* Mobile divider */}
          <div className="md:hidden relative my-6 w-full order-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-1/2 order-1 md:order-none">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => {
                      handleChange("email")(e);
                      setEmailVerified(false);
                    }}
                    className="pl-10"
                    required
                    disabled={emailDisabled}
                  />
                </div>
                <EmailVerification
                  email={formData.email}
                  isVerified={emailVerified}
                  onVerified={() => setEmailVerified(true)}
                  onOtpStep={(inOtp) => setEmailDisabled(inOtp)}
                  onAlreadyRegistered={(data) => {
                    const role = data?.currentRole;
                    if (role === "CA_USER" || role === "ADMIN") {
                      setShowAlreadyRegistered(true);
                    } else if (role === "SME_USER") {
                      setUpgradePasswordSet(!!data?.passwordSet);
                      setShowUpgradeDialog(true);
                    } else {
                      setShowAlreadyRegistered(true);
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!emailVerified}
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange("password")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    disabled={!emailVerified}
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-4">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => 
                    setFormData((prev) => ({ ...prev, agreeToTerms: checked === true }))
                  }
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting || !emailVerified}>
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </div>
          </div>
        </div>
      </div>

      {/* Already registered dialog */}
      <AlertDialog open={showAlreadyRegistered} onOpenChange={setShowAlreadyRegistered}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Email Already Registered</AlertDialogTitle>
            <AlertDialogDescription>
              This email is already registered with us. Please log in instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/login")}>Go to Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade dialog */}
      <UpgradeAccountDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        email={formData.email}
        passwordSet={upgradePasswordSet}
        onUpgradeComplete={async (password) => {
          try {
            const result = await register(formData.fullName || "User", formData.email, password, "CA_USER");
            if (result.error) throw new Error(result.error);
            await refreshUser();
            toast({ title: "Account Upgraded", description: "Your account has been upgraded to a financial expert!" });
            navigate("/ca/dashboard");
          } catch (error: any) {
            toast({ title: "Upgrade Failed", description: error?.message || "Something went wrong. Please try again.", variant: "destructive" });
          }
        }}
      />
    </div>
  );
};

export default CASignup;
