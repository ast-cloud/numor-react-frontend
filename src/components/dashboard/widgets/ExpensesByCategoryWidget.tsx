import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Office Supplies", value: 2400, color: "hsl(var(--chart-1))" },
  { name: "Travel", value: 4567, color: "hsl(var(--chart-2))" },
  { name: "Marketing", value: 1398, color: "hsl(var(--chart-3))" },
  { name: "Utilities", value: 980, color: "hsl(var(--chart-4))" },
  { name: "Software", value: 1890, color: "hsl(var(--chart-5))" },
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
      <CardHeader>
        <CardTitle className="text-base">Expenses by Category</CardTitle>
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
