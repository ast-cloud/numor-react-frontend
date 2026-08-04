import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
import { Plus, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  InvoiceUnits,
  addCustomInvoiceUnit,
  deleteCustomInvoiceUnit,
  setActiveInvoiceUnits,
} from "@/lib/api/invoiceUnits";

interface InvoiceUnitsSectionProps {
  units: InvoiceUnits;
  onRefetch: () => Promise<void>;
  isLoading: boolean;
}

const InvoiceUnitsSection = ({ units, onRefetch, isLoading }: InvoiceUnitsSectionProps) => {
  const { toast } = useToast();
  const { isOrgOwner, can } = useAuth();
  const canWrite = isOrgOwner || can("organizationSettings", "write");

  const { systemUnits, customUnits, activeUnits } = units;
  const allUnits = [...systemUnits, ...customUnits];

  const [activeSet, setActiveSet] = useState<Set<string>>(new Set(activeUnits));
  const [isPersisting, setIsPersisting] = useState(false);

  useEffect(() => {
    setActiveSet(new Set(activeUnits));
  }, [activeUnits]);

  const [addOpen, setAddOpen] = useState(false);
  const [newUnit, setNewUnit] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleActive = async (unit: string, checked: boolean) => {
    if (isPersisting) return;
    const next = new Set(activeSet);
    if (checked) {
      next.add(unit);
    } else {
      if (next.size === 1) {
        toast({
          title: "At least one unit required",
          description: "Keep at least one unit active so the invoice dropdown isn't empty.",
          variant: "destructive",
        });
        return;
      }
      next.delete(unit);
    }

    const previous = activeSet;
    setActiveSet(next);
    setIsPersisting(true);
    try {
      await setActiveInvoiceUnits(Array.from(next));
    } catch (err) {
      setActiveSet(previous);
      toast({
        title: "Failed to update active units",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPersisting(false);
    }
  };

  const handleAddUnit = async () => {
    const trimmed = newUnit.trim();
    if (!trimmed) {
      toast({ title: "Unit name required", description: "Please enter a unit name.", variant: "destructive" });
      return;
    }
    setIsAdding(true);
    try {
      await addCustomInvoiceUnit(trimmed);
      toast({ title: "Custom unit added" });
      setAddOpen(false);
      setNewUnit("");
      await onRefetch();
    } catch (err) {
      toast({
        title: "Failed to add unit",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUnit = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCustomInvoiceUnit(deleteTarget);
      toast({ title: "Custom unit deleted" });
      setDeleteTarget(null);
      await onRefetch();
    } catch (err) {
      toast({
        title: "Failed to delete unit",
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
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Invoice Item Units</CardTitle>
          <CardDescription className="text-sm">
            Manage the units available for invoice line items and which ones show up when creating an invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Available Units */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Available Units</p>
                    <p className="text-xs text-muted-foreground">
                      Built-in units plus any custom units you create.
                      {canWrite ? " Click a unit to add it to your active list." : ""}
                    </p>
                  </div>
                  {canWrite && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2.5 shrink-0"
                      onClick={() => setAddOpen(true)}
                    >
                      <Plus className="w-3 h-3 mr-1.5" />
                      Add Custom Unit
                    </Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {systemUnits.map((unit) => {
                    const isActive = activeSet.has(unit);
                    return (
                      <Badge
                        key={unit}
                        variant={isActive ? "secondary" : "outline"}
                        role={canWrite ? "button" : undefined}
                        tabIndex={canWrite ? 0 : undefined}
                        onClick={() => canWrite && !isPersisting && toggleActive(unit, true)}
                        onKeyDown={(e) => {
                          if (canWrite && !isPersisting && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            toggleActive(unit, true);
                          }
                        }}
                        className={cn(
                          "font-normal",
                          canWrite && (isPersisting ? "opacity-60" : "cursor-pointer hover:opacity-80")
                        )}
                      >
                        {unit}
                      </Badge>
                    );
                  })}
                  {customUnits.map((unit) => {
                    const isActive = activeSet.has(unit);
                    return (
                      <Badge
                        key={unit}
                        variant={isActive ? "secondary" : "outline"}
                        role={canWrite ? "button" : undefined}
                        tabIndex={canWrite ? 0 : undefined}
                        onClick={() => canWrite && !isPersisting && toggleActive(unit, true)}
                        onKeyDown={(e) => {
                          if (canWrite && !isPersisting && (e.key === "Enter" || e.key === " ")) {
                            e.preventDefault();
                            toggleActive(unit, true);
                          }
                        }}
                        className={cn(
                          "font-normal gap-1 pr-1",
                          canWrite && (isPersisting ? "opacity-60" : "cursor-pointer hover:opacity-80")
                        )}
                      >
                        {unit}
                        {canWrite && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(unit);
                            }}
                            className="ml-0.5 rounded-full hover:bg-background/60 p-0.5"
                            aria-label={`Delete ${unit}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Active Units */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="font-medium text-sm">Active Units</p>
                  <p className="text-xs text-muted-foreground">
                    These units will be shown in the dropdown when creating invoice line items.
                    {canWrite ? " Click × to remove one." : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allUnits
                    .filter((unit) => activeSet.has(unit))
                    .map((unit) => (
                      <Badge key={unit} variant="secondary" className="font-normal gap-1 pr-1">
                        {unit}
                        {canWrite && (
                          <button
                            type="button"
                            onClick={() => toggleActive(unit, false)}
                            disabled={isPersisting}
                            className="ml-0.5 rounded-full hover:bg-background/60 p-0.5 disabled:opacity-50"
                            aria-label={`Deactivate ${unit}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={(open) => !isAdding && setAddOpen(open)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Unit</DialogTitle>
            <DialogDescription>
              Create a unit that will be added to your Available Units list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="unit-name">Unit Name</Label>
            <Input
              id="unit-name"
              value={newUnit}
              onChange={(e) => setNewUnit(e.target.value)}
              placeholder="e.g. Pallets"
              maxLength={50}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newUnit.trim()) {
                  e.preventDefault();
                  handleAddUnit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAddUnit} disabled={isAdding}>
              {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !isDeleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete custom unit?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `"${deleteTarget}" will be removed from Available Units. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteUnit();
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

export default InvoiceUnitsSection;
