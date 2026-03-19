import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { forgotPassword, verifyResetCode, resetPassword } from "@/lib/api/auth";
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

type UpgradeStep = "prompt" | "enter-password" | "set-password-otp" | "set-password-reset";

interface UpgradeAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  passwordSet: boolean;
  onUpgradeComplete: (password: string) => void;
}

const UpgradeAccountDialog = ({
  open,
  onOpenChange,
  email,
  passwordSet,
  onUpgradeComplete,
}: UpgradeAccountDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<UpgradeStep>("prompt");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setStep("prompt");
    setPassword("");
    setConfirmPassword("");
    setOtpCode("");
    setResetCode("");
    onOpenChange(false);
  };

  const handleYes = async () => {
    if (passwordSet) {
      setStep("enter-password");
    } else {
      // Send OTP for password setup
      setIsSubmitting(true);
      try {
        const data = await forgotPassword(email);
        if (data.success) {
          toast({ title: "Code Sent", description: "Verification code sent to your email." });
          setStep("set-password-otp");
        } else {
          toast({ title: "Error", description: data.message || "Failed to send code", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
      }
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!password) return;
    onUpgradeComplete(password);
    handleClose();
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setIsSubmitting(true);
    try {
      const data = await verifyResetCode(email, otpCode);
      if (data.success) {
        setResetCode(otpCode);
        toast({ title: "Verified", description: "Code verified successfully" });
        if (passwordSet) {
          setStep("enter-password");
        } else {
          setStep("set-password-reset");
        }
      } else {
        toast({ title: "Error", description: data.message || "Invalid code", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await resetPassword(email, resetCode, password);
      if (data.success) {
        toast({ title: "Success", description: "Password set successfully" });
        onUpgradeComplete(password);
        handleClose();
      } else {
        toast({ title: "Error", description: data.message || "Failed to set password", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const handleResendOtp = async () => {
    setIsSubmitting(true);
    try {
      const data = await forgotPassword(email);
      if (data.success) {
        toast({ title: "Code Sent", description: "Verification code resent to your email." });
      } else {
        toast({ title: "Error", description: data.message || "Failed to resend code", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
      <AlertDialogContent className="max-w-sm">
        {step === "prompt" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Upgrade Account</AlertDialogTitle>
              <AlertDialogDescription>
                This email is already registered with us as a regular SME User. Do you want to upgrade your account to a financial expert?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>No</AlertDialogCancel>
              <Button onClick={(e) => { e.preventDefault(); handleYes(); }} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Yes
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === "enter-password" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Enter Your Password</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the password of your existing account to proceed with the upgrade.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 py-2">
              <Label htmlFor="upgrade-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="upgrade-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
              <Button onClick={(e) => { e.preventDefault(); handlePasswordSubmit(); }} disabled={!password}>
                Continue
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === "set-password-otp" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Verify Your Email</AlertDialogTitle>
              <AlertDialogDescription>
                You need to set a password first. Enter the 6-digit code sent to {email}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col items-center gap-3 py-2">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={handleResendOtp}
                disabled={isSubmitting}
              >
                Resend code
              </button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
              <Button onClick={(e) => { e.preventDefault(); handleVerifyOtp(); }} disabled={otpCode.length !== 6 || isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Verify
              </Button>
            </AlertDialogFooter>
          </>
        )}

        {step === "set-password-reset" && (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle>Set Your Password</AlertDialogTitle>
              <AlertDialogDescription>
                Create a password for your account to proceed with the upgrade.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
              <Button
                onClick={(e) => { e.preventDefault(); handleResetPassword(); }}
                disabled={!password || password !== confirmPassword || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Set Password & Upgrade
              </Button>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpgradeAccountDialog;
