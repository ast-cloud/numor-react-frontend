import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimeRangeConfig, getCashFlowData } from "./widgetData";

interface CashFlowWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
  timeRange: TimeRangeConfig;
}

const CashFlowWidget = ({ onRemove, isEditMode, timeRange }: CashFlowWidgetProps) => {
  const data = getCashFlowData(timeRange);

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
        <CardTitle className="text-base">Cash Flow</CardTitle>
        <p className="text-xs text-muted-foreground">Monitor your net cash movement over time</p>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Cash Flow"]}
            />
            <Area 
              type="monotone" 
              dataKey="cashFlow" 
              stroke="#06b6d4"
              fill="rgba(6, 182, 212, 0.3)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default CashFlowWidget;
