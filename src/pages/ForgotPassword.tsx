import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, verifyResetCode, resetPassword } from "@/lib/api/auth";

type Step = "email" | "verify" | "reset";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = await forgotPassword(email);
      if (data.success) {
        toast({ title: "Success", description: "Verification code sent to your email" });
        setStep("verify");
      } else {
        toast({ title: "Error", description: data.message || "Failed to send code", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setIsSubmitting(true);
    try {
      const data = await verifyResetCode(email, code);
      if (data.success) {
        toast({ title: "Success", description: "Code verified" });
        setStep("reset");
      } else {
        toast({ title: "Error", description: data.message || "Invalid code", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await resetPassword(email, code, newPassword);
      if (data.success) {
        toast({ title: "Success", description: "Password reset successfully" });
        navigate("/login");
      } else {
        toast({ title: "Error", description: data.message || "Failed to reset password", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">N</span>
          </div>
          <span className="font-display text-2xl font-bold text-foreground">Numor</span>
        </div>

        {step === "email" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">Forgot password?</h1>
              <p className="text-muted-foreground">Enter your email and we'll send you a verification code</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send verification code"}
              </Button>
            </form>
          </>
        )}

        {step === "verify" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">Enter verification code</h1>
              <p className="text-muted-foreground">We sent a 6-digit code to {email}</p>
            </div>
            <form onSubmit={handleVerifySubmit} className="space-y-5">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting || code.length !== 6}>
                {isSubmitting ? "Verifying..." : "Verify code"}
              </Button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">Set new password</h1>
              <p className="text-muted-foreground">Enter your new password below</p>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting || !newPassword || newPassword !== confirmPassword}
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
