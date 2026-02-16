

# Dashboard Integration with Real Backend Data

## Overview
Replace all hardcoded/dummy data in the dashboard with real data computed from the existing expense and invoice APIs. No new backend endpoints are needed -- all 7 widgets and the 4 summary stat cards can be fully powered by the current `GET /api/expenses/` and `GET /api/invoices/` endpoints, supplemented by `GET /api/clients` for client names.

## What Changes

### 1. New data-fetching hook: `useDashboardData`
Create a custom hook (`src/hooks/use-dashboard-data.ts`) that:
- Fetches expenses, invoices, and clients using React Query (parallel queries)
- Exposes loading/error states
- Returns the raw arrays for processing by widgets

### 2. Replace `widgetData.ts` with real data processing utilities
Create `src/components/dashboard/widgets/widgetDataProcessors.ts` with pure functions that:
- Accept real expense/invoice/client arrays + TimeRangeConfig
- Filter records by the selected time range (today, this week, this month, this quarter, custom date range, all)
- Group and aggregate data into the exact shapes each widget expects
- Compute summary stats (total revenue, total expenses, net income, pending invoice count, and period-over-period % change)

### 3. Update `DashboardHome.tsx`
- Call `useDashboardData()` to fetch data once at the page level
- Replace the hardcoded `stats` array with computed values from real data
- Pass processed data down to widgets as props (instead of widgets calling `widgetData.ts` functions internally)
- Add loading skeletons and error handling

### 4. Update each widget component
Update all 7 widget components to accept pre-processed data as a prop instead of calling dummy data functions:
- `RevenueOverTimeWidget` -- receives grouped invoice revenue by period
- `ExpensesOverTimeWidget` -- receives grouped expense totals by period
- `ExpensesByCategoryWidget` -- receives category-grouped expense totals
- `IncomeVsExpensesWidget` -- receives both series aligned by period
- `CashFlowWidget` -- receives net (income - expenses) by period
- `TopClientsWidget` -- receives client names with total invoice revenue
- `PaymentStatusWidget` -- receives invoice count by status

### 5. Dynamic currency formatting
Use the organization's country (from `useAuth` context) to format all monetary values with the correct currency symbol, consistent with how the Expenses page already works.

---

## Do You Need New Backend Endpoints?

**Not strictly required**, but here are recommendations for future optimization:

| Suggested Endpoint | Why | Priority |
|---|---|---|
| `GET /api/dashboard/summary?from=&to=` | Returns pre-aggregated totals (revenue, expenses, net income, pending count, % changes) so the frontend doesn't need to fetch all records just to sum them | Medium -- useful once data volume grows beyond a few hundred records |
| `GET /api/dashboard/trends?from=&to=&granularity=` | Returns time-bucketed series server-side (daily/weekly/monthly) | Low -- only needed at scale |

For now, fetching all expenses and invoices client-side and computing aggregates is perfectly fine for typical SME data volumes (hundreds to low thousands of records). The React Query cache will prevent redundant fetches as users switch between time ranges.

---

## Technical Details

### Files to create
- `src/hooks/use-dashboard-data.ts` -- React Query hook fetching expenses, invoices, clients in parallel
- `src/components/dashboard/widgets/widgetDataProcessors.ts` -- Pure functions for filtering by time range and aggregating data

### Files to modify
- `src/pages/DashboardHome.tsx` -- Use real data hook, compute stats, pass data to widgets
- `src/components/dashboard/widgets/RevenueOverTimeWidget.tsx`
- `src/components/dashboard/widgets/ExpensesOverTimeWidget.tsx`
- `src/components/dashboard/widgets/ExpensesByCategoryWidget.tsx`
- `src/components/dashboard/widgets/IncomeVsExpensesWidget.tsx`
- `src/components/dashboard/widgets/CashFlowWidget.tsx`
- `src/components/dashboard/widgets/TopClientsWidget.tsx`
- `src/components/dashboard/widgets/PaymentStatusWidget.tsx`

### Data flow

```text
DashboardHome
  |-- useDashboardData() --> fetches expenses[], invoices[], clients[]
  |-- filterByTimeRange(data, timeRangeConfig) --> filtered data
  |-- computeStats(filtered) --> { totalRevenue, totalExpenses, netIncome, pendingCount, changes }
  |-- Stats Cards (rendered with computed values)
  |-- Each Widget receives its pre-processed data array as a prop
```

### Time range filtering logic
- "Today": records where date matches today
- "This Week": records from Monday of current week to now
- "This Month": records from 1st of current month to now
- "This Quarter": records from start of current quarter to now
- "All Time": no filtering
- "Custom": records within the selected date range

### Period-over-period comparison for stat cards
For % change calculations, compare the current period's total against the equivalent previous period (e.g., this month vs last month, this week vs last week).

