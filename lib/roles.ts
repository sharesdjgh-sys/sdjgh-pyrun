export const USER_ROLES = ["student", "teacher", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(role: unknown): role is UserRole {
  return typeof role === "string" && USER_ROLES.includes(role as UserRole);
}

export function isAdministratorRole(role: unknown): boolean {
  return role === "administrator" || role === "admin";
}

export function isStudentRole(role: unknown): boolean {
  return role === "student";
}

export function canOpenAdminPage(role: unknown): boolean {
  return role === "teacher" || isAdministratorRole(role);
}

export function canImportStudents(role: unknown): boolean {
  return role === "teacher" || isAdministratorRole(role);
}

export function canManageStudentClass(
  role: unknown,
  assignedClasses: Iterable<{ grade: number; classNumber: number }>,
  grade: number | null,
  classNumber: number | null
): boolean {
  if (isAdministratorRole(role)) return true;
  if (role !== "teacher" || grade === null || classNumber === null) return false;
  return [...assignedClasses].some((item) => item.grade === grade && item.classNumber === classNumber);
}
