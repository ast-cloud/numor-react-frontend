import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

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

  const filterInvoices = (status: string) => {
    if (status === "all") return mockInvoices;
    return mockInvoices.filter((inv) => inv.status === status);
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
