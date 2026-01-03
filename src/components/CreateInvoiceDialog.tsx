import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  taxPercent: number;
}

interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  currency: string;
  clientName: string;
  clientAddress: string;
  lineItems: LineItem[];
  bankName: string;
  iban: string;
  swiftBic: string;
  bankAddress: string;
  notes: string;
}

const initialFormData: InvoiceFormData = {
  invoiceNumber: "",
  invoiceDate: new Date(),
  dueDate: undefined,
  currency: "USD",
  clientName: "",
  clientAddress: "",
  lineItems: [{ id: "1", description: "", quantity: 1, unit: "Pieces", rate: 0, taxPercent: 5 }],
  bankName: "",
  iban: "",
  swiftBic: "",
  bankAddress: "",
  notes: "",
};

const CreateInvoiceDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InvoiceFormData>(initialFormData);

  const handleInputChange = (field: keyof InvoiceFormData, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addLineItem = () => {
    const newId = String(formData.lineItems.length + 1);
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { id: newId, description: "", quantity: 1, unit: "Pieces", rate: 0, taxPercent: 5 }],
    }));
  };

  const removeLineItem = (id: string) => {
    if (formData.lineItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        lineItems: prev.lineItems.filter((item) => item.id !== id),
      }));
    }
  };

  const calculateLineTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.rate;
    const tax = subtotal * (item.taxPercent / 100);
    return subtotal + tax;
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const calculateTotalTax = () => {
    return formData.lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.rate;
      return sum + subtotal * (item.taxPercent / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const handleSubmit = () => {
    console.log("Invoice Data:", formData);
    setOpen(false);
    setFormData(initialFormData);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData(initialFormData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-9 w-9 rounded-full">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice No.</Label>
              <Input
                id="invoiceNumber"
                placeholder="INV-2026-0001"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !formData.invoiceDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.invoiceDate ? format(formData.invoiceDate, "dd MMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.invoiceDate}
                    onSelect={(date) => handleInputChange("invoiceDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !formData.dueDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "dd MMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => handleInputChange("dueDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Info */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Client Information</h3>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="e.g. Design Smith Interior Works LLC"
                value={formData.clientName}
                onChange={(e) => handleInputChange("clientName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea
                id="clientAddress"
                placeholder="e.g. Al Quoz 2, Dubai, UAE"
                value={formData.clientAddress}
                onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Line Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-3 bg-muted text-sm font-medium">
                <div className="col-span-4">Description</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-1">Tax %</div>
                <div className="col-span-1 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {formData.lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 p-3 border-t items-center">
                  <div className="col-span-4">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(item.id, "description", e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Select value={item.unit} onValueChange={(value) => handleLineItemChange(item.id, "unit", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pieces">Pieces</SelectItem>
                        <SelectItem value="Hours">Hours</SelectItem>
                        <SelectItem value="Days">Days</SelectItem>
                        <SelectItem value="Units">Units</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={item.rate || ""}
                      onChange={(e) => handleLineItemChange(item.id, "rate", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.taxPercent}
                      onChange={(e) => handleLineItemChange(item.id, "taxPercent", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-1 text-right font-medium">
                    {calculateLineTotal(item).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeLineItem(item.id)}
                      disabled={formData.lineItems.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="border-t bg-muted/50 p-3 space-y-2">
                <div className="flex justify-end gap-8 text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium w-24 text-right">{formData.currency} {calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-8 text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium w-24 text-right">{formData.currency} {calculateTotalTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-end gap-8 text-base font-semibold">
                  <span>Total:</span>
                  <span className="w-24 text-right">{formData.currency} {calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Bank / Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g. WIO Bank"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange("bankName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input
                  id="iban"
                  placeholder="e.g. AE730860000096565699265"
                  value={formData.iban}
                  onChange={(e) => handleInputChange("iban", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="swiftBic">SWIFT/BIC</Label>
                <Input
                  id="swiftBic"
                  placeholder="e.g. WIOBAEADXXX"
                  value={formData.swiftBic}
                  onChange={(e) => handleInputChange("swiftBic", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAddress">Bank Address</Label>
                <Input
                  id="bankAddress"
                  placeholder="e.g. Level 5, Etihad Airways Centre, Abu Dhabi"
                  value={formData.bankAddress}
                  onChange={(e) => handleInputChange("bankAddress", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Terms</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Payment due within 14 days of invoice date..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
