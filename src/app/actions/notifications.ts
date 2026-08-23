"use server";

import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function createNotification(data: {
  userId: number;
  title: string;
  detail: string;
  tone?: string;
}) {
  try {
    await db.insert(notifications).values({
      userId: data.userId,
      title: data.title,
      detail: data.detail,
      tone: data.tone || "info",
      status: "Belum Dibaca",
    });
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false };
  }
}

export async function notifyMultipleUsers(data: {
  userIds: number[];
  title: string;
  detail: string;
  tone?: string;
}) {
  try {
    for (const userId of data.userIds) {
      await db.insert(notifications).values({
        userId,
        title: data.title,
        detail: data.detail,
        tone: data.tone || "info",
        status: "Belum Dibaca",
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error notifying users:", error);
    return { success: false };
  }
}

export async function getNotifications(userId: number, limit = 20) {
  try {
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { success: false, data: [] };
  }
}

export async function getUnreadCount(userId: number) {
  try {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, "Belum Dibaca")
        )
      );
    return { success: true, count: result?.count ?? 0 };
  } catch (error) {
    console.error("Error getting unread count:", error);
    return { success: false, count: 0 };
  }
}

export async function markAsRead(notificationId: number) {
  try {
    await db
      .update(notifications)
      .set({ status: "Dibaca" })
      .where(eq(notifications.id, notificationId));
    return { success: true };
  } catch (error) {
    console.error("Error marking as read:", error);
    return { success: false };
  }
}

export async function markAllAsRead(userId: number) {
  try {
    await db
      .update(notifications)
      .set({ status: "Dibaca" })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, "Belum Dibaca")
        )
      );
    return { success: true };
  } catch (error) {
    console.error("Error marking all as read:", error);
    return { success: false };
  }
}
