"use server";

import { db } from "@/db";
import { patrolRecords, patrolFindings, incomingGoods, outgoingGoods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "./activity-log";

export async function deletePatrolRecord(number: string, userName: string) {
  try {
    const [existing] = await db
      .select()
      .from(patrolRecords)
      .where(eq(patrolRecords.number, number));

    if (!existing) {
      return { success: false, message: "Data tidak ditemukan" };
    }

    await db.delete(patrolRecords).where(eq(patrolRecords.number, number));

    await logActivity({
      userName,
      action: "Hapus Patroli",
      module: "patrol",
      referenceNumber: number,
      beforeValue: JSON.stringify(existing),
    });

    return { success: true, message: "Catatan patroli berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting patrol record:", error);
    return { success: false, message: "Gagal menghapus data" };
  }
}

export async function updatePatrolCondition(number: string, condition: string, note: string, userName: string) {
  try {
    const [existing] = await db
      .select()
      .from(patrolRecords)
      .where(eq(patrolRecords.number, number));

    if (!existing) {
      return { success: false, message: "Data tidak ditemukan" };
    }

    await db
      .update(patrolRecords)
      .set({
        condition,
        supervisorNote: note,
        verificationStatus: "Terverifikasi",
      })
      .where(eq(patrolRecords.number, number));

    await logActivity({
      userName,
      action: "Update Condition Patroli",
      module: "patrol",
      referenceNumber: number,
      beforeValue: JSON.stringify(existing),
      afterValue: JSON.stringify({ condition, supervisorNote: note }),
    });

    return { success: true, message: "Status patroli berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating patrol:", error);
    return { success: false, message: "Gagal memperbarui data" };
  }
}

export async function updateFindingProgress(
  number: string,
  progress: number,
  status: string,
  closingNote: string | undefined,
  userName: string
) {
  try {
    const [existing] = await db
      .select()
      .from(patrolFindings)
      .where(eq(patrolFindings.number, number));

    if (!existing) {
      return { success: false, message: "Data tidak ditemukan" };
    }

    await db
      .update(patrolFindings)
      .set({
        progress,
        status,
        closingNote,
      })
      .where(eq(patrolFindings.number, number));

    await logActivity({
      userName,
      action: "Update Progress Temuan",
      module: "findings",
      referenceNumber: number,
      beforeValue: JSON.stringify({ progress: existing.progress, status: existing.status }),
      afterValue: JSON.stringify({ progress, status, closingNote }),
    });

    return { success: true, message: "Progress temuan berhasil diperbarui" };
  } catch (error) {
    console.error("Error updating finding:", error);
    return { success: false, message: "Gagal memperbarui temuan" };
  }
}

export async function deleteFinding(number: string, userName: string) {
  try {
    const [existing] = await db
      .select()
      .from(patrolFindings)
      .where(eq(patrolFindings.number, number));

    if (!existing) {
      return { success: false, message: "Data tidak ditemukan" };
    }

    await db.delete(patrolFindings).where(eq(patrolFindings.number, number));

    await logActivity({
      userName,
      action: "Hapus Temuan",
      module: "findings",
      referenceNumber: number,
      beforeValue: JSON.stringify(existing),
    });

    return { success: true, message: "Data temuan berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting finding:", error);
    return { success: false, message: "Gagal menghapus temuan" };
  }
}
