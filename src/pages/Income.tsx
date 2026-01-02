import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreHorizontal, CalendarIcon, X } from "lucide-react";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";

type InvoiceStatus = "draft" | "paid" | "unpaid" | "overdue";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

const mockInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2025001", clientName: "Acme Corporation", dueDate: "15/01/2026", amount: 12500.00, status: "paid" },
  { id: "2", invoiceNumber: "INV-2025002", clientName: "Global Tech Solutions", dueDate: "20/01/2026", amount: 8750.50, status: "unpaid" },
  { id: "3", invoiceNumber: "INV-2025003", clientName: "Design Studio LLC", dueDate: "10/01/2026", amount: 3200.00, status: "overdue" },
  { id: "4", invoiceNumber: "INV-2025004", clientName: "Marketing Pro Agency", dueDate: "25/01/2026", amount: 15000.00, status: "draft" },
  { id: "5", invoiceNumber: "INV-2025005", clientName: "Tech Innovators Inc", dueDate: "18/01/2026", amount: 22400.00, status: "paid" },
  { id: "6", invoiceNumber: "INV-2025006", clientName: "Creative Works Studio", dueDate: "05/01/2026", amount: 6800.00, status: "overdue" },
  { id: "7", invoiceNumber: "INV-2025007", clientName: "Business Consulting Group", dueDate: "28/01/2026", amount: 9500.00, status: "unpaid" },
  { id: "8", invoiceNumber: "INV-2025008", clientName: "Digital Media Partners", dueDate: "30/01/2026", amount: 4200.00, status: "draft" },
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

const InvoiceRow = ({ invoice }: { invoice: Invoice }) => {
  const { variant, label } = statusStyles[invoice.status];
  
  return (
    <div className="flex items-center justify-between py-4 px-4 border-b border-border hover:bg-muted/50 transition-colors">
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
        <button className="p-1 hover:bg-muted rounded-md transition-colors">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

const Income = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const parseDate = (dateStr: string) => {
    return parse(dateStr, "dd/MM/yyyy", new Date());
  };

  const filterInvoices = (status: string) => {
    let filtered = status === "all" ? mockInvoices : mockInvoices.filter((inv) => inv.status === status);
    
    if (startDate || endDate) {
      filtered = filtered.filter((inv) => {
        const invoiceDate = parseDate(inv.dueDate);
        if (startDate && invoiceDate < startDate) return false;
        if (endDate && invoiceDate > endDate) return false;
        return true;
      });
    }
    
    return filtered;
  };

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
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
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Invoices</h1>
        <p className="text-muted-foreground mt-1">Track and manage your income.</p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">to</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {(startDate || endDate) && (
            <Button variant="ghost" size="icon" onClick={clearDateFilter} className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          )}
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

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {filterInvoices(tab.value).length > 0 ? (
                filterInvoices(tab.value).map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
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
    </div>
  );
};

export default Income;
