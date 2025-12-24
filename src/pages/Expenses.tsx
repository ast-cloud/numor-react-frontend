import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Expenses = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Expenses</h1>
        <p className="text-muted-foreground mt-1">Track and manage your business expenses.</p>
      </div>

      <Card className="h-96">
        <CardHeader>
          <CardTitle>Expense List</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-muted-foreground">Expenses content placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Expenses;
