import { config } from "@/lib/config";
import { getToken } from "./authToken";
import type { ModulePermissions } from "@/lib/authStore";

export interface SubAccount {
  id: string;
  name: string;
  email: string;
  permissions: ModulePermissions;
  isDisabled?: boolean;
  createdAt?: string;
}

async function authedFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${config.backendHost}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  const json = await res.json().catch(() => ({}));
  return json.data ?? json;
}

export async function listSubAccounts(): Promise<SubAccount[]> {
  const data = await authedFetch("/api/sub-accounts");
  return Array.isArray(data) ? data : (data?.subAccounts ?? []);
}

export async function createSubAccount(payload: {
  name: string;
  email: string;
  password?: string;
  permissions: ModulePermissions;
}): Promise<SubAccount> {
  return authedFetch("/api/sub-accounts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateSubAccountPermissions(
  id: string,
  permissions: ModulePermissions,
): Promise<SubAccount> {
  return authedFetch(`/api/sub-accounts/${id}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissions }),
  });
}

export async function setSubAccountDisabled(
  id: string,
  isDisabled: boolean,
): Promise<SubAccount> {
  return authedFetch(`/api/sub-accounts/${id}/disable`, {
    method: "PATCH",
    body: JSON.stringify({ isDisabled }),
  });
}

export async function resetSubAccountPassword(
  id: string,
  newPassword: string,
): Promise<void> {
  await authedFetch(`/api/sub-accounts/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

export async function deleteSubAccount(id: string): Promise<void> {
  await authedFetch(`/api/sub-accounts/${id}`, { method: "DELETE" });
}
