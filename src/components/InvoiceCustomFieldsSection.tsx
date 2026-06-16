import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Loader2, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  InvoiceCustomField,
  createInvoiceCustomField,
  deleteInvoiceCustomField,
  fetchInvoiceCustomFields,
  updateInvoiceCustomField,
} from "@/lib/api/invoiceCustomFields";

const InvoiceCustomFieldsSection = () => {
  const { toast } = useToast();
  const { isOrgOwner, can } = useAuth();
  const canWrite = isOrgOwner || can("organizationSettings", "write");

  const [fields, setFields] = useState<InvoiceCustomField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InvoiceCustomField | null>(null);
  const [name, setName] = useState("");
  const [values, setValues] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceCustomField | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInvoiceCustomFields();
      setFields(data);
    } catch {
      toast({
        title: "Failed to load custom fields",
        description: "Could not fetch invoice custom fields.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setValues([""]);
    setDialogOpen(true);
  };

  const openEdit = (field: InvoiceCustomField) => {
    setEditing(field);
    setName(field.name);
    setValues(field.predefinedValues.length ? [...field.predefinedValues] : [""]);
    setDialogOpen(true);
  };

  const handleValueChange = (idx: number, value: string) => {
    setValues((prev) => prev.map((v, i) => (i === idx ? value : v)));
  };

  const handleAddValue = () => setValues((prev) => [...prev, ""]);

  const handleRemoveValue = (idx: number) => {
    setValues((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== idx)));
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const cleaned = values.map((v) => v.trim()).filter(Boolean);
    if (!trimmedName) {
      toast({ title: "Name required", description: "Please enter a field name.", variant: "destructive" });
      return;
    }
    if (cleaned.length === 0) {
      toast({
        title: "Values required",
        description: "Add at least one predefined value.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      if (editing) {
        await updateInvoiceCustomField(editing.id, { name: trimmedName, predefinedValues: cleaned });
        toast({ title: "Custom field updated" });
      } else {
        await createInvoiceCustomField({ name: trimmedName, predefinedValues: cleaned });
        toast({ title: "Custom field created" });
      }
      setDialogOpen(false);
      await load();
    } catch {
      toast({
        title: editing ? "Failed to update" : "Failed to create",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteInvoiceCustomField(deleteTarget.id);
      toast({ title: "Custom field deleted" });
      setDeleteTarget(null);
      await load();
    } catch {
      toast({
        title: "Failed to delete",
        description: "Please try again.",
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
            <CardTitle className="text-xl font-semibold">Invoices</CardTitle>
            <CardDescription className="text-sm">
              Manage custom fields used on your invoices
            </CardDescription>
          </div>
          {canWrite && !isLoading && (
            <Button size="sm" className="h-7 text-xs px-2.5" onClick={openCreate}>
              <Plus className="w-3 h-3 mr-1.5" />
              Add Custom Field
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No custom fields yet.
                {canWrite ? " Add one to provide quick-select values when creating invoices." : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-start justify-between gap-4 p-4 border border-border rounded-lg bg-muted/20"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-medium text-sm">{field.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {field.predefinedValues.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No values</span>
                      ) : (
                        field.predefinedValues.map((v, i) => (
                          <Badge key={`${field.id}-${i}`} variant="secondary" className="font-normal">
                            {v}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                  {canWrite && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(field)}
                        aria-label="Edit field"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(field)}
                        aria-label="Delete field"
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

      <Dialog open={dialogOpen} onOpenChange={(open) => !isSaving && setDialogOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Custom Field" : "Add Custom Field"}</DialogTitle>
            <DialogDescription>
              Define a field name and the values that will be suggested when creating invoices.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cf-name">Field Name</Label>
              <Input
                id="cf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Project Code"
              />
            </div>
            <div className="space-y-2">
              <Label>Predefined Values</Label>
              <div className="space-y-2">
                {values.map((v, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input
                      value={v}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      placeholder={`Value ${idx + 1}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && idx === values.length - 1 && v.trim()) {
                          e.preventDefault();
                          handleAddValue();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleRemoveValue(idx)}
                      aria-label="Remove value"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                onClick={handleAddValue}
              >
                <Plus className="w-3 h-3 mr-1.5" />
                Add value
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom field?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget.name}" will be removed. This cannot be undone.`
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

export default InvoiceCustomFieldsSection;
