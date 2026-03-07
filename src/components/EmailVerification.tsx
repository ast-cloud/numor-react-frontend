import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { config } from "@/lib/config";

interface EmailVerificationProps {
  email: string;
  isVerified: boolean;
  onVerified: () => void;
}

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const EmailVerification = ({ email, isVerified, onVerified }: EmailVerificationProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"idle" | "otp" | "verified">(isVerified ? "verified" : "idle");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSendOtp = async () => {
    setIsSending(true);
    try {
      const res = await fetch(`${config.backendHost}/api/auth/verifyEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
        toast({ title: "OTP Sent", description: "Verification code sent to your email." });
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to send verification code.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`${config.backendHost}/api/auth/verifyEmailOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("verified");
        onVerified();
        toast({ title: "Verified", description: "Email verified successfully!" });
      } else {
        throw new Error(data.message || "Invalid OTP");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Verification failed.", variant: "destructive" });
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === "verified" || isVerified) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-green-600 mt-1">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Email verified</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {step === "idle" && (
        <div className="flex justify-end mt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs px-3"
            disabled={!isValidEmail(email) || isSending}
            onClick={handleSendOtp}
          >
            {isSending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Verify email
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/30">
          <p className="text-xs text-muted-foreground">Enter the 6-digit code sent to your email</p>
          <div className="flex items-center gap-3">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              type="button"
              size="sm"
              className="h-8"
              disabled={otp.length !== 6 || isVerifying}
              onClick={handleVerifyOtp}
            >
              {isVerifying ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Verify
            </Button>
          </div>
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={handleSendOtp}
            disabled={isSending}
          >
            Resend code
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;
