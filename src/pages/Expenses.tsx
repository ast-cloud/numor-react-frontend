import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PenLine, Upload, Plus, IndianRupee, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

type ExpenseItem = {
  description: string;
  amount: string;
  category: string;
};

const categories = ["Food & Dining", "Transportation", "Utilities", "Office Supplies", "Travel", "Entertainment", "Other"];

const emptyItem: ExpenseItem = { description: "", amount: "", category: "" };

const Expenses = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([{ ...emptyItem }]);

  const hasExpenses = expenses.length > 0;

  const updateItem = (index: number, field: keyof ExpenseItem, value: string) => {
    const updated = [...expenseItems];
    updated[index] = { ...updated[index], [field]: value };
    setExpenseItems(updated);
  };

  const addItem = () => {
    setExpenseItems([...expenseItems, { ...emptyItem }]);
  };

  const removeItem = (index: number) => {
    if (expenseItems.length > 1) {
      setExpenseItems(expenseItems.filter((_, i) => i !== index));
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = expenseItems.filter(item => item.description && item.amount && item.category);
    
    if (validItems.length === 0) {
      toast({ title: "Error", description: "Please fill at least one complete expense item", variant: "destructive" });
      return;
    }

    const newExpenses: Expense[] = validItems.map((item, index) => ({
      id: `${Date.now()}-${index}`,
      description: item.description,
      amount: parseFloat(item.amount),
      category: item.category,
      date: expenseDate,
    }));

    setExpenses([...newExpenses, ...expenses]);
    setExpenseItems([{ ...emptyItem }]);
    setExpenseDate(new Date().toISOString().split("T")[0]);
    setIsManualDialogOpen(false);
    toast({ title: "Success", description: `${newExpenses.length} expense(s) added successfully` });
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Expenses</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-3">
                <Label>Expense Items</Label>
                {expenseItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-start p-3 border border-border rounded-lg bg-muted/30">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Description *"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
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
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => removeItem(index)}
                      disabled={expenseItems.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
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
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="text-right">₹{expense.amount.toFixed(2)}</TableCell>
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
