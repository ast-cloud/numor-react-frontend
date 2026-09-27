import { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CalendarIcon, X, ArrowUpDown, Download, FileText, Circle, Users, Loader2, Trash2, Copy } from "lucide-react";
import { InvoiceProgressBadge } from "@/components/InvoiceProgressBadge";
import { InvoiceEmailStatus } from "@/components/InvoiceEmailStatus";
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
import {
  format,
  parse,
  parseISO,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  isWithinInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog";
import { useToast } from "@/hooks/use-toast";
import { fetchInvoices, fetchInvoice, updateInvoiceStatus, fetchInvoicePdfStatus, deleteInvoice, cloneInvoiceAsDraft, type InvoiceData } from "@/lib/api/invoices";
import InvoicePreviewWrapper from "@/components/InvoicePreview";
import type { InvoiceFormData } from "@/lib/invoiceTemplateRenderer";
import { moneyLocale } from "@/lib/amountInWords";
import { fetchClients, type ClientData } from "@/lib/api/clients";
import { fetchCurrentOrganization, fetchOrganizationLogo } from "@/lib/api/user";
import { useAuth } from "@/hooks/use-auth";

type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

type SortOption = "due_date_asc" | "due_date_desc" | "issue_date_asc" | "issue_date_desc" | "amount_asc" | "amount_desc" | "client_asc" | "client_desc";

type InvoiceStatus = "draft" | "paid" | "unpaid" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  issueDate: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  pdfUrl: string;
  // Drives the progress badge; `status` is payment state.
  pdfStatus: string;
  emailStatus: string;
  // NOT_REQUESTED only means "done" when this is false.
  emailRequested: boolean;
  emailSentAt: string | null;
  emailError: string | null;
}

const mapApiStatus = (status: string): InvoiceStatus => {
  const s = status.toLowerCase();
  if (s === "paid") return "paid";
  if (s === "draft") return "draft";
  if (s === "overdue") return "overdue";
  return "unpaid";
};

const mapApiInvoice = (inv: InvoiceData, clientsMap: Map<string, string>): Invoice => ({
  id: inv.id,
  invoiceNumber: inv.invoiceNumber,
  clientName: clientsMap.get(inv.clientId) || inv.sellerName,
  dueDate: format(parseISO(inv.dueDate), "dd/MM/yyyy"),
  issueDate: inv.issueDate ? format(parseISO(inv.issueDate), "dd/MM/yyyy") : "",
  amount: parseFloat(inv.totalAmount),
  currency: inv.currency || "USD",
  status: mapApiStatus(inv.status),
  pdfUrl: inv.pdfKey || "",
  pdfStatus: inv.pdfStatus || "NOT_STARTED",
  emailStatus: inv.emailStatus || "NOT_REQUESTED",
  emailSentAt: inv.emailSentAt ?? null,
  emailRequested: inv.emailRequested ?? false,
  emailError: inv.emailError ?? null,
});

const statusStyles: Record<
  InvoiceStatus,
  { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
> = {
  draft: { variant: "secondary", label: "Draft" },
  paid: { variant: "default", label: "Paid" },
  unpaid: { variant: "outline", label: "Unpaid" },
  overdue: { variant: "destructive", label: "Overdue" },
};

const COUNTRY_CURRENCY: Record<string, string> = {
  India: "INR", UAE: "AED", US: "USD", UK: "GBP",
  Austria: "EUR", Belgium: "EUR", France: "EUR", Germany: "EUR",
  Italy: "EUR", Netherlands: "EUR", Spain: "EUR", Sweden: "EUR",
};

const formatCurrencyVal = (amount: number, currency = "USD") => {
  try {
    // The currency decides the grouping, not the browser: an en-US visitor
    // should still see an INR invoice as 7,35,000.
    return new Intl.NumberFormat(moneyLocale(currency), {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const InvoiceRow = ({
  invoice,
  onClick,
  onStatusChange,
  onProgressStatusChange,
  onDownload,
  onClone,
  onDelete,
}: {
  invoice: Invoice;
  onClick: () => void;
  onStatusChange: (invoiceId: string, status: InvoiceStatus) => void;
  /** The badge reports DRAFT -> UNPAID as it happens. */
  onProgressStatusChange: (invoiceId: string, status: string) => void;
  onDownload: (invoice: Invoice) => void;
  onClone: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}) => {
  const { variant, label } = statusStyles[invoice.status];
  // A draft being rendered cannot be opened for editing - see handleInvoiceClick.
  const isGenerating = ["QUEUED", "PROCESSING"].includes(invoice.pdfStatus);
  const showsAsClickable = invoice.status !== "draft" || !isGenerating;

  return (
    <div
      className={`flex items-center justify-between gap-3 py-4 px-4 border-b border-border hover:bg-muted/50 transition-colors ${showsAsClickable ? "cursor-pointer" : "cursor-default"}`}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <p className="truncate">
          <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
          <span className="text-muted-foreground">, </span>
          <span className="text-foreground">{invoice.clientName}</span>
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">{invoice.dueDate}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <InvoiceProgressBadge
          invoiceId={invoice.id}
          pdfStatus={invoice.pdfStatus}
          emailStatus={invoice.emailStatus}
          emailRequested={invoice.emailRequested}
          onStatusChange={(status) => onProgressStatusChange(invoice.id, status)}
        />
        <Badge variant={variant} className="min-w-[56px] sm:min-w-[70px] justify-center">
          {label}
        </Badge>
        <span className="font-semibold text-foreground min-w-[60px] sm:min-w-[100px] text-right">{formatCurrencyVal(invoice.amount, invoice.currency)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            {invoice.status !== "draft" && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Circle className="mr-2 h-4 w-4" />
                  Change Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "paid")}>Paid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "unpaid")}>Unpaid</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "overdue")}>Overdue</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            {invoice.status !== "draft" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDownload(invoice)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onClone(invoice)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone as Draft
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(invoice)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const Income = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [isCustomDatePopoverOpen, setIsCustomDatePopoverOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("due_date_desc");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
  const [previewFormData, setPreviewFormData] = useState<InvoiceFormData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // The badge polls, so it sees the invoice become issued before any refresh.
  const handleProgressStatusChange = (invoiceId: string, status: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: mapApiStatus(status) } : inv
      )
    );
  };
  const [rawInvoices, setRawInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  // The key is minted when the dialog opens, not per click, so confirming twice
  // after a failed first attempt resolves to one copy rather than two.
  const [cloneTarget, setCloneTarget] = useState<{ invoice: Invoice; idempotencyKey: string } | null>(null);
  const [cloning, setCloning] = useState(false);
  const [editDraftId, setEditDraftId] = useState<string | null>(null);
  const [editDraftOpen, setEditDraftOpen] = useState(false);
  const [clientsData, setClientsData] = useState<ClientData[]>([]);
  const [orgCountry, setOrgCountry] = useState<string>("US");
  const { toast } = useToast();
  const { can } = useAuth();
  const canWriteIncome = can("income", "write");

  useEffect(() => {
    fetchCurrentOrganization()
      .then((org) => setOrgCountry(org.country || "US"))
      .catch(() => {});
  }, []);

  const queryClient = useQueryClient();

  const loadInvoices = () => {
    setIsLoading(true);
    Promise.all([fetchInvoices(), fetchClients()])
      .then(([invoiceData, clientData]) => {
        const clientsMap = new Map(clientData.map((c) => [c.id, c.name]));
        setClientsData(clientData);
        setRawInvoices(invoiceData);
        setInvoices(invoiceData.map((inv) => mapApiInvoice(inv, clientsMap)));
        // Invalidate React Query cache so dashboard stays in sync
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
        toast({ title: "Error", description: "Failed to load invoices", variant: "destructive" });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleInvoiceClick = async (invoice: Invoice) => {
    if (invoice.status === "draft") {
      // A worker is rendering this invoice right now. Editing would make it
      // discard that PDF and start again, which looks like a random restart, so
      // the server refuses it too.
      if (["QUEUED", "PROCESSING"].includes(invoice.pdfStatus)) {
        toast({
          title: "Still generating",
          description: "This invoice can be edited once its PDF finishes.",
        });
        return;
      }

      setEditDraftId(invoice.id);
      setEditDraftOpen(true);
      return;
    }
    setSelectedInvoice(invoice);
    setPreviewFormData(null);
    setIsPdfDialogOpen(true);
    try {
      const [detail, logoUrl] = await Promise.all([
        fetchInvoice(invoice.id),
        fetchOrganizationLogo().catch(() => null),
      ]);
      // Look up client from already-fetched clients data
      const client = clientsData.find((c) => c.id === detail.clientId);

      const formData: InvoiceFormData = {
        invoiceNumber: detail.invoiceNumber || "",
        invoiceDate: detail.issueDate ? new Date(detail.issueDate) : undefined,
        dueDate: detail.dueDate ? new Date(detail.dueDate) : undefined,
        currency: detail.currency || "USD",
        taxType: detail.taxType || "GST",
        seller: {
          logo: logoUrl || "",
          name: detail.sellerName || detail.seller?.name || "",
          streetAddress: detail.sellerStreetAddress || detail.seller?.streetAddress || "",
          city: detail.sellerCity || detail.seller?.city || "",
          state: detail.sellerState || detail.seller?.state || "",
          zip: detail.sellerZipCode || detail.seller?.zipCode || "",
          country: detail.sellerCountry || detail.seller?.country || "",
          taxId: detail.sellerTaxId || detail.seller?.taxId || "",
          email: detail.sellerEmail || detail.seller?.email || "",
          phone: detail.sellerPhone || detail.seller?.phone || "",
        },
        clientName: client?.name || detail.client?.name || "",
        clientEmail: client?.email || detail.client?.email || "",
        clientPhone: client?.phone || detail.client?.phone || "",
        clientStreetAddress: client?.streetAddress || detail.client?.streetAddress || "",
        clientCity: client?.city || detail.client?.city || "",
        clientState: client?.state || detail.client?.state || "",
        clientZip: client?.zipCode || detail.client?.zipCode || "",
        clientCountry: client?.country || detail.client?.country || "",
        lineItems: (detail.items || []).map((item) => ({
          id: item.id,
          description: item.description || item.itemName || "",
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unitType || "",
          rate: parseFloat(item.unitPrice) || 0,
          taxPercent: parseFloat(item.taxRate) || 0,
        })),
        bankName: detail.bankDetails?.bankName || "",
        accountName: detail.bankDetails?.accountName || "",
        iban: detail.bankDetails?.accountNumber || "",
        swiftBic: detail.bankDetails?.swift || "",
        ifscCode: detail.bankDetails?.ifsc || "",
        bankAddress: detail.bankAddress || "",
        notes: detail.notes || "",
        sacCode: detail.sacCode || "",
        paymentTerms: detail.paymentTerms || "",
        customFields: detail.customFields || [],
      };
      setPreviewFormData(formData);
    } catch {
      console.error("Failed to fetch invoice details for preview");
    }
  };

  const handleDownloadPdf = async (invoice?: Invoice) => {
    const target = invoice || selectedInvoice;
    if (!target || target.status === "draft") return;

    try {
      const res = await fetchInvoicePdfStatus(target.id);
      if (res.success && res.url) {
        const link = document.createElement("a");
        link.href = res.url;
        link.download = `${target.invoiceNumber}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast({ title: "PDF not available", description: res.message || "PDF is not ready yet", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch PDF", variant: "destructive" });
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const oldStatus = invoice.status;
    // Optimistic update
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: newStatus } : inv)));

    if (selectedInvoice?.id === invoiceId) {
      setSelectedInvoice({ ...selectedInvoice, status: newStatus });
    }

    try {
      await updateInvoiceStatus(invoiceId, newStatus.toUpperCase());
      toast({
        title: "Status updated",
        description: `Invoice ${invoice.invoiceNumber} marked as ${statusStyles[newStatus].label}`,
      });
    } catch {
      // Revert on failure
      setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: oldStatus } : inv)));
      if (selectedInvoice?.id === invoiceId) {
        setSelectedInvoice({ ...selectedInvoice, status: oldStatus });
      }
      toast({ title: "Error", description: "Failed to update invoice status", variant: "destructive" });
    }
  };

  const handleCloneInvoice = async () => {
    if (!cloneTarget) return;
    setCloning(true);
    try {
      await cloneInvoiceAsDraft(cloneTarget.invoice.id, cloneTarget.idempotencyKey);
      toast({
        title: "Copied as draft",
        description: `A draft copy of ${cloneTarget.invoice.invoiceNumber} has been created.`,
      });
      setCloneTarget(null);
      loadInvoices();
    } catch (err) {
      toast({
        title: "Could not copy invoice",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCloning(false);
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteInvoice(deleteTarget.id);
      if (res.success) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== deleteTarget.id));
        if (selectedInvoice?.id === deleteTarget.id) {
          setIsPdfDialogOpen(false);
          setSelectedInvoice(null);
        }
        toast({ title: "Invoice deleted", description: `${deleteTarget.invoiceNumber} has been deleted.` });
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
      } else {
        toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete invoice", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDialogStatusChange = (newStatus: InvoiceStatus) => {
    if (selectedInvoice) {
      handleStatusChange(selectedInvoice.id, newStatus);
    }
  };

  const handleApplyDateRange = () => {
    setCustomDateRange(tempDateRange);
    setIsCustomDatePopoverOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsCustomDatePopoverOpen(open);
    if (open) {
      setTempDateRange(customDateRange);
    }
  };

  const parseDate = (dateStr: string) => {
    return parse(dateStr, "dd/MM/yyyy", new Date());
  };

  const getDateRange = (): { start: Date; end: Date } | null => {
    const today = new Date();
    switch (timeRangePreset) {
      case "today":
        return { start: startOfDay(today), end: endOfDay(today) };
      case "this_week":
        return { start: startOfWeek(today, { weekStartsOn: 1 }), end: endOfDay(today) };
      case "this_month":
        return { start: startOfMonth(today), end: endOfDay(today) };
      case "this_quarter":
        return { start: startOfQuarter(today), end: endOfDay(today) };
      case "custom":
        if (customDateRange?.from) {
          return {
            start: startOfDay(customDateRange.from),
            end: endOfDay(customDateRange.to || customDateRange.from),
          };
        }
        return null;
      default:
        return null;
    }
  };

  const sortInvoices = (invoices: Invoice[]) => {
    return [...invoices].sort((a, b) => {
      switch (sortOption) {
        case "due_date_asc":
          return parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime();
        case "due_date_desc":
          return parseDate(b.dueDate).getTime() - parseDate(a.dueDate).getTime();
        case "issue_date_asc":
          return parseDate(a.issueDate).getTime() - parseDate(b.issueDate).getTime();
        case "issue_date_desc":
          return parseDate(b.issueDate).getTime() - parseDate(a.issueDate).getTime();
        case "amount_asc":
          return a.amount - b.amount;
        case "amount_desc":
          return b.amount - a.amount;
        case "client_asc":
          return a.clientName.localeCompare(b.clientName);
        case "client_desc":
          return b.clientName.localeCompare(a.clientName);
        default:
          return 0;
      }
    });
  };

  const filterInvoices = (status: string) => {
    // "all" means all *active* invoices. Untouched drafts live on their own tab,
    // but a draft that has been issued is still mid-flight - its PDF is
    // generating or needs a retry - so it belongs here until it becomes UNPAID.
    // pdfStatus tells them apart: NOT_STARTED means nobody has issued it yet.
    // Tab counts and the list both read from here, so they stay in step.
    // The Draft tab is the exact complement: only drafts nobody has issued yet.
    const isUntouchedDraft = (inv: Invoice) =>
      inv.status === "draft" && inv.pdfStatus === "NOT_STARTED";

    let filtered =
      status === "all"
        ? invoices.filter((inv) => !isUntouchedDraft(inv))
        : status === "draft"
          ? invoices.filter(isUntouchedDraft)
          : invoices.filter((inv) => inv.status === status);

    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter((inv) => {
        const invoiceDate = parseDate(inv.dueDate);
        return isWithinInterval(invoiceDate, { start: dateRange.start, end: dateRange.end });
      });
    }

    return sortInvoices(filtered);
  };

  const currency = COUNTRY_CURRENCY[orgCountry] || "USD";

  const summaryStats = useMemo(() => {
    const filtered = filterInvoices(activeTab).filter((inv) => inv.status !== "draft");
    const totalIncome = filtered.reduce((sum, inv) => sum + inv.amount, 0);
    const incomeByCurrency = filtered.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.currency] = (acc[inv.currency] || 0) + inv.amount;
      return acc;
    }, {});
    const incomeByCurrencyEntries = Object.entries(incomeByCurrency).sort((a, b) => b[1] - a[1]);
    const paidInvoices = filtered.filter((inv) => inv.status === "paid");
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const unpaidInvoices = filtered.filter((inv) => inv.status === "unpaid" || inv.status === "overdue");
    const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const invoiceCount = filtered.length;

    // Top client by revenue
    const clientRevenue: Record<string, number> = {};
    filtered.forEach((inv) => {
      clientRevenue[inv.clientName] = (clientRevenue[inv.clientName] || 0) + inv.amount;
    });
    const topClient = Object.entries(clientRevenue).sort((a, b) => b[1] - a[1])[0];

    return { totalIncome, incomeByCurrencyEntries, totalPaid, totalUnpaid, invoiceCount, topClient: topClient ? { name: topClient[0], amount: topClient[1] } : null };
  }, [invoices, activeTab, timeRangePreset, customDateRange, sortOption]);

  const getTimeRangeLabel = () => {
    switch (timeRangePreset) {
      case "today":
        return "Today";
      case "this_week":
        return "This Week";
      case "this_month":
        return "This Month";
      case "this_quarter":
        return "This Quarter";
      case "custom":
        if (customDateRange?.from) {
          return customDateRange.to
            ? `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`
            : format(customDateRange.from, "MMM d, yyyy");
        }
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  const handleTimeRangeChange = (value: TimeRangePreset) => {
    setTimeRangePreset(value);
    if (value === "custom") {
      // Delay opening popover to avoid conflict with Select dropdown closing
      setTimeout(() => {
        setIsCustomDatePopoverOpen(true);
      }, 100);
    } else {
      setCustomDateRange(undefined);
    }
  };

  const clearDateFilter = () => {
    setTimeRangePreset("all");
    setCustomDateRange(undefined);
  };

  // Draft sits last: it is the only tab that is not real income.
  const tabs = [
    { value: "all", label: "All active" },
    { value: "unpaid", label: "Unpaid" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "draft", label: "Draft" },
  ];

  return (
    <div className="space-y-6">
      <Helmet><title>Numor - Income</title></Helmet>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Track and manage your income.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="Manage Clients" onClick={() => navigate("/sme/income/clients")}>
            <Users className="h-4 w-4" />
          </Button>
          {canWriteIncome && <CreateInvoiceDialog onInvoiceCreated={loadInvoices} />}
          {canWriteIncome && editDraftId && (
            <CreateInvoiceDialog
              editInvoiceId={editDraftId}
              editOpen={editDraftOpen}
              onEditOpenChange={(open) => {
                setEditDraftOpen(open);
                if (!open) setEditDraftId(null);
              }}
              onInvoiceCreated={loadInvoices}
            />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-4 sm:gap-6 md:gap-8 overflow-x-auto flex-nowrap">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="group bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 px-0 text-muted-foreground data-[state=active]:text-foreground font-medium transition-colors duration-200 hover:text-foreground relative"
            >
              <span className="inline-flex items-center gap-1.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-data-[state=active]:translate-y-0">
                {tab.label}
                <span className="text-[10px] font-normal text-muted-foreground bg-muted rounded-full px-1 leading-4 min-w-[1rem] text-center">
                  {filterInvoices(tab.value).length}
                </span>
              </span>
              <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-primary/60 origin-center scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-data-[state=active]:scale-x-0 pointer-events-none" />
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length > 0 ? (
          <>
            {/* Summary Card */}
            <div className="rounded-lg border border-border bg-muted/20 p-4 mt-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-start gap-1.5">
                    <span className="text-muted-foreground">Total Income:</span>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {summaryStats.incomeByCurrencyEntries.length > 0 ? (
                        summaryStats.incomeByCurrencyEntries.map(([cur, amt]) => (
                          <span key={cur} className="font-semibold text-foreground">
                            {formatCurrencyVal(amt, cur)}
                          </span>
                        ))
                      ) : (
                        <span className="font-semibold text-foreground">{formatCurrencyVal(0, currency)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Paid:</span>
                    <span className="font-semibold text-foreground">{formatCurrencyVal(summaryStats.totalPaid, currency)}</span>
                  </div>
                </div>
                
                <div className="flex md:flex-1 md:justify-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Outstanding:</span>
                      <span className="font-semibold text-foreground">{formatCurrencyVal(summaryStats.totalUnpaid, currency)}</span>
                    </div>
                    {summaryStats.topClient && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-muted-foreground">Top Client:</span>
                        <span className="font-semibold text-foreground">{summaryStats.topClient.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mb-2">
              <div className="flex items-center gap-2">
                <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                  <SelectTrigger className="w-auto min-w-[100px] h-8 text-sm">
                    <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="due_date_desc">Due Date (Latest)</SelectItem>
                    <SelectItem value="due_date_asc">Due Date (Oldest)</SelectItem>
                    <SelectItem value="issue_date_desc">Issue Date (Latest)</SelectItem>
                    <SelectItem value="issue_date_asc">Issue Date (Oldest)</SelectItem>
                    <SelectItem value="amount_desc">Amount (High to Low)</SelectItem>
                    <SelectItem value="amount_asc">Amount (Low to High)</SelectItem>
                    <SelectItem value="client_asc">Client (A to Z)</SelectItem>
                    <SelectItem value="client_desc">Client (Z to A)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeRangePreset} onValueChange={(value: TimeRangePreset) => handleTimeRangeChange(value)}>
                  <SelectTrigger className="w-auto min-w-[100px] h-8 text-sm">
                    <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_quarter">This Quarter</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {timeRangePreset === "custom" && (
                  <Popover open={isCustomDatePopoverOpen} onOpenChange={handleOpenChange}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-sm justify-start text-left font-normal">
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                        {customDateRange?.from ? (
                          customDateRange.to ? (
                            <>
                              {format(customDateRange.from, "dd/MM/yy")} - {format(customDateRange.to, "dd/MM/yy")}
                            </>
                          ) : (
                            format(customDateRange.from, "dd/MM/yy")
                          )
                        ) : (
                          "Pick range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        selected={tempDateRange}
                        onSelect={setTempDateRange}
                        numberOfMonths={2}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      <div className="flex justify-end p-3 pt-0 border-t border-border">
                        <Button size="sm" onClick={handleApplyDateRange} disabled={!tempDateRange?.from}>
                          Apply
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {timeRangePreset !== "all" && (
                  <Button variant="ghost" size="icon" onClick={clearDateFilter} className="h-8 w-8">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
            {tabs.map((tab) => {
              const tabInvoices = filterInvoices(tab.value);
              return (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                    {tabInvoices.length > 0 ? (
                      tabInvoices.map((invoice) => (
                        <InvoiceRow
                          key={invoice.id}
                          invoice={invoice}
                          onClick={() => handleInvoiceClick(invoice)}
                          onStatusChange={handleStatusChange}
                          onProgressStatusChange={handleProgressStatusChange}
                          onDownload={handleDownloadPdf}
                          onClone={(inv) =>
                            setCloneTarget({ invoice: inv, idempotencyKey: crypto.randomUUID() })
                          }
                          onDelete={(inv) => setDeleteTarget(inv)}
                        />
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">No invoices found</div>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">No invoices found</div>
        )}
      </Tabs>

      {/* PDF Preview Dialog */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle>
                  {selectedInvoice?.invoiceNumber} - {selectedInvoice?.clientName}
                </DialogTitle>
                {selectedInvoice && selectedInvoice.status !== "draft" && (
                  <InvoiceEmailStatus
                    invoiceId={selectedInvoice.id}
                    emailStatus={selectedInvoice.emailStatus}
                    emailRequested={selectedInvoice.emailRequested}
                    emailSentAt={selectedInvoice.emailSentAt}
                    emailError={selectedInvoice.emailError}
                    pdfReady={selectedInvoice.pdfStatus === "READY"}
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedInvoice?.status !== "draft" && (
                  <Select
                    value={selectedInvoice?.status}
                    onValueChange={(value: InvoiceStatus) => handleDialogStatusChange(value)}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {selectedInvoice?.status !== "draft" && (
                  <Button variant="outline" size="sm" onClick={() => handleDownloadPdf()}>
                    <Download className="h-4 w-4 mr-1.5" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto">
            {selectedInvoice && previewFormData ? (
              <div className="w-full px-4 py-6 bg-muted/30">
                <InvoicePreviewWrapper formData={previewFormData} />
              </div>
            ) : selectedInvoice ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!cloneTarget} onOpenChange={(open) => !open && setCloneTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clone as Draft</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to make a copy of invoice {cloneTarget?.invoice.invoiceNumber} as a Draft?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cloning}>No</AlertDialogCancel>
            <AlertDialogAction
              disabled={cloning}
              onClick={(e) => {
                // Kept open until the request settles, so a failure can be retried
                // with the same key instead of silently closing.
                e.preventDefault();
                handleCloneInvoice();
              }}
            >
              {cloning ? "Copying..." : "Yes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {deleteTarget?.invoiceNumber}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={handleDeleteInvoice}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Income;
