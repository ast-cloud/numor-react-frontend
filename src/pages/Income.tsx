import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Income = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Income</h1>
        <p className="text-muted-foreground mt-1">Track and manage your income.</p>
      </div>

      <Card className="h-96">
        <CardHeader>
          <CardTitle>Income List</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-muted-foreground">Income content placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Income;
