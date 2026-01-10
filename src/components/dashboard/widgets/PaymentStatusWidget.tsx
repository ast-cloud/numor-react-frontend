import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { TimeRangeConfig, getPaymentStatusData } from "./widgetData";

interface PaymentStatusWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
  timeRange: TimeRangeConfig;
}

const PaymentStatusWidget = ({ onRemove, isEditMode, timeRange }: PaymentStatusWidgetProps) => {
  const data = getPaymentStatusData(timeRange);

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
        <CardTitle className="text-base">Invoice Status</CardTitle>
        <p className="text-xs text-muted-foreground">Breakdown of your invoice payment states</p>
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
