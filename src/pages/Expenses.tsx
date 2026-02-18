import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload,
  Plus,
  IndianRupee,
  Trash2,
  Pencil,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Loader2,
  CalendarIcon,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, startOfWeek, startOfMonth, startOfQuarter, endOfDay, isWithinInterval } from "date-fns";
import { fetchCurrentOrganization } from "@/lib/api/user";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

import { config } from "@/lib/config";
import { getToken } from "@/lib/api/authToken";
import { fetchExpenses, type ExpenseAPI } from "@/lib/api/expenses";

type SortField = "date" | "totalPrice" | "category";
type SortOrder = "asc" | "desc";
type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

type Expense = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxType: string;
  taxPercentage: number;
  category: string;
  date: string;
};

type ExpenseItem = {
  title: string;
  merchant: string;
  quantity: string;
  unitType: string;
  unitPrice: string;
  taxType: string;
  taxPercentage: string;
  category: string;
  paymentMethod: string;
  date: string;
};

// Bill upload form types
type BillCommon = {
  merchant: string;
  billDate: string;
  totalAmount: string;
  category: string;
  paymentMethod: string;
};

type BillItem = {
  name: string;
  quantity: string;
  unitType: string;
  unitPrice: string;
  taxRate: string;
  itemPrice: string;
};

type DialogMode = "default" | "bill";

const paymentMethods = ["Cash", "Credit Card", "Debit Card", "Bank Transfer", "UPI", "Cheque", "Other"];
const billPaymentMethods = ["Card", "UPI", "Cash", "Bank Transfer"];

const createEmptyBillItem = (): BillItem => ({
  name: "",
  quantity: "1",
  unitType: "Units",
  unitPrice: "",
  taxRate: "",
  itemPrice: "",
});

const categories = [
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Office Supplies",
  "Travel",
  "Entertainment",
  "Other",
];

// Country-to-currency mapping
const countryCurrency: Record<string, string> = {
  "India": "INR", "UAE": "AED", "US": "USD", "UK": "GBP",
  "Austria": "EUR", "Belgium": "EUR", "Bulgaria": "EUR", "Croatia": "EUR",
  "Cyprus": "EUR", "Czech Republic": "EUR", "Denmark": "EUR", "Estonia": "EUR",
  "Finland": "EUR", "France": "EUR", "Germany": "EUR", "Greece": "EUR",
  "Hungary": "EUR", "Ireland": "EUR", "Italy": "EUR", "Latvia": "EUR",
  "Lithuania": "EUR", "Luxembourg": "EUR", "Malta": "EUR", "Netherlands": "EUR",
  "Poland": "EUR", "Portugal": "EUR", "Romania": "EUR", "Slovakia": "EUR",
  "Slovenia": "EUR", "Spain": "EUR", "Sweden": "EUR",
};

// Country-to-tax defaults mapping (shared with invoice logic)
const countryTaxDefaults: Record<string, { taxType: string; taxPercent: string }> = {
  "India": { taxType: "GST", taxPercent: "18" },
  "UAE": { taxType: "VAT", taxPercent: "5" },
  "US": { taxType: "Sales Tax", taxPercent: "" },
  "UK": { taxType: "VAT", taxPercent: "20" },
  "Austria": { taxType: "VAT", taxPercent: "20" },
  "Belgium": { taxType: "VAT", taxPercent: "21" },
  "Bulgaria": { taxType: "VAT", taxPercent: "20" },
  "Croatia": { taxType: "VAT", taxPercent: "25" },
  "Cyprus": { taxType: "VAT", taxPercent: "19" },
  "Czech Republic": { taxType: "VAT", taxPercent: "21" },
  "Denmark": { taxType: "VAT", taxPercent: "25" },
  "Estonia": { taxType: "VAT", taxPercent: "22" },
  "Finland": { taxType: "VAT", taxPercent: "24" },
  "France": { taxType: "VAT", taxPercent: "20" },
  "Germany": { taxType: "VAT", taxPercent: "19" },
  "Greece": { taxType: "VAT", taxPercent: "24" },
  "Hungary": { taxType: "VAT", taxPercent: "27" },
  "Ireland": { taxType: "VAT", taxPercent: "23" },
  "Italy": { taxType: "VAT", taxPercent: "22" },
  "Latvia": { taxType: "VAT", taxPercent: "21" },
  "Lithuania": { taxType: "VAT", taxPercent: "21" },
  "Luxembourg": { taxType: "VAT", taxPercent: "17" },
  "Malta": { taxType: "VAT", taxPercent: "18" },
  "Netherlands": { taxType: "VAT", taxPercent: "21" },
  "Poland": { taxType: "VAT", taxPercent: "23" },
  "Portugal": { taxType: "VAT", taxPercent: "23" },
  "Romania": { taxType: "VAT", taxPercent: "19" },
  "Slovakia": { taxType: "VAT", taxPercent: "20" },
  "Slovenia": { taxType: "VAT", taxPercent: "22" },
  "Spain": { taxType: "VAT", taxPercent: "21" },
  "Sweden": { taxType: "VAT", taxPercent: "25" },
};

// Country-specific tax percentage options
const expenseTaxPercentOptions: Record<string, number[]> = {
  "India": [0, 5, 12, 18, 28],
  "UAE": [0, 5],
  "UK": [0, 5, 20],
  "US": [0],
  "Austria": [0, 10, 13, 20],
  "Belgium": [0, 6, 12, 21],
  "Bulgaria": [0, 9, 20],
  "Croatia": [0, 5, 13, 25],
  "Cyprus": [0, 5, 9, 19],
  "Czech Republic": [0, 10, 15, 21],
  "Denmark": [0, 25],
  "Estonia": [0, 9, 22],
  "Finland": [0, 10, 14, 24],
  "France": [0, 5.5, 10, 20],
  "Germany": [0, 7, 19],
  "Greece": [0, 6, 13, 24],
  "Hungary": [0, 5, 18, 27],
  "Ireland": [0, 9, 13.5, 23],
  "Italy": [0, 4, 10, 22],
  "Latvia": [0, 5, 12, 21],
  "Lithuania": [0, 5, 9, 21],
  "Luxembourg": [0, 3, 8, 17],
  "Malta": [0, 5, 7, 18],
  "Netherlands": [0, 9, 21],
  "Poland": [0, 5, 8, 23],
  "Portugal": [0, 6, 13, 23],
  "Romania": [0, 5, 9, 19],
  "Slovakia": [0, 10, 20],
  "Slovenia": [0, 5, 9.5, 22],
  "Spain": [0, 4, 10, 21],
  "Sweden": [0, 6, 12, 25],
};

const getTaxPercentOptions = (country?: string): number[] => {
  if (!country) return [0, 5, 12, 18, 20, 25, 28];
  return expenseTaxPercentOptions[country] || [0, 5, 12, 18, 20, 25, 28];
};

const unitTypes = ["Kg", "g", "Ltr", "ml", "m", "ft", "Box", "Pack", "Units", "Hrs", "Sq ft"];

const quickPaymentMethods = ["Card", "UPI", "Cash"];

const createEmptyItem = (orgCountry?: string): ExpenseItem => {
  const defaults = orgCountry ? countryTaxDefaults[orgCountry] : undefined;
  return {
    title: "",
    merchant: "",
    quantity: "",
    unitType: "Units",
    unitPrice: "",
    taxType: defaults?.taxType || "",
    taxPercentage: defaults?.taxPercent || "",
    category: "",
    paymentMethod: "",
    date: new Date().toISOString().split("T")[0],
  };
};

const Expenses = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [apiExpenses, setApiExpenses] = useState<ExpenseAPI[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<ExpenseAPI | null>(null);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([createEmptyItem()]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customTaxItems, setCustomTaxItems] = useState<Set<number>>(new Set());
  const [customTaxBillItems, setCustomTaxBillItems] = useState<Set<number>>(new Set());
  const [orgCountry, setOrgCountry] = useState<string | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<DialogMode>("default");
  const [billCommon, setBillCommon] = useState<BillCommon>({
    merchant: "",
    billDate: new Date().toISOString().split("T")[0],
    totalAmount: "",
    category: "",
    paymentMethod: "",
  });
  const [billItems, setBillItems] = useState<BillItem[]>([createEmptyBillItem()]);
  const [ocrMeta, setOcrMeta] = useState<{ ocrExtracted: boolean; ocrConfidence: number | null; receiptUrl: string | null }>({ ocrExtracted: false, ocrConfidence: null, receiptUrl: null });

  // Fetch org country for tax defaults
  useEffect(() => {
    fetchCurrentOrganization()
      .then((org) => {
        const country = org.country || undefined;
        setOrgCountry(country);
        // Prefill the initial empty item with org defaults
        if (country && countryTaxDefaults[country]) {
          setExpenseItems((prev) =>
            prev.map((item) =>
              !item.taxType && !item.taxPercentage
                ? { ...item, taxType: countryTaxDefaults[country].taxType, taxPercentage: countryTaxDefaults[country].taxPercent }
                : item
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch expenses from API
  const loadExpenses = async () => {
    setIsLoadingExpenses(true);
    try {
      const data = await fetchExpenses();
      setApiExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  // Filtering & Sorting state
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [unitPriceMin, setUnitPriceMin] = useState<string>("");
  const [unitPriceMax, setUnitPriceMax] = useState<string>("");
  const [totalPriceMin, setTotalPriceMin] = useState<string>("");
  const [totalPriceMax, setTotalPriceMax] = useState<string>("");
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  const [isCustomDatePopoverOpen, setIsCustomDatePopoverOpen] = useState(false);
  const [tempCustomDateRange, setTempCustomDateRange] = useState<DateRange | undefined>(undefined);

  // Calculate date range based on preset
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

  const hasExpenses = expenses.length > 0 || apiExpenses.length > 0;

  // Filter and sort API expenses (receipts)
  const filteredApiExpenses = useMemo(() => {
    let result = [...apiExpenses];

    // Apply category filter
    if (categoryFilter.length > 0) {
      result = result.filter((r) => categoryFilter.includes(r.category));
    }

    // Apply time range filter
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter((r) => {
        const d = new Date(r.expenseDate);
        return isWithinInterval(d, { start: dateRange.start, end: dateRange.end });
      });
    }

    // Apply total price filter
    if (totalPriceMin) {
      const min = parseFloat(totalPriceMin);
      if (!isNaN(min)) result = result.filter((r) => parseFloat(r.totalAmount) >= min);
    }
    if (totalPriceMax) {
      const max = parseFloat(totalPriceMax);
      if (!isNaN(max)) result = result.filter((r) => parseFloat(r.totalAmount) <= max);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime();
          break;
        case "totalPrice":
          comparison = parseFloat(a.totalAmount) - parseFloat(b.totalAmount);
          break;
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    apiExpenses,
    categoryFilter,
    timeRangePreset,
    customDateRange,
    totalPriceMin,
    totalPriceMax,
    sortField,
    sortOrder,
  ]);

  // Filter and sort local expenses (legacy)
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];
    if (categoryFilter.length > 0) {
      result = result.filter((exp) => categoryFilter.includes(exp.category));
    }
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter((exp) => {
        const expenseDate = new Date(exp.date);
        return isWithinInterval(expenseDate, { start: dateRange.start, end: dateRange.end });
      });
    }
    if (unitPriceMin) { const min = parseFloat(unitPriceMin); if (!isNaN(min)) result = result.filter((exp) => exp.unitPrice >= min); }
    if (unitPriceMax) { const max = parseFloat(unitPriceMax); if (!isNaN(max)) result = result.filter((exp) => exp.unitPrice <= max); }
    if (totalPriceMin) { const min = parseFloat(totalPriceMin); if (!isNaN(min)) result = result.filter((exp) => exp.quantity * exp.unitPrice >= min); }
    if (totalPriceMax) { const max = parseFloat(totalPriceMax); if (!isNaN(max)) result = result.filter((exp) => exp.quantity * exp.unitPrice <= max); }
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date": comparison = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
        case "totalPrice": comparison = a.quantity * a.unitPrice - b.quantity * b.unitPrice; break;
        case "category": comparison = a.category.localeCompare(b.category); break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
    return result;
  }, [expenses, categoryFilter, timeRangePreset, customDateRange, unitPriceMin, unitPriceMax, totalPriceMin, totalPriceMax, sortField, sortOrder]);

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

  // Calculate summary stats from API expenses
  const summaryStats = useMemo(() => {
    const receipts = filteredApiExpenses;
    const totalSpend = receipts.reduce((sum, r) => sum + parseFloat(r.totalAmount), 0);
    const receiptCount = receipts.length;
    const averageSpend = receiptCount > 0 ? totalSpend / receiptCount : 0;

    // Total claimable tax from all items across all receipts
    let totalTax = 0;
    receipts.forEach((r) => {
      (r.items || []).forEach((item) => {
        const taxRate = parseFloat(item.taxRate) || 0;
        if (taxRate > 0) {
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const qty = parseFloat(item.quantity) || 1;
          totalTax += (unitPrice * qty * taxRate) / 100;
        }
      });
    });

    // Top category
    const categorySpend: Record<string, number> = {};
    receipts.forEach((r) => {
      categorySpend[r.category || "Other"] = (categorySpend[r.category || "Other"] || 0) + parseFloat(r.totalAmount);
    });
    const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];

    return {
      totalSpend,
      receiptCount,
      averageSpend,
      totalTax,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    };
  }, [filteredApiExpenses]);

  const [shouldOpenCustomPopover, setShouldOpenCustomPopover] = useState(false);

  const handleTimeRangeChange = (value: TimeRangePreset) => {
    setTimeRangePreset(value);
    if (value !== "custom") {
      setCustomDateRange(undefined);
      setTempCustomDateRange(undefined);
      setShouldOpenCustomPopover(false);
    } else {
      // Flag to open the popover after it mounts
      setTempCustomDateRange(customDateRange);
      setShouldOpenCustomPopover(true);
    }
  };

  // Open the custom date popover after it mounts
  useEffect(() => {
    if (shouldOpenCustomPopover && timeRangePreset === "custom") {
      const timer = setTimeout(() => {
        setIsCustomDatePopoverOpen(true);
        setShouldOpenCustomPopover(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [shouldOpenCustomPopover, timeRangePreset]);

  const handleApplyCustomDateRange = () => {
    setCustomDateRange(tempCustomDateRange);
    setIsCustomDatePopoverOpen(false);
  };

  const clearFilters = () => {
    setCategoryFilter([]);
    setTimeRangePreset("all");
    setCustomDateRange(undefined);
    setUnitPriceMin("");
    setUnitPriceMax("");
    setTotalPriceMin("");
    setTotalPriceMax("");
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilter((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
  };

  const hasActiveFilters =
    categoryFilter.length > 0 ||
    timeRangePreset !== "all" ||
    unitPriceMin ||
    unitPriceMax ||
    totalPriceMin ||
    totalPriceMax;
  const activeFilterCount = [
    categoryFilter.length > 0,
    timeRangePreset !== "all",
    unitPriceMin || unitPriceMax,
    totalPriceMin || totalPriceMax,
  ].filter(Boolean).length;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    return sortOrder === "asc" ? <ArrowUp className="w-4 h-4 ml-1" /> : <ArrowDown className="w-4 h-4 ml-1" />;
  };

  const updateItem = (index: number, field: keyof ExpenseItem, value: string) => {
    const updated = [...expenseItems];
    updated[index] = { ...updated[index], [field]: value };
    setExpenseItems(updated);
  };

  const addItem = () => {
    setExpenseItems([...expenseItems, createEmptyItem(orgCountry)]);
  };

  const removeItem = (index: number) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter((_, i) => i !== index));
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if ALL items have their required fields filled
    const incompleteItems = expenseItems
      .map((item, index) => {
        const missingFields: string[] = [];
        if (!item.title.trim()) missingFields.push("title");
        if (!item.quantity.trim()) missingFields.push("quantity");
        if (!item.unitPrice.trim()) missingFields.push("unit price");
        if (!item.category) missingFields.push("category");
        return { index: index + 1, missingFields };
      })
      .filter((item) => item.missingFields.length > 0);

    if (incompleteItems.length > 0) {
      const errorMessage = incompleteItems
        .map((item) => `Item ${item.index}: missing ${item.missingFields.join(", ")}`)
        .join("; ");
      toast({
        title: "Error",
        description: `Please fill all required fields. ${errorMessage}`,
        variant: "destructive",
      });
      return;
    }

    // Build payload matching confirmAndSaveExpense API
    const item = expenseItems[0];
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const quantity = parseFloat(item.quantity) || 1;
    const taxRate = parseFloat(item.taxPercentage) || 0;
    const itemTotal = unitPrice * quantity * (1 + taxRate / 100);

    const payload = {
      merchant: item.merchant || item.title,
      expenseDate: item.date,
      totalAmount: itemTotal,
      category: item.category || "Other",
      paymentMethod: (item.paymentMethod || "CASH").toUpperCase(),
      receiptUrl: null,
      ocrExtracted: false,
      ocrConfidence: null,
      items: expenseItems.map((ei) => {
        const qty = parseFloat(ei.quantity) || 1;
        const up = parseFloat(ei.unitPrice) || 0;
        const tax = parseFloat(ei.taxPercentage) || 0;
        return {
          name: ei.title,
          quantity: qty,
          unitPrice: up,
          unitType: (ei.unitType || "Units").toUpperCase(),
          taxRate: tax,
          total: qty * up * (1 + tax / 100),
        };
      }),
    };

    try {
      const token = getToken();
      const res = await fetch(`${config.backendHost}/api/expenses/confirmAndSaveExpense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast({ title: "Error", description: result.message || "Failed to save expense", variant: "destructive" });
        return;
      }

      await loadExpenses();

      setExpenseItems([createEmptyItem(orgCountry)]);
      setCustomTaxItems(new Set());
      setIsManualDialogOpen(false);
      toast({ title: "Success", description: "Expense saved successfully" });
    } catch (error) {
      console.error("Save expense error:", error);
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billCommon.merchant.trim()) {
      toast({ title: "Error", description: "Please enter merchant name", variant: "destructive" });
      return;
    }

    const incompleteItems = billItems
      .map((item, index) => {
        const missing: string[] = [];
        if (!item.name.trim()) missing.push("name");
        if (!item.quantity.trim()) missing.push("quantity");
        if (!item.unitPrice.trim()) missing.push("unit price");
        return { index: index + 1, missing };
      })
      .filter((item) => item.missing.length > 0);

    if (incompleteItems.length > 0) {
      const errorMessage = incompleteItems.map((item) => `Item ${item.index}: missing ${item.missing.join(", ")}`).join("; ");
      toast({ title: "Error", description: `Please fill required fields. ${errorMessage}`, variant: "destructive" });
      return;
    }

    const payload = {
      merchant: billCommon.merchant,
      expenseDate: billCommon.billDate,
      totalAmount: parseFloat(billCommon.totalAmount) || 0,
      category: billCommon.category || "Other",
      paymentMethod: (billCommon.paymentMethod || "CASH").toUpperCase(),
      receiptUrl: ocrMeta.receiptUrl,
      ocrExtracted: ocrMeta.ocrExtracted,
      ocrConfidence: ocrMeta.ocrConfidence,
      items: billItems.map((item) => ({
        name: item.name,
        quantity: parseFloat(item.quantity) || 1,
        unitPrice: parseFloat(item.unitPrice) || 0,
        unitType: (item.unitType || "Units").toUpperCase(),
        taxRate: parseFloat(item.taxRate) || 0,
        total: parseFloat(item.itemPrice) || 0,
      })),
    };

    try {
      const token = getToken();
      const res = await fetch(`${config.backendHost}/api/expenses/confirmAndSaveExpense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        toast({ title: "Error", description: result.message || "Failed to save expense", variant: "destructive" });
        return;
      }

      // Refetch expenses from API
      await loadExpenses();

      setBillCommon({ merchant: "", billDate: new Date().toISOString().split("T")[0], totalAmount: "", category: "", paymentMethod: "" });
      setBillItems([createEmptyBillItem()]);
      setOcrMeta({ ocrExtracted: false, ocrConfidence: null, receiptUrl: null });
      setDialogMode("default");
      setIsManualDialogOpen(false);
      toast({ title: "Success", description: "Expense saved successfully" });
    } catch (error) {
      console.error("Save expense error:", error);
      toast({ title: "Error", description: "Network error. Please try again.", variant: "destructive" });
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    setExpenses(expenses.map((exp) => (exp.id === editingExpense.id ? editingExpense : exp)));
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    toast({ title: "Success", description: "Expense updated successfully" });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
    toast({ title: "Deleted", description: "Expense removed successfully" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = getToken();
      const response = await fetch(`${config.backendHost}/api/expenses/parseExpense`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data?.parsedData) {
        const parsedData = result.data.parsedData;
        const items = parsedData.items || [];

        if (items.length === 0) {
          toast({
            title: "No Items Found",
            description: "Could not extract any items from the bill",
            variant: "destructive",
          });
          return;
        }

        // Parse date - backend returns YYYY-MM-DD format
        let expenseDate = new Date().toISOString().split("T")[0];
        if (parsedData.expenseDate) {
          // Handle YYYY-MM-DD directly
          if (/^\d{4}-\d{2}-\d{2}$/.test(parsedData.expenseDate)) {
            expenseDate = parsedData.expenseDate;
          } else {
            // Fallback for other formats like MM/DD/YYYY
            const dateParts = parsedData.expenseDate.split("/");
            if (dateParts.length === 3) {
              const [day, month, year] = dateParts;
              expenseDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            }
          }
        }

        // Map parsed items to bill items
        const prefillBillItems: BillItem[] = items.map((item: any) => ({
          name: item.itemName || item.name || "",
          quantity: String(item.quantity || 1),
          unitType: item.unitType || "Units",
          unitPrice: String(item.unitPrice ?? item.unit_price_before_tax ?? 0),
          taxRate: String(item.taxRate ?? item.taxPercent ?? item.tax_percentage ?? ""),
          itemPrice: String(item.total ?? item.totalPrice ?? item.itemPrice ?? ""),
        }));

        // Set bill common fields
        setBillCommon({
          merchant: parsedData.merchant || "",
          billDate: expenseDate,
          totalAmount: String(parsedData.totalAmount || ""),
          category: parsedData.category && categories.includes(parsedData.category) ? parsedData.category : "",
          paymentMethod: parsedData.paymentMethod || "",
        });
        setBillItems(prefillBillItems);
        setOcrMeta({
          ocrExtracted: !!parsedData.ocrExtracted,
          ocrConfidence: result.data.confidence ?? parsedData.confidence ?? null,
          receiptUrl: parsedData.receiptUrl || null,
        });
        setDialogMode("bill");
        toast({ title: "Success", description: `Parsed ${items.length} item(s) from the bill` });
      } else {
        toast({ title: "Error", description: "Failed to parse bill data", variant: "destructive" });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast({ title: "Error", description: "Failed to process the bill. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your business expenses.</p>
        </div>

        {/* Quick Action Button */}
        <div className="flex items-center gap-2">
          <Dialog open={isManualDialogOpen} onOpenChange={(open) => {
              setIsManualDialogOpen(open);
              if (!open) {
                setExpenseItems([createEmptyItem(orgCountry)]);
                setCustomTaxItems(new Set());
                setCustomTaxBillItems(new Set());
                setDialogMode("default");
                setBillCommon({ merchant: "", billDate: new Date().toISOString().split("T")[0], totalAmount: "", category: "", paymentMethod: "" });
                setBillItems([createEmptyBillItem()]);
                setOcrMeta({ ocrExtracted: false, ocrConfidence: null, receiptUrl: null });
              }
            }}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>

              {dialogMode === "default" && (
                <>
                  {/* Upload Receipt Section */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="bill-upload"
                    />
                    <label htmlFor="bill-upload" className="cursor-pointer">
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                          <p className="text-foreground font-medium">Processing receipt...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-foreground font-medium">Upload Receipt / Bill</p>
                          <p className="text-muted-foreground text-xs mt-1">Upload image to auto-parse bill details</p>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="relative flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or add a quick expense</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Quick Single Expense Form */}
                  <form onSubmit={handleManualSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <FloatingLabelInput
                          label="Title *"
                          value={expenseItems[0].title}
                          onChange={(e) => updateItem(0, "title", e.target.value)}
                        />
                        <FloatingLabelInput
                          label="Merchant"
                          value={expenseItems[0].merchant}
                          onChange={(e) => updateItem(0, "merchant", e.target.value)}
                        />
                        <FloatingLabelInput
                          label="Date"
                          type="date"
                          value={expenseItems[0].date}
                          onChange={(e) => updateItem(0, "date", e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3" style={{ gridTemplateColumns: '0.7fr 0.8fr 1.2fr 1.2fr 1fr 1fr' }}>
                        <FloatingLabelInput
                          label="Qty *"
                          type="number"
                          step="1"
                          min="1"
                          value={expenseItems[0].quantity}
                          onChange={(e) => updateItem(0, "quantity", e.target.value)}
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Select value={expenseItems[0].unitType} onValueChange={(value) => updateItem(0, "unitType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {unitTypes.map((u) => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1">
                          <FloatingLabelInput
                            label="Unit Price *"
                            type="number"
                            step="0.01"
                            value={expenseItems[0].unitPrice}
                            onChange={(e) => updateItem(0, "unitPrice", e.target.value)}
                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-xs text-muted-foreground shrink-0">
                            {orgCountry === "India" ? "INR" : orgCountry === "UAE" ? "AED" : orgCountry === "US" ? "USD" : orgCountry === "UK" ? "GBP" : ["Austria","Belgium","Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands","Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden"].includes(orgCountry || "") ? "EUR" : "USD"}
                          </span>
                        </div>
                        {(() => {
                          const taxLabel = orgCountry && countryTaxDefaults[orgCountry] ? countryTaxDefaults[orgCountry].taxType : "Tax";
                          const options = getTaxPercentOptions(orgCountry);
                          const isCustom = customTaxItems.has(0) || (expenseItems[0].taxPercentage !== "" && !options.map(String).includes(expenseItems[0].taxPercentage));
                          return isCustom ? (
                            <div className="flex items-center gap-1">
                              <FloatingLabelInput
                                label="Tax %"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={expenseItems[0].taxPercentage}
                                onChange={(e) => updateItem(0, "taxPercentage", e.target.value)}
                                className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="text-xs font-medium text-muted-foreground shrink-0">{taxLabel}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 shrink-0"
                                title="Back to presets"
                                onClick={() => {
                                  updateItem(0, "taxPercentage", "");
                                  setCustomTaxItems((prev) => { const next = new Set(prev); next.delete(0); return next; });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Select
                                value={expenseItems[0].taxPercentage}
                                onValueChange={(value) => {
                                  if (value === "__custom__") {
                                    setCustomTaxItems((prev) => new Set(prev).add(0));
                                  } else {
                                    updateItem(0, "taxPercentage", value);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Tax %" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  {options.map((pct) => (
                                    <SelectItem key={pct} value={String(pct)}>
                                      {pct}%
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="__custom__">Custom...</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-xs font-medium text-muted-foreground shrink-0">{taxLabel}</span>
                            </div>
                          );
                        })()}
                        <Select value={expenseItems[0].category} onValueChange={(value) => updateItem(0, "category", value)}>
                          <SelectTrigger className="truncate">
                            <SelectValue placeholder="Category *" className="truncate" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50 min-w-[200px]">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat} className="whitespace-normal">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={expenseItems[0].paymentMethod} onValueChange={(value) => updateItem(0, "paymentMethod", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {quickPaymentMethods.map((pm) => (
                              <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsManualDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Plus className="w-4 h-4 mr-2" /> Add Expense
                      </Button>
                    </div>
                  </form>
                </>
              )}

              {dialogMode === "bill" && (
                <>
                  {/* Bill Upload Form - Common Fields */}
                  <form onSubmit={handleBillSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Bill Details</Label>
                      <div className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <FloatingLabelInput
                            label="Merchant *"
                            value={billCommon.merchant}
                            onChange={(e) => setBillCommon({ ...billCommon, merchant: e.target.value })}
                          />
                          <FloatingLabelInput
                            label="Bill Date"
                            type="date"
                            value={billCommon.billDate}
                            onChange={(e) => setBillCommon({ ...billCommon, billDate: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex items-center gap-1">
                            <FloatingLabelInput
                              label="Total Amount"
                              type="number"
                              step="0.01"
                              value={billCommon.totalAmount}
                              onChange={(e) => setBillCommon({ ...billCommon, totalAmount: e.target.value })}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {orgCountry === "India" ? "INR" : orgCountry === "UAE" ? "AED" : orgCountry === "US" ? "USD" : orgCountry === "UK" ? "GBP" : ["Austria","Belgium","Bulgaria","Croatia","Cyprus","Czech Republic","Denmark","Estonia","Finland","France","Germany","Greece","Hungary","Ireland","Italy","Latvia","Lithuania","Luxembourg","Malta","Netherlands","Poland","Portugal","Romania","Slovakia","Slovenia","Spain","Sweden"].includes(orgCountry || "") ? "EUR" : "USD"}
                            </span>
                          </div>
                          <div className="relative">
                            <Select value={billCommon.category} onValueChange={(value) => setBillCommon({ ...billCommon, category: value })}>
                              <SelectTrigger className="truncate h-10 pt-4 pb-1">
                                <SelectValue placeholder=" " className="truncate" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover z-50 min-w-[200px]">
                                {categories.map((cat) => (
                                  <SelectItem key={cat} value={cat} className="whitespace-normal">
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className={cn(
                              "absolute left-3 transition-all duration-200 pointer-events-none text-muted-foreground",
                              billCommon.category ? "top-1 text-[10px] font-medium" : "top-1/2 -translate-y-1/2 text-sm"
                            )}>Category</span>
                          </div>
                          <div className="relative">
                            <Select value={billCommon.paymentMethod} onValueChange={(value) => setBillCommon({ ...billCommon, paymentMethod: value })}>
                              <SelectTrigger className="h-10 pt-4 pb-1">
                                <SelectValue placeholder=" " />
                              </SelectTrigger>
                              <SelectContent className="bg-popover z-50">
                                {billPaymentMethods.map((method) => (
                                  <SelectItem key={method} value={method}>{method}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <span className={cn(
                              "absolute left-3 transition-all duration-200 pointer-events-none text-muted-foreground",
                              billCommon.paymentMethod ? "top-1 text-[10px] font-medium" : "top-1/2 -translate-y-1/2 text-sm"
                            )}>Payment Method</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bill Items */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Items</Label>
                      {billItems.map((item, index) => (
                        <div key={index} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (billItems.length > 1) {
                                  setBillItems(billItems.filter((_, i) => i !== index));
                                }
                              }}
                              disabled={billItems.length === 1}
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                          <div className="grid gap-3" style={{ gridTemplateColumns: '2fr 0.7fr 0.7fr 1fr 1.1fr 1fr' }}>
                            <FloatingLabelInput
                              label="Name *"
                              value={item.name}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index] = { ...updated[index], name: e.target.value };
                                setBillItems(updated);
                              }}
                            />
                            <FloatingLabelInput
                              label="Qty *"
                              type="number"
                              step="1"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index] = { ...updated[index], quantity: e.target.value };
                                setBillItems(updated);
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <Select
                              value={item.unitType}
                              onValueChange={(value) => {
                                const updated = [...billItems];
                                updated[index] = { ...updated[index], unitType: value };
                                setBillItems(updated);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover z-50">
                                {unitTypes.map((u) => (
                                  <SelectItem key={u} value={u}>{u}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FloatingLabelInput
                              label="Unit Price *"
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index] = { ...updated[index], unitPrice: e.target.value };
                                setBillItems(updated);
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            {(() => {
                              const taxLabel = orgCountry && countryTaxDefaults[orgCountry] ? countryTaxDefaults[orgCountry].taxType : "Tax";
                              const options = getTaxPercentOptions(orgCountry);
                              const isCustom = customTaxBillItems.has(index) || (item.taxRate !== "" && !options.map(String).includes(item.taxRate));
                              return isCustom ? (
                                <div className="flex gap-1 items-end">
                                  <FloatingLabelInput
                                    label={`${taxLabel} %`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={item.taxRate}
                                    onChange={(e) => {
                                      const updated = [...billItems];
                                      updated[index] = { ...updated[index], taxRate: e.target.value };
                                      setBillItems(updated);
                                    }}
                                    className="flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    title="Back to presets"
                                    onClick={() => {
                                      const updated = [...billItems];
                                      updated[index] = { ...updated[index], taxRate: "" };
                                      setBillItems(updated);
                                      setCustomTaxBillItems((prev) => { const next = new Set(prev); next.delete(index); return next; });
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Select
                                  value={item.taxRate}
                                  onValueChange={(value) => {
                                    if (value === "__custom__") {
                                      setCustomTaxBillItems((prev) => new Set(prev).add(index));
                                    } else {
                                      const updated = [...billItems];
                                      updated[index] = { ...updated[index], taxRate: value };
                                      setBillItems(updated);
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`${taxLabel} %`} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover z-50">
                                    {options.map((opt) => (
                                      <SelectItem key={opt} value={String(opt)}>{opt}%</SelectItem>
                                    ))}
                                    <SelectSeparator />
                                    <SelectItem value="__custom__">Custom...</SelectItem>
                                  </SelectContent>
                                </Select>
                              );
                            })()}
                            <FloatingLabelInput
                              label="Item Price"
                              type="number"
                              step="0.01"
                              value={item.itemPrice}
                              onChange={(e) => {
                                const updated = [...billItems];
                                updated[index] = { ...updated[index], itemPrice: e.target.value };
                                setBillItems(updated);
                              }}
                              className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={() => setBillItems([...billItems, createEmptyBillItem()])} className="w-full">
                        <Plus className="w-4 h-4 mr-2" /> Add Another Item
                      </Button>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setDialogMode("default");
                          setBillCommon({ merchant: "", billDate: new Date().toISOString().split("T")[0], totalAmount: "", category: "", paymentMethod: "" });
                          setBillItems([createEmptyBillItem()]);
                        }}
                      >
                        ← Back
                      </Button>
                      <Button type="submit" className="flex-1">
                        <Plus className="w-4 h-4 mr-2" /> Add {billItems.length > 1 ? `${billItems.length} Expenses` : "Expense"}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </DialogContent>
          </Dialog>



        </div>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input
                  value={editingExpense.title}
                  onChange={(e) => setEditingExpense({ ...editingExpense, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    step="1"
                    min="1"
                    value={editingExpense.quantity}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, quantity: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price ({countryCurrency[orgCountry || ""] || "USD"}) *</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-9"
                      value={editingExpense.unitPrice}
                      onChange={(e) =>
                        setEditingExpense({ ...editingExpense, unitPrice: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tax Type</Label>
                  <Input
                    value={editingExpense.taxType}
                    onChange={(e) => setEditingExpense({ ...editingExpense, taxType: e.target.value })}
                    placeholder="e.g., VAT, GST"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax %</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editingExpense.taxPercentage}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, taxPercentage: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={editingExpense.category}
                  onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Expense List */}
      <Card>
        <CardHeader className="pb-3">
        </CardHeader>
        <CardContent>
          {isLoadingExpenses ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading expenses...</p>
            </div>
          ) : apiExpenses.length > 0 ? (
            <>
              {/* Summary Insight Cards */}
              {!selectedReceipt && (
                <div className="rounded-lg border border-border bg-muted/20 p-4 mb-6 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Left: Stats */}
                    <div className="flex items-start gap-6 flex-wrap text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {summaryStats.totalSpend.toLocaleString(undefined, { style: "currency", currency: countryCurrency[orgCountry || ""] || "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-muted-foreground">Total Expenses</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">
                            {summaryStats.totalTax.toLocaleString(undefined, { style: "currency", currency: countryCurrency[orgCountry || ""] || "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-muted-foreground">{orgCountry === "India" ? "GST" : "Tax"} Claimable</span>
                        </div>
                      </div>
                      <span className="text-border hidden sm:inline mt-1">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground">{summaryStats.receiptCount}</span>
                        <span className="text-muted-foreground">Receipt{summaryStats.receiptCount !== 1 ? "s" : ""}</span>
                      </div>
                      {summaryStats.topCategory && (
                        <>
                          <span className="text-border hidden sm:inline">|</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Top Category:</span>
                            <span className="font-semibold text-foreground">{summaryStats.topCategory.name}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right: Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Select value={timeRangePreset} onValueChange={(v) => handleTimeRangeChange(v as TimeRangePreset)}>
                        <SelectTrigger className="h-8 text-xs w-auto gap-1.5">
                          <CalendarIcon className="w-3 h-3" />
                          <SelectValue placeholder="All Time" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="this_week">This Week</SelectItem>
                          <SelectItem value="this_month">This Month</SelectItem>
                          <SelectItem value="this_quarter">This Quarter</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                      {timeRangePreset === "custom" && (
                        <Popover
                          open={isCustomDatePopoverOpen}
                          onOpenChange={(open) => {
                            setIsCustomDatePopoverOpen(open);
                            if (open) setTempCustomDateRange(customDateRange);
                          }}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn("h-8 text-xs gap-1.5", !customDateRange && "text-muted-foreground")}
                            >
                              <CalendarIcon className="w-3 h-3" />
                              {customDateRange?.from ? (
                                customDateRange.to ? (
                                  <>{format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d")}</>
                                ) : (
                                  format(customDateRange.from, "MMM d, y")
                                )
                              ) : (
                                <span>Pick dates</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <div className="flex flex-col">
                              <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={tempCustomDateRange?.from}
                                selected={tempCustomDateRange}
                                onSelect={setTempCustomDateRange}
                                numberOfMonths={2}
                                className="pointer-events-auto"
                              />
                              <div className="p-2 border-t border-border flex justify-end">
                                <Button size="sm" className="h-7 px-3 text-xs" onClick={handleApplyCustomDateRange} disabled={!tempCustomDateRange?.from}>
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                            <Filter className="w-3 h-3" />
                            Filters
                            {activeFilterCount > 0 && (
                              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {activeFilterCount}
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4" align="end">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">Filters</h4>
                              {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setIsFilterPopoverOpen(false); }} className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                                  Clear all
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Categories</Label>
                              <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => (
                                  <Button key={cat} variant="ghost" size="sm" className={cn("h-7 px-2.5 text-xs", categoryFilter.includes(cat) ? "bg-primary/15 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground")} onClick={() => toggleCategoryFilter(cat)}>
                                    {cat}
                                  </Button>
                                ))}
                              </div>
                              {categoryFilter.length > 0 && (
                                <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-muted-foreground" onClick={() => setCategoryFilter([])}>Clear categories</Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs text-muted-foreground">Total Price Range</Label>
                              <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                  <Input type="number" placeholder="Min" value={totalPriceMin} onChange={(e) => setTotalPriceMin(e.target.value)} className="h-8 pl-6 text-xs" />
                                </div>
                                <span className="text-xs text-muted-foreground">to</span>
                                <div className="relative flex-1">
                                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                  <Input type="number" placeholder="Max" value={totalPriceMax} onChange={(e) => setTotalPriceMax(e.target.value)} className="h-8 pl-6 text-xs" />
                                </div>
                              </div>
                            </div>
                            <Button size="sm" className="w-full h-8 text-xs" onClick={() => setIsFilterPopoverOpen(false)}>Apply Filters</Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      {hasActiveFilters && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">
                          Clear all
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {selectedReceipt ? (
              /* Item Detail View */
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)} className="gap-1">
                    ← Back to Receipts
                  </Button>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{selectedReceipt.merchant}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>Date: {format(new Date(selectedReceipt.expenseDate), "MMM d, yyyy")}</span>
                    <span>Total: {parseFloat(selectedReceipt.totalAmount).toLocaleString(undefined, { style: "currency", currency: countryCurrency[orgCountry || ""] || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span>Category: {selectedReceipt.category || "—"}</span>
                    <span>Payment: {selectedReceipt.paymentMethod || "—"}</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Unit Type</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Tax Rate</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedReceipt.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.itemName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell>{item.unitType}</TableCell>
                        <TableCell className="text-right">{parseFloat(item.unitPrice).toLocaleString(undefined, { style: "currency", currency: countryCurrency[orgCountry || ""] || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">{parseFloat(item.taxRate) > 0 ? `${item.taxRate}%` : "—"}</TableCell>
                        <TableCell className="text-right font-medium">{parseFloat(item.totalPrice).toLocaleString(undefined, { style: "currency", currency: countryCurrency[orgCountry || ""] || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Receipt List View */
              <div className="space-y-2">
                {/* Column Header */}
                <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground font-medium">
                  <span>Receipt</span>
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                    onClick={() => handleSort("totalPrice")}
                  >
                    Amount {getSortIcon("totalPrice")}
                  </button>
                </div>
                {filteredApiExpenses.length > 0 ? (
                  filteredApiExpenses.map((receipt) => (
                    <div
                      key={receipt.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedReceipt(receipt)}
                    >
                      <div className="space-y-0.5">
                        <p className="font-medium text-foreground">{receipt.merchant}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(receipt.expenseDate), "MMM d, yyyy")} · {(receipt.items || []).length} item{(receipt.items || []).length !== 1 ? "s" : ""} · {receipt.category || "Uncategorized"}
                        </p>
                      </div>
                      <p className="text-base font-semibold text-foreground">
                        {parseFloat(receipt.totalAmount).toLocaleString(undefined, { style: "currency", currency: countryCurrency[orgCountry || ""] || "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">No receipts match the current filters</p>
                    <Button variant="link" onClick={clearFilters} className="mt-2">Clear all filters</Button>
                  </div>
                )}
              </div>
            )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <IndianRupee className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No expenses added yet</p>
              <p className="text-muted-foreground text-sm">Add your first expense using the options above</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
