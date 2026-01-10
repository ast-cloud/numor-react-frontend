import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const CHART_COLORS = {
  chart1: "#f87171", // red
  chart2: "#4ade80", // green  
  chart3: "#60a5fa", // blue
  chart4: "#facc15", // yellow
  chart5: "#c084fc", // purple
};

const data = [
  { name: "Office Supplies", value: 2400, color: CHART_COLORS.chart1 },
  { name: "Travel", value: 4567, color: CHART_COLORS.chart2 },
  { name: "Marketing", value: 1398, color: CHART_COLORS.chart3 },
  { name: "Utilities", value: 980, color: CHART_COLORS.chart4 },
  { name: "Software", value: 1890, color: CHART_COLORS.chart5 },
];

interface ExpensesByCategoryWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
}

const ExpensesByCategoryWidget = ({ onRemove, isEditMode }: ExpensesByCategoryWidgetProps) => {
  return (
    <Card className="h-80 relative">
      {isEditMode && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 z-10 hover:bg-destructive hover:text-destructive-foreground"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Expenses by Category</CardTitle>
        <p className="text-xs text-muted-foreground">See where your money is going</p>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`$${value}`, "Amount"]}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px" }}
              formatter={(value, entry: any) => {
                const item = data.find(d => d.name === value);
                return <span style={{ color: item?.color || entry.color }}>{value}</span>;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExpensesByCategoryWidget;
