"use server";

import { db } from "@/db";
import { gatePasses, gatePassLogs, outgoingGoods, outgoingGoodsItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function generateGatePass(outgoingNumber: string, approver: string) {
  try {
    const [outgoing] = await db
      .select()
      .from(outgoingGoods)
      .where(eq(outgoingGoods.number, outgoingNumber));

    if (!outgoing) {
      return {
        success: false,
        message: "Permintaan barang keluar tidak ditemukan",
      };
    }

    const items = await db
      .select()
      .from(outgoingGoodsItems)
      .where(eq(outgoingGoodsItems.outgoingNumber, outgoingNumber));

    const token = generateToken();
    const number = `GTP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const itemsJson = JSON.stringify(items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      assetCode: item.assetCode,
    })));

    await db.insert(gatePasses).values({
      number,
      outgoingNumber,
      token,
      requester: outgoing.applicantName,
      department: outgoing.department,
      bearer: outgoing.carrierName,
      purpose: outgoing.purpose,
      movementType: outgoing.movementType,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      returnDate: outgoing.plannedReturnDate,
      approvalSummary: `Disetujui oleh ${approver}`,
      status: "Aktif",
      itemsJson,
    });

    await db
      .update(outgoingGoods)
      .set({ gatePassStatus: "Aktif" })
      .where(eq(outgoingGoods.number, outgoingNumber));

    return {
      success: true,
      message: "Gate Pass berhasil dibuat",
      data: { number, token },
    };
  } catch (error) {
    console.error("Error generating gate pass:", error);
    return {
      success: false,
      message: "Gagal membuat Gate Pass",
    };
  }
}

export async function scanGatePass(token: string, scanner: string, device = "Web") {
  try {
    const [gatePass] = await db
      .select()
      .from(gatePasses)
      .where(eq(gatePasses.token, token));

    if (!gatePass) {
      return {
        success: false,
        message: "Token Gate Pass tidak valid",
      };
    }

    const now = new Date();
    const validUntil = new Date(gatePass.validUntil);

    if (now > validUntil) {
      await db
        .update(gatePasses)
        .set({ status: "Kadaluarsa" })
        .where(eq(gatePasses.number, gatePass.number));

      return {
        success: false,
        message: "Gate Pass telah kadaluarsa",
      };
    }

    if (gatePass.status !== "Aktif") {
      return {
        success: false,
        message: `Gate Pass berstatus: ${gatePass.status}`,
      };
    }

    await db.insert(gatePassLogs).values({
      gatePassNumber: gatePass.number,
      action: "Scan Keluar",
      result: "Berhasil",
      scannedBy: scanner,
      device,
    });

    await db
      .update(gatePasses)
      .set({
        status: "Digunakan",
        scannedBy: scanner,
        scannedAt: now.toISOString(),
      })
      .where(eq(gatePasses.number, gatePass.number));

    return {
      success: true,
      message: "Gate Pass berhasil digunakan",
      data: {
        number: gatePass.number,
        bearer: gatePass.bearer,
        department: gatePass.department,
        movementType: gatePass.movementType,
      },
    };
  } catch (error) {
    console.error("Error scanning gate pass:", error);
    return {
      success: false,
      message: "Gagal scan Gate Pass",
    };
  }
}

export async function getGatePassStatus(token: string) {
  try {
    const [gatePass] = await db
      .select()
      .from(gatePasses)
      .where(eq(gatePasses.token, token));

    if (!gatePass) {
      return {
        success: false,
        message: "Token tidak ditemukan",
      };
    }

    const items = JSON.parse(gatePass.itemsJson);

    return {
      success: true,
      data: {
        number: gatePass.number,
        status: gatePass.status,
        requester: gatePass.requester,
        bearer: gatePass.bearer,
        department: gatePass.department,
        purpose: gatePass.purpose,
        validFrom: gatePass.validFrom,
        validUntil: gatePass.validUntil,
        items,
      },
    };
  } catch (error) {
    console.error("Error getting gate pass status:", error);
    return {
      success: false,
      message: "Gagal mendapatkan status Gate Pass",
    };
  }
}
