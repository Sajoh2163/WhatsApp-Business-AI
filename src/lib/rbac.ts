export type Role = "owner" | "admin" | "agent";
export type Permission = "conversations:write" | "catalog:write" | "settings:write" | "team:write" | "billing:write";
const M: Record<Role, Permission[]> = {
  owner: ["conversations:write", "catalog:write", "settings:write", "team:write", "billing:write"],
  admin: ["conversations:write", "catalog:write", "settings:write", "team:write"],
  agent: ["conversations:write"],
};
export const can = (r: Role, p: Permission) => M[r].includes(p);
export function requirePermission(r: Role, p: Permission) { if (!can(r, p)) throw new Error("FORBIDDEN"); }
