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

export async function deleteExpense(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/expenses/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json?.message || 'Failed to delete expense');
  }
}

export interface UpdateExpensePayload {
  merchant: string;
  expenseDate: string;
  totalAmount: number;
  category: string;
  paymentMethod: string;
  receiptUrl: string | null;
  ocrExtracted: boolean;
  ocrConfidence: number | null;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    unitType: string;
    taxRate: number;
    total: number;
  }>;
}

export async function updateExpense(id: string, payload: UpdateExpensePayload): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/expenses/${id}/updateExpense`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    throw new Error(json?.message || 'Failed to update expense');
  }
}
