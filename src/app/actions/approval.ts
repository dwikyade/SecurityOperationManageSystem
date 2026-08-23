"use server";

import { db } from "@/db";
import { approvalFlows, approvalSteps, approvalRecords, outgoingGoods } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notifyMultipleUsers } from "./notifications";
import { getUserIdsByRole } from "@/lib/notify-helpers";

export async function startApprovalWorkflow(requestNumber: string, requester: string, department: string, risk: string) {
  try {
    const flows = await db
      .select()
      .from(approvalFlows)
      .where(eq(approvalFlows.transactionType, risk === "Aset" ? "Barang Aset" : "Barang Non-Aset"));

    if (flows.length === 0) {
      return {
        success: false,
        message: "Workflow approval tidak ditemukan untuk tipe transaksi ini",
      };
    }

    const flow = flows[0];
    const steps = await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.flowId, flow.id))
      .orderBy(approvalSteps.stepOrder);

    if (steps.length === 0) {
      return {
        success: false,
        message: "Tidak ada step approval yang ditemukan",
      };
    }

    const currentStep = steps[0];

    const recordId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    await db.insert(approvalRecords).values({
      id: recordId,
      requestNumber,
      requester,
      department,
      stepName: currentStep.roleName,
      itemSummary: `Permintaan barang keluar ${requestNumber}`,
      risk,
      status: "Menunggu",
    });

    await db
      .update(outgoingGoods)
      .set({ status: "Dalam Proses Approval" })
      .where(eq(outgoingGoods.number, requestNumber));

    const targetUserIds = await getUserIdsByRole(currentStep.roleName);
    if (targetUserIds.length > 0) {
      await notifyMultipleUsers({
        userIds: targetUserIds,
        title: `Permintaan Approval: ${requestNumber}`,
        detail: `Pemohon: ${requester} (${department}). Tipe: ${risk}`,
        tone: "info",
      });
    }

    return {
      success: true,
      message: "Workflow approval dimulai",
      data: { recordId, currentStep: currentStep.roleName },
    };
  } catch (error) {
    console.error("Error starting approval workflow:", error);
    return {
      success: false,
      message: "Gagal memulai workflow approval",
    };
  }
}

export async function approveRequest(recordId: string, approver: string, note?: string) {
  try {
    const [record] = await db
      .select()
      .from(approvalRecords)
      .where(eq(approvalRecords.id, recordId));

    if (!record) {
      return {
        success: false,
        message: "Record approval tidak ditemukan",
      };
    }

    const steps = await db
      .select()
      .from(approvalSteps)
      .innerJoin(approvalFlows, eq(approvalSteps.flowId, approvalFlows.id))
      .where(and(
        eq(approvalFlows.transactionType, record.risk === "Aset" ? "Barang Aset" : "Barang Non-Aset"),
      ))
      .orderBy(approvalSteps.stepOrder);

    const currentIdx = steps.findIndex(s => s.approval_steps.roleName === record.stepName);
    const isLastStep = currentIdx === steps.length - 1;

    await db
      .update(approvalRecords)
      .set({
        status: "Disetujui",
        decidedBy: approver,
        decidedAt: new Date(),
        note: note || record.note,
      })
      .where(eq(approvalRecords.id, recordId));

    if (isLastStep) {
      await db
        .update(outgoingGoods)
        .set({ status: "Disetujui" })
        .where(eq(outgoingGoods.number, record.requestNumber));

      return {
        success: true,
        message: "Permintaan telah disetujui sepenuhnya",
        complete: true,
      };
    } else {
      const nextStep = steps[currentIdx + 1];
      
      await db.insert(approvalRecords).values({
        id: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        requestNumber: record.requestNumber,
        requester: record.requester,
        department: record.department,
        stepName: nextStep.approval_steps.roleName,
        itemSummary: record.itemSummary,
        risk: record.risk,
        status: "Menunggu",
      });

      return {
        success: true,
        message: "Disetujui, dilanjutkan ke tahap berikutnya",
        complete: false,
        nextStep: nextStep.approval_steps.roleName,
      };
    }
  } catch (error) {
    console.error("Error approving request:", error);
    return {
      success: false,
      message: "Gagal menyetujui permintaan",
    };
  }
}

export async function rejectRequest(recordId: string, approver: string, reason: string) {
  try {
    const [record] = await db
      .select()
      .from(approvalRecords)
      .where(eq(approvalRecords.id, recordId));

    if (!record) {
      return {
        success: false,
        message: "Record approval tidak ditemukan",
      };
    }

    await db
      .update(approvalRecords)
      .set({
        status: "Ditolak",
        decidedBy: approver,
        decidedAt: new Date(),
        note: reason,
      })
      .where(eq(approvalRecords.id, recordId));

    await db
      .update(outgoingGoods)
      .set({ status: "Ditolak" })
      .where(eq(outgoingGoods.number, record.requestNumber));

    return {
      success: true,
      message: "Permintaan telah ditolak",
    };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return {
      success: false,
      message: "Gagal menolak permintaan",
    };
  }
}
