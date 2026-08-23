"use server";

import { db } from "@/db";
import { patrolRecords } from "@/db/schema";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function createPatrolRecord(data: {
  patrolDate: string;
  startTime: string;
  endTime?: string;
  officerId: number;
  officerName: string;
  shift: string;
  area: string;
  checkpointTotal: number;
  condition: string;
}) {
  try {
    const number = `PTR-${Date.now()}-${generateId()}`;

    const result = await db.insert(patrolRecords).values({
      number,
      patrolDate: data.patrolDate,
      startTime: data.startTime,
      endTime: data.endTime,
      officerId: data.officerId,
      officerName: data.officerName,
      shift: data.shift,
      area: data.area,
      checkpointDone: 0,
      checkpointTotal: data.checkpointTotal,
      condition: data.condition,
      verificationStatus: "Menunggu Verifikasi",
    });

    return {
      success: true,
      message: "Patroli berhasil dicatat",
      data: { number },
    };
  } catch (error) {
    console.error("Error creating patrol record:", error);
    return {
      success: false,
      message: "Gagal mencatat patroli",
    };
  }
}
