import { auth } from "@/lib/auth";
import { db } from "@/db";
import { patrolFindings } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const records = await db
    .select()
    .from(patrolFindings)
    .orderBy(desc(patrolFindings.createdAt));

  const data = records.map((r) => ({
    Nomor: r.number,
    "No Patroli": r.patrolNumber ?? "",
    Judul: r.title,
    "Ditemukan Pada": r.foundAt,
    Pelapor: r.reporter,
    Lokasi: r.location,
    Kategori: r.category,
    Prioritas: r.priority,
    "Dept Penanggung Jawab": r.ownerDepartment,
    PIC: r.ownerName,
    "Target Penyelesaian": r.targetResolutionAt,
    Status: r.status,
    "Progress (%)": r.progress,
    "Tindakan Awal": r.initialAction ?? "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Temuan");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-temuan-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
