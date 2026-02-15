import { config } from '@/lib/config';
import { getToken } from './authToken';

export interface ExpenseItemAPI {
  id: string;
  expenseId: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  unitType: string;
  taxRate: string;
  totalPrice: string;
  createdAt: string;
}

export interface ExpenseAPI {
  id: string;
  orgId: string;
  userId: string;
  merchant: string;
  expenseDate: string;
  totalAmount: string;
  category: string;
  paymentMethod: string;
  receiptUrl: string | null;
  ocrExtracted: boolean;
  ocrConfidence: number | null;
  createdAt: string;
  updatedAt: string;
  items: ExpenseItemAPI[];
}

export async function fetchExpenses(): Promise<ExpenseAPI[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/expenses/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch expenses');
  const json = await res.json();
  if (!json.success) throw new Error('Failed to fetch expenses');
  return json.data ?? [];
}
