import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PenLine,
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

const OCR_API_URL = "https://dda4eae2447e.ngrok-free.app/api/expenses/ocr/uploadExpenseForAI";

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
  description: string;
  quantity: string;
  unitPrice: string;
  taxType: string;
  taxPercentage: string;
  category: string;
  date: string;
};

const categories = [
  "Food & Dining",
  "Transportation",
  "Utilities",
  "Office Supplies",
  "Travel",
  "Entertainment",
  "Other",
];

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

const createEmptyItem = (orgCountry?: string): ExpenseItem => {
  const defaults = orgCountry ? countryTaxDefaults[orgCountry] : undefined;
  return {
    title: "",
    description: "",
    quantity: "",
    unitPrice: "",
    taxType: defaults?.taxType || "",
    taxPercentage: defaults?.taxPercent || "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  };
};

const Expenses = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([createEmptyItem()]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [customTaxItems, setCustomTaxItems] = useState<Set<number>>(new Set());
  const [orgCountry, setOrgCountry] = useState<string | undefined>(undefined);

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

  const hasExpenses = expenses.length > 0;

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    // Apply category filter
    if (categoryFilter.length > 0) {
      result = result.filter((exp) => categoryFilter.includes(exp.category));
    }

    // Apply time range filter
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter((exp) => {
        const expenseDate = new Date(exp.date);
        return isWithinInterval(expenseDate, { start: dateRange.start, end: dateRange.end });
      });
    }

    // Apply unit price filter
    if (unitPriceMin) {
      const min = parseFloat(unitPriceMin);
      if (!isNaN(min)) {
        result = result.filter((exp) => exp.unitPrice >= min);
      }
    }
    if (unitPriceMax) {
      const max = parseFloat(unitPriceMax);
      if (!isNaN(max)) {
        result = result.filter((exp) => exp.unitPrice <= max);
      }
    }

    // Apply total price filter
    if (totalPriceMin) {
      const min = parseFloat(totalPriceMin);
      if (!isNaN(min)) {
        result = result.filter((exp) => exp.quantity * exp.unitPrice >= min);
      }
    }
    if (totalPriceMax) {
      const max = parseFloat(totalPriceMax);
      if (!isNaN(max)) {
        result = result.filter((exp) => exp.quantity * exp.unitPrice <= max);
      }
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "totalPrice":
          comparison = a.quantity * a.unitPrice - b.quantity * b.unitPrice;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [
    expenses,
    categoryFilter,
    timeRangePreset,
    customDateRange,
    unitPriceMin,
    unitPriceMax,
    totalPriceMin,
    totalPriceMax,
    sortField,
    sortOrder,
  ]);

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

  // Calculate summary stats for filtered expenses
  const summaryStats = useMemo(() => {
    if (filteredAndSortedExpenses.length === 0) {
      return {
        totalSpend: 0,
        transactionCount: 0,
        averageSpend: 0,
        topCategory: null,
        highestExpense: { amount: 0, title: "" },
        totalTax: 0,
        taxByType: {} as Record<string, number>,
      };
    }

    const totalSpend = filteredAndSortedExpenses.reduce((sum, exp) => sum + exp.quantity * exp.unitPrice, 0);
    const transactionCount = filteredAndSortedExpenses.length;
    const averageSpend = totalSpend / transactionCount;

    // Find top category by spend
    const categorySpend: Record<string, number> = {};
    filteredAndSortedExpenses.forEach((exp) => {
      const amount = exp.quantity * exp.unitPrice;
      categorySpend[exp.category] = (categorySpend[exp.category] || 0) + amount;
    });
    const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0];

    // Find highest single expense
    const highestExpense = filteredAndSortedExpenses.reduce(
      (max, exp) => {
        const amount = exp.quantity * exp.unitPrice;
        return amount > max.amount ? { amount, title: exp.title } : max;
      },
      { amount: 0, title: "" },
    );

    // Calculate tax summary
    let totalTax = 0;
    const taxByType: Record<string, number> = {};
    filteredAndSortedExpenses.forEach((exp) => {
      if (exp.taxPercentage > 0) {
        const baseAmount = exp.quantity * exp.unitPrice;
        const taxAmount = baseAmount * (exp.taxPercentage / 100);
        totalTax += taxAmount;
        const taxType = exp.taxType || "Other";
        taxByType[taxType] = (taxByType[taxType] || 0) + taxAmount;
      }
    });

    return {
      totalSpend,
      transactionCount,
      averageSpend,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      highestExpense,
      totalTax,
      taxByType,
    };
  }, [filteredAndSortedExpenses]);

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

  const handleManualSubmit = (e: React.FormEvent) => {
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

    const newExpenses: Expense[] = expenseItems.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      title: item.title,
      description: item.description,
      quantity: parseFloat(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      taxType: item.taxType,
      taxPercentage: parseFloat(item.taxPercentage) || 0,
      category: item.category,
      date: item.date,
    }));

    setExpenses([...newExpenses, ...expenses]);
    setExpenseItems([createEmptyItem(orgCountry)]);
    setCustomTaxItems(new Set());
    setIsManualDialogOpen(false);
    toast({ title: "Success", description: `${newExpenses.length} expense(s) added successfully` });
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
    setIsOCRDialogOpen(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(OCR_API_URL, {
        method: "POST",
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

        // Parse date from the response (format: "MM/DD/YYYY")
        let expenseDate = new Date().toISOString().split("T")[0];
        if (parsedData.expenseDate) {
          const dateParts = parsedData.expenseDate.split("/");
          if (dateParts.length === 3) {
            const [day, month, year] = dateParts;
            expenseDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
        }

        // Map OCR items to form items
        const prefillItems: ExpenseItem[] = items.map((item: any) => ({
          title: item.name || "",
          description: parsedData.merchant ? `From: ${parsedData.merchant}` : "",
          quantity: String(item.quantity || 1),
          unitPrice: String(item.unit_price_before_tax || 0),
          taxType: String(item.tax_type || ""),
          taxPercentage: String(item.tax_percentage || ""),
          category: parsedData.category && categories.includes(parsedData.category) ? parsedData.category : "",
          date: expenseDate,
        }));

        setExpenseItems(prefillItems);
        setIsManualDialogOpen(true);
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

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Dialog open={isManualDialogOpen} onOpenChange={(open) => {
              setIsManualDialogOpen(open);
              if (!open) {
                setExpenseItems([createEmptyItem(orgCountry)]);
                setCustomTaxItems(new Set());
              }
            }}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <PenLine className="w-4 h-4" />
                <span className="hidden sm:inline">Manual Entry</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expenses</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-3">
                  <Label>Expense Items</Label>
                  {expenseItems.map((item, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg bg-muted/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeItem(index)}
                          disabled={expenseItems.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Title *"
                          value={item.title}
                          onChange={(e) => updateItem(index, "title", e.target.value)}
                        />
                        <Input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItem(index, "date", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-5 gap-3">
                        <Input
                          type="number"
                          step="1"
                          min="1"
                          placeholder="Quantity *"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        />
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Unit Price *"
                            className="pl-9"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                          />
                        </div>
                        <Select value={item.taxType} onValueChange={(value) => updateItem(index, "taxType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tax Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="GST">GST</SelectItem>
                            <SelectItem value="VAT">VAT</SelectItem>
                            <SelectItem value="Sales Tax">Sales Tax</SelectItem>
                            <SelectItem value="None">None</SelectItem>
                          </SelectContent>
                        </Select>
                        {(() => {
                          const options = getTaxPercentOptions(orgCountry);
                          const isCustom = customTaxItems.has(index) || (item.taxPercentage !== "" && !options.map(String).includes(item.taxPercentage));
                          return isCustom ? (
                            <div className="flex gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                placeholder="Tax %"
                                value={item.taxPercentage}
                                onChange={(e) => updateItem(index, "taxPercentage", e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 shrink-0"
                                title="Back to presets"
                                onClick={() => {
                                  updateItem(index, "taxPercentage", "");
                                  setCustomTaxItems((prev) => { const next = new Set(prev); next.delete(index); return next; });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value={item.taxPercentage}
                              onValueChange={(value) => {
                                if (value === "__custom__") {
                                  setCustomTaxItems((prev) => new Set(prev).add(index));
                                } else {
                                  updateItem(index, "taxPercentage", value);
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
                          );
                        })()}
                        <Select value={item.category} onValueChange={(value) => updateItem(index, "category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Category *" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Another Item
                  </Button>
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
                    <Plus className="w-4 h-4 mr-2" /> Add{" "}
                    {expenseItems.length > 1 ? `${expenseItems.length} Expenses` : "Expense"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2" disabled={isUploading}>
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">{isUploading ? "Processing..." : "Upload Bill"}</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Bill for OCR</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="bill-upload"
                  />
                  <label htmlFor="bill-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-foreground font-medium">Drop your bill here or click to upload</p>
                    <p className="text-muted-foreground text-sm mt-1">Supports JPG, PNG and other image formats</p>
                  </label>
                </div>
                <Button variant="outline" className="w-full" onClick={() => setIsOCRDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
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
                  <Label>Unit Price (₹) *</Label>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {hasExpenses && (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* Date Filter - Separate */}
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
                      if (open) {
                        setTempCustomDateRange(customDateRange);
                      }
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
                            <>
                              {format(customDateRange.from, "MMM d")} - {format(customDateRange.to, "MMM d")}
                            </>
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
                          <Button
                            size="sm"
                            className="h-7 px-3 text-xs"
                            onClick={handleApplyCustomDateRange}
                            disabled={!tempCustomDateRange?.from}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Generic Filters */}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              clearFilters();
                              setIsFilterPopoverOpen(false);
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            Clear all
                          </Button>
                        )}
                      </div>

                      {/* Category Filter */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Categories</Label>
                        <div className="flex flex-wrap gap-1.5">
                          {categories.map((cat) => (
                            <Button
                              key={cat}
                              variant="ghost"
                              size="sm"
                              className={cn(
                                "h-7 px-2.5 text-xs",
                                categoryFilter.includes(cat)
                                  ? "bg-primary/15 text-primary hover:bg-primary/20"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                              onClick={() => toggleCategoryFilter(cat)}
                            >
                              {cat}
                            </Button>
                          ))}
                        </div>
                        {categoryFilter.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2 text-muted-foreground"
                            onClick={() => setCategoryFilter([])}
                          >
                            Clear categories
                          </Button>
                        )}
                      </div>

                      {/* Unit Price Range */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Unit Price Range</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Min"
                              value={unitPriceMin}
                              onChange={(e) => setUnitPriceMin(e.target.value)}
                              className="h-8 pl-6 text-xs"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">to</span>
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={unitPriceMax}
                              onChange={(e) => setUnitPriceMax(e.target.value)}
                              className="h-8 pl-6 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Total Price Range */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Total Price Range</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Min"
                              value={totalPriceMin}
                              onChange={(e) => setTotalPriceMin(e.target.value)}
                              className="h-8 pl-6 text-xs"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">to</span>
                          <div className="relative flex-1">
                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="Max"
                              value={totalPriceMax}
                              onChange={(e) => setTotalPriceMax(e.target.value)}
                              className="h-8 pl-6 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <Button size="sm" className="w-full h-8 text-xs" onClick={() => setIsFilterPopoverOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasExpenses ? (
            <>
              {/* Summary Strip - Always visible when there are expenses */}
              <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2">
                  <span className="font-medium">{getTimeRangeLabel()} Summary</span>
                  <span>
                    {summaryStats.transactionCount} transaction{summaryStats.transactionCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Spend</p>
                    <p className="text-base font-semibold text-foreground flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {summaryStats.totalSpend.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total Tax</p>
                    <p className="text-base font-semibold text-foreground flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {summaryStats.totalTax.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Tax Breakdown</p>
                    <div className="text-xs font-medium text-foreground">
                      {Object.keys(summaryStats.taxByType).length > 0 ? (
                        Object.entries(summaryStats.taxByType).map(([type, amount]) => (
                          <span key={type} className="flex items-center gap-1">
                            {type}: <IndianRupee className="w-2.5 h-2.5" />
                            {amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg / Transaction</p>
                    <p className="text-base font-semibold text-foreground flex items-center">
                      {summaryStats.transactionCount > 0 ? (
                        <>
                          <IndianRupee className="w-3.5 h-3.5" />
                          {summaryStats.averageSpend.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Top Category</p>
                    <p className="text-sm font-medium text-foreground truncate" title={summaryStats.topCategory?.name}>
                      {summaryStats.topCategory?.name || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Highest Expense</p>
                    <p
                      className="text-sm font-medium text-foreground truncate"
                      title={summaryStats.highestExpense.title}
                    >
                      {summaryStats.highestExpense.title || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Applied Filters Row */}
              {hasActiveFilters && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Applied filters:</span>
                  {categoryFilter.map((cat) => (
                    <Button
                      key={cat}
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs bg-muted/50 gap-1.5"
                      onClick={() => toggleCategoryFilter(cat)}
                    >
                      {cat}
                      <X className="h-3 w-3" />
                    </Button>
                  ))}
                  {timeRangePreset !== "all" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs bg-muted/50 gap-1.5"
                      onClick={() => {
                        setTimeRangePreset("all");
                        setCustomDateRange(undefined);
                      }}
                    >
                      Time period: {getTimeRangeLabel()}
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {(unitPriceMin || unitPriceMax) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs bg-muted/50 gap-1.5"
                      onClick={() => {
                        setUnitPriceMin("");
                        setUnitPriceMax("");
                      }}
                    >
                      Unit price: ₹{unitPriceMin || "0"} - ₹{unitPriceMax || "∞"}
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  {(totalPriceMin || totalPriceMax) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2.5 text-xs bg-muted/50 gap-1.5"
                      onClick={() => {
                        setTotalPriceMin("");
                        setTotalPriceMax("");
                      }}
                    >
                      Total price: ₹{totalPriceMin || "0"} - ₹{totalPriceMax || "∞"}
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort("date")}
                      >
                        Date {getSortIcon("date")}
                      </Button>
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort("category")}
                      >
                        Category {getSortIcon("category")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead>Tax Type</TableHead>
                    <TableHead className="text-right">Tax %</TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium hover:bg-transparent ml-auto"
                        onClick={() => handleSort("totalPrice")}
                      >
                        Total Price {getSortIcon("totalPrice")}
                      </Button>
                    </TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedExpenses.length > 0 ? (
                    filteredAndSortedExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{expense.title}</TableCell>
                        <TableCell className="text-muted-foreground">{expense.description || "-"}</TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right">{expense.quantity}</TableCell>
                        <TableCell className="text-right">₹{expense.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>{expense.taxType || "-"}</TableCell>
                        <TableCell className="text-right">
                          {expense.taxPercentage != null && expense.taxPercentage !== 0
                            ? `${expense.taxPercentage}%`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{(expense.quantity * expense.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-muted-foreground">No expenses match the current filters</p>
                          <Button variant="link" onClick={clearFilters} className="mt-2">
                            Clear all filters
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
