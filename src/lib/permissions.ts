import type { ModuleKey, ModulePermissions } from "./authStore";

export const MODULE_KEYS: ModuleKey[] = ["dashboard", "income", "expense", "settings"];

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: "Dashboard",
  income: "Income",
  expense: "Expenses",
  settings: "Settings",
};

export const defaultPermissions = (): ModulePermissions => ({
  dashboard: { read: false, write: false },
  income: { read: false, write: false },
  expense: { read: false, write: false },
  settings: { read: false, write: false },
});

export const fullPermissions = (): ModulePermissions => ({
  dashboard: { read: true, write: true },
  income: { read: true, write: true },
  expense: { read: true, write: true },
  settings: { read: true, write: true },
});

export function normalizePermissions(
  raw: unknown,
): ModulePermissions | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const result = defaultPermissions();
  for (const key of MODULE_KEYS) {
    const mod = obj[key] as { read?: boolean; write?: boolean } | undefined;
    if (mod && typeof mod === "object") {
      const write = !!mod.write;
      const read = !!mod.read || write; // write implies read
      result[key] = { read, write };
    }
  }
  return result;
}

export function can(
  permissions: ModulePermissions | null | undefined,
  module: ModuleKey,
  action: "read" | "write",
  isSubAccount: boolean,
): boolean {
  if (!isSubAccount) return true; // non-sub-account users have full access
  if (!permissions) return false;
  return !!permissions[module]?.[action];
}

export function firstAllowedRoute(
  permissions: ModulePermissions | null | undefined,
): string {
  if (!permissions) return "/sme/no-access";
  if (permissions.dashboard.read) return "/sme/dashboard";
  if (permissions.income.read) return "/sme/income";
  if (permissions.expense.read) return "/sme/expenses";
  if (permissions.settings.read) return "/sme/settings";
  return "/sme/no-access";
}
