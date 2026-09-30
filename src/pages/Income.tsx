import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MoreHorizontal, CalendarIcon, X, ArrowUpDown, Download, FileText, Circle, Users, Loader2, Trash2, Copy, PenSquare, Search, ChevronLeft, ChevronRight , SlidersHorizontal } from "lucide-react";
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
import { buildPageItems } from "@/lib/pagination";
import { DateRange } from "react-day-picker";
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog";
import { useToast } from "@/hooks/use-toast";
import { fetchInvoices, fetchInvoice, updateInvoiceStatus, fetchInvoicePdfStatus, deleteInvoice, cloneInvoiceAsDraft, type InvoiceData, type InvoiceTab, type InvoiceListResult } from "@/lib/api/invoices";
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
  // The snapshot first. clientsMap is keyed on clientId, which is null once the
  // client is deleted - and the old fallback then printed the SELLER name in the
  // client column rather than admitting it did not know.
  clientName: inv.clientName || clientsMap.get(inv.clientId) || "—",
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

// Rows per page. The server caps limit at 200; this is what the pager steps by.
const PAGE_SIZE = 10;


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
  onEditReshare,
  onDelete,
}: {
  invoice: Invoice;
  onClick: () => void;
  onStatusChange: (invoiceId: string, status: InvoiceStatus) => void;
  /** The badge reports DRAFT -> UNPAID as it happens. */
  onProgressStatusChange: (invoiceId: string, status: string) => void;
  onDownload: (invoice: Invoice) => void;
  onClone: (invoice: Invoice) => void;
  onEditReshare: (invoice: Invoice) => void;
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
                <DropdownMenuItem onClick={() => onEditReshare(invoice)}>
                  <PenSquare className="mr-2 h-4 w-4" />
                  Edit &amp; Re-share
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  // Client ids, not names: two clients can share a name, and the chips are
  // built from the saved client list, which is keyed by id.
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
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
  // Re-issuing an invoice that already went out. Held separately from
  // editDraftId because this one must not edit the invoice it was opened from.
  const [reshareSourceId, setReshareSourceId] = useState<string | null>(null);
  const [reshareOpen, setReshareOpen] = useState(false);

  // What the user is typing, and the value actually sent to the server. Kept
  // apart so every keystroke does not become a request.
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [offset, setOffset] = useState(0);
  // The full-page spinner is for the first load only. Every later fetch keeps
  // the screen mounted: swapping it for a spinner tore out the search box
  // mid-keystroke, and the remounted input came back without focus.
  const [hasLoaded, setHasLoaded] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, limit: PAGE_SIZE, offset: 0 });
  // Counts and totals come from the server: they describe the whole filtered
  // set, which the page of rows no longer does.
  const [counts, setCounts] = useState<Record<InvoiceTab, number>>({ all: 0, draft: 0, unpaid: 0, paid: 0, overdue: 0 });
  const [totals, setTotals] = useState<InvoiceListResult["totals"]>({ invoiceCount: 0, byCurrency: [], topClient: null });
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

  // Filtering, sorting, searching and paging all happen on the server now, so
  // this carries the whole query rather than fetching everything and sifting it
  // here. Held in a ref so loadInvoices() can stay a stable, argument-free
  // callback for the many places that just want a refresh.
  const dateRange = getDateRange();
  const listQuery = {
    tab: activeTab as InvoiceTab,
    search: searchTerm,
    sort: sortOption,
    clientIds: selectedClientIds,
    limit: PAGE_SIZE,
    offset,
    startDate: dateRange?.start.toISOString(),
    endDate: dateRange?.end.toISOString(),
    // The screen shows and filters by due date; the API defaults to issue date.
    dateField: "dueDate" as const,
  };
  const listQueryRef = useRef(listQuery);
  listQueryRef.current = listQuery;

  const loadInvoices = useCallback(() => {
    setIsLoading(true);
    Promise.all([fetchInvoices(listQueryRef.current), fetchClients()])
      .then(([result, clientData]) => {
        const clientsMap = new Map(clientData.map((c) => [c.id, c.name]));
        setClientsData(clientData);
        setRawInvoices(result.invoices);
        setInvoices(result.invoices.map((inv) => mapApiInvoice(inv, clientsMap)));
        setPagination(result.pagination);
        setCounts(result.counts);
        setTotals(result.totals);
        // Invalidate React Query cache so dashboard stays in sync
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        queryClient.invalidateQueries({ queryKey: ["clients"] });
      })
      .catch((err) => {
        console.error("Failed to fetch invoices:", err);
        toast({ title: "Error", description: "Failed to load invoices", variant: "destructive" });
      })
      .finally(() => {
        setIsLoading(false);
        setHasLoaded(true);
      });
  }, [queryClient, toast]);

  // Typing pauses before it becomes a request.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Any change to what is being asked for starts again at the first page -
  // otherwise a narrower filter can leave you stranded on a page past its end.
  useEffect(() => {
    setOffset(0);
  }, [activeTab, searchTerm, sortOption, timeRangePreset, customDateRange, selectedClientIds]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, activeTab, searchTerm, sortOption, timeRangePreset, customDateRange, selectedClientIds, offset]);

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
        // Snapshot first, then the live client record, then the relation.
        clientName: detail.clientName || client?.name || detail.client?.name || "",
        clientEmail: detail.clientEmail || client?.email || detail.client?.email || "",
        clientPhone: detail.clientPhone || client?.phone || detail.client?.phone || "",
        clientStreetAddress:
          detail.clientStreetAddress || client?.streetAddress || detail.client?.streetAddress || "",
        clientCity: detail.clientCity || client?.city || detail.client?.city || "",
        clientState: detail.clientState || client?.state || detail.client?.state || "",
        clientZip: detail.clientZipCode || client?.zipCode || detail.client?.zipCode || "",
        clientCountry: detail.clientCountry || client?.country || detail.client?.country || "",
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


  const currency = COUNTRY_CURRENCY[orgCountry] || "USD";

  const pageStart = pagination.total === 0 ? 0 : pagination.offset + 1;
  const pageEnd = Math.min(pagination.offset + pagination.limit, pagination.total);
  const hasPrevPage = pagination.offset > 0;
  const hasNextPage = pageEnd < pagination.total;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const goToPage = (page: number) => setOffset((page - 1) * pagination.limit);

  // The org has invoices, or the user is searching and found none. Either way
  // the toolbar has to stay: hiding it on an empty result would take the search
  // box away with it, leaving no way to clear the term.
  // invoices.length is the fallback: an older backend returns rows but no
  // counts, and without this the page would claim there are no invoices while
  // holding a list of them.
  const hasInvoicesInScope = counts.all + counts.draft > 0 || invoices.length > 0;

  // Once the org is known to have invoices, the toolbar stays for the rest of
  // the session. Both of the other conditions are read from the last response,
  // so clearing a search that matched nothing would see them as "no invoices at
  // all" for one render and unmount the search box mid-edit.
  const everHadInvoices = useRef(false);
  if (counts.all + counts.draft > 0) everHadInvoices.current = true;

  const showList = everHadInvoices.current || hasInvoicesInScope || searchTerm !== "";

  // Straight from the server, which computed these over the whole filtered set.
  // Deriving them from `invoices` would now describe only the visible page.
  const summaryStats = useMemo(() => {
    const incomeByCurrencyEntries: [string, number][] = totals.byCurrency.map(
      (c) => [c.currency, c.total],
    );

    return {
      incomeByCurrencyEntries,
      totalIncome: totals.byCurrency.reduce((sum, c) => sum + c.total, 0),
      totalPaid: totals.byCurrency.reduce((sum, c) => sum + c.paid, 0),
      totalUnpaid: totals.byCurrency.reduce((sum, c) => sum + c.unpaid, 0),
      invoiceCount: totals.invoiceCount,
      topClient: totals.topClient,
    };
  }, [totals]);

  const toggleClientFilter = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId],
    );
  };

  const clearAllFilters = () => {
    setTimeRangePreset("all");
    setCustomDateRange(undefined);
    setTempDateRange(undefined);
    setSelectedClientIds([]);
  };

  // Drives the count on the trigger, so the button says whether anything is
  // filtered without having to open it.
  const activeFilterCount =
    (timeRangePreset !== "all" ? 1 : 0) + (selectedClientIds.length > 0 ? 1 : 0);

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
          {canWriteIncome && reshareSourceId && (
            <CreateInvoiceDialog
              prefillFromInvoiceId={reshareSourceId}
              prefillOpen={reshareOpen}
              onPrefillOpenChange={(open) => {
                setReshareOpen(open);
                // Cleared on close so the next one remounts and refetches,
                // rather than reopening with the previous invoice in the form.
                if (!open) setReshareSourceId(null);
              }}
              onInvoiceCreated={loadInvoices}
            />
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-4 sm:gap-6 md:gap-8 overflow-x-auto flex-nowrap no-scrollbar">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="group bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 px-0 text-muted-foreground data-[state=active]:text-foreground font-medium transition-colors duration-200 hover:text-foreground relative"
            >
              <span className="inline-flex items-center gap-1.5 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-data-[state=active]:translate-y-0">
                {tab.label}
                <span className="text-[10px] font-normal text-muted-foreground bg-muted rounded-full px-1 leading-4 min-w-[1rem] text-center">
                  {counts[tab.value as InvoiceTab] ?? 0}
                </span>
              </span>
              <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-primary/60 origin-center scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 group-data-[state=active]:scale-x-0 pointer-events-none" />
            </TabsTrigger>
          ))}
        </TabsList>

        {isLoading && !hasLoaded ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : showList ? (
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

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search invoice number or client"
                  className="h-8 pl-8 pr-8 text-sm"
                />
                {searchInput && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
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

                <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-sm">
                      <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-medium text-primary">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="text-sm font-medium">Filters</span>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={clearAllFilters}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    <div className="px-4 py-3 space-y-2 border-b border-border">
                      <Label className="text-xs text-muted-foreground">Due date</Label>
                      <Select
                        value={timeRangePreset}
                        onValueChange={(value: TimeRangePreset) => handleTimeRangeChange(value)}
                      >
                        {/* The icon and the value are one child, not two. The
                            trigger is justify-between, so as separate children it
                            spread them apart and stranded the value in the middle. */}
                        {/* A div, not a span: the trigger carries
                            [&>span]:line-clamp-1, which sets display:-webkit-box on
                            a direct span child and would break this flex row,
                            stacking the icon above the text. */}
                        <SelectTrigger className="h-7 px-2.5 text-xs border-border/70 font-normal">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <SelectValue placeholder="All Time" />
                          </div>
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-full justify-start px-2.5 text-left text-xs font-normal border-border/70"
                            >
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
                          {/* One month, not two: the parent popover is 320px wide and a
                              two-month calendar overflows the viewport on a phone. */}
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="range"
                              selected={tempDateRange}
                              onSelect={setTempDateRange}
                              numberOfMonths={1}
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
                    </div>

                    <div className="px-4 py-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Client</Label>
                        {selectedClientIds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setSelectedClientIds([])}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {clientsData.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-1">No clients yet.</p>
                      ) : (
                        // Scrolls rather than growing: an org with fifty clients would
                        // otherwise push the popover past the bottom of the screen.
                        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                          {clientsData.map((client) => {
                            const selected = selectedClientIds.includes(client.id);
                            return (
                              <button
                                key={client.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => toggleClientFilter(client.id)}
                                className={cn(
                                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                                  selected
                                    ? "border-primary/20 bg-primary/10 text-primary"
                                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                                )}
                              >
                                {client.name}
                                {selected && <X className="h-3 w-3" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {tabs.map((tab) => {
              // The server already filtered to the active tab, so only that one
              // has rows to show; the others render empty until selected.
              const tabInvoices = tab.value === activeTab ? invoices : [];
              return (
                <TabsContent key={tab.value} value={tab.value} className="mt-6">
                  <div
                    className={cn(
                      "bg-card rounded-lg border border-border overflow-hidden transition-opacity",
                      // Refetching: the previous rows stay put and fade slightly,
                      // so the list does not collapse and shift everything below it.
                      isLoading && "opacity-50",
                    )}
                  >
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
                          onEditReshare={(inv) => {
                            setReshareSourceId(inv.id);
                            setReshareOpen(true);
                          }}
                          onDelete={(inv) => setDeleteTarget(inv)}
                        />
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">No invoices found</div>
                    )}
                  </div>

                  {/* The range always shows, so the size of the list is visible
                      even on a single page; the controls appear only when there
                      is somewhere to go. */}
                  {pagination.total > 0 && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
                      {totalPages > 1 && (
                        <nav aria-label="Invoice pages" className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label="Previous page"
                            disabled={!hasPrevPage || isLoading}
                            onClick={() => goToPage(currentPage - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          {buildPageItems(currentPage, totalPages).map((page, i) =>
                            page === null ? (
                              <span
                                key={`gap-${i}`}
                                aria-hidden="true"
                                className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                              >
                                …
                              </span>
                            ) : (
                              <button
                                key={page}
                                type="button"
                                aria-label={`Page ${page}`}
                                aria-current={page === currentPage ? "page" : undefined}
                                disabled={isLoading}
                                onClick={() => goToPage(page)}
                                className={cn(
                                  // The border stays in the box for every state and only
                                  // its colour changes, so becoming the current page
                                  // cannot nudge the row by a pixel.
                                  "flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                                  page === currentPage
                                    ? "border-primary/20 bg-primary/10 text-primary"
                                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                                  isLoading && "pointer-events-none opacity-60",
                                )}
                              >
                                {page}
                              </button>
                            ),
                          )}

                          <button
                            type="button"
                            aria-label="Next page"
                            disabled={!hasNextPage || isLoading}
                            onClick={() => goToPage(currentPage + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </nav>
                      )}

                      <span className="text-xs text-muted-foreground">
                        Showing {pageStart}–{pageEnd} of {pagination.total}
                      </span>
                    </div>
                  )}
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
