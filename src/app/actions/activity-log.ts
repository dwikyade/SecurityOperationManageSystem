"use server";

import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export async function logActivity(data: {
  userId?: number;
  userName: string;
  action: string;
  module: string;
  referenceNumber: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress?: string;
  device?: string;
  userAgent?: string;
}) {
  try {
    await db.insert(activityLogs).values({
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      module: data.module,
      referenceNumber: data.referenceNumber,
      beforeValue: data.beforeValue,
      afterValue: data.afterValue,
      ipAddress: data.ipAddress || "",
      device: data.device || "Web",
      userAgent: data.userAgent,
    });
    return { success: true };
  } catch (error) {
    console.error("Error logging activity:", error);
    return { success: false };
  }
}
