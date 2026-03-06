import { config } from '@/lib/config';
import { getToken } from './authToken';

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/user/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch user');
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchCurrentOrganization() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/organization/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch organization');
  const json = await res.json();
  return json.data ?? json;
}

export async function updateUserProfile(data: { name: string; phone: string }) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/users/update`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update profile');
  const json = await res.json();
  return json.data ?? json;
}

export async function updateOrganization(data: {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  taxId: string;
  email: string;
  phone: string;
}) {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${config.backendHost}/api/organization/update`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update organization');
  const json = await res.json();
  return json.data ?? json;
}
