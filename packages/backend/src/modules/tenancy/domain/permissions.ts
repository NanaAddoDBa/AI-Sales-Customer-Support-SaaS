export type MemberRole = "owner" | "admin" | "agent" | "viewer";
export function canManageMembers(role: MemberRole) {
  return role === "owner" || role === "admin";
}
export function canReply(role: MemberRole) {
  return role !== "viewer";
}
