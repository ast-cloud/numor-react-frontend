import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Pencil, ShieldCheck, ShieldOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddSubAccountDialog from "./AddSubAccountDialog";
import EditSubAccountPermissionsDialog from "./EditSubAccountPermissionsDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteSubAccount, listSubAccounts, setSubAccountDisabled, type SubAccount,
} from "@/lib/api/subAccounts";
import { MODULE_KEYS, MODULE_LABELS } from "@/lib/permissions";

const SubAccountsSection = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<SubAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SubAccount | null>(null);
  const [deleting, setDeleting] = useState<SubAccount | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSubAccounts();
      setItems(data);
    } catch (e) {
      // Most likely the backend endpoint doesn't exist yet — keep UI usable.
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleToggleDisabled = async (sa: SubAccount) => {
    try {
      await setSubAccountDisabled(sa.id, !sa.isDisabled);
      toast({ title: sa.isDisabled ? "Sub-account enabled" : "Sub-account disabled" });
      load();
    } catch (e) {
      toast({ title: "Failed", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteSubAccount(deleting.id);
      toast({ title: "Sub-account deleted" });
      setDeleting(null);
      load();
    } catch (e) {
      toast({ title: "Failed to delete", description: e instanceof Error ? e.message : "", variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">Team & Permissions</CardTitle>
          <CardDescription className="text-sm">
            Invite employees and control what they can access.
          </CardDescription>
        </div>
        <AddSubAccountDialog onCreated={load} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No sub-accounts yet. Click "Add Sub-Account" to create one.
          </div>
        ) : (
          <div className="divide-y border rounded-md">
            {items.map((sa) => (
              <div key={sa.id} className="p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{sa.name}</p>
                    {sa.isDisabled && <Badge variant="outline" className="text-xs">Disabled</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{sa.email}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {MODULE_KEYS.map((m) => {
                      const p = sa.permissions?.[m];
                      const label = p?.write ? "RW" : p?.read ? "R" : "—";
                      return (
                        <Badge key={m} variant="secondary" className="text-[10px] font-normal">
                          {MODULE_LABELS[m]}: {label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(sa)}>
                    <Pencil className="w-3 h-3 mr-1" /> Permissions
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleToggleDisabled(sa)}>
                    {sa.isDisabled ? <ShieldCheck className="w-3 h-3 mr-1" /> : <ShieldOff className="w-3 h-3 mr-1" />}
                    {sa.isDisabled ? "Enable" : "Disable"}
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => setDeleting(sa)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <EditSubAccountPermissionsDialog
        subAccount={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
      />

      <AlertDialog open={!!deleting} onOpenChange={(o) => { if (!o) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sub-account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting?.email} will no longer be able to log in. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SubAccountsSection;
