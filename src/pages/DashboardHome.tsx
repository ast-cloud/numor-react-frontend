import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrendingUp, TrendingDown, DollarSign, FileText, CalendarIcon, X, Pencil, Plus, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData, formatCurrency } from "@/hooks/use-dashboard-data";
import {
  ExpensesByCategoryWidget,
  RevenueOverTimeWidget,
  IncomeVsExpensesWidget,
  CashFlowWidget,
  TopClientsWidget,
  PaymentStatusWidget,
  ExpensesOverTimeWidget,
  availableWidgets,
  WidgetType,
  TimeRangeConfig,
} from "@/components/dashboard/widgets";
import {
  filterExpenses,
  filterInvoices,
  computeStats,
  processRevenueOverTime,
  processExpensesOverTime,
  processExpensesByCategory,
  processIncomeVsExpenses,
  processCashFlow,
  processTopClients,
  processPaymentStatus,
} from "@/components/dashboard/widgets/widgetDataProcessors";

type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

const DashboardHome = () => {
  const [timeRangePreset, setTimeRangePreset] = useState<TimeRangePreset>("this_month");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [isCustomDatePopoverOpen, setIsCustomDatePopoverOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<WidgetType[]>([
    "revenue-over-time",
    "expenses-by-category",
  ]);

  const { expenses, invoices, clients, country, isLoading, isError } = useDashboardData();

  const timeRangeConfig: TimeRangeConfig = {
    preset: timeRangePreset,
    customRange: customDateRange,
  };

  const filteredExpenses = useMemo(() => filterExpenses(expenses, timeRangeConfig), [expenses, timeRangePreset, customDateRange]);
  const filteredInvoices = useMemo(() => filterInvoices(invoices, timeRangeConfig), [invoices, timeRangePreset, customDateRange]);

  const stats = useMemo(
    () => computeStats(filteredExpenses, filteredInvoices, expenses, invoices, timeRangeConfig),
    [filteredExpenses, filteredInvoices, expenses, invoices, timeRangePreset, customDateRange]
  );

  const widgetData = useMemo(() => ({
    revenueOverTime: processRevenueOverTime(filteredInvoices, timeRangeConfig),
    expensesOverTime: processExpensesOverTime(filteredExpenses, timeRangeConfig),
    expensesByCategory: processExpensesByCategory(filteredExpenses),
    incomeVsExpenses: processIncomeVsExpenses(filteredInvoices, filteredExpenses, timeRangeConfig),
    cashFlow: processCashFlow(filteredInvoices, filteredExpenses, timeRangeConfig),
    topClients: processTopClients(filteredInvoices, clients),
    paymentStatus: processPaymentStatus(filteredInvoices),
  }), [filteredExpenses, filteredInvoices, clients, timeRangePreset, customDateRange]);

  const handleTimeRangeChange = (value: TimeRangePreset) => {
    setTimeRangePreset(value);
    if (value === "custom") {
      setTimeout(() => setIsCustomDatePopoverOpen(true), 100);
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
    if (open) setTempDateRange(customDateRange);
  };

  const clearDateFilter = () => {
    setTimeRangePreset("this_month");
    setCustomDateRange(undefined);
  };

  const handleAddWidget = (widgetType: WidgetType) => {
    if (!activeWidgets.includes(widgetType)) {
      setActiveWidgets([...activeWidgets, widgetType]);
    }
  };

  const handleRemoveWidget = (widgetType: WidgetType) => {
    setActiveWidgets(activeWidgets.filter((w) => w !== widgetType));
  };

  const formatVal = (amount: number) => formatCurrency(amount, country);

  const changeLabel = (preset: TimeRangePreset) => {
    switch (preset) {
      case "today": return "vs yesterday";
      case "this_week": return "vs last week";
      case "this_month": return "vs last month";
      case "this_quarter": return "vs last quarter";
      default: return "";
    }
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: formatVal(stats.totalRevenue),
      change: stats.revenueChange !== null ? `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange.toFixed(1)}%` : null,
      trend: (stats.revenueChange ?? 0) >= 0 ? "up" : "down",
      icon: DollarSign,
    },
    {
      title: "Expenses",
      value: formatVal(stats.totalExpenses),
      change: stats.expensesChange !== null ? `${stats.expensesChange >= 0 ? "+" : ""}${stats.expensesChange.toFixed(1)}%` : null,
      trend: (stats.expensesChange ?? 0) >= 0 ? "up" : "down",
      icon: TrendingDown,
    },
    {
      title: "Net Income",
      value: formatVal(stats.netIncome),
      change: stats.netIncomeChange !== null ? `${stats.netIncomeChange >= 0 ? "+" : ""}${stats.netIncomeChange.toFixed(1)}%` : null,
      trend: (stats.netIncomeChange ?? 0) >= 0 ? "up" : "down",
      icon: TrendingUp,
    },
    {
      title: "Pending Invoices",
      value: String(stats.pendingInvoices),
      change: stats.pendingChange !== null ? `${stats.pendingChange >= 0 ? "+" : ""}${stats.pendingChange}` : null,
      trend: (stats.pendingChange ?? 0) <= 0 ? "up" : "down",
      icon: FileText,
    },
  ];

  const renderWidget = (type: WidgetType) => {
    const baseProps = {
      onRemove: () => handleRemoveWidget(type),
      isEditMode,
      country,
    };

    switch (type) {
      case "expenses-by-category":
        return <ExpensesByCategoryWidget key={type} {...baseProps} data={widgetData.expensesByCategory} />;
      case "revenue-over-time":
        return <RevenueOverTimeWidget key={type} {...baseProps} data={widgetData.revenueOverTime} />;
      case "income-vs-expenses":
        return <IncomeVsExpensesWidget key={type} {...baseProps} data={widgetData.incomeVsExpenses} />;
      case "cash-flow":
        return <CashFlowWidget key={type} {...baseProps} data={widgetData.cashFlow} />;
      case "top-clients":
        return <TopClientsWidget key={type} {...baseProps} data={widgetData.topClients} />;
      case "payment-status":
        return <PaymentStatusWidget key={type} {...baseProps} data={widgetData.paymentStatus} />;
      case "expenses-over-time":
        return <ExpensesOverTimeWidget key={type} {...baseProps} data={widgetData.expensesOverTime} />;
      default:
        return null;
    }
  };

  const availableToAdd = availableWidgets.filter(
    (widget) => !activeWidgets.includes(widget.type)
  );

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
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-7 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  {stat.change && (
                    <p className={`text-xs mt-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {stat.change} {changeLabel(timeRangePreset)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Edit Mode Controls */}
      <div className="flex items-center justify-end gap-2">
        {isEditMode && availableToAdd.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-7 text-xs">
                <Plus className="h-3 w-3" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {availableToAdd.map((widget) => (
                <DropdownMenuItem
                  key={widget.id}
                  onClick={() => handleAddWidget(widget.type)}
                  className="flex flex-col items-start gap-1 py-2"
                >
                  <span className="font-medium">{widget.title}</span>
                  <span className="text-xs text-muted-foreground">{widget.description}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          variant={isEditMode ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsEditMode(!isEditMode)}
          className="gap-1.5 h-7 text-xs"
        >
          {isEditMode ? (
            <>
              <Check className="h-3 w-3" />
              Done
            </>
          ) : (
            <>
              <Pencil className="h-3 w-3" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Customizable Widget Grid */}
      <div className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-6",
        isEditMode && "ring-2 ring-dashed ring-primary/20 p-4 rounded-lg bg-primary/5"
      )}>
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="h-80">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="h-56 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded" />
              </CardContent>
            </Card>
          ))
        ) : activeWidgets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p>No widgets added yet.</p>
            <p className="text-sm">Click "Add Widget" to get started.</p>
          </div>
        ) : (
          activeWidgets.map((widgetType) => renderWidget(widgetType))
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
