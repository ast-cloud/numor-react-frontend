import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { PaymentAccount, deletePaymentAccount } from "@/lib/api/paymentAccounts";
import PaymentAccountFormDialog from "@/components/PaymentAccountFormDialog";

interface PaymentAccountsSectionProps {
  accounts: PaymentAccount[];
  onRefetch: () => Promise<void>;
  isLoading: boolean;
}

/** What each saved set shows beneath its nickname, in reading order. */
const DETAIL_FIELDS: { key: keyof Omit<PaymentAccount, "id" | "nickname">; label: string }[] = [
  { key: "bankName", label: "Bank" },
  { key: "accountName", label: "Account name" },
  { key: "accountNumber", label: "Account no. / IBAN" },
  { key: "ifsc", label: "IFSC" },
  { key: "swift", label: "SWIFT/BIC" },
  { key: "bankAddress", label: "Bank address" },
];

/**
 * Account-level bank / payment detail sets. Each is saved under a nickname and
 * picked from the card list while creating an invoice, so the same numbers are
 * never retyped.
 */
const PaymentAccountsSection = ({ accounts, onRefetch, isLoading }: PaymentAccountsSectionProps) => {
  const { toast } = useToast();
  const { isOrgOwner, can } = useAuth();
  const canWrite = isOrgOwner || can("organizationSettings", "write");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (account: PaymentAccount) => {
    setEditing(account);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deletePaymentAccount(deleteTarget.id);
      toast({ title: "Payment details deleted" });
      setDeleteTarget(null);
      await onRefetch();
    } catch (err) {
      toast({
        title: "Failed to delete",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">Payment / Bank Details</CardTitle>
            <CardDescription className="text-sm">
              Save the accounts you get paid into, then pick one while creating an invoice
            </CardDescription>
          </div>
          {canWrite && !isLoading && (
            <Button size="sm" className="h-7 text-xs px-2.5" onClick={openCreate}>
              <Plus className="w-3 h-3 mr-1.5" />
              Add Payment Details
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Landmark className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No saved payment details yet.
                {canWrite ? " Add a set to stop retyping them on every invoice." : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg bg-muted/20"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium text-sm">{account.nickname}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                      {DETAIL_FIELDS.filter(({ key }) => account[key]).map(({ key, label }) => (
                        <p key={key} className="text-xs text-muted-foreground truncate">
                          <span className="font-medium text-foreground/70">{label}:</span>{" "}
                          {account[key]}
                        </p>
                      ))}
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(account)}
                        aria-label="Edit payment details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(account)}
                        aria-label="Delete payment details"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <PaymentAccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSaved={onRefetch}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete payment details?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.nickname}" will no longer be offered on new invoices. Invoices already using it keep the details they were issued with.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PaymentAccountsSection;
