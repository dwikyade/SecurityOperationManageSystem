"use server";

import { db } from "@/db";
import { attachments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createAttachment(data: {
  module: string;
  referenceNumber: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploader: string;
}) {
  try {
    await db.insert(attachments).values({
      module: data.module,
      referenceNumber: data.referenceNumber,
      url: data.url,
      fileName: data.fileName,
      fileType: data.fileType,
      fileSize: data.fileSize,
      uploader: data.uploader,
    });
    return { success: true, message: "Lampiran berhasil disimpan" };
  } catch (error) {
    console.error("Error creating attachment:", error);
    return { success: false, message: "Gagal menyimpan lampiran" };
  }
}

export async function getAttachments(module: string, referenceNumber: string) {
  try {
    const result = await db
      .select()
      .from(attachments)
      .where(
        eq(attachments.referenceNumber, referenceNumber)
      );
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting attachments:", error);
    return { success: false, data: [] };
  }
}
