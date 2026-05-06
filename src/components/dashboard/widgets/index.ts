export { default as ExpensesByCategoryWidget } from "./ExpensesByCategoryWidget";
export { default as RevenueOverTimeWidget } from "./RevenueOverTimeWidget";
export { default as IncomeVsExpensesWidget } from "./IncomeVsExpensesWidget";
export { default as CashFlowWidget } from "./CashFlowWidget";
export { default as TopClientsWidget } from "./TopClientsWidget";
export { default as PaymentStatusWidget } from "./PaymentStatusWidget";
export { default as ExpensesOverTimeWidget } from "./ExpensesOverTimeWidget";
export type { TimeRangeConfig, TimeRangePreset } from "./widgetData";

export const WIDGET_KEY_MAP: Record<string, string> = {
  "revenue-over-time": "revenue_vs_time",
  "expenses-over-time": "expense_vs_time",
  "cash-flow": "cashflow_vs_time",
  "income-vs-expenses": "income_expense_vs_time",
  "top-clients": "client_vs_revenue",
  "payment-status": "invoice_status_wise_breakdown",
  "expenses-by-category": "expense_category_wise_breakdown",
};

export type WidgetType = 
  | "expenses-by-category"
  | "revenue-over-time"
  | "income-vs-expenses"
  | "cash-flow"
  | "top-clients"
  | "payment-status"
  | "expenses-over-time";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
}

export const availableWidgets: WidgetConfig[] = [
  { id: "expenses-by-category", type: "expenses-by-category", title: "Expenses by Category", description: "Pie chart showing expense distribution" },
  { id: "revenue-over-time", type: "revenue-over-time", title: "Revenue Over Time", description: "Line chart of revenue trends" },
  { id: "income-vs-expenses", type: "income-vs-expenses", title: "Income vs Expenses", description: "Bar chart comparing income and expenses" },
  { id: "cash-flow", type: "cash-flow", title: "Cash Flow", description: "Area chart showing cash flow over time" },
  { id: "top-clients", type: "top-clients", title: "Top Clients", description: "Horizontal bar chart of top clients by revenue" },
  { id: "payment-status", type: "payment-status", title: "Invoice Status", description: "Pie chart of invoice payment statuses" },
  { id: "expenses-over-time", type: "expenses-over-time", title: "Expenses Over Time", description: "Area chart showing expense trends" },
];
