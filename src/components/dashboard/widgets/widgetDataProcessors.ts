import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, subDays, subWeeks, subMonths, subQuarters, isWithinInterval, format, parseISO, endOfDay } from "date-fns";
import type { ExpenseAPI } from "@/lib/api/expenses";
import type { InvoiceData } from "@/lib/api/invoices";
import type { ClientData } from "@/lib/api/clients";
import type { TimeRangeConfig, TimeRangePreset } from "./widgetData";

// --- Time range filtering ---

interface TimeRange {
  start: Date;
  end: Date;
}

const getTimeRange = (config: TimeRangeConfig): TimeRange | null => {
  const now = new Date();
  switch (config.preset) {
    case "today":
      return { start: startOfDay(now), end: endOfDay(now) };
    case "this_week":
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfDay(now) };
    case "this_month":
      return { start: startOfMonth(now), end: endOfDay(now) };
    case "this_quarter":
      return { start: startOfQuarter(now), end: endOfDay(now) };
    case "all":
      return null;
    case "custom":
      if (config.customRange?.from) {
        return {
          start: startOfDay(config.customRange.from),
          end: endOfDay(config.customRange.to ?? config.customRange.from),
        };
      }
      return null;
    default:
      return null;
  }
};

const getPreviousTimeRange = (config: TimeRangeConfig): TimeRange | null => {
  const now = new Date();
  switch (config.preset) {
    case "today": {
      const prevDay = subDays(now, 1);
      return { start: startOfDay(prevDay), end: endOfDay(prevDay) };
    }
    case "this_week": {
      const prevWeekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
      const prevWeekEnd = subDays(startOfWeek(now, { weekStartsOn: 1 }), 1);
      return { start: prevWeekStart, end: endOfDay(prevWeekEnd) };
    }
    case "this_month": {
      const prevMonthStart = subMonths(startOfMonth(now), 1);
      const prevMonthEnd = subDays(startOfMonth(now), 1);
      return { start: prevMonthStart, end: endOfDay(prevMonthEnd) };
    }
    case "this_quarter": {
      const prevQuarterStart = subQuarters(startOfQuarter(now), 1);
      const prevQuarterEnd = subDays(startOfQuarter(now), 1);
      return { start: prevQuarterStart, end: endOfDay(prevQuarterEnd) };
    }
    default:
      return null;
  }
};

const isInRange = (dateStr: string, range: TimeRange | null): boolean => {
  if (!range) return true;
  try {
    const date = parseISO(dateStr);
    return isWithinInterval(date, { start: range.start, end: range.end });
  } catch {
    return false;
  }
};

export const filterExpenses = (expenses: ExpenseAPI[], config: TimeRangeConfig): ExpenseAPI[] => {
  const range = getTimeRange(config);
  return expenses.filter((e) => isInRange(e.expenseDate, range));
};

export const filterInvoices = (invoices: InvoiceData[], config: TimeRangeConfig): InvoiceData[] => {
  const range = getTimeRange(config);
  return invoices.filter((i) => isInRange(i.issueDate, range));
};

// --- Period label generation ---

type PeriodFormat = "hour" | "day" | "week" | "month";

const getPeriodFormat = (preset: TimeRangePreset): PeriodFormat => {
  switch (preset) {
    case "today": return "hour";
    case "this_week": return "day";
    case "this_month": return "week";
    case "this_quarter": return "month";
    case "all": return "month";
    case "custom": return "day";
    default: return "month";
  }
};

const getPeriodKey = (dateStr: string, periodFormat: PeriodFormat): string => {
  try {
    const date = parseISO(dateStr);
    switch (periodFormat) {
      case "hour": return format(date, "ha");
      case "day": return format(date, "EEE");
      case "week": {
        const weekNum = Math.ceil(date.getDate() / 7);
        return `Week ${weekNum}`;
      }
      case "month": return format(date, "MMM");
      default: return format(date, "MMM");
    }
  } catch {
    return "Unknown";
  }
};

// --- Stats computation ---

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingInvoices: number;
  revenueChange: number | null;
  expensesChange: number | null;
  netIncomeChange: number | null;
  pendingChange: number | null;
}

const calcPercentChange = (current: number, previous: number): number | null => {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
};

export const computeStats = (
  expenses: ExpenseAPI[],
  invoices: InvoiceData[],
  allExpenses: ExpenseAPI[],
  allInvoices: InvoiceData[],
  config: TimeRangeConfig
): DashboardStats => {
  const totalRevenue = invoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.totalAmount || "0"), 0);
  const netIncome = totalRevenue - totalExpenses;
  const pendingInvoices = invoices.filter((i) => i.status?.toUpperCase() === "UNPAID" || i.status?.toUpperCase() === "PENDING").length;

  // Previous period comparison
  const prevRange = getPreviousTimeRange(config);
  let revenueChange: number | null = null;
  let expensesChange: number | null = null;
  let netIncomeChange: number | null = null;
  let pendingChange: number | null = null;

  if (prevRange) {
    const prevExpenses = allExpenses.filter((e) => isInRange(e.expenseDate, prevRange));
    const prevInvoices = allInvoices.filter((i) => isInRange(i.issueDate, prevRange));
    const prevRevenue = prevInvoices.reduce((sum, i) => sum + parseFloat(i.totalAmount || "0"), 0);
    const prevExpTotal = prevExpenses.reduce((sum, e) => sum + parseFloat(e.totalAmount || "0"), 0);
    const prevNet = prevRevenue - prevExpTotal;
    const prevPending = prevInvoices.filter((i) => i.status?.toUpperCase() === "UNPAID" || i.status?.toUpperCase() === "PENDING").length;

    revenueChange = calcPercentChange(totalRevenue, prevRevenue);
    expensesChange = calcPercentChange(totalExpenses, prevExpTotal);
    netIncomeChange = calcPercentChange(netIncome, prevNet);
    pendingChange = pendingInvoices - prevPending;
  }

  return { totalRevenue, totalExpenses, netIncome, pendingInvoices, revenueChange, expensesChange, netIncomeChange, pendingChange };
};

// --- Widget data processors ---

export interface PeriodData {
  period: string;
  [key: string]: string | number;
}

export const processRevenueOverTime = (invoices: InvoiceData[], config: TimeRangeConfig): PeriodData[] => {
  const periodFormat = getPeriodFormat(config.preset);
  const grouped: Record<string, number> = {};
  invoices.forEach((inv) => {
    const key = getPeriodKey(inv.issueDate, periodFormat);
    grouped[key] = (grouped[key] || 0) + parseFloat(inv.totalAmount || "0");
  });
  return Object.entries(grouped).map(([period, revenue]) => ({ period, revenue }));
};

export const processExpensesOverTime = (expenses: ExpenseAPI[], config: TimeRangeConfig): PeriodData[] => {
  const periodFormat = getPeriodFormat(config.preset);
  const grouped: Record<string, number> = {};
  expenses.forEach((exp) => {
    const key = getPeriodKey(exp.expenseDate, periodFormat);
    grouped[key] = (grouped[key] || 0) + parseFloat(exp.totalAmount || "0");
  });
  return Object.entries(grouped).map(([period, expenses]) => ({ period, expenses }));
};

export const processIncomeVsExpenses = (
  invoices: InvoiceData[],
  expenses: ExpenseAPI[],
  config: TimeRangeConfig
): PeriodData[] => {
  const periodFormat = getPeriodFormat(config.preset);
  const incomeMap: Record<string, number> = {};
  const expenseMap: Record<string, number> = {};

  invoices.forEach((inv) => {
    const key = getPeriodKey(inv.issueDate, periodFormat);
    incomeMap[key] = (incomeMap[key] || 0) + parseFloat(inv.totalAmount || "0");
  });
  expenses.forEach((exp) => {
    const key = getPeriodKey(exp.expenseDate, periodFormat);
    expenseMap[key] = (expenseMap[key] || 0) + parseFloat(exp.totalAmount || "0");
  });

  const allKeys = new Set([...Object.keys(incomeMap), ...Object.keys(expenseMap)]);
  return Array.from(allKeys).map((period) => ({
    period,
    income: incomeMap[period] || 0,
    expenses: expenseMap[period] || 0,
  }));
};

export const processCashFlow = (
  invoices: InvoiceData[],
  expenses: ExpenseAPI[],
  config: TimeRangeConfig
): PeriodData[] => {
  const combined = processIncomeVsExpenses(invoices, expenses, config);
  return combined.map((d) => ({
    period: d.period,
    cashFlow: (d.income as number) - (d.expenses as number),
  }));
};

const CATEGORY_COLORS = ["#f87171", "#4ade80", "#60a5fa", "#facc15", "#c084fc", "#fb923c", "#22d3ee", "#e879f9"];

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export const processExpensesByCategory = (expenses: ExpenseAPI[]): CategoryData[] => {
  const grouped: Record<string, number> = {};
  expenses.forEach((exp) => {
    const cat = exp.category || "Other";
    grouped[cat] = (grouped[cat] || 0) + parseFloat(exp.totalAmount || "0");
  });
  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({
      name,
      value,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));
};

export interface TopClientData {
  name: string;
  revenue: number;
}

export const processTopClients = (invoices: InvoiceData[], clients: ClientData[]): TopClientData[] => {
  const clientMap = new Map(clients.map((c) => [c.id, c.name]));
  const revenueByClient: Record<string, number> = {};

  invoices.forEach((inv) => {
    const clientId = inv.clientId || inv.customerId;
    const name = clientMap.get(clientId) || "Unknown Client";
    revenueByClient[name] = (revenueByClient[name] || 0) + parseFloat(inv.totalAmount || "0");
  });

  return Object.entries(revenueByClient)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, revenue]) => ({ name, revenue }));
};

const STATUS_COLORS: Record<string, string> = {
  PAID: "#4ade80",
  UNPAID: "#facc15",
  PENDING: "#facc15",
  OVERDUE: "#f87171",
  DRAFT: "#c084fc",
};

export interface StatusData {
  name: string;
  value: number;
  color: string;
}

export const processPaymentStatus = (invoices: InvoiceData[]): StatusData[] => {
  const grouped: Record<string, number> = {};
  invoices.forEach((inv) => {
    const status = inv.status?.toUpperCase() || "DRAFT";
    grouped[status] = (grouped[status] || 0) + 1;
  });
  return Object.entries(grouped)
    .map(([name, value]) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      value,
      color: STATUS_COLORS[name] || "#94a3b8",
    }));
};
