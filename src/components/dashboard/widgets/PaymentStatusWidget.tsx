import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const CHART_COLORS = {
  paid: "#4ade80",    // green
  pending: "#facc15", // yellow
  overdue: "#f87171", // red
  draft: "#c084fc",   // purple
};

const data = [
  { name: "Paid", value: 45, color: CHART_COLORS.paid },
  { name: "Pending", value: 30, color: CHART_COLORS.pending },
  { name: "Overdue", value: 15, color: CHART_COLORS.overdue },
  { name: "Draft", value: 10, color: CHART_COLORS.draft },
];

interface PaymentStatusWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
}

const PaymentStatusWidget = ({ onRemove, isEditMode }: PaymentStatusWidgetProps) => {
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
        <CardTitle className="text-base">Invoice Status</CardTitle>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={false}
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
              formatter={(value: number) => [`${value} invoices`, "Count"]}
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

export default PaymentStatusWidget;
