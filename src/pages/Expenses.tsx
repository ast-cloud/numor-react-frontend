import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PenLine, Upload, Plus, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
};

const categories = ["Food & Dining", "Transportation", "Utilities", "Office Supplies", "Travel", "Entertainment", "Other"];

const Expenses = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const hasExpenses = expenses.length > 0;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({ description: "", amount: "", category: "", date: new Date().toISOString().split("T")[0] });
    setIsManualDialogOpen(false);
    toast({ title: "Success", description: "Expense added successfully" });
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
      <div className={`grid gap-4 ${hasExpenses ? "grid-cols-2 max-w-md" : "grid-cols-1 md:grid-cols-2 max-w-2xl"}`}>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="e.g., Office supplies"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsManualDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <Plus className="w-4 h-4 mr-2" /> Add Expense
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
