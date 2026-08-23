"use server";

import { db } from "@/db";
import { outgoingGoods, outgoingGoodsItems } from "@/db/schema";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function createOutgoingGoods(data: {
  requestedAt: string;
  applicantId: number;
  applicantName: string;
  department: string;
  movementType: string;
  purpose: string;
  reason?: string;
  carrierName: string;
  carrierIdentity: string;
  vehicleNumber: string;
  destination: string;
  exitDate: string;
  plannedReturnDate?: string;
  risk: string;
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    conditionBefore: string;
    assetCode?: string;
    serialNumber?: string;
    ownership: string;
  }>;
}) {
  try {
    const number = `OGD-${Date.now()}-${generateId()}`;

    await db.insert(outgoingGoods).values({
      number,
      requestedAt: data.requestedAt,
      applicantId: data.applicantId,
      applicantName: data.applicantName,
      department: data.department,
      movementType: data.movementType,
      purpose: data.purpose,
      reason: data.reason,
      carrierName: data.carrierName,
      carrierIdentity: data.carrierIdentity,
      vehicleNumber: data.vehicleNumber,
      destination: data.destination,
      exitDate: data.exitDate,
      plannedReturnDate: data.plannedReturnDate,
      status: "Menunggu Approval",
      gatePassStatus: "Belum Aktif",
      itemCount: data.items.length,
      risk: data.risk,
    });

    for (const item of data.items) {
      await db.insert(outgoingGoodsItems).values({
        outgoingNumber: number,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        conditionBefore: item.conditionBefore,
        assetCode: item.assetCode || "",
        serialNumber: item.serialNumber || "",
        ownership: item.ownership,
      });
    }

    return {
      success: true,
      message: "Permintaan barang keluar berhasil diajukan",
      data: { number },
    };
  } catch (error) {
    console.error("Error creating outgoing goods:", error);
    return {
      success: false,
      message: "Gagal mengajukan barang keluar",
    };
  }
}
