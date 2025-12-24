import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Invoices = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Invoices</h1>
        <p className="text-muted-foreground mt-1">Create and manage your invoices.</p>
      </div>

      <Card className="h-96">
        <CardHeader>
          <CardTitle>Invoice List</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-muted-foreground">Invoices content placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;
