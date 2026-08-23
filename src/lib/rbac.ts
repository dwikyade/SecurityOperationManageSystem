export type UserSession = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  departmentCode: string | null;
};

export type ModuleKey =
  | "dashboard"
  | "patrol"
  | "findings"
  | "goods"
  | "approval"
  | "gatepass"
  | "reports"
  | "master-data"
  | "admin";

export const MODULE_ACCESS: Record<string, ModuleKey[]> = {
  "Security Officer": ["dashboard", "patrol", "findings", "goods", "gatepass", "reports"],
  "Security Supervisor": ["dashboard", "patrol", "findings", "goods", "approval", "gatepass", "reports"],
  "Chief Security": ["dashboard", "patrol", "findings", "goods", "approval", "gatepass", "reports", "master-data", "admin"],
  "Department Staff": ["dashboard", "goods", "approval", "gatepass", "reports"],
  "Head of Department": ["dashboard", "goods", "approval", "reports"],
  Receiving: ["dashboard", "goods", "reports"],
  Purchasing: ["dashboard", "goods", "reports"],
  "Asset Officer": ["dashboard", "goods", "approval", "gatepass", "reports"],
  Management: ["dashboard", "patrol", "findings", "goods", "reports", "admin"],
  Administrator: ["dashboard", "patrol", "findings", "goods", "approval", "gatepass", "reports", "master-data", "admin"],
};

export function getUserModules(roles: string[]): ModuleKey[] {
  const modules = new Set<ModuleKey>();
  for (const role of roles) {
    const access = MODULE_ACCESS[role];
    if (access) {
      for (const m of access) modules.add(m);
    }
  }
  return Array.from(modules);
}

export function hasAccess(roles: string[], module: ModuleKey): boolean {
  return getUserModules(roles).includes(module);
}
