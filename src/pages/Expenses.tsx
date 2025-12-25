import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PenLine, Upload, Plus, IndianRupee, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Expense = {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

type ExpenseItem = {
  title: string;
  description: string;
  amount: string;
  category: string;
  date: string;
};

const categories = ["Food & Dining", "Transportation", "Utilities", "Office Supplies", "Travel", "Entertainment", "Other"];

const createEmptyItem = (): ExpenseItem => ({
  title: "",
  description: "",
  amount: "",
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

  const hasExpenses = expenses.length > 0;

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
    const incompleteItems = expenseItems.map((item, index) => {
      const missingFields: string[] = [];
      if (!item.title.trim()) missingFields.push("title");
      if (!item.amount.trim()) missingFields.push("amount");
      if (!item.category) missingFields.push("category");
      return { index: index + 1, missingFields };
    }).filter(item => item.missingFields.length > 0);

    if (incompleteItems.length > 0) {
      const errorMessage = incompleteItems
        .map(item => `Item ${item.index}: missing ${item.missingFields.join(", ")}`)
        .join("; ");
      toast({ title: "Error", description: `Please fill all required fields. ${errorMessage}`, variant: "destructive" });
      return;
    }

    const newExpenses: Expense[] = expenseItems.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      title: item.title,
      description: item.description,
      amount: parseFloat(item.amount),
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

    setExpenses(expenses.map(exp => 
      exp.id === editingExpense.id ? editingExpense : exp
    ));
    setIsEditDialogOpen(false);
    setEditingExpense(null);
    toast({ title: "Success", description: "Expense updated successfully" });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    toast({ title: "Deleted", description: "Expense removed successfully" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({ title: "Processing", description: "OCR feature coming soon. File received: " + file.name });
      setIsOCRDialogOpen(false);
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
              <CardContent className={`flex flex-col items-center justify-center text-center ${hasExpenses ? "p-4" : "p-8"}`}>
                <div className={`rounded-full bg-primary/10 flex items-center justify-center mb-3 ${hasExpenses ? "w-10 h-10" : "w-16 h-16"}`}>
                  <PenLine className={`text-primary ${hasExpenses ? "w-5 h-5" : "w-8 h-8"}`} />
                </div>
                <h3 className={`font-semibold text-foreground ${hasExpenses ? "text-sm" : "text-lg"}`}>Manual Entry</h3>
                {!hasExpenses && (
                  <p className="text-muted-foreground text-sm mt-1">Fill in expense details manually</p>
                )}
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
                    <div className="grid grid-cols-3 gap-3">
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Amount *"
                          className="pl-9"
                          value={item.amount}
                          onChange={(e) => updateItem(index, "amount", e.target.value)}
                        />
                      </div>
                      <Select value={item.category} onValueChange={(value) => updateItem(index, "category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Category *" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                  <Plus className="w-4 h-4 mr-2" /> Add {expenseItems.length > 1 ? `${expenseItems.length} Expenses` : "Expense"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* OCR Upload Option */}
        <Dialog open={isOCRDialogOpen} onOpenChange={setIsOCRDialogOpen}>
          <DialogTrigger asChild>
            <Card className={`cursor-pointer hover:border-primary transition-colors group ${hasExpenses ? "" : "p-6"}`}>
              <CardContent className={`flex flex-col items-center justify-center text-center ${hasExpenses ? "p-4" : "p-8"}`}>
                <div className={`rounded-full bg-accent/10 flex items-center justify-center mb-3 ${hasExpenses ? "w-10 h-10" : "w-16 h-16"}`}>
                  <Upload className={`text-accent-foreground ${hasExpenses ? "w-5 h-5" : "w-8 h-8"}`} />
                </div>
                <h3 className={`font-semibold text-foreground ${hasExpenses ? "text-sm" : "text-lg"}`}>Upload Bill</h3>
                {!hasExpenses && (
                  <p className="text-muted-foreground text-sm mt-1">Scan bill with OCR for auto-fill</p>
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
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="bill-upload"
                />
                <label htmlFor="bill-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-foreground font-medium">Drop your bill here or click to upload</p>
                  <p className="text-muted-foreground text-sm mt-1">Supports JPG, PNG, PDF</p>
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
              <div className="space-y-2">
                <Label>Amount (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-9"
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={editingExpense.category} onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
                <Button type="submit" className="flex-1">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent>
          {hasExpenses ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell className="text-muted-foreground">{expense.description || "-"}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditExpense(expense)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteExpense(expense.id)}>
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
