import { useQuery } from "@tanstack/react-query";
import { fetchExpenses, type ExpenseAPI } from "@/lib/api/expenses";
import { fetchInvoices, type InvoiceData } from "@/lib/api/invoices";
import { fetchClients, type ClientData } from "@/lib/api/clients";
import { fetchCurrentOrganization } from "@/lib/api/user";

export interface DashboardData {
  expenses: ExpenseAPI[];
  invoices: InvoiceData[];
  clients: ClientData[];
  country: string;
  isLoading: boolean;
  isError: boolean;
}

const COUNTRY_CURRENCY: Record<string, string> = {
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  UAE: "AED",
  "United Arab Emirates": "AED",
  Austria: "EUR",
  Belgium: "EUR",
  Bulgaria: "EUR",
  Croatia: "EUR",
  Cyprus: "EUR",
  "Czech Republic": "EUR",
  Denmark: "EUR",
  Estonia: "EUR",
  Finland: "EUR",
  France: "EUR",
  Germany: "EUR",
  Greece: "EUR",
  Hungary: "EUR",
  Ireland: "EUR",
  Italy: "EUR",
  Latvia: "EUR",
  Lithuania: "EUR",
  Luxembourg: "EUR",
  Malta: "EUR",
  Netherlands: "EUR",
  Poland: "EUR",
  Portugal: "EUR",
  Romania: "EUR",
  Slovakia: "EUR",
  Slovenia: "EUR",
  Spain: "EUR",
  Sweden: "EUR",
  Canada: "CAD",
  Australia: "AUD",
  Japan: "JPY",
  Singapore: "SGD",
};

export const getCurrencyForCountry = (country: string): string => {
  return COUNTRY_CURRENCY[country] || "USD";
};

export const formatCurrency = (amount: number, country: string): string => {
  const currency = getCurrencyForCountry(country);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

export const useDashboardData = (): DashboardData => {
  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
    staleTime: 5 * 60 * 1000,
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000,
  });

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000,
  });

  const orgQuery = useQuery({
    queryKey: ["organization"],
    queryFn: fetchCurrentOrganization,
    staleTime: 10 * 60 * 1000,
  });

  return {
    expenses: expensesQuery.data ?? [],
    invoices: invoicesQuery.data ?? [],
    clients: clientsQuery.data ?? [],
    country: orgQuery.data?.country || "India",
    isLoading: expensesQuery.isLoading || invoicesQuery.isLoading || clientsQuery.isLoading || orgQuery.isLoading,
    isError: expensesQuery.isError || invoicesQuery.isError || clientsQuery.isError,
  };
};
