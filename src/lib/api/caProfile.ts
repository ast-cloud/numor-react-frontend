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
