"use server";

import { db } from "@/db";
import { patrolFindings } from "@/db/schema";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function createFinding(data: {
  patrolNumber?: string;
  title: string;
  foundAt: string;
  reporter: string;
  location: string;
  category: string;
  priority: string;
  ownerDepartment: string;
  ownerName: string;
  targetResolutionAt: string;
  initialAction?: string;
}) {
  try {
    const number = `FND-${Date.now()}-${generateId()}`;

    await db.insert(patrolFindings).values({
      number,
      patrolNumber: data.patrolNumber,
      title: data.title,
      foundAt: data.foundAt,
      reporter: data.reporter,
      location: data.location,
      category: data.category,
      priority: data.priority,
      ownerDepartment: data.ownerDepartment,
      ownerName: data.ownerName,
      targetResolutionAt: data.targetResolutionAt,
      status: "Baru Dilaporkan",
      progress: 0,
      initialAction: data.initialAction,
    });

    return {
      success: true,
      message: "Temuan berhasil dilaporkan",
      data: { number },
    };
  } catch (error) {
    console.error("Error creating finding:", error);
    return {
      success: false,
      message: "Gagal melaporkan temuan",
    };
  }
}
