import { DateRange } from "react-day-picker";

export type TimeRangePreset = "all" | "today" | "this_week" | "this_month" | "this_quarter" | "custom";

export interface TimeRangeConfig {
  preset: TimeRangePreset;
  customRange?: DateRange;
}

// Generate data labels based on time range
export const getTimeLabels = (config: TimeRangeConfig): string[] => {
  switch (config.preset) {
    case "today":
      return ["6am", "9am", "12pm", "3pm", "6pm", "9pm"];
    case "this_week":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "this_month":
      return ["Week 1", "Week 2", "Week 3", "Week 4"];
    case "this_quarter":
      return ["Month 1", "Month 2", "Month 3"];
    case "all":
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    case "custom":
      // For custom, we'll show days or weeks depending on range
      return ["Period 1", "Period 2", "Period 3", "Period 4", "Period 5", "Period 6"];
    default:
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  }
};

// Revenue data
export const getRevenueData = (config: TimeRangeConfig) => {
  const labels = getTimeLabels(config);
  const baseValues: Record<TimeRangePreset, number[]> = {
    today: [1200, 2400, 3600, 2800, 4200, 3000],
    this_week: [4500, 5200, 4800, 6100, 7200, 3500, 2800],
    this_month: [12000, 15000, 18000, 14000],
    this_quarter: [45000, 52000, 48000],
    all: [12000, 19000, 15000, 22000, 28000, 25000, 30000, 27000, 32000, 29000, 35000, 38000],
    custom: [8000, 9500, 11000, 10200, 12000, 11500],
  };
  
  return labels.map((label, i) => ({
    period: label,
    revenue: baseValues[config.preset]?.[i] || 10000,
  }));
};

// Expenses data
export const getExpensesData = (config: TimeRangeConfig) => {
  const labels = getTimeLabels(config);
  const baseValues: Record<TimeRangePreset, number[]> = {
    today: [400, 800, 1200, 600, 900, 700],
    this_week: [1500, 1800, 1600, 2100, 2400, 1200, 900],
    this_month: [4500, 5200, 6000, 5300],
    this_quarter: [18000, 21000, 19500],
    all: [8500, 9200, 7800, 11000, 10500, 12234, 11000, 9800, 13000, 11500, 14000, 15000],
    custom: [3200, 3800, 4100, 3900, 4500, 4200],
  };
  
  return labels.map((label, i) => ({
    period: label,
    expenses: baseValues[config.preset]?.[i] || 5000,
  }));
};

// Cash flow data
export const getCashFlowData = (config: TimeRangeConfig) => {
  const labels = getTimeLabels(config);
  const baseValues: Record<TimeRangePreset, number[]> = {
    today: [800, 1600, 2400, 2200, 3300, 2300],
    this_week: [3000, 3400, 3200, 4000, 4800, 2300, 1900],
    this_month: [7500, 9800, 12000, 8700],
    this_quarter: [27000, 31000, 28500],
    all: [7000, 12000, 8500, 13000, 16000, 17000, 19000, 17200, 19000, 17500, 21000, 23000],
    custom: [4800, 5700, 6900, 6300, 7500, 7300],
  };
  
  return labels.map((label, i) => ({
    period: label,
    cashFlow: baseValues[config.preset]?.[i] || 8000,
  }));
};

// Income vs Expenses data
export const getIncomeVsExpensesData = (config: TimeRangeConfig) => {
  const labels = getTimeLabels(config);
  const incomeValues: Record<TimeRangePreset, number[]> = {
    today: [1200, 2400, 3600, 2800, 4200, 3000],
    this_week: [4500, 5200, 4800, 6100, 7200, 3500, 2800],
    this_month: [12000, 15000, 18000, 14000],
    this_quarter: [45000, 52000, 48000],
    all: [15000, 22000, 18000, 25000, 30000, 28000, 32000, 29000, 35000, 31000, 38000, 42000],
    custom: [8000, 9500, 11000, 10200, 12000, 11500],
  };
  const expenseValues: Record<TimeRangePreset, number[]> = {
    today: [400, 800, 1200, 600, 900, 700],
    this_week: [1500, 1800, 1600, 2100, 2400, 1200, 900],
    this_month: [4500, 5200, 6000, 5300],
    this_quarter: [18000, 21000, 19500],
    all: [8000, 10000, 9500, 12000, 14000, 11000, 13000, 11500, 16000, 14000, 17000, 19000],
    custom: [3200, 3800, 4100, 3900, 4500, 4200],
  };
  
  return labels.map((label, i) => ({
    period: label,
    income: incomeValues[config.preset]?.[i] || 10000,
    expenses: expenseValues[config.preset]?.[i] || 5000,
  }));
};

// Expenses by category data
export const getExpensesByCategoryData = (config: TimeRangeConfig) => {
  const multipliers: Record<TimeRangePreset, number> = {
    today: 0.03,
    this_week: 0.25,
    this_month: 1,
    this_quarter: 3,
    all: 12,
    custom: 0.5,
  };
  
  const mult = multipliers[config.preset] || 1;
  
  return [
    { name: "Office Supplies", value: Math.round(2400 * mult), color: "#f87171" },
    { name: "Travel", value: Math.round(4567 * mult), color: "#4ade80" },
    { name: "Marketing", value: Math.round(1398 * mult), color: "#60a5fa" },
    { name: "Utilities", value: Math.round(980 * mult), color: "#facc15" },
    { name: "Software", value: Math.round(1890 * mult), color: "#c084fc" },
  ];
};

// Payment status data
export const getPaymentStatusData = (config: TimeRangeConfig) => {
  const baseData: Record<TimeRangePreset, { paid: number; pending: number; overdue: number; draft: number }> = {
    today: { paid: 3, pending: 2, overdue: 1, draft: 1 },
    this_week: { paid: 12, pending: 8, overdue: 3, draft: 2 },
    this_month: { paid: 45, pending: 30, overdue: 15, draft: 10 },
    this_quarter: { paid: 120, pending: 75, overdue: 35, draft: 25 },
    all: { paid: 450, pending: 180, overdue: 90, draft: 60 },
    custom: { paid: 25, pending: 15, overdue: 8, draft: 5 },
  };
  
  const data = baseData[config.preset] || baseData.this_month;
  
  return [
    { name: "Paid", value: data.paid, color: "#4ade80" },
    { name: "Pending", value: data.pending, color: "#facc15" },
    { name: "Overdue", value: data.overdue, color: "#f87171" },
    { name: "Draft", value: data.draft, color: "#c084fc" },
  ];
};

// Top clients data
export const getTopClientsData = (config: TimeRangeConfig) => {
  const multipliers: Record<TimeRangePreset, number> = {
    today: 0.03,
    this_week: 0.25,
    this_month: 1,
    this_quarter: 3,
    all: 12,
    custom: 0.5,
  };
  
  const mult = multipliers[config.preset] || 1;
  
  return [
    { name: "Acme Corp", revenue: Math.round(25000 * mult) },
    { name: "Tech Solutions", revenue: Math.round(18000 * mult) },
    { name: "Global Inc", revenue: Math.round(15000 * mult) },
    { name: "StartUp Co", revenue: Math.round(12000 * mult) },
    { name: "Enterprise Ltd", revenue: Math.round(8000 * mult) },
  ];
};

// Get time range label for display
export const getTimeRangeLabel = (config: TimeRangeConfig): string => {
  switch (config.preset) {
    case "today":
      return "Today";
    case "this_week":
      return "This Week";
    case "this_month":
      return "This Month";
    case "this_quarter":
      return "This Quarter";
    case "all":
      return "All Time";
    case "custom":
      return "Custom Range";
    default:
      return "";
  }
};
