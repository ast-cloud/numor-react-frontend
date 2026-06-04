import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { config } from "@/lib/config";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface InvitationData {
  email: string;
  organizationName: string;
  expiresAt: string;
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token") || "";

  const [verifying, setVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setVerifyError("Invalid invitation link");
        setVerifying(false);
        return;
      }
      try {
        const res = await fetch(`${config.backendHost}/api/auth/verifyInvitation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const json = await res.json().catch(() => ({}));
        if (json?.success) {
          setInvitation(json.data);
        } else {
          setVerifyError(json?.message || "Invitation verification failed");
        }
      } catch {
        setVerifyError("Network error. Please try again.");
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${config.backendHost}/api/auth/createSubAccount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: name.trim(), password, phone: phone.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (json?.success) {
        toast({ title: "Account created", description: "You can now log in." });
        navigate("/login", { replace: true });
      } else {
        toast({ title: "Error", description: json?.message || "Failed to create account", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-md mx-auto px-4 py-16">
        {verifying ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Verifying invitation...</p>
          </div>
        ) : verifyError ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold">Invitation Unavailable</h1>
            <p className="text-sm text-muted-foreground">{verifyError}</p>
            <Button asChild variant="outline">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 space-y-6">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-semibold">Join Numor</h1>
              <p className="text-sm text-muted-foreground">
                You've been invited to join{" "}
                <span className="font-medium text-foreground">{invitation?.organizationName}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={invitation?.email || ""} disabled className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="pl-9" placeholder="Jane Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="Optional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="pl-9" />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Join Numor
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation;
