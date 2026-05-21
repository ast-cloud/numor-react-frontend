import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Mail, Phone, Home, Building2, MapPin, Hash, Globe, Receipt } from "lucide-react";
import { createClient, type ClientData } from "@/lib/api/clients";
import { INDIAN_STATES } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: ClientData) => void;
}

const COUNTRIES = [
  "India", "UAE", "United States", "United Kingdom", "Austria", "Belgium",
  "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
  "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy",
  "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland",
  "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden",
];

const getTaxSystem = (country: string): "GST" | "VAT" | "SALES" | "" => {
  if (!country) return "";
  if (country === "India") return "GST";
  if (country === "United States" || country === "US") return "SALES";
  return "VAT";
};

const getTaxLabel = (country: string): string => {
  const sys = getTaxSystem(country);
  if (sys === "GST") return "Tax ID (GST)";
  if (sys === "VAT") return "Tax ID (VAT)";
  if (sys === "SALES") return "Tax ID (Sales Tax)";
  return "Tax ID (GST/VAT/Sales Tax)";
};

const AddClientDialog = ({ open, onOpenChange, onClientCreated }: AddClientDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    taxId: "",
  });

  const reset = () => {
    setForm({
      name: "", email: "", phone: "", streetAddress: "",
      city: "", state: "", zipCode: "", country: "", taxId: "",
    });
  };

  const handleSave = async () => {
    const required: { key: keyof typeof form; label: string }[] = [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "streetAddress", label: "Street Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "zipCode", label: "Zip Code" },
      { key: "country", label: "Country" },
    ];
    const missing = required.find((f) => !form[f.key].trim());
    if (missing) {
      toast({
        title: `${missing.label} required`,
        description: `Please enter ${missing.label.toLowerCase()}.`,
        variant: "destructive",
      });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const created = await createClient({
        name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        streetAddress: form.streetAddress || null,
        city: form.city || null,
        state: form.state || null,
        zipCode: form.zipCode || null,
        country: form.country || null,
      });
      toast({ title: "Client created", description: "New client has been added." });
      onClientCreated(created);
      reset();
      onOpenChange(false);
    } catch {
      toast({
        title: "Save failed",
        description: "Could not create client.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-muted-foreground" />Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Client name"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-muted-foreground" />Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-muted-foreground" />Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Home className="w-3.5 h-3.5 text-muted-foreground" />Street Address *</Label>
            <Input
              value={form.streetAddress}
              onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-muted-foreground" />City *</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />State *</Label>
              {form.country === "India" ? (
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Hash className="w-3.5 h-3.5 text-muted-foreground" />Zip Code *</Label>
              <Input
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-muted-foreground" />Country *</Label>
              <Select value={form.country} onValueChange={(v) => setForm({ ...form, country: v, state: "" })}>
                <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                !form.name.trim() ||
                !form.email.trim() ||
                !form.streetAddress.trim() ||
                !form.city.trim() ||
                !form.state.trim() ||
                !form.zipCode.trim() ||
                !form.country.trim()
              }
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientDialog;
