import { config } from '@/lib/config';
import { getToken } from './authToken';

export interface ClientData {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  gstin: string | null;
  country: string | null;
  companyType: string | null;
  taxId: string | null;
  taxSystem: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchClients(): Promise<ClientData[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/clients`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch clients');
  const json = await res.json();
  return json.data ?? [];
}

export interface UpdateClientPayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  gstin?: string | null;
  country?: string | null;
  companyType?: string | null;
  taxId?: string | null;
  taxSystem?: string | null;
}

export interface CreateClientPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  companyType?: string | null;
  taxSystem?: string | null;
  taxId?: string | null;
}

export async function createClient(payload: CreateClientPayload): Promise<ClientData> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/clients/createClient/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to create client');
  const json = await res.json();
  return json.data;
}

export async function updateClient(clientId: string, payload: UpdateClientPayload): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/clients/${clientId}/updateClient`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to update client');
}
