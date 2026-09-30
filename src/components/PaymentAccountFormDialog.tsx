import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  PaymentAccount,
  PaymentAccountInput,
  createPaymentAccount,
  updatePaymentAccount,
} from "@/lib/api/paymentAccounts";

interface PaymentAccountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The set being edited, or null to create a new one. */
  editing?: PaymentAccount | null;
  /** Receives the saved set, so a caller can select it straight away. */
  onSaved: (account: PaymentAccount) => void;
}

const EMPTY: PaymentAccountInput = {
  nickname: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifsc: "",
  swift: "",
  bankAddress: "",
};

/** The detail fields, nickname aside - at least one must be filled. */
const DETAIL_FIELDS: (keyof Omit<PaymentAccountInput, "nickname">)[] = [
  "bankName",
  "accountName",
  "accountNumber",
  "ifsc",
  "swift",
  "bankAddress",
];

const toInput = (account: PaymentAccount): PaymentAccountInput => ({
  nickname: account.nickname,
  bankName: account.bankName ?? "",
  accountName: account.accountName ?? "",
  accountNumber: account.accountNumber ?? "",
  ifsc: account.ifsc ?? "",
  swift: account.swift ?? "",
  bankAddress: account.bankAddress ?? "",
});

/**
 * Create or edit one saved bank / payment detail set. Shared by the settings
 * page and the invoice dialog, so both offer the same form and the same rules.
 */
const PaymentAccountFormDialog = ({
  open,
  onOpenChange,
  editing = null,
  onSaved,
}: PaymentAccountFormDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState<PaymentAccountInput>(EMPTY);
  const [isSaving, setIsSaving] = useState(false);

  // Seed on open rather than on mount: the same instance is reused for the next
  // create, and a stale form would otherwise still hold the last one.
  useEffect(() => {
    if (open) setForm(editing ? toInput(editing) : EMPTY);
  }, [open, editing]);

  const setField = (key: keyof PaymentAccountInput, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    const nickname = form.nickname.trim();
    if (!nickname) {
      toast({
        title: "Nickname required",
        description: "Give this set a name you will recognise, e.g. HDFC Current.",
        variant: "destructive",
      });
      return;
    }

    // A nickname on its own would populate nothing when picked on an invoice.
    if (!DETAIL_FIELDS.some((key) => (form[key] ?? "").trim())) {
      toast({
        title: "Details required",
        description: "Fill at least one bank or payment field.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: PaymentAccountInput = { ...form, nickname };
      const saved = editing
        ? await updatePaymentAccount(editing.id, payload)
        : await createPaymentAccount(payload);

      toast({ title: editing ? "Payment details updated" : "Payment details saved" });
      onOpenChange(false);
      onSaved(saved);
    } catch (err) {
      toast({
        title: editing ? "Failed to update" : "Failed to save",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Payment Details" : "Add Payment Details"}</DialogTitle>
          <DialogDescription>
            Fill the fields that apply. Only the ones you fill appear on the invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pa-nickname">Nickname</Label>
            <Input
              id="pa-nickname"
              value={form.nickname}
              onChange={(e) => setField("nickname", e.target.value)}
              placeholder="e.g. HDFC Current"
            />
            <p className="text-xs text-muted-foreground">
              Only you see this. It is how you pick this set on an invoice.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pa-bankName">Bank Name</Label>
              <Input
                id="pa-bankName"
                value={form.bankName ?? ""}
                onChange={(e) => setField("bankName", e.target.value)}
                placeholder="e.g. HDFC Bank"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pa-accountName">Account Name</Label>
              <Input
                id="pa-accountName"
                value={form.accountName ?? ""}
                onChange={(e) => setField("accountName", e.target.value)}
                placeholder="e.g. Numor Technologies Pvt Ltd"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pa-accountNumber">Account Number / IBAN</Label>
              <Input
                id="pa-accountNumber"
                value={form.accountNumber ?? ""}
                onChange={(e) => setField("accountNumber", e.target.value)}
                placeholder="e.g. 1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pa-ifsc">IFSC Code</Label>
              <Input
                id="pa-ifsc"
                value={form.ifsc ?? ""}
                onChange={(e) => setField("ifsc", e.target.value)}
                placeholder="e.g. HDFC0000123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pa-swift">SWIFT/BIC</Label>
              <Input
                id="pa-swift"
                value={form.swift ?? ""}
                onChange={(e) => setField("swift", e.target.value)}
                placeholder="e.g. HDFCINBB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pa-bankAddress">Bank Address</Label>
              <Input
                id="pa-bankAddress"
                value={form.bankAddress ?? ""}
                onChange={(e) => setField("bankAddress", e.target.value)}
                placeholder="e.g. MG Road, Bengaluru"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {editing ? "Save changes" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentAccountFormDialog;
