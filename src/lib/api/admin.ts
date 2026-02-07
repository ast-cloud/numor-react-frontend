import { config } from '@/lib/config';
import { getToken } from './authToken';

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export async function fetchAllUsers() {
  const res = await fetch(`${config.backendHost}/api/admin/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function toggleUserDisabledApi(email: string) {
  const res = await fetch(`${config.backendHost}/api/admin/users/toggle-disabled`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Failed to toggle user status');
  return res.json();
}

export async function updateUserRolesApi(email: string, roles: string[]) {
  const res = await fetch(`${config.backendHost}/api/admin/users/roles`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ email, roles }),
  });
  if (!res.ok) throw new Error('Failed to update roles');
  return res.json();
}

export async function deleteUserApi(email: string) {
  const res = await fetch(`${config.backendHost}/api/admin/users`, {
    method: 'DELETE',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}
