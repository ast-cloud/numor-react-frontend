import { config } from '@/lib/config';
import { setToken, clearToken } from './authToken';

export async function register(name: string, email: string, password: string, role: string) {
  const res = await fetch(`${config.backendHost}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user: { name, email, password, role } })
  });
  const data = await res.json();

  if (data.success && data.data?.token) {
    setToken(data.data.token);
  }

  return data;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${config.backendHost}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user: { email, password } })
  });
  const data = await res.json();

  if (data.success && data.data?.token) {
    setToken(data.data.token);
  }

  return data;
}

export async function logout() {
  clearToken();
}
