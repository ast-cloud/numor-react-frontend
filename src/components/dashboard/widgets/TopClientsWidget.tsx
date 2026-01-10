import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TimeRangeConfig, getTopClientsData } from "./widgetData";

interface TopClientsWidgetProps {
  onRemove: () => void;
  isEditMode: boolean;
  timeRange: TimeRangeConfig;
}

const TopClientsWidget = ({ onRemove, isEditMode, timeRange }: TopClientsWidgetProps) => {
  const data = getTopClientsData(timeRange);

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
        <CardTitle className="text-base">Top Clients by Revenue</CardTitle>
        <p className="text-xs text-muted-foreground">Your highest-earning client relationships</p>
      </CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <XAxis 
              type="number"
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <YAxis 
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))" 
              fontSize={11}
              width={85}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--popover-foreground))",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
            />
            <Bar 
              dataKey="revenue" 
              fill="#8b5cf6"
              radius={[0, 4, 4, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TopClientsWidget;
