import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, CalendarIcon, X, ArrowUpDown } from "lucide-react";
import { format, parse, startOfDay, endOfDay, startOfWeek, startOfMonth, startOfQuarter, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog";

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

const DUMMY_PDF_URL = "https://pdfobject.com/pdf/sample.pdf";

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2025001", clientName: "Acme Corporation", dueDate: "15/01/2026", amount: 12500.00, status: "paid", pdfUrl: DUMMY_PDF_URL },
  { id: "2", invoiceNumber: "INV-2025002", clientName: "Global Tech Solutions", dueDate: "20/01/2026", amount: 8750.50, status: "unpaid", pdfUrl: DUMMY_PDF_URL },
  { id: "3", invoiceNumber: "INV-2025003", clientName: "Design Studio LLC", dueDate: "10/01/2026", amount: 3200.00, status: "overdue", pdfUrl: DUMMY_PDF_URL },
  { id: "4", invoiceNumber: "INV-2025004", clientName: "Marketing Pro Agency", dueDate: "25/01/2026", amount: 15000.00, status: "draft", pdfUrl: DUMMY_PDF_URL },
  { id: "5", invoiceNumber: "INV-2025005", clientName: "Tech Innovators Inc", dueDate: "18/01/2026", amount: 22400.00, status: "paid", pdfUrl: DUMMY_PDF_URL },
  { id: "6", invoiceNumber: "INV-2025006", clientName: "Creative Works Studio", dueDate: "05/01/2026", amount: 6800.00, status: "overdue", pdfUrl: DUMMY_PDF_URL },
  { id: "7", invoiceNumber: "INV-2025007", clientName: "Business Consulting Group", dueDate: "28/01/2026", amount: 9500.00, status: "unpaid", pdfUrl: DUMMY_PDF_URL },
  { id: "8", invoiceNumber: "INV-2025008", clientName: "Digital Media Partners", dueDate: "30/01/2026", amount: 4200.00, status: "draft", pdfUrl: DUMMY_PDF_URL },
];

const statusStyles: Record<InvoiceStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
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

const InvoiceRow = ({ invoice, onClick }: { invoice: Invoice; onClick: () => void }) => {
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
        <span className="font-semibold text-foreground min-w-[100px] text-right">
          {formatCurrency(invoice.amount)}
        </span>
        <button 
          className="p-1 hover:bg-muted rounded-md transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

const Income = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [isCustomDatePopoverOpen, setIsCustomDatePopoverOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("due_date_desc");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPdfDialogOpen(true);
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
    let filtered = status === "all" ? mockInvoices : mockInvoices.filter((inv) => inv.status === status);
    
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
        <CreateInvoiceDialog />
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

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {filterInvoices(tab.value).length > 0 ? (
                filterInvoices(tab.value).map((invoice) => (
                  <InvoiceRow 
                    key={invoice.id} 
                    invoice={invoice} 
                    onClick={() => handleInvoiceClick(invoice)}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No invoices found
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* PDF Preview Dialog */}
      <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedInvoice?.invoiceNumber} - {selectedInvoice?.clientName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {selectedInvoice && (
              <iframe
                src={selectedInvoice.pdfUrl}
                className="w-full h-full border rounded-lg"
                title={`Invoice ${selectedInvoice.invoiceNumber}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Income;
