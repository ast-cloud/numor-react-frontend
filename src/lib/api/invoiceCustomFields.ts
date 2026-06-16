import { config } from '@/lib/config';
import { getToken } from './authToken';

export interface InvoiceCustomField {
  id: string;
  name: string;
  predefinedValues: string[];
}

const BASE = '/api/organizations/custom-fields';

function authHeaders() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchInvoiceCustomFields(): Promise<InvoiceCustomField[]> {
  const res = await fetch(`${config.backendHost}${BASE}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch custom fields');
  const json = await res.json();
  const data = json.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function createInvoiceCustomField(payload: {
  name: string;
  predefinedValues: string[];
}): Promise<InvoiceCustomField> {
  const res = await fetch(`${config.backendHost}${BASE}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create custom field');
  const json = await res.json();
  return json.data ?? json;
}

export async function updateInvoiceCustomField(
  id: string,
  payload: { name: string; predefinedValues: string[] },
): Promise<InvoiceCustomField> {
  const res = await fetch(`${config.backendHost}${BASE}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update custom field');
  const json = await res.json();
  return json.data ?? json;
}

export async function deleteInvoiceCustomField(id: string): Promise<void> {
  const res = await fetch(`${config.backendHost}${BASE}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete custom field');
}
