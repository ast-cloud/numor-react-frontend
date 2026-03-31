import { config } from "@/lib/config";
import { getToken } from "./authToken";

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json",
});

export async function fetchAllUsers() {
  const res = await fetch(`${config.backendHost}/api/admin/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function toggleUserDisabledApi(email: string) {
  const res = await fetch(`${config.backendHost}/api/admin/users/toggle-disabled`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to toggle user status");
  return res.json();
}

export async function updateUserRolesApi(email: string, roles: string[]) {
  const res = await fetch(`${config.backendHost}/api/admin/users/roles`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ email, roles }),
  });
  if (!res.ok) throw new Error("Failed to update roles");
  return res.json();
}

export async function fetchCAProfileCounts() {
  const res = await fetch(`${config.backendHost}/api/admin/ca-profiles/counts`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch CA profile counts");
  const json = await res.json();
  return json.data ?? json;
}

export type CAProfileTab =
  | "unverified"
  | "underReview"
  | "verified"
  | "rejected"
  | "suspended"
  | "unverifiedUpdates"
  | "updatesUnderReview"
  | "updatesRejected";

export interface CAProfilesResponse {
  profiles: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchCAProfiles(tab: CAProfileTab, page = 1, limit = 20): Promise<CAProfilesResponse> {
  const res = await fetch(`${config.backendHost}/api/admin/ca-profiles?tab=${tab}&page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch CA profiles");
  const json = await res.json();
  return json.data ?? json;
}

export async function approveCAProfileApi(caId: string) {
  const res = await fetch(`${config.backendHost}/api/admin/ca/caprofile/${caId}/approve`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to approve CA profile");
  return res.json();
}

export async function approveCAProfileUpdateApi(caProfileId: string) {
  const res = await fetch(`${config.backendHost}/api/admin/ca/caprofile/${caProfileId}/approveUpdate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to approve CA profile update");
  return res.json();
}

export async function rejectCAProfileApi(caId: string) {
  const res = await fetch(`${config.backendHost}/api/admin/ca/caprofile/${caId}/reject`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reject CA profile");
  return res.json();
}

export async function rejectCAProfileUpdateApi(caProfileId: string) {
  const res = await fetch(`${config.backendHost}/api/admin/ca/caprofile/${caProfileId}/rejectUpdate`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reject CA profile update");
  return res.json();
}

export async function suspendCAProfileApi(caId: string) {
  const res = await fetch(`${config.backendHost}/api/admin/ca/caprofile/${caId}/suspend`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to suspend CA profile");
  return res.json();
}

export async function deleteUserApi(email: string) {
  const res = await fetch(`${config.backendHost}/api/admin/users`, {
    method: "DELETE",
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}
