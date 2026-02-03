import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, CalendarIcon, Trash2, Upload, ArrowLeft, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoicePreview from "@/components/InvoicePreview";
import { INDIAN_STATES } from "@/lib/constants";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  taxPercent: number;
}

interface SellerInfo {
  logo: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  email: string;
  phone: string;
}

interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  currency: string;
  taxType: string;
  seller: SellerInfo;
  clientName: string;
  clientStreetAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  lineItems: LineItem[];
  bankName: string;
  iban: string;
  swiftBic: string;
  bankAddress: string;
  notes: string;
}

// Country-to-currency/tax defaults mapping
const countryDefaults: Record<string, { currency: string; taxType: string }> = {
  "India": { currency: "INR", taxType: "GST" },
  "UAE": { currency: "AED", taxType: "VAT" },
  "US": { currency: "USD", taxType: "Sales Tax" },
  "UK": { currency: "GBP", taxType: "VAT" },
  // EU Countries (27)
  "Austria": { currency: "EUR", taxType: "VAT" },
  "Belgium": { currency: "EUR", taxType: "VAT" },
  "Bulgaria": { currency: "EUR", taxType: "VAT" },
  "Croatia": { currency: "EUR", taxType: "VAT" },
  "Cyprus": { currency: "EUR", taxType: "VAT" },
  "Czech Republic": { currency: "EUR", taxType: "VAT" },
  "Denmark": { currency: "EUR", taxType: "VAT" },
  "Estonia": { currency: "EUR", taxType: "VAT" },
  "Finland": { currency: "EUR", taxType: "VAT" },
  "France": { currency: "EUR", taxType: "VAT" },
  "Germany": { currency: "EUR", taxType: "VAT" },
  "Greece": { currency: "EUR", taxType: "VAT" },
  "Hungary": { currency: "EUR", taxType: "VAT" },
  "Ireland": { currency: "EUR", taxType: "VAT" },
  "Italy": { currency: "EUR", taxType: "VAT" },
  "Latvia": { currency: "EUR", taxType: "VAT" },
  "Lithuania": { currency: "EUR", taxType: "VAT" },
  "Luxembourg": { currency: "EUR", taxType: "VAT" },
  "Malta": { currency: "EUR", taxType: "VAT" },
  "Netherlands": { currency: "EUR", taxType: "VAT" },
  "Poland": { currency: "EUR", taxType: "VAT" },
  "Portugal": { currency: "EUR", taxType: "VAT" },
  "Romania": { currency: "EUR", taxType: "VAT" },
  "Slovakia": { currency: "EUR", taxType: "VAT" },
  "Slovenia": { currency: "EUR", taxType: "VAT" },
  "Spain": { currency: "EUR", taxType: "VAT" },
  "Sweden": { currency: "EUR", taxType: "VAT" },
};

// Dummy seller data (would come from user settings)
const defaultSellerInfo: SellerInfo = {
  logo: "",
  name: "Acme Corporation LLC",
  streetAddress: "123 Business Street, Suite 100",
  city: "Dubai",
  state: "",
  zip: "",
  country: "UAE",
  taxId: "TRN-100234567890003",
  email: "billing@acmecorp.com",
  phone: "+971 4 123 4567",
};

const initialFormData: InvoiceFormData = {
  invoiceNumber: "",
  invoiceDate: new Date(),
  dueDate: undefined,
  currency: "AED",
  taxType: "VAT",
  seller: { ...defaultSellerInfo },
  clientName: "",
  clientStreetAddress: "",
  clientCity: "",
  clientState: "",
  clientZip: "",
  clientCountry: "",
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
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDateOpen, setInvoiceDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const handleInputChange = (field: keyof InvoiceFormData, value: string | Date | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSellerChange = (field: keyof SellerInfo, value: string) => {
    setFormData((prev) => {
      const updatedSeller = { ...prev.seller, [field]: value };
      
      // If country changed, update currency and tax type
      if (field === "country" && countryDefaults[value]) {
        // Check if client country differs - zero-rate taxes if cross-border
        const isCrossBorder = prev.clientCountry && prev.clientCountry !== value;
        const updatedLineItems = isCrossBorder 
          ? prev.lineItems.map(item => ({ ...item, taxPercent: 0 }))
          : prev.lineItems;
        
        return {
          ...prev,
          seller: updatedSeller,
          currency: countryDefaults[value].currency,
          taxType: countryDefaults[value].taxType,
          lineItems: updatedLineItems,
        };
      }
      
      // Check if changing to/from cross-border scenario
      if (field === "country") {
        const isCrossBorder = prev.clientCountry && prev.clientCountry !== value;
        const updatedLineItems = isCrossBorder 
          ? prev.lineItems.map(item => ({ ...item, taxPercent: 0 }))
          : prev.lineItems;
        return { ...prev, seller: updatedSeller, lineItems: updatedLineItems };
      }
      
      return { ...prev, seller: updatedSeller };
    });
  };

  const handleClientCountryChange = (value: string) => {
    setFormData((prev) => {
      const isCrossBorder = prev.seller.country && prev.seller.country !== value;
      const updatedLineItems = isCrossBorder 
        ? prev.lineItems.map(item => ({ ...item, taxPercent: 0 }))
        : prev.lineItems;
      
      return {
        ...prev,
        clientCountry: value,
        lineItems: updatedLineItems,
      };
    });
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

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const handleConfirmInvoice = () => {
    console.log("Invoice Confirmed:", formData);
    setOpen(false);
    setFormData(initialFormData);
    setShowPreview(false);
  };

  const handleSaveAsDraft = () => {
    console.log("Draft Invoice Data:", { ...formData, status: "draft" });
    setOpen(false);
    setFormData(initialFormData);
    setShowPreview(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData(initialFormData);
      setShowPreview(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-9 w-9 rounded-lg">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[95vh] overflow-hidden p-0", showPreview ? "max-w-[900px]" : "max-w-4xl")}>
        {showPreview ? (
          <div className="flex flex-col max-h-[95vh]">
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToForm}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Invoice Preview
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="flex justify-center py-6 bg-muted/30">
                <div className="flex flex-col gap-6">
                  <InvoicePreview formData={formData} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0">
              <Button variant="outline" onClick={handleBackToForm}>
                Back to Edit
              </Button>
              <Button onClick={handleConfirmInvoice}>
                Confirm & Create Invoice
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-h-[95vh] overflow-y-auto px-6">
            <DialogHeader className="py-6">
              <DialogTitle className="text-xl font-semibold">Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pb-6">
            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Popover open={invoiceDateOpen} onOpenChange={setInvoiceDateOpen}>
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
                      onSelect={(date) => {
                        handleInputChange("invoiceDate", date);
                        setInvoiceDateOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
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
                      onSelect={(date) => {
                        handleInputChange("dueDate", date);
                        setDueDateOpen(false);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-4">
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
              <div className="space-y-2">
                <Label>Tax Type</Label>
                <Select value={formData.taxType} onValueChange={(value) => handleInputChange("taxType", value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seller Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Seller Information</h3>
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-16 w-16 border">
                    <AvatarImage src={formData.seller.logo} alt="Seller logo" />
                    <AvatarFallback className="bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Label htmlFor="sellerLogo" className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Upload Logo
                  </Label>
                  <Input
                    id="sellerLogo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleSellerChange("logo", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sellerName">Name</Label>
                    <Input
                      id="sellerName"
                      placeholder="e.g. Acme Corporation LLC"
                      value={formData.seller.name}
                      onChange={(e) => handleSellerChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerTaxId">Tax ID</Label>
                    <Input
                      id="sellerTaxId"
                      placeholder="e.g. TRN-100234567890003"
                      value={formData.seller.taxId}
                      onChange={(e) => handleSellerChange("taxId", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerEmail">Email</Label>
                    <Input
                      id="sellerEmail"
                      type="email"
                      placeholder="e.g. billing@acmecorp.com"
                      value={formData.seller.email}
                      onChange={(e) => handleSellerChange("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sellerPhone">Phone Number</Label>
                    <Input
                      id="sellerPhone"
                      placeholder="e.g. +971 4 123 4567"
                      value={formData.seller.phone}
                      onChange={(e) => handleSellerChange("phone", e.target.value)}
                    />
                  </div>
                  {/* Business Address Subgroup */}
                  <div className="md:col-span-2 space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Business Address
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="sellerStreetAddress">Street Address</Label>
                        <Input
                          id="sellerStreetAddress"
                          placeholder="e.g. 123 Business Street, Suite 100"
                          value={formData.seller.streetAddress}
                          onChange={(e) => handleSellerChange("streetAddress", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sellerCity">City</Label>
                        <Input
                          id="sellerCity"
                          placeholder="e.g. Dubai"
                          value={formData.seller.city}
                          onChange={(e) => handleSellerChange("city", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sellerState">State / Province</Label>
                        {formData.seller.country === "India" ? (
                          <Select
                            value={formData.seller.state}
                            onValueChange={(value) => handleSellerChange("state", value)}
                          >
                            <SelectTrigger id="sellerState">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {INDIAN_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="sellerState"
                            placeholder="e.g. Dubai"
                            value={formData.seller.state}
                            onChange={(e) => handleSellerChange("state", e.target.value)}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sellerZip">ZIP / Postal Code</Label>
                        <Input
                          id="sellerZip"
                          placeholder="e.g. 00000"
                          value={formData.seller.zip}
                          onChange={(e) => handleSellerChange("zip", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sellerCountry">Country</Label>
                        <Select 
                          value={formData.seller.country} 
                          onValueChange={(value) => handleSellerChange("country", value)}
                        >
                          <SelectTrigger id="sellerCountry">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="UAE">UAE</SelectItem>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="Austria">Austria</SelectItem>
                            <SelectItem value="Belgium">Belgium</SelectItem>
                            <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                            <SelectItem value="Croatia">Croatia</SelectItem>
                            <SelectItem value="Cyprus">Cyprus</SelectItem>
                            <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                            <SelectItem value="Denmark">Denmark</SelectItem>
                            <SelectItem value="Estonia">Estonia</SelectItem>
                            <SelectItem value="Finland">Finland</SelectItem>
                            <SelectItem value="France">France</SelectItem>
                            <SelectItem value="Germany">Germany</SelectItem>
                            <SelectItem value="Greece">Greece</SelectItem>
                            <SelectItem value="Hungary">Hungary</SelectItem>
                            <SelectItem value="Ireland">Ireland</SelectItem>
                            <SelectItem value="Italy">Italy</SelectItem>
                            <SelectItem value="Latvia">Latvia</SelectItem>
                            <SelectItem value="Lithuania">Lithuania</SelectItem>
                            <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                            <SelectItem value="Malta">Malta</SelectItem>
                            <SelectItem value="Netherlands">Netherlands</SelectItem>
                            <SelectItem value="Poland">Poland</SelectItem>
                            <SelectItem value="Portugal">Portugal</SelectItem>
                            <SelectItem value="Romania">Romania</SelectItem>
                            <SelectItem value="Slovakia">Slovakia</SelectItem>
                            <SelectItem value="Slovenia">Slovenia</SelectItem>
                            <SelectItem value="Spain">Spain</SelectItem>
                            <SelectItem value="Sweden">Sweden</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
              {/* Client Address Subgroup */}
              <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Client Address
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="clientStreetAddress">Street Address</Label>
                    <Input
                      id="clientStreetAddress"
                      placeholder="e.g. 123 Business Street, Suite 100"
                      value={formData.clientStreetAddress}
                      onChange={(e) => handleInputChange("clientStreetAddress", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCity">City</Label>
                    <Input
                      id="clientCity"
                      placeholder="e.g. Dubai"
                      value={formData.clientCity}
                      onChange={(e) => handleInputChange("clientCity", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientState">State / Province</Label>
                    {formData.clientCountry === "India" ? (
                      <Select
                        value={formData.clientState}
                        onValueChange={(value) => handleInputChange("clientState", value)}
                      >
                        <SelectTrigger id="clientState">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="clientState"
                        placeholder="e.g. Dubai"
                        value={formData.clientState}
                        onChange={(e) => handleInputChange("clientState", e.target.value)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientZip">ZIP / Postal Code</Label>
                    <Input
                      id="clientZip"
                      placeholder="e.g. 00000"
                      value={formData.clientZip}
                      onChange={(e) => handleInputChange("clientZip", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientCountry">Country</Label>
                    <Select 
                      value={formData.clientCountry} 
                      onValueChange={handleClientCountryChange}
                    >
                      <SelectTrigger id="clientCountry">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="UAE">UAE</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="Austria">Austria</SelectItem>
                        <SelectItem value="Belgium">Belgium</SelectItem>
                        <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                        <SelectItem value="Croatia">Croatia</SelectItem>
                        <SelectItem value="Cyprus">Cyprus</SelectItem>
                        <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                        <SelectItem value="Denmark">Denmark</SelectItem>
                        <SelectItem value="Estonia">Estonia</SelectItem>
                        <SelectItem value="Finland">Finland</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="Greece">Greece</SelectItem>
                        <SelectItem value="Hungary">Hungary</SelectItem>
                        <SelectItem value="Ireland">Ireland</SelectItem>
                        <SelectItem value="Italy">Italy</SelectItem>
                        <SelectItem value="Latvia">Latvia</SelectItem>
                        <SelectItem value="Lithuania">Lithuania</SelectItem>
                        <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                        <SelectItem value="Malta">Malta</SelectItem>
                        <SelectItem value="Netherlands">Netherlands</SelectItem>
                        <SelectItem value="Poland">Poland</SelectItem>
                        <SelectItem value="Portugal">Portugal</SelectItem>
                        <SelectItem value="Romania">Romania</SelectItem>
                        <SelectItem value="Slovakia">Slovakia</SelectItem>
                        <SelectItem value="Slovenia">Slovenia</SelectItem>
                        <SelectItem value="Spain">Spain</SelectItem>
                        <SelectItem value="Sweden">Sweden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
                          <SelectItem value="Units">Units</SelectItem>
                          <SelectItem value="Hours">Hours</SelectItem>
                          <SelectItem value="Days">Days</SelectItem>
                          <SelectItem value="Weeks">Weeks</SelectItem>
                          <SelectItem value="Months">Months</SelectItem>
                          <SelectItem value="Kg">Kg</SelectItem>
                          <SelectItem value="Grams">Grams</SelectItem>
                          <SelectItem value="Liters">Liters</SelectItem>
                          <SelectItem value="Meters">Meters</SelectItem>
                          <SelectItem value="Sq. Meters">Sq. Meters</SelectItem>
                          <SelectItem value="Feet">Feet</SelectItem>
                          <SelectItem value="Sq. Feet">Sq. Feet</SelectItem>
                          <SelectItem value="Boxes">Boxes</SelectItem>
                          <SelectItem value="Cartons">Cartons</SelectItem>
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
            <div className="flex justify-end gap-3 pt-4 pb-6 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleSaveAsDraft}>
                Save as Draft
              </Button>
              <Button onClick={handlePreview}>
                Create Invoice
              </Button>
            </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateInvoiceDialog;
