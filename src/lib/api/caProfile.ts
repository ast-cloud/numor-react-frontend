import { config } from "@/lib/config";
import { getToken } from "./authToken";

export type CAProfileStatus =
  | "Unverified"
  | "Under Review"
  | "Verified"
  | "Rejected"
  | "Suspended"
  | "Unverified Updates"
  | "Updates Under Review"
  | "Updates Rejected";

export function deriveCAProfileStatus(
  currentProfile: Record<string, unknown> | null,
  pendingProfile: Record<string, unknown> | null
): CAProfileStatus {
  if (!currentProfile) return "Unverified";
  const status = currentProfile.status as string;

  if (status === "SUSPENDED") return "Suspended";

  if (status === "APPROVED" && pendingProfile) {
    const pendingStatus = pendingProfile.status as string;
    if (pendingStatus === "UNDER_REVIEW") return "Updates Under Review";
    if (pendingStatus === "REJECTED") return "Updates Rejected";
    return "Unverified Updates";
  }

  if (status === "APPROVED") return "Verified";
  if (status === "UNDER_REVIEW") return "Under Review";
  if (status === "REJECTED") return "Rejected";

  return "Unverified";
}

export interface CAProfileResponse {
  currentProfile: Record<string, unknown> | null;
  pendingProfile: Record<string, unknown> | null;
}

export async function fetchCAProfile(): Promise<CAProfileResponse> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/ca-profile/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch CA profile");
  const json = await res.json();
  const data = json.data ?? json;
  return {
    currentProfile: data.currentProfile ?? data,
    pendingProfile: data.pendingProfile ?? null,
  };
}

export async function uploadCADocument(file: File, type: string, description: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  formData.append("description", description);

  const res = await fetch(`${config.backendHost}/api/ca-profile/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload document");
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchCADocuments() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/ca-profile/documents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch CA documents");
  const json = await res.json();
  return json.data?.documents ?? json.documents ?? [];
}

export async function deleteCADocument(documentId: string) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/ca-profile/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to delete document");
  const json = await res.json();
  return json.data ?? json;
}

export async function submitCAProfileForReview() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/ca-profile/submit`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to submit profile for review");
  const json = await res.json();
  return json.data ?? json;
}

export async function updateCAProfileAPI(data: Record<string, unknown>) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/ca-profile/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update CA profile");
  const json = await res.json();
  return json.data ?? json;


