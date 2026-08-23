"use server";

import { db } from "@/db";
import { checkpoints } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "./activity-log";

function generateQrToken(code: string): string {
  return `CP-${code}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

export async function createCheckpoint(data: {
  code: string;
  name: string;
  locationCode: string;
  floor: string;
  description?: string;
  frequency?: string;
  shift: string;
  patrolOrder?: number;
  userName: string;
}) {
  try {
    const qrToken = generateQrToken(data.code);

    await db.insert(checkpoints).values({
      code: data.code.toUpperCase(),
      name: data.name,
      locationCode: data.locationCode,
      floor: data.floor,
      description: data.description,
      frequency: data.frequency || "Setiap shift",
      shift: data.shift,
      patrolOrder: data.patrolOrder || 1,
      qrToken,
      status: "Aktif",
    });

    await logActivity({
      userName: data.userName,
      action: "Tambah Checkpoint",
      module: "master-data",
      referenceNumber: data.code,
    });

    return {
      success: true,
      message: "Checkpoint berhasil dibuat",
      data: { code: data.code, qrToken },
    };
  } catch (error) {
    console.error("Error creating checkpoint:", error);
    return { success: false, message: "Gagal membuat checkpoint" };
  }
}

export async function deleteCheckpoint(code: string, userName: string) {
  try {
    const [existing] = await db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.code, code));

    if (!existing) {
      return { success: false, message: "Checkpoint tidak ditemukan" };
    }

    await db.delete(checkpoints).where(eq(checkpoints.code, code));

    await logActivity({
      userName,
      action: "Hapus Checkpoint",
      module: "master-data",
      referenceNumber: code,
      beforeValue: JSON.stringify(existing),
    });

    return { success: true, message: "Checkpoint berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting checkpoint:", error);
    return { success: false, message: "Gagal menghapus checkpoint" };
  }
}

export async function getCheckpointsByShift(shift: string) {
  try {
    const result = await db
      .select()
      .from(checkpoints)
      .where(eq(checkpoints.shift, shift))
      .orderBy(checkpoints.patrolOrder);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting checkpoints:", error);
    return { success: false, data: [] };
  }
}
