import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ModulePermissions, ModuleKey } from "@/lib/authStore";
import { defaultPermissions, MODULE_KEYS, MODULE_LABELS } from "@/lib/permissions";
import { createSubAccount } from "@/lib/api/subAccounts";

type Props = {
  onCreated: () => void;
};

const AddSubAccountDialog = ({ onCreated }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<ModulePermissions>(defaultPermissions());

  const reset = () => {
    setEmail("");
    setPermissions(defaultPermissions());
  };

  const togglePerm = (module: ModuleKey, action: "read" | "write", value: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev, [module]: { ...prev[module] } };
      next[module][action] = value;
      // write implies read
      if (action === "write" && value) next[module].read = true;
      if (action === "read" && !value) next[module].write = false;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast({ title: "Missing fields", description: "Email is required.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createSubAccount({ email: email.trim(), permissions });
      setSent(true);
      setTimeout(() => {
        toast({ title: "Invitation sent", description: `A link has been sent to ${email} to set their password.` });
        reset();
        setSent(false);
        setOpen(false);
        onCreated();
      }, 1400);
    } catch (e) {
      toast({ title: "Failed to create", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (loading || sent) return; setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Sub-Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Sub-Account</DialogTitle>
        </DialogHeader>
        {sent && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg animate-fade-in">
            <div className="paperplane-fly">
              <Send className="w-12 h-12 text-primary" strokeWidth={1.75} />
            </div>
            <p className="mt-6 text-sm font-medium text-foreground animate-fade-in">Invitation sent!</p>
          </div>
        )}
        <div className="space-y-4 pt-2">
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sa-email">Email</Label>
              <Input id="sa-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="employee@example.com" />
            </div>
            <p className="text-xs text-muted-foreground">
              A link will be emailed to the user so they can set their own password.
            </p>

          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-3 px-3 py-2 bg-muted text-xs font-medium">
                <span>Module</span>
                <span className="text-center">Read</span>
                <span className="text-center">Write</span>
              </div>
              {MODULE_KEYS.map((m) => (
                <div key={m} className="grid grid-cols-3 px-3 py-2 items-center border-t">
                  <span className="text-sm">{MODULE_LABELS[m]}</span>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={permissions[m].read}
                      onCheckedChange={(v) => togglePerm(m, "read", !!v)}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Checkbox
                      checked={permissions[m].write}
                      onCheckedChange={(v) => togglePerm(m, "write", !!v)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Enabling Write automatically enables Read.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Send Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubAccountDialog;
