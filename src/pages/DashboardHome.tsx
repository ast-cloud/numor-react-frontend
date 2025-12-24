import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, FileText } from "lucide-react";

const stats = [
  { title: "Total Revenue", value: "$45,231", change: "+20.1%", trend: "up", icon: DollarSign },
  { title: "Expenses", value: "$12,234", change: "+4.5%", trend: "up", icon: TrendingDown },
  { title: "Net Income", value: "$32,997", change: "+15.2%", trend: "up", icon: TrendingUp },
  { title: "Pending Invoices", value: "12", change: "-2", trend: "down", icon: FileText },
];

const DashboardHome = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className={`text-xs mt-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-56">
            <p className="text-muted-foreground">Chart placeholder</p>
          </CardContent>
        </Card>

        <Card className="h-80">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-56">
            <p className="text-muted-foreground">Transactions list placeholder</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
