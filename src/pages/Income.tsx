import { useState, useEffect } from "react";
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
import { MoreHorizontal, CalendarIcon, X, ArrowUpDown, Download, FileText, Circle, Users, Loader2, Trash2 } from "lucide-react";
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
import { fetchInvoices, fetchInvoice, updateInvoiceStatus, fetchInvoicePdfStatus, deleteInvoice, type InvoiceData } from "@/lib/api/invoices";
import InvoicePreviewWrapper from "@/components/InvoicePreview";
import type { InvoiceFormData } from "@/lib/invoiceTemplateRenderer";
import { fetchClients, type ClientData } from "@/lib/api/clients";

type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

type SortOption = "due_date_asc" | "due_date_desc" | "amount_asc" | "amount_desc" | "client_asc" | "client_desc";

type InvoiceStatus = "draft" | "paid" | "unpaid" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  pdfUrl: string;
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
  amount: parseFloat(inv.totalAmount),
  status: mapApiStatus(inv.status),
  pdfUrl: inv.pdfKey || "",
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
  onDownload,
  onDelete,
}: {
  invoice: Invoice;
  onClick: () => void;
  onStatusChange: (invoiceId: string, status: InvoiceStatus) => void;
  onDownload: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
}) => {
  const { variant, label } = statusStyles[invoice.status];

  return (
    <div
      className="flex items-center justify-between py-4 px-4 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{invoice.invoiceNumber}</span>
          <span className="text-muted-foreground">,</span>
          <span className="text-foreground truncate">{invoice.clientName}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{invoice.dueDate}</p>
      </div>
      <div className="flex items-center gap-4">
        <Badge variant={variant} className="min-w-[70px] justify-center">
          {label}
        </Badge>
        <span className="font-semibold text-foreground min-w-[100px] text-right">{formatCurrency(invoice.amount)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-muted rounded-md transition-colors" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Circle className="mr-2 h-4 w-4" />
                Change Status
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "draft")}>Draft</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "paid")}>Paid</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "unpaid")}>Unpaid</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(invoice.id, "overdue")}>Overdue</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {invoice.status !== "draft" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDownload(invoice)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
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
  const [rawInvoices, setRawInvoices] = useState<InvoiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [editDraftId, setEditDraftId] = useState<string | null>(null);
  const [editDraftOpen, setEditDraftOpen] = useState(false);
  const { toast } = useToast();

  const loadInvoices = () => {
    setIsLoading(true);
    Promise.all([fetchInvoices(), fetchClients()])
      .then(([invoiceData, clientData]) => {
        const clientsMap = new Map(clientData.map((c) => [c.id, c.name]));
        setRawInvoices(invoiceData);
        setInvoices(invoiceData.map((inv) => mapApiInvoice(inv, clientsMap)));
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
      setEditDraftId(invoice.id);
      setEditDraftOpen(true);
      return;
    }
    setSelectedInvoice(invoice);
    setPreviewFormData(null);
    setIsPdfDialogOpen(true);
    try {
      const detail = await fetchInvoice(invoice.id);
      const formData: InvoiceFormData = {
        invoiceNumber: detail.invoiceNumber || "",
        invoiceDate: detail.issueDate ? new Date(detail.issueDate) : undefined,
        dueDate: detail.dueDate ? new Date(detail.dueDate) : undefined,
        currency: detail.currency || "USD",
        taxType: detail.taxType || "GST",
        seller: {
          logo: "",
          name: detail.seller?.name || detail.sellerName || "",
          streetAddress: detail.seller?.streetAddress || "",
          city: detail.seller?.city || "",
          state: detail.seller?.state || "",
          zip: detail.seller?.zipCode || "",
          country: detail.seller?.country || "",
          taxId: detail.seller?.taxId || "",
          email: detail.seller?.email || detail.sellerEmail || "",
          phone: detail.seller?.phone || "",
        },
        clientName: detail.client?.name || "",
        clientEmail: detail.client?.email || "",
        clientPhone: detail.client?.phone || "",
        clientStreetAddress: detail.client?.streetAddress || "",
        clientCity: detail.client?.city || "",
        clientState: detail.client?.state || "",
        clientZip: detail.client?.zipCode || "",
        clientCountry: detail.client?.country || "",
        lineItems: (detail.items || []).map((item) => ({
          id: item.id,
          description: item.description || item.itemName || "",
          quantity: parseFloat(item.quantity) || 0,
          unit: "",
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
    let filtered = status === "all" ? invoices : invoices.filter((inv) => inv.status === status);

    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter((inv) => {
        const invoiceDate = parseDate(inv.dueDate);
        return isWithinInterval(invoiceDate, { start: dateRange.start, end: dateRange.end });
      });
    }

    return sortInvoices(filtered);
  };

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

  const tabs = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "paid", label: "Paid" },
    { value: "unpaid", label: "Unpaid" },
    { value: "overdue", label: "Overdue" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-1">Track and manage your income.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" title="Manage Clients" onClick={() => navigate("/sme/income/clients")}>
            <Users className="h-4 w-4" />
          </Button>
          <CreateInvoiceDialog onInvoiceCreated={loadInvoices} />
          <CreateInvoiceDialog
            editInvoiceId={editDraftId}
            editOpen={editDraftOpen}
            onEditOpenChange={(open) => {
              setEditDraftOpen(open);
              if (!open) setEditDraftId(null);
            }}
            onInvoiceCreated={loadInvoices}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start h-auto p-0 gap-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-primary pb-3 px-0 text-muted-foreground data-[state=active]:text-foreground font-medium"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex justify-end mt-4 mb-2">
          <div className="flex items-center gap-2">
            <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
              <SelectTrigger className="w-auto min-w-[100px] h-8 text-sm">
                <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due_date_desc">Due Date (Newest)</SelectItem>
                <SelectItem value="due_date_asc">Due Date (Oldest)</SelectItem>
                <SelectItem value="amount_desc">Amount (High-Low)</SelectItem>
                <SelectItem value="amount_asc">Amount (Low-High)</SelectItem>
                <SelectItem value="client_asc">Client (A-Z)</SelectItem>
                <SelectItem value="client_desc">Client (Z-A)</SelectItem>
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

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                {filterInvoices(tab.value).length > 0 ? (
                  filterInvoices(tab.value).map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      onClick={() => handleInvoiceClick(invoice)}
                      onStatusChange={handleStatusChange}
                      onDownload={handleDownloadPdf}
                      onDelete={(inv) => setDeleteTarget(inv)}
                    />
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">No invoices found</div>
                )}
              </div>
            </TabsContent>
          ))
        )}
      </Tabs>

      {/* PDF Preview Dialog */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between pr-8">
              <DialogTitle>
                {selectedInvoice?.invoiceNumber} - {selectedInvoice?.clientName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedInvoice?.status}
                  onValueChange={(value: InvoiceStatus) => handleDialogStatusChange(value)}
                >
                  <SelectTrigger className="w-[120px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
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
