import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ModulePermissions, ModuleKey } from "@/lib/authStore";
import { MODULE_KEYS, MODULE_LABELS } from "@/lib/permissions";
import { updateSubAccountPermissions, type SubAccount } from "@/lib/api/subAccounts";

type Props = {
  subAccount: SubAccount | null;
  onClose: () => void;
  onSaved: () => void;
  onDelete?: (sa: SubAccount) => void;
};

const EditSubAccountPermissionsDialog = ({ subAccount, onClose, onSaved, onDelete }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<ModulePermissions | null>(null);

  useEffect(() => {
    setPermissions(subAccount?.permissions ?? null);
  }, [subAccount]);

  const togglePerm = (module: ModuleKey, action: "read" | "write", value: boolean) => {
    setPermissions((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [module]: { ...prev[module] } };
      next[module][action] = value;
      if (action === "write" && value) next[module].read = true;
      if (action === "read" && !value) next[module].write = false;
      return next;
    });
  };

  const handleSave = async () => {
    if (!subAccount || !permissions) return;
    setLoading(true);
    try {
      await updateSubAccountPermissions(subAccount.id, permissions);
      toast({ title: "Permissions updated" });
      onSaved();
      onClose();
    } catch (e) {
      toast({ title: "Failed to update", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={!!subAccount} onOpenChange={(o) => { if (!o) { setPermissions(null); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Member — {subAccount?.name}</DialogTitle>
        </DialogHeader>
        {permissions && (
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
                  <Checkbox checked={permissions[m].read} onCheckedChange={(v) => togglePerm(m, "read", !!v)} />
                </div>
                <div className="flex justify-center">
                  <Checkbox checked={permissions[m].write} onCheckedChange={(v) => togglePerm(m, "write", !!v)} />
                </div>
              </div>
            ))}
          </div>
        )}
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-1.5">
            {onDelete && subAccount && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(subAccount)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setPermissions(null); onClose(); }} disabled={loading}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubAccountPermissionsDialog;
