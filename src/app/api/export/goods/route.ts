import { auth } from "@/lib/auth";
import { db } from "@/db";
import { incomingGoods, outgoingGoods } from "@/db/schema";
import { desc } from "drizzle-orm";
import * as XLSX from "xlsx";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const incoming = await db
    .select()
    .from(incomingGoods)
    .orderBy(desc(incomingGoods.createdAt));

  const outgoing = await db
    .select()
    .from(outgoingGoods)
    .orderBy(desc(outgoingGoods.createdAt));

  const inData = incoming.map((r) => ({
    Nomor: r.number,
    "Tanggal Terima": r.receivedAt,
    Pembawa: r.carrierName,
    "Tipe Kendaraan": r.carrierType,
    Vendor: r.vendorName,
    Departemen: r.department,
    Penerima: r.receiver,
    "No Surat Jalan": r.deliveryNoteNumber,
    "No PO": r.purchaseOrderNumber,
    "Security Checker": r.securityChecker,
    Status: r.status,
  }));

  const outData = outgoing.map((r) => ({
    Nomor: r.number,
    "Tanggal Permintaan": r.requestedAt,
    Pemohon: r.applicantName,
    Departemen: r.department,
    "Tipe Pergerakan": r.movementType,
    Tujuan: r.purpose,
    Pembawa: r.carrierName,
    Tujuan2: r.destination,
    "Tanggal Keluar": r.exitDate,
    "Jumlah Item": r.itemCount,
    Risiko: r.risk,
    Status: r.status,
    "Status Gate Pass": r.gatePassStatus,
  }));

  const wb = XLSX.utils.book_new();
  const wsIn = XLSX.utils.json_to_sheet(inData);
  const wsOut = XLSX.utils.json_to_sheet(outData);
  XLSX.utils.book_append_sheet(wb, wsIn, "Barang Masuk");
  XLSX.utils.book_append_sheet(wb, wsOut, "Barang Keluar");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="laporan-barang-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}
