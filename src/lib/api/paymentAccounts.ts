import { config } from '@/lib/config';
import { getToken } from './authToken';

/**
 * A saved set of bank / payment details, stored on the organisation and picked
 * by nickname when creating an invoice. The invoice keeps its own copy of the
 * values, so editing or deleting a set here never alters an issued invoice.
 */
export interface PaymentAccount {
  id: string;
  nickname: string;
  bankName: string | null;
  accountName: string | null;
  /** IBAN outside India, plain account number within it. */
  accountNumber: string | null;
  ifsc: string | null;
  swift: string | null;
  bankAddress: string | null;
}

export type PaymentAccountInput = Omit<PaymentAccount, 'id'>;

const BASE = '/api/organization/payment-accounts';

function authHeaders() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

interface ApiError {
  message?: string;
  errors?: { field: string; message: string }[];
}

/**
 * The API answers errors with something worth showing - surface it. A failed
 * validation carries the useful part in errors[]; its top-level message is only
 * ever "Invalid input", so prefer the field messages when they are there.
 */
async function failure(res: Response, fallback: string): Promise<Error> {
  const json: ApiError | null = await res.json().catch(() => null);

  const fieldErrors = json?.errors?.map((e) => e.message).filter(Boolean);
  if (fieldErrors?.length) return new Error(fieldErrors.join(". "));

  return new Error(json?.message || fallback);
}

export async function fetchPaymentAccounts(): Promise<PaymentAccount[]> {
  const res = await fetch(`${config.backendHost}${BASE}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw await failure(res, 'Failed to fetch payment details');
  const json = await res.json();
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function createPaymentAccount(payload: PaymentAccountInput): Promise<PaymentAccount> {
  const res = await fetch(`${config.backendHost}${BASE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await failure(res, 'Failed to save payment details');
  const json = await res.json();
  return json.data ?? json;
}

export async function updatePaymentAccount(
  id: string,
  payload: PaymentAccountInput,
): Promise<PaymentAccount> {
  const res = await fetch(`${config.backendHost}${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await failure(res, 'Failed to update payment details');
  const json = await res.json();
  return json.data ?? json;
}

export async function deletePaymentAccount(id: string): Promise<void> {
  const res = await fetch(`${config.backendHost}${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw await failure(res, 'Failed to delete payment details');
}
