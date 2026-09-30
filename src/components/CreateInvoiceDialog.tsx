import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, CalendarIcon, Trash2, Upload, ArrowLeft, MapPin, ChevronDown, Settings2, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import InvoicePreviewWrapper from "@/components/InvoicePreview";
import { INDIAN_STATES } from "@/lib/constants";
import { fetchCurrentOrganization, fetchOrganizationLogo } from "@/lib/api/user";
import { fetchClients, type ClientData } from "@/lib/api/clients";
import { fetchInvoiceUnits } from "@/lib/api/invoiceUnits";
import { fetchPaymentAccounts, type PaymentAccount } from "@/lib/api/paymentAccounts";
import { getTaxLabel, getTaxSystem } from "@/lib/taxSystem";
import AddClientDialog from "@/components/AddClientDialog";
import PaymentAccountFormDialog from "@/components/PaymentAccountFormDialog";
import { useAuth } from "@/hooks/use-auth";
import {
  createInvoice,
  updateInvoice,
  finalizeInvoice,
  fetchInvoice,
  type InvoiceData,
} from "@/lib/api/invoices";
import { z } from "zod";
import { formatMoney } from "@/lib/amountInWords";
import { toast } from "@/hooks/use-toast";
import type { InvoiceCustomField } from "@/lib/api/invoiceCustomFields";

interface InvoiceCustomFieldValue {
  definitionId: string;
  name: string;
  value: string;
}

/** Last four digits only - a card in the picker should not print a full account. */
const maskAccountNumber = (value?: string | null) => {
  const trimmed = (value ?? "").replace(/s+/g, "");
  if (!trimmed) return "";
  return trimmed.length <= 4 ? trimmed : `•••• ${trimmed.slice(-4)}`;
};

// Fallback used until the organization's active units load (or if that fetch fails).
const DEFAULT_UNIT_OPTIONS = [
  "Units", "Hours", "Days", "Weeks", "Months", "Kg", "Grams", "Liters",
  "Meters", "Sq. Meters", "Feet", "Sq. Feet", "Boxes", "Cartons",
];

interface CreateInvoiceDialogProps {
  onInvoiceCreated?: () => void;
  editInvoiceId?: string | null;
  editOpen?: boolean;
  onEditOpenChange?: (open: boolean) => void;
}

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
  clientEmail: string;
  clientStreetAddress: string;
  clientCity: string;
  clientState: string;
  clientZip: string;
  clientCountry: string;
  clientTaxId: string;
  lineItems: LineItem[];
  bankName: string;
  accountName: string;
  iban: string;
  swiftBic: string;
  ifscCode: string;
  bankAddress: string;
  notes: string;
  customFields: InvoiceCustomFieldValue[];
}

// Country-to-currency/tax defaults mapping
const countryDefaults: Record<string, { currency: string; taxType: string }> = {
  India: { currency: "INR", taxType: "GST" },
  UAE: { currency: "AED", taxType: "VAT" },
  US: { currency: "USD", taxType: "Sales Tax" },
  UK: { currency: "GBP", taxType: "VAT" },
  // EU Countries (27)
  Austria: { currency: "EUR", taxType: "VAT" },
  Belgium: { currency: "EUR", taxType: "VAT" },
  Bulgaria: { currency: "EUR", taxType: "VAT" },
  Croatia: { currency: "EUR", taxType: "VAT" },
  Cyprus: { currency: "EUR", taxType: "VAT" },
  "Czech Republic": { currency: "EUR", taxType: "VAT" },
  Denmark: { currency: "EUR", taxType: "VAT" },
  Estonia: { currency: "EUR", taxType: "VAT" },
  Finland: { currency: "EUR", taxType: "VAT" },
  France: { currency: "EUR", taxType: "VAT" },
  Germany: { currency: "EUR", taxType: "VAT" },
  Greece: { currency: "EUR", taxType: "VAT" },
  Hungary: { currency: "EUR", taxType: "VAT" },
  Ireland: { currency: "EUR", taxType: "VAT" },
  Italy: { currency: "EUR", taxType: "VAT" },
  Latvia: { currency: "EUR", taxType: "VAT" },
  Lithuania: { currency: "EUR", taxType: "VAT" },
  Luxembourg: { currency: "EUR", taxType: "VAT" },
  Malta: { currency: "EUR", taxType: "VAT" },
  Netherlands: { currency: "EUR", taxType: "VAT" },
  Poland: { currency: "EUR", taxType: "VAT" },
  Portugal: { currency: "EUR", taxType: "VAT" },
  Romania: { currency: "EUR", taxType: "VAT" },
  Slovakia: { currency: "EUR", taxType: "VAT" },
  Slovenia: { currency: "EUR", taxType: "VAT" },
  Spain: { currency: "EUR", taxType: "VAT" },
  Sweden: { currency: "EUR", taxType: "VAT" },
};

// Tax percentage options by country
const taxPercentOptions: Record<string, number[]> = {
  UAE: [0, 5],
  India: [0, 5, 18, 28],
  UK: [0, 5, 20],
};

// EU countries that should have free input for tax %
const euCountries = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
];

const hasTaxDropdown = (country: string): boolean => {
  return country in taxPercentOptions;
};

const getTaxOptions = (country: string): number[] => {
  return taxPercentOptions[country] || [];
};

// Empty default seller - will be filled from org API
const emptySellerInfo: SellerInfo = {
  logo: "",
  name: "",
  streetAddress: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  taxId: "",
  email: "",
  phone: "",
};

const getInitialFormData = (seller?: SellerInfo): InvoiceFormData => {
  const s = seller || emptySellerInfo;
  const defaults =
    s.country && countryDefaults[s.country] ? countryDefaults[s.country] : { currency: "USD", taxType: "None" };
  return {
    invoiceNumber: "",
    invoiceDate: new Date(),
    dueDate: undefined,
    currency: defaults.currency,
    taxType: defaults.taxType,
    seller: { ...s },
    clientName: "",
    clientEmail: "",
    clientStreetAddress: "",
    clientCity: "",
    clientState: "",
    clientZip: "",
    clientCountry: "",
    clientTaxId: "",
    // No rows to begin with: the table offers a single button to add the first.
    lineItems: [],
    bankName: "",
    accountName: "",
    iban: "",
    swiftBic: "",
    ifscCode: "",
    bankAddress: "",
    notes: "",
    customFields: [],
  };
};

const mapInvoiceDataToForm = (
  inv: InvoiceData,
  orgSeller?: SellerInfo,
  clients?: ClientData[],
  customFieldDefs?: InvoiceCustomField[],
): InvoiceFormData => {
  // Build seller from nested object OR flat fields
  const seller: SellerInfo = inv.seller
    ? {
        logo: "",
        name: inv.seller.name || "",
        streetAddress: inv.seller.streetAddress || "",
        city: inv.seller.city || "",
        state: inv.seller.state || "",
        zip: inv.seller.zipCode || "",
        country: inv.seller.country || "",
        taxId: inv.seller.taxId || "",
        email: inv.seller.email || "",
        phone: inv.seller.phone || "",
      }
    : {
        logo: "",
        name: inv.sellerName || orgSeller?.name || "",
        streetAddress: inv.sellerStreetAddress || orgSeller?.streetAddress || "",
        city: inv.sellerCity || orgSeller?.city || "",
        state: inv.sellerState || orgSeller?.state || "",
        zip: inv.sellerZipCode || orgSeller?.zip || "",
        country: inv.sellerCountry || orgSeller?.country || "",
        taxId: inv.sellerTaxId || orgSeller?.taxId || "",
        email: inv.sellerEmail || orgSeller?.email || "",
        phone: inv.sellerPhone || orgSeller?.phone || "",
      };

  // Resolve client from nested object, or look up from clients list
  let clientName = inv.client?.name || "";
  let clientEmail = inv.client?.email || "";
  let clientStreetAddress = inv.client?.streetAddress || "";
  let clientCity = inv.client?.city || "";
  let clientState = inv.client?.state || "";
  let clientZip = inv.client?.zipCode || "";
  let clientCountry = inv.client?.country || "";
  let clientTaxId = "";

  if (!clientName && clients && inv.clientId) {
    const matched = clients.find((c) => c.id === inv.clientId);
    if (matched) {
      clientName = matched.name || "";
      clientEmail = matched.email || "";
      clientStreetAddress = matched.streetAddress || "";
      clientCity = matched.city || "";
      clientState = matched.state || "";
      clientZip = matched.zipCode || "";
      clientCountry = matched.country || "";
      clientTaxId = matched.taxId || "";
    }
  }

  return {
    invoiceNumber: inv.invoiceNumber || "",
    invoiceDate: inv.issueDate ? new Date(inv.issueDate) : new Date(),
    dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
    currency: inv.currency || "USD",
    taxType: inv.taxType || (seller.country && countryDefaults[seller.country]?.taxType) || "None",
    seller,
    clientName,
    clientEmail,
    clientStreetAddress,
    clientCity,
    clientState,
    clientZip,
    clientCountry,
    clientTaxId,
    lineItems: inv.items?.length
      ? inv.items.map((item, i) => ({
          id: String(i + 1),
          description: item.itemName || item.description || "",
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unitType || "Units",
          rate: parseFloat(item.unitPrice) || 0,
          taxPercent: parseFloat(item.taxRate) || 0,
        }))
      : [],
    bankName: inv.bankDetails?.bankName || "",
    accountName: inv.bankDetails?.accountName || "",
    iban: inv.bankDetails?.accountNumber || "",
    swiftBic: inv.bankDetails?.swift || "",
    ifscCode: inv.bankDetails?.ifsc || "",
    bankAddress: inv.bankAddress || "",
    notes: inv.notes || "",
    // The invoice carries the field's name and value, but the checkboxes below
    // are keyed by definition id. Fall back to matching on name when the API
    // does not send an id - without a real id the field renders unticked, the
    // user ticks it again, and the invoice ends up holding it twice.
    customFields: (inv.customFields ?? []).map((f) => ({
      definitionId:
        f.definitionId != null
          ? String(f.definitionId)
          : String(customFieldDefs?.find((d) => d.name === f.name)?.id ?? ""),
      name: f.name,
      value: f.value ?? "",
    })),
  };
};

const CreateInvoiceDialog = ({
  onInvoiceCreated,
  editInvoiceId,
  editOpen,
  onEditOpenChange,
}: CreateInvoiceDialogProps) => {
  const isEditMode = !!editInvoiceId;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEditMode ? (editOpen ?? false) : internalOpen;
  const setOpen = isEditMode ? (v: boolean) => onEditOpenChange?.(v) : setInternalOpen;

  const [formData, setFormData] = useState<InvoiceFormData>(getInitialFormData());
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDateOpen, setInvoiceDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [sellerExpanded, setSellerExpanded] = useState(false);
  const [savedClients, setSavedClients] = useState<ClientData[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [orgCustomFieldDefs, setOrgCustomFieldDefs] = useState<InvoiceCustomField[]>([]);
  const [unitOptions, setUnitOptions] = useState<string[]>(DEFAULT_UNIT_OPTIONS);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  // The selection is held as a nickname rather than an id because that is what
  // the invoice stores, so reopening one preselects without a second lookup.
  const [selectedPaymentNickname, setSelectedPaymentNickname] = useState<string | null>(null);
  const [paymentAccountDialogOpen, setPaymentAccountDialogOpen] = useState(false);
  const { can } = useAuth();
  const canAddClient = can("income", "write");

  // Fetch organization data and clients when dialog opens
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    fetchInvoiceUnits()
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.activeUnits) && data.activeUnits.length > 0) {
          setUnitOptions(data.activeUnits);
        }
      })
      .catch(() => {
        // Keep DEFAULT_UNIT_OPTIONS fallback so invoice creation never breaks.
      });

    fetchPaymentAccounts()
      .then((accounts) => {
        if (cancelled) return;
        setPaymentAccounts(accounts);
      })
      .catch(() => {
        // No saved sets on offer, so the bank fields stay typed by hand.
      });

    // In edit mode, fetch invoice details
    if (isEditMode && editInvoiceId) {
      setEditLoading(true);
      Promise.all([
        fetchInvoice(editInvoiceId),
        fetchClients(),
        fetchOrganizationLogo().catch(() => null),
        fetchCurrentOrganization().catch(() => null),
      ])
        .then(([invoiceData, clientData, logoUrl, org]) => {
          if (cancelled) return;
          console.log("Invoice data received:", JSON.stringify(invoiceData));
          setSavedClients(clientData);
          const defs: InvoiceCustomField[] = Array.isArray(org?.customFieldDefinitions)
            ? org.customFieldDefinitions.map((f: { id: string | number; name: string; predefinedValues?: string[] }) => ({
                id: String(f.id),
                name: f.name,
                predefinedValues: Array.isArray(f.predefinedValues) ? f.predefinedValues : [],
              }))
            : [];
          setOrgCustomFieldDefs(defs);
          const mapped = mapInvoiceDataToForm(invoiceData, undefined, clientData, defs);
          if (logoUrl) mapped.seller.logo = logoUrl;
          console.log("Mapped form data:", JSON.stringify(mapped));
          setFormData(mapped);
          // Nothing is selected when the set has since been renamed or deleted;
          // the values on the invoice are unaffected either way.
          setSelectedPaymentNickname(invoiceData.bankDetails?.nickname ?? null);
          if (invoiceData.clientId) {
            setSelectedClientId(invoiceData.clientId);
          }
        })
        .catch((err) => {
          console.error("Failed to load invoice data:", err);
          toast({ title: "Error", description: "Failed to load invoice data", variant: "destructive" });
        })
        .finally(() => setEditLoading(false));
    } else {
      Promise.all([fetchCurrentOrganization(), fetchOrganizationLogo().catch(() => null)])
        .then(([org, logoUrl]) => {
          if (cancelled) return;
          const seller: SellerInfo = {
            logo: logoUrl || "",
            name: org.name || "",
            streetAddress: org.streetAddress || "",
            city: org.city || "",
            state: org.state || "",
            zip: org.zipCode || "",
            country: org.country || "",
            taxId: org.taxId || "",
            email: org.email || "",
            phone: org.phone || "",
          };
          const defs: InvoiceCustomField[] = Array.isArray(org?.customFieldDefinitions)
            ? org.customFieldDefinitions.map((f: { id: string | number; name: string; predefinedValues?: string[] }) => ({
                id: String(f.id),
                name: f.name,
                predefinedValues: Array.isArray(f.predefinedValues) ? f.predefinedValues : [],
              }))
            : [];
          setOrgCustomFieldDefs(defs);
          setFormData(getInitialFormData(seller));
        })
        .catch(() => {});

      fetchClients()
        .then((clients) => {
          if (cancelled) return;
          setSavedClients(clients);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [open, editInvoiceId, isEditMode]);

  // Resolves only while the set still exists. A nickname that no longer matches
  // one leaves the fields unlocked, holding whatever the invoice was issued with.
  const selectedPaymentAccount =
    paymentAccounts.find((a) => a.nickname === selectedPaymentNickname) ?? null;

  // Details an invoice was issued with that match no saved set - from before this
  // picker existed, or from a set since renamed. Shown rather than dropped: they
  // are still what the PDF prints.
  const legacyBankSummary = selectedPaymentAccount
    ? ""
    : [formData.bankName, maskAccountNumber(formData.iban), formData.accountName]
        .filter(Boolean)
        .join(" - ");

  /** Copies a saved set onto the invoice. The values travel, not a reference. */
  const applyPaymentAccount = (account: PaymentAccount) => {
    setSelectedPaymentNickname(account.nickname);
    setFormData((prev) => ({
      ...prev,
      bankName: account.bankName ?? "",
      accountName: account.accountName ?? "",
      iban: account.accountNumber ?? "",
      ifscCode: account.ifsc ?? "",
      swiftBic: account.swift ?? "",
      bankAddress: account.bankAddress ?? "",
    }));
  };

  const handlePaymentAccountSelect = (accountId: string) => {
    const account = paymentAccounts.find((a) => a.id === accountId);
    if (account) applyPaymentAccount(account);
  };

  // Saved from the Add New card: list it and select it, so the click that created
  // it also does what the user came for.
  const handlePaymentAccountCreated = (account: PaymentAccount) => {
    setPaymentAccounts((prev) => [...prev.filter((a) => a.id !== account.id), account]);
    applyPaymentAccount(account);
  };


  /**
   * Copies a saved client onto the invoice. The values travel, not a reference,
   * so editing the client later never rewrites an issued invoice.
   *
   * Shared by selecting a card and by creating one: they used to copy the fields
   * separately, and only the select path zeroed item tax for a foreign client.
   */
  const applyClient = (client: ClientData) => {
    setSelectedClientId(client.id);
    setFormData((prev) => {
      const newClientCountry = client.country || "";
      const isCrossBorder = !!(
        prev.seller.country &&
        newClientCountry &&
        prev.seller.country !== newClientCountry
      );
      return {
        ...prev,
        clientName: client.name || "",
        clientEmail: client.email || "",
        clientStreetAddress: client.streetAddress || "",
        clientCity: client.city || "",
        clientState: client.state || "",
        clientZip: client.zipCode || "",
        clientCountry: newClientCountry,
        clientTaxId: client.taxId || "",
        lineItems: isCrossBorder
          ? prev.lineItems.map((item) => ({ ...item, taxPercent: 0 }))
          : prev.lineItems,
      };
    });
  };

  const handleClientSelect = (clientId: string) => {
    const client = savedClients.find((c) => c.id === clientId);
    if (client) applyClient(client);
  };

  // Saved from the Add New card: list it and select it, so the click that created
  // it also does what the user came for.
  const handleClientCreated = (client: ClientData) => {
    setSavedClients((prev) => [client, ...prev.filter((c) => c.id !== client.id)]);
    applyClient(client);
  };

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
          ? prev.lineItems.map((item) => ({ ...item, taxPercent: 0 }))
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
          ? prev.lineItems.map((item) => ({ ...item, taxPercent: 0 }))
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
        ? prev.lineItems.map((item) => ({ ...item, taxPercent: 0 }))
        : prev.lineItems;

      return {
        ...prev,
        clientCountry: value,
        lineItems: updatedLineItems,
      };
    });
  };

  const toggleCustomField = (def: InvoiceCustomField, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        if (prev.customFields.some((f) => f.definitionId === def.id)) return prev;
        return {
          ...prev,
          customFields: [...prev.customFields, { definitionId: def.id, name: def.name, value: "" }],
        };
      }
      return { ...prev, customFields: prev.customFields.filter((f) => f.definitionId !== def.id) };
    });
  };

  const setCustomFieldValue = (definitionId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) => (f.definitionId === definitionId ? { ...f, value } : f)),
    }));
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addLineItem = () => {
    setFormData((prev) => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        // Numbering by length collides once a row is removed - deleting row 1 of
        // two and adding another would reuse the id still held by the survivor.
        { id: crypto.randomUUID(), description: "", quantity: 1, unit: "Units", rate: 0, taxPercent: 5 },
      ],
    }));
  };

  // Every row is removable, the last one included: a draft is allowed to have none.
  const removeLineItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
    setSubmittedItemIds((prev) => prev.filter((x) => x !== id));
  };

  const isCrossBorderInvoice = () =>
    !!(formData.seller.country && formData.clientCountry && formData.seller.country !== formData.clientCountry);

  const calculateLineTotal = (item: LineItem) => {
    const subtotal = item.quantity * item.rate;
    const tax = isCrossBorderInvoice() ? 0 : subtotal * (item.taxPercent / 100);
    return subtotal + tax;
  };

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  };

  const calculateTotalTax = () => {
    if (isCrossBorderInvoice()) return 0;
    return formData.lineItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.rate;
      return sum + subtotal * (item.taxPercent / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const hasClientSelected = !!(selectedClientId || formData.clientName.trim());
  const hasAtLeastOneItem = formData.lineItems.length > 0;
  const allItemsHaveDescription = formData.lineItems.every((i) => i.description.trim() !== "");
  // Same rule the API applies (sellerSchema in invoice.validator.js), so a bad
  // address is caught here instead of coming back as a toast after submit.
  // Blank is allowed - the seller email is optional.
  const sellerEmailValid =
    formData.seller.email.trim() === "" ||
    z.string().email().safeParse(formData.seller.email.trim()).success;
  // Two rules, because the buttons promise different things. A draft is a
  // work in progress: it may have no items yet, but a row that exists must be
  // described, or it would reach the API as a nameless item and be rejected.
  // Issuing is the real document, so it needs something to bill for.
  const isDraftValid = hasClientSelected && allItemsHaveDescription && sellerEmailValid;
  const isFormValid = isDraftValid && hasAtLeastOneItem;

  // Which button was pressed, so the summary below only raises rules that
  // actually applied to it - null until one is.
  const [attemptedAction, setAttemptedAction] = useState<"create" | "draft" | null>(null);
  const attemptedSubmit = attemptedAction !== null;
  const [submittedItemIds, setSubmittedItemIds] = useState<string[]>([]);
  const [jiggleKey, setJiggleKey] = useState(0);
  const formScrollRef = useRef<HTMLDivElement | null>(null);

  /** Flags the offending fields and scrolls them into view. */
  const reportInvalid = (action: "create" | "draft") => {
    setAttemptedAction(action);
    setSubmittedItemIds(formData.lineItems.map((i) => i.id));
    setJiggleKey((k) => k + 1);
    requestAnimationFrame(() => {
      const el = formScrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const clearValidation = () => {
    setAttemptedAction(null);
    setSubmittedItemIds([]);
  };

  const handlePreview = () => {
    if (!isFormValid) {
      reportInvalid("create");
      return;
    }
    clearValidation();
    setShowPreview(true);
  };

  const handleBackToForm = () => {
    setShowPreview(false);
  };

  const [confirmingInvoice, setConfirmingInvoice] = useState(false);
  // Set on the first successful save; later attempts update it rather than
  // creating another copy.
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);

  // One key per dialog, reused on every retry. Covers what createdInvoiceId
  // cannot: a lost create response means we never learn the id.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  // Union territories where UTGST applies instead of SGST
  const utgstTerritories = [
    "Lakshadweep",
    "Ladakh",
    "Chandigarh",
    "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu",
  ];

  const buildTaxSummary = (): Record<string, { rate: number; amount: number }> | undefined => {
    const { seller, clientCountry, lineItems, taxType } = formData;
    const isCrossBorder = seller.country && clientCountry && seller.country !== clientCountry;

    // Cross-border: zero-rated, no tax summary needed
    if (isCrossBorder) return undefined;

    if (taxType === "None") return undefined;

    // Calculate overall subtotal and total tax for effective rate
    const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.rate, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.quantity * item.rate * (item.taxPercent / 100), 0);
    const effectiveRate = subtotal > 0 ? Math.round(((totalTax * 100) / subtotal) * 100) / 100 : 0;

    if (taxType === "GST" && seller.country === "India") {
      const isIntraState = seller.state && formData.clientState && seller.state === formData.clientState;

      if (isIntraState) {
        // Intra-state: split into CGST + SGST (or UTGST for specific UTs)
        const isUT = utgstTerritories.includes(seller.state);
        const secondLabel = isUT ? "UTGST" : "SGST";
        const halfRate = Math.round((effectiveRate / 2) * 100) / 100;
        let totalCgst = 0;
        let totalSecond = 0;

        lineItems.forEach((item) => {
          const itemSubtotal = item.quantity * item.rate;
          const halfAmount = itemSubtotal * (item.taxPercent / 2 / 100);
          totalCgst += halfAmount;
          totalSecond += halfAmount;
        });

        return {
          CGST: { rate: halfRate, amount: Math.round(totalCgst * 100) / 100 },
          [secondLabel]: { rate: halfRate, amount: Math.round(totalSecond * 100) / 100 },
        };
      } else {
        // Inter-state: full IGST
        return {
          IGST: { rate: effectiveRate, amount: Math.round(totalTax * 100) / 100 },
        };
      }
    }

    // VAT / Sales Tax: single entry
    if (taxType === "VAT" || taxType === "Sales Tax") {
      return {
        [taxType]: { rate: effectiveRate, amount: Math.round(totalTax * 100) / 100 },
      };
    }

    return undefined;
  };

  // No status field - the server owns the payment lifecycle.
  const buildPayload = (): Record<string, unknown> => {
    const isCrossBorder =
      formData.seller.country && formData.clientCountry && formData.seller.country !== formData.clientCountry;
    const taxSummary = buildTaxSummary();
    return {
      clientId: selectedClientId || undefined,
      invoiceType: "TAX",
      issueDate: formData.invoiceDate ? formData.invoiceDate.toISOString() : undefined,
      dueDate: formData.dueDate ? formData.dueDate.toISOString() : undefined,
      currency: formData.currency,
      taxType: formData.taxType,
      reverseCharge: !!isCrossBorder,
      ...(taxSummary ? { taxSummary } : {}),
      seller: {
        name: formData.seller.name,
        // Trimmed because that is the value validated above: sending "  " raw
        // would pass here and be rejected by the API as a malformed address.
        email: formData.seller.email.trim(),
        phone: formData.seller.phone,
        streetAddress: formData.seller.streetAddress,
        city: formData.seller.city,
        state: formData.seller.state,
        zipCode: formData.seller.zip,
        country: formData.seller.country,
        taxId: formData.seller.taxId,
        taxSystem: getTaxLabel(formData.seller.country),
      },
      bankDetails: {
        // A copy of the nickname, not a reference: the invoice keeps these
        // numbers even if the saved set is later edited or deleted.
        nickname: selectedPaymentAccount?.nickname ?? null,
        bankName: formData.bankName,
        accountName: formData.accountName,
        accountNumber: formData.iban,
        ifsc: formData.ifscCode,
        swift: formData.swiftBic,
      },
      bankAddress: formData.bankAddress,
      notes: formData.notes,
      items: formData.lineItems.map((item) => ({
        name: item.description,
        description: item.description,
        quantity: item.quantity,
        unitType: item.unit,
        unitPrice: item.rate,
        taxRate: isCrossBorder ? 0 : item.taxPercent,
        itemTotal: String(calculateLineTotal(item)),
      })),
      customFields: formData.customFields
        .filter((f) => f.value.trim() !== "")
        .map((f) => ({ name: f.name, value: f.value.trim() })),
    };
  };

  // A fresh key makes the next invoice a new request, not a retry of this one.
  const resetAfterSubmit = () => {
    setOpen(false);
    setFormData(getInitialFormData());
    setShowPreview(false);
    setSelectedClientId(null);
    setCreatedInvoiceId(null);
    setSelectedPaymentNickname(null);
    setPaymentAccountDialogOpen(false);
    setIdempotencyKey(crypto.randomUUID());
    onInvoiceCreated?.();
  };

  /** Creates the invoice, or saves this attempt's edits onto it. Returns the id. */
  const saveInvoice = async (): Promise<string> => {
    const payload = buildPayload();
    const existingId = (isEditMode && editInvoiceId) || createdInvoiceId;

    if (existingId) {
      await updateInvoice(existingId, payload);
      return existingId;
    }

    const created = await createInvoice(payload, { idempotencyKey });
    // Recorded immediately: if anything below fails, the next attempt must edit
    // this invoice rather than create another.
    setCreatedInvoiceId(created.id);
    return created.id;
  };

  const handleConfirmInvoice = async () => {
    setConfirmingInvoice(true);
    try {
      const invoiceId = await saveInvoice();

      // Issued only once the id is in hand, so every later failure is retryable.
      await finalizeInvoice(invoiceId, { sendEmail });

      // Nothing left to edit - progress moves to the row badge.
      toast({
        title: "Invoice created",
        description: "Generating the PDF - progress is shown on the invoice row.",
      });
      resetAfterSubmit();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create invoice.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setConfirmingInvoice(false);
    }
  };

  const [savingDraft, setSavingDraft] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const handleSaveAsDraft = async () => {
    // This used to save unconditionally, so a draft could be stored with no
    // client, and a described-less item reached the API only to come back as
    // "Invalid input".
    if (!isDraftValid) {
      reportInvalid("draft");
      return;
    }

    setSavingDraft(true);
    try {
      // No finalize call, so the invoice stays a draft: no PDF, no email.
      await saveInvoice();
      clearValidation();
      toast({ title: "Draft saved", description: "Invoice has been saved as a draft." });
      resetAfterSubmit();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save draft. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData(getInitialFormData());
      setShowPreview(false);
      setSelectedClientId(null);
      setCreatedInvoiceId(null);
      setSelectedPaymentNickname(null);
      setPaymentAccountDialogOpen(false);
      setIdempotencyKey(crypto.randomUUID());
      setSendEmail(false);
      setAttemptedAction(null);
      setSubmittedItemIds([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isEditMode && (
        <DialogTrigger asChild>
          <Button size="icon" className="h-9 w-9 rounded-lg">
            <Plus className="h-5 w-5" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className={cn(
          "p-0 w-[95vw]",
          showPreview ? "max-w-4xl h-[85vh] flex flex-col overflow-hidden" : "max-w-4xl max-h-[95vh] overflow-hidden",
        )}
      >
        {editLoading ? (
          <div className="flex items-center justify-center h-64">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : showPreview ? (
          <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
            <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToForm}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                Invoice Preview
              </DialogTitle>
            </DialogHeader>
            <div
              className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-muted/30"
              style={{ scrollbarGutter: "stable both-edges" }}
            >
              <div className="w-full min-w-0 overflow-hidden px-4 py-6">
                <InvoicePreviewWrapper formData={formData} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-t flex-shrink-0">
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox checked={sendEmail} onCheckedChange={(c) => setSendEmail(c === true)} />
                Share Invoice with client on email
              </label>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleBackToForm}>
                  Back to Edit
                </Button>
                <Button onClick={handleConfirmInvoice} disabled={confirmingInvoice}>
                  {confirmingInvoice ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating PDF...
                    </>
                  ) : (
                    "Confirm & Create Invoice"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div ref={formScrollRef} className="max-h-[95vh] overflow-y-auto px-6">
            <DialogHeader className="py-6">
              <DialogTitle className="text-xl font-semibold">
                {isEditMode ? "Edit Draft Invoice" : "Create New Invoice"}
              </DialogTitle>
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
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.invoiceDate && "text-muted-foreground",
                        )}
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
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dueDate && "text-muted-foreground",
                        )}
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

              {/* Seller Info - Collapsible */}
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Seller Information</h3>
                <Collapsible open={sellerExpanded} onOpenChange={setSellerExpanded}>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={formData.seller.logo} alt="Seller logo" />
                            <AvatarFallback className="bg-muted text-xs">
                              {formData.seller.name ? formData.seller.name.charAt(0).toUpperCase() : "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-medium text-foreground text-sm">
                              {formData.seller.name || "Seller Information"}
                            </p>
                            <p className="text-xs text-muted-foreground">{formData.seller.email || "No email set"}</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            sellerExpanded && "rotate-180",
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                      <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border">
                        <div className="flex items-start gap-4 pt-4">
                          <div className="flex flex-col items-center gap-2">
                            <Avatar className="h-16 w-16 border">
                              <AvatarImage src={formData.seller.logo} alt="Seller logo" />
                              <AvatarFallback className="bg-muted">
                                <Upload className="h-6 w-6 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <Label
                              htmlFor="sellerLogo"
                              className="text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                            >
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
                              <Label htmlFor="sellerTaxId">{getTaxLabel(formData.seller.country)}</Label>
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
                              {attemptedSubmit && !sellerEmailValid && (
                                <p className="text-xs text-destructive">
                                  Enter a valid email address, or leave it blank.
                                </p>
                              )}
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
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              </div>

              {/* Custom Fields */}
              <div className="p-3 border border-border rounded-lg bg-muted/20 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Settings2 className="w-4 h-4" />
                  Custom Fields
                </div>
                {orgCustomFieldDefs.length > 0 && (
                  <div className="space-y-2">
                    {orgCustomFieldDefs.map((def) => {
                      const selected = formData.customFields.find((f) => f.definitionId === def.id);
                      const isChecked = !!selected;
                      return (
                        <div
                          key={def.id}
                          className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-2 items-center"
                        >
                          <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={(c) => toggleCustomField(def, c === true)}
                            />
                            <span className="text-xs">{def.name}</span>
                          </label>
                          {isChecked ? (
                            def.predefinedValues.length > 0 ? (
                              <Select
                                value={selected?.value ?? ""}
                                onValueChange={(value) => setCustomFieldValue(def.id, value)}
                              >
                                <SelectTrigger className="h-8 text-xs data-[placeholder]:text-muted-foreground/70 data-[placeholder]:font-normal">
                                  <SelectValue placeholder="Select a value" />
                                </SelectTrigger>
                                <SelectContent>
                                  {def.predefinedValues.map((v) => (
                                    <SelectItem key={v} value={v} className="text-xs">
                                      {v}
                                    </SelectItem>
                                  ))}
                                  {selected?.value && !def.predefinedValues.includes(selected.value) && (
                                    <SelectItem value={selected.value} className="text-xs">
                                      {selected.value}
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                className="h-8 text-xs"
                                placeholder="Enter a value"
                                value={selected?.value ?? ""}
                                onChange={(e) => setCustomFieldValue(def.id, e.target.value)}
                              />
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">Not included</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {orgCustomFieldDefs.length === 0 && (
                  <p className="text-sm text-muted-foreground">No custom fields configured.</p>
                )}
              </div>

              {/* Client Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Select Client</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Only the saved cards are choices; Add New is an action, so it
                      sits outside the group. "contents" keeps the cards as direct
                      grid items rather than boxing them into one cell. */}
                  <div role="radiogroup" aria-label="Saved clients" className="contents">
                    {savedClients.map((client) => {
                      const selected = selectedClientId === client.id;
                      const place = [client.city, client.state, client.country]
                        .filter(Boolean)
                        .join(", ");
                      const taxId = client.taxId || client.gstin;

                      return (
                        <button
                          key={client.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handleClientSelect(client.id)}
                          className={cn(
                            "text-left rounded-lg border-2 p-3 transition-colors h-full",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/40",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {selected ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground/40"
                              />
                            )}
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm font-medium text-foreground truncate">
                                {client.name}
                              </p>
                              {client.email && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {client.email}
                                </p>
                              )}
                              {place && (
                                <p className="text-xs text-muted-foreground truncate">{place}</p>
                              )}
                              {taxId && (
                                <p className="text-xs text-muted-foreground truncate">
                                  GSTIN: {taxId}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {canAddClient && (
                    <button
                      type="button"
                      onClick={() => setAddClientOpen(true)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border p-3 h-full min-h-[92px] transition-colors",
                        "hover:border-primary/40 hover:bg-muted/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      <Plus className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Add New</span>
                    </button>
                  )}
                </div>

                {/*
                  An invoice whose client has since been deleted still bills someone.
                  There is no form here, so without this the name would vanish from
                  the dialog while still printing on the PDF.
                */}
                {!selectedClientId && formData.clientName.trim() && (
                  <p className="text-xs text-muted-foreground">
                    This invoice is billed to {formData.clientName.trim()}
                    {formData.clientEmail.trim() ? ` (${formData.clientEmail.trim()})` : ""}, who is
                    no longer in your saved clients. Choosing one above replaces them.
                  </p>
                )}

                {attemptedSubmit && !hasClientSelected && (
                  <p className="text-xs text-destructive">Please select a client.</p>
                )}
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
                        {attemptedSubmit && submittedItemIds.includes(item.id) && !item.description.trim() && (
                          <p className="text-xs text-destructive mt-1">Description is required.</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <Input
                          type="number"
                          min="0"
                          // "any" rather than "1": the spinner arrows step by whole
                          // units, but a typed fractional quantity stays valid.
                          step="any"
                          value={item.quantity}
                          onChange={(e) => handleLineItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          value={item.unit}
                          onValueChange={(value) => handleLineItemChange(item.id, "unit", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(unitOptions.includes(item.unit) ? unitOptions : [item.unit, ...unitOptions]).map((unit) => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
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
                        {(() => {
                          const isCrossBorder =
                            formData.seller.country &&
                            formData.clientCountry &&
                            formData.seller.country !== formData.clientCountry;
                          if (isCrossBorder) {
                            return <Input type="text" value="0" disabled className="[appearance:textfield] bg-muted" />;
                          }
                          if (hasTaxDropdown(formData.seller.country)) {
                            return (
                              <Select
                                value={String(item.taxPercent)}
                                onValueChange={(value) =>
                                  handleLineItemChange(item.id, "taxPercent", parseFloat(value))
                                }
                              >
                                <SelectTrigger className="w-full h-10 px-2 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent align="end" className="min-w-[70px]">
                                  {getTaxOptions(formData.seller.country).map((tax) => (
                                    <SelectItem key={tax} value={String(tax)} className="text-sm">
                                      {tax}%
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }
                          return (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={item.taxPercent}
                              onChange={(e) =>
                                handleLineItemChange(item.id, "taxPercent", parseFloat(e.target.value) || 0)
                              }
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          );
                        })()}
                      </div>
                      <div className="col-span-1 text-right font-medium">{formatMoney(calculateLineTotal(item), formData.currency)}</div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {formData.lineItems.length === 0 && (
                    <div className="border-t p-8 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={addLineItem}
                        aria-label="Add the first item"
                        className="h-10 w-10 rounded-full border-2 border-dashed border-border"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="border-t bg-muted/50 p-3 space-y-2">
                    <div className="flex justify-end gap-8 text-sm">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-medium w-24 text-right">
                        {formData.currency} {formatMoney(calculateSubtotal(), formData.currency)}
                      </span>
                    </div>
                    {(() => {
                      const taxSummary = buildTaxSummary();
                      if (taxSummary) {
                        return Object.entries(taxSummary).map(([label, { rate, amount }]) => (
                          <div key={label} className="flex justify-end gap-8 text-sm">
                            <span className="text-muted-foreground">
                              {label} ({rate}%):
                            </span>
                            <span className="font-medium w-24 text-right">
                              {formData.currency} {formatMoney(amount, formData.currency)}
                            </span>
                          </div>
                        ));
                      }
                      // Fallback for cross-border or None
                      const taxLabel = formData.taxType && formData.taxType !== "None" ? formData.taxType : "Tax";
                      const isCrossBorder =
                        formData.seller.country &&
                        formData.clientCountry &&
                        formData.seller.country !== formData.clientCountry;
                      return (
                        <div className="flex justify-end gap-8 text-sm">
                          <span className="text-muted-foreground">
                            {taxLabel}
                            {isCrossBorder ? " (0%)" : ""}:
                          </span>
                          <span className="font-medium w-24 text-right">
                            {formData.currency} {isCrossBorder ? formatMoney(0, formData.currency) : formatMoney(calculateTotalTax(), formData.currency)}
                          </span>
                        </div>
                      );
                    })()}
                    <div className="flex justify-end gap-8 text-base font-semibold">
                      <span>Total:</span>
                      <span className="w-24 text-right">
                        {formData.currency} {formatMoney(calculateTotal(), formData.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Bank / Payment Details</h3>
                <p className="text-sm text-muted-foreground">
                  Select from saved accounts or add a new one:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* Only the saved cards are choices; Add New is an action, so it
                      sits outside the group. "contents" keeps the cards as direct
                      grid items rather than boxing them into one cell. */}
                  <div role="radiogroup" aria-label="Saved payment details" className="contents">
                    {paymentAccounts.map((account) => {
                      const selected = selectedPaymentAccount?.id === account.id;
                      const masked = maskAccountNumber(account.accountNumber);
                      const code = account.ifsc
                        ? `IFSC Code: ${account.ifsc}`
                        : account.swift
                          ? `SWIFT/BIC: ${account.swift}`
                          : "";

                      return (
                        <button
                          key={account.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => handlePaymentAccountSelect(account.id)}
                          className={cn(
                            "text-left rounded-lg border-2 p-3 transition-colors h-full",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40 hover:bg-muted/40",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            {selected ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="h-4 w-4 shrink-0 mt-0.5 rounded-full border-2 border-muted-foreground/40"
                              />
                            )}
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-sm font-medium text-foreground truncate">
                                {account.nickname}
                              </p>
                              {(account.bankName || masked) && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {[account.bankName, masked].filter(Boolean).join(" - ")}
                                </p>
                              )}
                              {account.accountName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {account.accountName}
                                </p>
                              )}
                              {code && (
                                <p className="text-xs text-muted-foreground truncate">{code}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPaymentAccountDialogOpen(true)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border p-3 h-full min-h-[92px] transition-colors",
                      "hover:border-primary/40 hover:bg-muted/40",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    )}
                  >
                    <Plus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Add New</span>
                  </button>
                </div>

                {/*
                  Invoices issued before this picker existed carry bank details that
                  match no saved set. There is no form here any more, so without this
                  they would be invisible while still printing on the PDF.
                */}
                {!selectedPaymentAccount && legacyBankSummary && (
                  <p className="text-xs text-muted-foreground">
                    This invoice carries details entered earlier: {legacyBankSummary}. Choosing a
                    saved account above replaces them.
                  </p>
                )}
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
              <div className="flex flex-col items-end gap-2 pt-4 pb-6 border-t">
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  {/* The key restarts the CSS animation on a repeat press; the class
                      is gated on attemptedAction so only the button just pressed
                      shakes. */}
                  <Button
                    key={`draft-jiggle-${jiggleKey}`}
                    variant="secondary"
                    onClick={handleSaveAsDraft}
                    disabled={savingDraft}
                    className={attemptedAction === "draft" ? "animate-jiggle" : ""}
                  >
                    {savingDraft ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    key={`create-jiggle-${jiggleKey}`}
                    onClick={handlePreview}
                    className={attemptedAction === "create" ? "animate-jiggle" : ""}
                  >
                    Create Invoice
                  </Button>
                </div>
                {(() => {
                  if (!attemptedAction) return null;
                  const flaggedMissingDesc = formData.lineItems.some(
                    (i) => submittedItemIds.includes(i.id) && !i.description.trim()
                  );
                  const showClient = !hasClientSelected;
                  // A draft may be saved with none, so this is a create-only rule.
                  const showNoItems = attemptedAction === "create" && !hasAtLeastOneItem;
                  if (!showClient && !showNoItems && !flaggedMissingDesc) return null;
                  return (
                    <div className="text-xs text-destructive text-right space-y-0.5">
                      {showClient && (
                        <p>
                          Please select a client before
                          {attemptedAction === "draft" ? " saving the draft." : " creating the invoice."}
                        </p>
                      )}
                      {showNoItems && <p>Add at least one item.</p>}
                      {!showNoItems && flaggedMissingDesc && (
                        <p>Description is required for all items.</p>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}
      </DialogContent>
      <AddClientDialog open={addClientOpen} onOpenChange={setAddClientOpen} onClientCreated={handleClientCreated} />

      <PaymentAccountFormDialog
        open={paymentAccountDialogOpen}
        onOpenChange={setPaymentAccountDialogOpen}
        onSaved={handlePaymentAccountCreated}
      />
    </Dialog>
  );
};

export default CreateInvoiceDialog;
