import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/hooks/use-dashboard-data";
import type { PeriodData } from "./widgetDataProcessors";

interface ExpensesOverTimeWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
  data: PeriodData[];
  country: string;
}

const ExpensesOverTimeWidget = ({ onRemove, isEditMode, data, country }: ExpensesOverTimeWidgetProps) => {
  return (
    <Card className="h-80 relative">
      {isEditMode && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10 hover:bg-destructive hover:text-destructive-foreground" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expenses Over Time</CardTitle>
        <p className="text-xs text-muted-foreground">Track your spending trends</p>
      </CardHeader>
      <CardContent className="h-56">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No expense data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCurrency(v, country)} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }}
                formatter={(value: number) => [formatCurrency(value, country), "Expenses"]}
              />
              <Area type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} fill="rgba(248, 113, 113, 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesOverTimeWidget;
