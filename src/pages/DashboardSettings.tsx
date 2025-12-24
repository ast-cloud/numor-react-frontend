import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardSettings = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
      </div>

      <Card className="h-96">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-muted-foreground">Settings content placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSettings;
