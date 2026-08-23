"use server";

import { db } from "@/db";
import { incomingGoods, incomingGoodsItems } from "@/db/schema";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function createIncomingGoods(data: {
  receivedAt: string;
  carrierName: string;
  carrierType: string;
  vendorName: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  department: string;
  receiver: string;
  deliveryNoteNumber: string;
  purchaseOrderNumber: string;
  securityChecker: string;
  notes?: string;
  items: Array<{
    name: string;
    category: string;
    quantity: number;
    unit: string;
    condition: string;
    serialNumber?: string;
    assetCode?: string;
  }>;
}) {
  try {
    const number = `IGD-${Date.now()}-${generateId()}`;

    await db.insert(incomingGoods).values({
      number,
      receivedAt: data.receivedAt,
      carrierName: data.carrierName,
      carrierType: data.carrierType,
      vendorName: data.vendorName,
      phone: data.phone,
      vehicleNumber: data.vehicleNumber,
      vehicleType: data.vehicleType,
      department: data.department,
      receiver: data.receiver,
      deliveryNoteNumber: data.deliveryNoteNumber,
      purchaseOrderNumber: data.purchaseOrderNumber,
      securityChecker: data.securityChecker,
      notes: data.notes,
      status: "Diterima",
    });

    for (const item of data.items) {
      await db.insert(incomingGoodsItems).values({
        incomingNumber: number,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        condition: item.condition,
        serialNumber: item.serialNumber || "",
        assetCode: item.assetCode || "",
        ownership: "Hotel",
      });
    }

    return {
      success: true,
      message: "Barang masuk berhasil dicatat",
      data: { number },
    };
  } catch (error) {
    console.error("Error creating incoming goods:", error);
    return {
      success: false,
      message: "Gagal mencatat barang masuk",
    };
  }
}
