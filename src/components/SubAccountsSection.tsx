import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Pencil, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddSubAccountDialog from "./AddSubAccountDialog";
import EditSubAccountPermissionsDialog from "./EditSubAccountPermissionsDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  deleteSubAccount, listSubAccounts, setSubAccountDisabled, type SubAccount,
  listInvitations, type Invitation, createSubAccount,
} from "@/lib/api/subAccounts";
import { MODULE_KEYS, MODULE_LABELS } from "@/lib/permissions";

const formatDate = (s: string) => {
  try {
    return new Date(s).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
};

const SubAccountsSection = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<SubAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SubAccount | null>(null);
  const [deleting, setDeleting] = useState<SubAccount | null>(null);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSubAccounts();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const loadInvites = async () => {
    setLoadingInvites(true);
    try {
      const data = await listInvitations();
      setInvitations(data);
    } catch {
      setInvitations([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => { load(); loadInvites(); }, []);

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

  const onCreated = () => { load(); loadInvites(); };

  const handleResend = async (inv: Invitation) => {
    setResendingId(inv.id);
    try {
      await createSubAccount({ email: inv.email, permissions: inv.permissions });
      toast({ title: "Invitation resent", description: `A new invite has been sent to ${inv.email}.` });
      loadInvites();
    } catch (e) {
      toast({ title: "Failed to resend", description: e instanceof Error ? e.message : "", variant: "destructive" });
    } finally {
      setResendingId(null);
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
        <AddSubAccountDialog onCreated={onCreated} />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations
              {invitations.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1.5">{invitations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4">
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
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditing(sa)} title="Manage member">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="mt-4">
            {loadingInvites ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : invitations.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No pending invitations.
              </div>
            ) : (
              <div className="divide-y border rounded-md">
                {invitations.map((inv) => (
                  <div key={inv.id} className="p-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Sent {formatDate(inv.createdAt)} · {inv.isExpired ? "Expired" : "Expires"} {formatDate(inv.expiresAt)}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {MODULE_KEYS.map((m) => {
                          const p = inv.permissions?.[m];
                          const label = p?.write ? "RW" : p?.read ? "R" : "—";
                          return (
                            <Badge key={m} variant="secondary" className="text-[10px] font-normal">
                              {MODULE_LABELS[m]}: {label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5">
                      {inv.isExpired ? (
                        <Badge variant="destructive" className="text-[9px] gap-1 px-1.5 py-0">
                          <AlertTriangle className="w-2.5 h-2.5" /> Expired
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] gap-1 px-1.5 py-0">
                          <Clock className="w-2.5 h-2.5" /> Pending
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleResend(inv)} disabled={resendingId === inv.id} title="Resend invitation">
                        {resendingId === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <EditSubAccountPermissionsDialog
        subAccount={editing}
        onClose={() => setEditing(null)}
        onSaved={load}
        onToggleDisabled={async (sa) => {
          await handleToggleDisabled(sa);
          setEditing(null);
        }}
        onDelete={(sa) => {
          setEditing(null);
          setDeleting(sa);
        }}
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
