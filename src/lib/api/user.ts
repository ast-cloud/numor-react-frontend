import { config } from "@/lib/config";
import { getToken } from "./authToken";

export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/user/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchCurrentOrganization() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/organization/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch organization");
  const json = await res.json();
  return json.data ?? json;
}

export async function updateUserProfile(data: { name: string; phone: string }) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/user/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchProfilePhoto(): Promise<string | null> {
  try {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${config.backendHost}/api/user/profilePhoto`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const url = json.photoUrl;
    if (!url || (typeof url === "object" && url.profilePhoto === null)) return null;
    return typeof url === "string" ? url : null;
  } catch {
    return null;
  }
}

export async function deleteProfilePhoto(): Promise<boolean> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/user/profilePhoto`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to delete profile photo");
  const json = await res.json();
  return json.success === true;
}

export async function uploadProfilePhoto(base64DataUrl: string): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  // Convert base64 data URL to Blob
  const res0 = await fetch(base64DataUrl);
  const blob = await res0.blob();
  const file = new File([blob], "profile.jpg", { type: blob.type || "image/jpeg" });

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${config.backendHost}/api/user/profilePhoto`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload profile photo");
  const json = await res.json();

  const rawPhotoUrl =
    typeof json.photoUrl === "string"
      ? json.photoUrl
      : typeof json.data?.photoUrl === "string"
        ? json.data.photoUrl
        : null;

  if (rawPhotoUrl) {
    const separator = rawPhotoUrl.includes("?") ? "&" : "?";
    return `${rawPhotoUrl}${separator}t=${Date.now()}`;
  }

  const hasFileKey =
    typeof json.photoUrl?.fileKey === "string" ||
    typeof json.data?.photoUrl?.fileKey === "string";

  if (hasFileKey) {
    const refreshedUrl = await fetchProfilePhoto();
    if (refreshedUrl) return refreshedUrl;
  }

  return base64DataUrl;
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
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/organization/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update organization");
  const json = await res.json();
  return json.data ?? json;
}

export async function fetchOrganizationLogo(): Promise<string | null> {
  try {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${config.backendHost}/api/organization/logo`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;
    const json = await res.json();
    const url = json.logoUrl;
    if (!url || typeof url !== "string") return null;
    return url;
  } catch {
    return null;
  }
}

export async function uploadOrganizationLogo(base64DataUrl: string): Promise<string> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res0 = await fetch(base64DataUrl);
  const blob = await res0.blob();
  const file = new File([blob], "logo.png", { type: blob.type || "image/png" });

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${config.backendHost}/api/organization/logo`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to upload organization logo");
  const json = await res.json();

  const logoUrl = typeof json.logoUrl === "string" ? json.logoUrl : null;
  if (logoUrl) {
    const separator = logoUrl.includes("?") ? "&" : "?";
    return `${logoUrl}${separator}t=${Date.now()}`;
  }

  const refreshed = await fetchOrganizationLogo();
  if (refreshed) return refreshed;

  return base64DataUrl;
}

export async function deleteOrganizationLogo(): Promise<boolean> {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${config.backendHost}/api/organization/logo`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to delete organization logo");
  const json = await res.json();
  return json.success === true;
}
