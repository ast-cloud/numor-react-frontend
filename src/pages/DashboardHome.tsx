import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, FileText, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

const stats = [
  { title: "Total Revenue", value: "$45,231", change: "+20.1%", trend: "up", icon: DollarSign },
  { title: "Expenses", value: "$12,234", change: "+4.5%", trend: "up", icon: TrendingDown },
  { title: "Net Income", value: "$32,997", change: "+15.2%", trend: "up", icon: TrendingUp },
  { title: "Pending Invoices", value: "12", change: "-2", trend: "down", icon: FileText },
];

const DashboardHome = () => {
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>("this_month");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [isCustomDatePopoverOpen, setIsCustomDatePopoverOpen] = useState(false);

  const handleTimeRangeChange = (value: TimeRangePreset) => {
    setTimeRangePreset(value);
    if (value === "custom") {
      setTimeout(() => {
        setIsCustomDatePopoverOpen(true);
      }, 100);
    } else {
      setCustomDateRange(undefined);
    }
  };

  const handleApplyDateRange = () => {
    setCustomDateRange(tempDateRange);
    setIsCustomDatePopoverOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsCustomDatePopoverOpen(open);
    if (open) {
      setTempDateRange(customDateRange);
    }
  };

  const clearDateFilter = () => {
    setTimeRangePreset("this_month");
    setCustomDateRange(undefined);
  };

  const getTimeRangeLabel = () => {
    switch (timeRangePreset) {
      case "today":
        return "Today";
      case "this_week":
        return "This Week";
      case "this_month":
        return "This Month";
      case "this_quarter":
        return "This Quarter";
      case "custom":
        if (customDateRange?.from) {
          return customDateRange.to
            ? `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d")}`
            : format(customDateRange.from, "MMM d, yyyy");
        }
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRangePreset} onValueChange={(value: TimeRangePreset) => handleTimeRangeChange(value)}>
            <SelectTrigger className="w-auto min-w-[100px] h-8 text-sm">
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder="This Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_quarter">This Quarter</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {timeRangePreset === "custom" && (
            <Popover open={isCustomDatePopoverOpen} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-sm justify-start text-left font-normal">
                  <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                  {customDateRange?.from ? (
                    customDateRange.to ? (
                      <>
                        {format(customDateRange.from, "dd/MM/yy")} - {format(customDateRange.to, "dd/MM/yy")}
                      </>
                    ) : (
                      format(customDateRange.from, "dd/MM/yy")
                    )
                  ) : (
                    "Pick range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  numberOfMonths={2}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                <div className="flex justify-end p-3 pt-0 border-t border-border">
                  <Button size="sm" onClick={handleApplyDateRange} disabled={!tempDateRange?.from}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {timeRangePreset !== "this_month" && (
            <Button variant="ghost" size="icon" onClick={clearDateFilter} className="h-8 w-8">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
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
