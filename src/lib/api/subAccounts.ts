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
  email: string;
  permissions: ModulePermissions;
}): Promise<{ success: boolean; message?: string }> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  // Fetch organization to get organizationId
  const orgRes = await fetch(`${config.backendHost}/api/organization/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!orgRes.ok) throw new Error("Failed to fetch organization");
  const orgJson = await orgRes.json();
  const organizationId = String((orgJson.data ?? orgJson)?.id ?? "");

  const res = await fetch(`${config.backendHost}/api/user/inviteNewUser`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      organizationId,
      permissions: {
        ...payload.permissions,
        organizationSettings: payload.permissions.settings,
        settings: undefined,
      },
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || `Request failed: ${res.status}`);
  }
  return json;
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
