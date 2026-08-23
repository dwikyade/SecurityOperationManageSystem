import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ count: 0, items: [] }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const [unreadResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.status, "Belum Dibaca")
      )
    );

  const items = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(10);

  return Response.json({
    count: unreadResult?.count ?? 0,
    items,
  });
}
