import { auth } from "@/lib/auth";
import { db } from "@/db";
import { patrolRecords } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const records = await db
    .select()
    .from(patrolRecords)
    .orderBy(desc(patrolRecords.createdAt));

  const data = records.map((r) => ({
    Nomor: r.number,
    Tanggal: r.patrolDate,
    "Waktu Mulai": r.startTime,
    "Waktu Selesai": r.endTime ?? "",
    Petugas: r.officerName,
    Shift: r.shift,
    Area: r.area,
    "Checkpoint Selesai": r.checkpointDone,
    "Checkpoint Total": r.checkpointTotal,
    Kondisi: r.condition,
    Sumber: r.source,
    "Status Verifikasi": r.verificationStatus,
    "Status Sync": r.syncStatus,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Patroli");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-patroli-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
