import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OCR_API_URL = "https://0513771666f0.ngrok-free.app/api/expenses/ocr/uploadExpenseForAI";

type SortField = "date" | "totalPrice" | "category";
type SortOrder = "asc" | "desc";

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
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const hasExpenses = expenses.length > 0;

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((exp) => exp.category === categoryFilter);
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
  }, [expenses, categoryFilter, sortField, sortOrder]);

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
            const [month, day, year] = dateParts;
            expenseDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
          }
        }

        // Map OCR items to form items
        const prefillItems: ExpenseItem[] = items.map((item: any) => ({
          title: item.name || "",
          description: "",
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground mt-1">Track and manage your business expenses.</p>
      </div>

      {/* Add Expense Options */}
      <div className={`grid gap-4 ${hasExpenses ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}>
        {/* Manual Entry Option */}
        <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
          <DialogTrigger asChild>
            <Card className={`cursor-pointer hover:border-primary transition-colors group ${hasExpenses ? "" : "p-6"}`}>
              <CardContent
                className={`flex flex-col items-center justify-center text-center ${hasExpenses ? "p-4" : "p-8"}`}
              >
                <div
                  className={`rounded-full bg-primary/10 flex items-center justify-center mb-3 ${hasExpenses ? "w-10 h-10" : "w-16 h-16"}`}
                >
                  <PenLine className={`text-primary ${hasExpenses ? "w-5 h-5" : "w-8 h-8"}`} />
                </div>
                <h3 className={`font-semibold text-foreground ${hasExpenses ? "text-sm" : "text-lg"}`}>Manual Entry</h3>
                {!hasExpenses && <p className="text-muted-foreground text-sm mt-1">Fill in expense details manually</p>}
              </CardContent>
            </Card>
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
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsManualDialogOpen(false)}>
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

        {/* OCR Upload Option */}
        <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
          <DialogTrigger asChild>
            <Card
              className={`cursor-pointer hover:border-primary transition-colors group ${hasExpenses ? "" : "p-6"} ${isUploading ? "pointer-events-none opacity-70" : ""}`}
            >
              <CardContent
                className={`flex flex-col items-center justify-center text-center ${hasExpenses ? "p-4" : "p-8"}`}
              >
                <div
                  className={`rounded-full bg-accent/10 flex items-center justify-center mb-3 ${hasExpenses ? "w-10 h-10" : "w-16 h-16"}`}
                >
                  {isUploading ? (
                    <Loader2 className={`text-accent-foreground animate-spin ${hasExpenses ? "w-5 h-5" : "w-8 h-8"}`} />
                  ) : (
                    <Upload className={`text-accent-foreground ${hasExpenses ? "w-5 h-5" : "w-8 h-8"}`} />
                  )}
                </div>
                <h3 className={`font-semibold text-foreground ${hasExpenses ? "text-sm" : "text-lg"}`}>
                  {isUploading ? "Processing..." : "Upload Bill"}
                </h3>
                {!hasExpenses && (
                  <p className="text-muted-foreground text-sm mt-1">
                    {isUploading ? "Scanning your bill with OCR" : "Scan bill with OCR for auto-fill"}
                  </p>
                )}
              </CardContent>
            </Card>
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

      {/* Edit Expense Dialog */}
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Expense List</CardTitle>
          {hasExpenses && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
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
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {hasExpenses ? (
            <>
              {filteredAndSortedExpenses.length > 0 ? (
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
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">No expenses match the current filter</p>
                  <Button variant="link" onClick={() => setCategoryFilter("all")} className="mt-2">
                    Clear filter
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
