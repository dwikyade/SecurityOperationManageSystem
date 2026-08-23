import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  patrolRecords,
  patrolFindings,
  incomingGoods,
  outgoingGoods,
  gatePasses,
  approvalRecords,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const [
    [patrolTotal],
    [findingTotal],
    [findingOpen],
    [inTotal],
    [outTotal],
    [gateTotal],
    [approvalTotal],
    [approvalPending],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(patrolRecords),
    db.select({ count: sql<number>`count(*)` }).from(patrolFindings),
    db.select({ count: sql<number>`count(*)` }).from(patrolFindings).where(sql`${patrolFindings.status} NOT IN ('Selesai','Ditutup')`),
    db.select({ count: sql<number>`count(*)` }).from(incomingGoods),
    db.select({ count: sql<number>`count(*)` }).from(outgoingGoods),
    db.select({ count: sql<number>`count(*)` }).from(gatePasses),
    db.select({ count: sql<number>`count(*)` }).from(approvalRecords),
    db.select({ count: sql<number>`count(*)` }).from(approvalRecords).where(sql`${approvalRecords.status} = 'Menunggu'`),
  ]);

  const summaryData = [
    { Modul: "Patroli", Keterangan: "Total catatan patroli", Jumlah: patrolTotal?.count ?? 0 },
    { Modul: "Temuan", Keterangan: "Total temuan", Jumlah: findingTotal?.count ?? 0 },
    { Modul: "Temuan Aktif", Keterangan: "Temuan belum selesai", Jumlah: findingOpen?.count ?? 0 },
    { Modul: "Temuan Selesai", Keterangan: "Temuan sudah ditutup", Jumlah: (findingTotal?.count ?? 0) - (findingOpen?.count ?? 0) },
    { Modul: "Barang Masuk", Keterangan: "Total penerimaan barang", Jumlah: inTotal?.count ?? 0 },
    { Modul: "Barang Keluar", Keterangan: "Total pengeluaran barang", Jumlah: outTotal?.count ?? 0 },
    { Modul: "Gate Pass", Keterangan: "Total surat jalan", Jumlah: gateTotal?.count ?? 0 },
    { Modul: "Approval", Keterangan: "Total permintaan approval", Jumlah: approvalTotal?.count ?? 0 },
    { Modul: "Approval Menunggu", Keterangan: "Menunggu keputusan", Jumlah: approvalPending?.count ?? 0 },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summaryData);

  ws["!cols"] = [{ wch: 20 }, { wch: 35 }, { wch: 10 }];

  XLSX.utils.book_append_sheet(wb, ws, "Rekap Operasional");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rekap-operasional-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
