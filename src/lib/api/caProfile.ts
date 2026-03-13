import { config } from "@/lib/config";
import { getToken } from "./authToken";

export async function fetchCAProfile() {
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
  return json.data ?? json;
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
}
