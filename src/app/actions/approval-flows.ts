"use server";

import { db } from "@/db";
import { approvalFlows, approvalSteps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "./activity-log";

export async function createApprovalFlow(data: {
  name: string;
  transactionType: string;
  steps: Array<{
    stepOrder: number;
    roleName: string;
    condition?: string;
  }>;
  userName: string;
}) {
  try {
    const [result] = await db.insert(approvalFlows).values({
      name: data.name,
      transactionType: data.transactionType,
      status: "Aktif",
    }).$returningId();

    const flowId = result.id;

    for (const step of data.steps) {
      await db.insert(approvalSteps).values({
        flowId,
        stepOrder: step.stepOrder,
        roleName: step.roleName,
        condition: step.condition,
      });
    }

    await logActivity({
      userName: data.userName,
      action: "Buat Approval Flow",
      module: "admin",
      referenceNumber: `FLOW-${flowId}`,
    });

    return {
      success: true,
      message: "Approval flow berhasil dibuat",
      data: { flowId },
    };
  } catch (error) {
    console.error("Error creating approval flow:", error);
    return { success: false, message: "Gagal membuat approval flow" };
  }
}

export async function deleteApprovalFlow(id: number, userName: string) {
  try {
    await db.delete(approvalSteps).where(eq(approvalSteps.flowId, id));
    await db.delete(approvalFlows).where(eq(approvalFlows.id, id));

    await logActivity({
      userName,
      action: "Hapus Approval Flow",
      module: "admin",
      referenceNumber: `FLOW-${id}`,
    });

    return { success: true, message: "Approval flow berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting approval flow:", error);
    return { success: false, message: "Gagal menghapus approval flow" };
  }
}
