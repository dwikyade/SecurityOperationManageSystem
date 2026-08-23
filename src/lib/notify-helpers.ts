import { db } from "@/db";
import { users, userRoles, roles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getUserIdsByRole(roleName: string): Promise<number[]> {
  const result = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(roles.name, roleName));
  return result.map((r) => r.userId);
}

export async function getUserIdsByRoles(roleNames: string[]): Promise<number[]> {
  const result = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(sql`${roles.name} IN (${sql.join(roleNames.map(r => sql`${r}`), sql`,`)})`);
  const ids = new Set(result.map((r) => r.userId));
  return Array.from(ids);
}
