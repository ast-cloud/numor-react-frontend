import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/hooks/use-dashboard-data";
import type { PeriodData } from "./widgetDataProcessors";

const CHART_COLORS = { income: "#4ade80", expenses: "#f87171" };

interface IncomeVsExpensesWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
  data: PeriodData[];
  country: string;
}

const IncomeVsExpensesWidget = ({ onRemove, isEditMode, data, country }: IncomeVsExpensesWidgetProps) => {
  return (
    <Card className="h-80 relative">
      {isEditMode && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10 hover:bg-destructive hover:text-destructive-foreground" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
        <p className="text-xs text-muted-foreground">Compare earnings and spending</p>
      </CardHeader>
      <CardContent className="h-56">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data for this period</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => formatCurrency(v, country)} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--popover-foreground))" }}
                formatter={(value: number) => [formatCurrency(value, country)]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} formatter={(value) => <span style={{ color: CHART_COLORS[value as keyof typeof CHART_COLORS] }} className="capitalize">{value}</span>} />
              <Bar dataKey="income" fill={CHART_COLORS.income} radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill={CHART_COLORS.expenses} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeVsExpensesWidget;
