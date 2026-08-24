"use server";

import { db } from "@/db";
import { goodsReturns, goodsReturnItems, gatePasses, outgoingGoods } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "./activity-log";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function createGoodsReturn(data: {
  gatePassNumber: string;
  returnedAt: string;
  securityChecker: string;
  carrierName: string;
  returnedSummary: string;
  returnCondition: string;
  notes?: string;
  items: Array<{
    itemName: string;
    quantityReturned: number;
    conditionOnReturn: string;
    notes?: string;
  }>;
  userName: string;
}) {
  try {
    const number = `RET-${Date.now()}-${generateId()}`;

    await db.insert(goodsReturns).values({
      number,
      gatePassNumber: data.gatePassNumber,
      returnedAt: data.returnedAt,
      securityChecker: data.securityChecker,
      carrierName: data.carrierName,
      returnedSummary: data.returnedSummary,
      returnCondition: data.returnCondition,
      status: "Dikembalikan",
      notes: data.notes,
    });

    for (const item of data.items) {
      await db.insert(goodsReturnItems).values({
        returnNumber: number,
        itemName: item.itemName,
        quantityReturned: item.quantityReturned,
        conditionOnReturn: item.conditionOnReturn,
        notes: item.notes,
      });
    }

    const [gatePass] = await db
      .select()
      .from(gatePasses)
      .where(eq(gatePasses.number, data.gatePassNumber));

    if (gatePass) {
      await db
        .update(gatePasses)
        .set({ status: "Selesai" })
        .where(eq(gatePasses.number, data.gatePassNumber));

      if (gatePass.outgoingNumber) {
        await db
          .update(outgoingGoods)
          .set({ status: "Selesai" })
          .where(eq(outgoingGoods.number, gatePass.outgoingNumber));
      }
    }

    await logActivity({
      userName: data.userName,
      action: "Catat Pengembalian Barang",
      module: "goods",
      referenceNumber: number,
    });

    return {
      success: true,
      message: "Pengembalian barang berhasil dicatat",
      data: { number },
    };
  } catch (error) {
    console.error("Error creating goods return:", error);
    return { success: false, message: "Gagal mencatat pengembalian barang" };
  }
}
