import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, startOfWeek, startOfMonth, startOfQuarter, endOfDay, isWithinInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

const OCR_API_URL = "https://3fb7db89986e.ngrok-free.app/api/expenses/ocr/uploadExpenseForAI";

type SortField = "date" | "totalPrice" | "category";
type SortOrder = "asc" | "desc";
type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

type Expense = {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
  date: string;
};

type ExpenseItem = {
  title: string;
  description: string;
  quantity: string;
  unitPrice: string;
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

const createEmptyItem = (): ExpenseItem => ({
  title: "",
  description: "",
  quantity: "",
  unitPrice: "",
  category: "",
  date: new Date().toISOString().split("T")[0],
});

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

  // Filtering & Sorting state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

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
    if (categoryFilter !== "all") {
      result = result.filter((exp) => exp.category === categoryFilter);
    }

    // Apply time range filter
    const dateRange = getDateRange();
    if (dateRange) {
      result = result.filter((exp) => {
        const expenseDate = new Date(exp.date);
        return isWithinInterval(expenseDate, { start: dateRange.start, end: dateRange.end });
      });
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
  }, [expenses, categoryFilter, timeRangePreset, customDateRange, sortField, sortOrder]);

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
    if (filteredAndSortedExpenses.length === 0) return null;

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

    return {
      totalSpend,
      transactionCount,
      averageSpend,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      highestExpense,
    };
  }, [filteredAndSortedExpenses]);

  const handleTimeRangeChange = (value: TimeRangePreset) => {
    setTimeRangePreset(value);
    if (value !== "custom") {
      setCustomDateRange(undefined);
    }
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setTimeRangePreset("all");
    setCustomDateRange(undefined);
  };

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
    setExpenseItems([...expenseItems, createEmptyItem()]);
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
      category: item.category,
      date: item.date,
    }));

    setExpenses([...newExpenses, ...expenses]);
    setExpenseItems([createEmptyItem()]);
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
          unitPrice: String(item.unitPrice || 0),
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
          <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
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
                      <div className="grid grid-cols-4 gap-3">
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
                        <Select value={item.category} onValueChange={(value) => updateItem(index, "category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Category *" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Description (optional)"
                          value={item.description}
                          onChange={(e) => updateItem(index, "description", e.target.value)}
                        />
                      </div>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Expense List</CardTitle>
            {hasExpenses && (
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <Filter className="w-3 h-3 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={timeRangePreset} onValueChange={(v) => handleTimeRangeChange(v as TimeRangePreset)}>
                  <SelectTrigger className="h-8 w-[120px] text-xs">
                    <CalendarIcon className="w-3 h-3 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="this_week">This Week</SelectItem>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="this_quarter">This Quarter</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>

                {timeRangePreset === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 w-[160px] justify-start text-left text-xs font-normal",
                          !customDateRange && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3 w-3" />
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
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={customDateRange?.from}
                        selected={customDateRange}
                        onSelect={setCustomDateRange}
                        numberOfMonths={2}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {(categoryFilter !== "all" || timeRangePreset !== "all") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasExpenses ? (
            <>
              {filteredAndSortedExpenses.length > 0 ? (
                <>
                  {/* Summary Strip */}
                  {summaryStats && (
                    <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-2">
                        <span className="font-medium">{getTimeRangeLabel()} Summary</span>
                        <span>
                          {summaryStats.transactionCount} transaction{summaryStats.transactionCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Avg / Transaction</p>
                          <p className="text-base font-semibold text-foreground flex items-center">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {summaryStats.averageSpend.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Top Category</p>
                          <p
                            className="text-sm font-medium text-foreground truncate"
                            title={summaryStats.topCategory?.name}
                          >
                            {summaryStats.topCategory?.name || "—"}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Highest Expense</p>
                          <p
                            className="text-sm font-medium text-foreground truncate"
                            title={summaryStats.highestExpense.title}
                          >
                            {summaryStats.highestExpense.title || "—"}
                          </p>
                        </div>
                      </div>
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
                      {filteredAndSortedExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-medium">{expense.title}</TableCell>
                          <TableCell className="text-muted-foreground">{expense.description || "-"}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell className="text-right">{expense.quantity}</TableCell>
                          <TableCell className="text-right">₹{expense.unitPrice.toFixed(2)}</TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No expenses match the current filters</p>
                  <Button variant="link" onClick={clearFilters} className="mt-2">
                    Clear all filters
                  </Button>
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
