"use server";

import { db } from "@/db";
import { personalItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logActivity } from "./activity-log";

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export async function createPersonalItem(data: {
  ownerName: string;
  ownerIdentity?: string;
  department: string;
  itemName: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  color?: string;
  enteredAt: string;
  securityChecker: string;
  userName: string;
}) {
  try {
    const number = `PIT-${Date.now()}-${generateId()}`;

    await db.insert(personalItems).values({
      number,
      ownerName: data.ownerName,
      ownerIdentity: data.ownerIdentity || "",
      department: data.department,
      itemName: data.itemName,
      brand: data.brand || "",
      model: data.model || "",
      serialNumber: data.serialNumber || "",
      color: data.color || "",
      enteredAt: data.enteredAt,
      securityChecker: data.securityChecker,
      status: "Di Dalam Hotel",
    });

    await logActivity({
      userName: data.userName,
      action: "Catat Barang Pribadi",
      module: "goods",
      referenceNumber: number,
    });

    return {
      success: true,
      message: "Barang pribadi berhasil dicatat",
      data: { number },
    };
  } catch (error) {
    console.error("Error creating personal item:", error);
    return { success: false, message: "Gagal mencatat barang pribadi" };
  }
}

export async function checkoutPersonalItem(number: string, userName: string) {
  try {
    const [existing] = await db
      .select()
      .from(personalItems)
      .where(eq(personalItems.number, number));

    if (!existing) {
      return { success: false, message: "Data tidak ditemukan" };
    }

    await db
      .update(personalItems)
      .set({ status: "Sudah Keluar" })
      .where(eq(personalItems.number, number));

    await logActivity({
      userName,
      action: "Checkout Barang Pribadi",
      module: "goods",
      referenceNumber: number,
    });

    return { success: true, message: "Barang pribadi telah ditandai keluar" };
  } catch (error) {
    console.error("Error checking out personal item:", error);
    return { success: false, message: "Gagal memproses checkout" };
  }
}
