import { config } from '@/lib/config';
import { getToken } from './authToken';

export interface InvoiceUnits {
  systemUnits: string[];
  customUnits: string[];
  activeUnits: string[];
}

const BASE = '/api/organization';

function authHeaders() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function fetchInvoiceUnits(): Promise<InvoiceUnits> {
  const res = await fetch(`${config.backendHost}${BASE}/invoice-units`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch invoice units');
  const json = await res.json();
  return json.data ?? json;
}

export async function addCustomInvoiceUnit(unit: string): Promise<string[]> {
  const res = await fetch(`${config.backendHost}${BASE}/custom-units`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ unit }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to add custom unit');
  return json.data ?? json;
}

export async function deleteCustomInvoiceUnit(unit: string): Promise<string[]> {
  const res = await fetch(`${config.backendHost}${BASE}/custom-units/${encodeURIComponent(unit)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to delete custom unit');
  return json.data ?? json;
}

export async function setActiveInvoiceUnits(units: string[]): Promise<string[]> {
  const res = await fetch(`${config.backendHost}${BASE}/invoice-units/active`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ units }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update active units');
  return json.data ?? json;
}
