import { auth } from "@/lib/auth";
import { db } from "@/db";
import { gatePasses } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const records = await db
    .select()
    .from(gatePasses)
    .orderBy(desc(gatePasses.createdAt));

  const data = records.map((r) => ({
    Nomor: r.number,
    "No Outgoing": r.outgoingNumber ?? "",
    Pemohon: r.requester,
    Departemen: r.department,
    Pembawa: r.bearer,
    Tujuan: r.purpose,
    "Tipe Pergerakan": r.movementType,
    "Berlaku Dari": r.validFrom,
    "Berlaku Sampai": r.validUntil,
    "Tanggal Kembali": r.returnDate ?? "",
    Status: r.status,
    "Discan Oleh": r.scannedBy ?? "",
    "Discan Pada": r.scannedAt ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Gate Pass");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-gatepass-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
