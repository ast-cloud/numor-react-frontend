import { config } from '@/lib/config';

export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${config.backendHost}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ user: { name, email, password } })
  });
  const data = await res.json();
  return data;
}
