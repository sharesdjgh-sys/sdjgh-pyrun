export const USER_ROLES = ["student", "teacher", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && USER_ROLES.includes(role as UserRole);
}

export function isAdministratorRole(role: unknown): boolean {
  return role === "administrator" || role === "admin";
}

export function canOpenAdminPage(role: unknown): boolean {
  return role === "teacher" || isAdministratorRole(role);
}
