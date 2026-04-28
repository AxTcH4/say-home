export function isAdminRole(role?: string | null) {
  return role === "ADMIN";
}

export function hasManagementAccess(role?: string | null) {
  return role === "ADMIN";
}
