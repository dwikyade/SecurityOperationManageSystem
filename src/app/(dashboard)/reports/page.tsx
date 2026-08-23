import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  patrolRecords,
  patrolFindings,
  incomingGoods,
  outgoingGoods,
  gatePasses,
  googleSyncConfig,
  googleSyncLogs,
} from "@/db/schema";
import { sql, desc } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, ShieldCheck, ShieldAlert, Package, QrCode, RefreshCw } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [[patrolTotal], [findingTotal], [findingOpen], [inTotal], [outTotal], [gateTotal]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(patrolRecords),
      db.select({ count: sql<number>`count(*)` }).from(patrolFindings),
      db
        .select({ count: sql<number>`count(*)` })
        .from(patrolFindings)
        .where(sql`${patrolFindings.status} NOT IN ('Selesai','Ditutup')`),
      db.select({ count: sql<number>`count(*)` }).from(incomingGoods),
      db.select({ count: sql<number>`count(*)` }).from(outgoingGoods),
      db.select({ count: sql<number>`count(*)` }).from(gatePasses),
    ]);

  const [syncConfigs, syncLogs] = await Promise.all([
    db.select().from(googleSyncConfig),
    db.select().from(googleSyncLogs).orderBy(desc(googleSyncLogs.syncedAt)).limit(20),
  ]);

  const summary = [
    {
      label: "Patroli",
      icon: ShieldCheck,
      rows: [
        { name: "Total Patroli", value: patrolTotal?.count ?? 0 },
      ],
    },
    {
      label: "Temuan",
      icon: ShieldAlert,
      rows: [
        { name: "Total Temuan", value: findingTotal?.count ?? 0 },
        { name: "Temuan Aktif", value: findingOpen?.count ?? 0 },
        { name: "Selesai", value: (findingTotal?.count ?? 0) - (findingOpen?.count ?? 0) },
      ],
    },
    {
      label: "Barang",
      icon: Package,
      rows: [
        { name: "Barang Masuk", value: inTotal?.count ?? 0 },
        { name: "Barang Keluar", value: outTotal?.count ?? 0 },
      ],
    },
    {
      label: "Gate Pass",
      icon: QrCode,
      rows: [
        { name: "Total Gate Pass", value: gateTotal?.count ?? 0 },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Laporan</h2>
        <p className="text-sm text-muted-foreground">
          Ringkasan statistik operasional security hotel
        </p>
      </div>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Ringkasan</TabsTrigger>
          <TabsTrigger value="google-sheets">Google Sheets Sync</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {section.label}
                    </CardTitle>
                    <Icon size={18} className="text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-1">
                    {section.rows.map((row) => (
                      <div key={row.name} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{row.name}</span>
                        <span className="text-sm font-bold">{row.value}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet size={18} />
                Rekap Operasional
              </CardTitle>
              <CardDescription>
                Ringkasan seluruh aktivitas operasional dalam sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modul</TableHead>
                    <TableHead>Keterangan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Patroli</TableCell>
                    <TableCell>Total catatan patroli keamanan</TableCell>
                    <TableCell className="text-right font-bold">{patrolTotal?.count ?? 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Temuan</TableCell>
                    <TableCell>Total temuan dari patroli</TableCell>
                    <TableCell className="text-right font-bold">{findingTotal?.count ?? 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Temuan Aktif</TableCell>
                    <TableCell>Temuan yang belum selesai ditangani</TableCell>
                    <TableCell className="text-right font-bold">{findingOpen?.count ?? 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Barang Masuk</TableCell>
                    <TableCell>Total transaksi penerimaan barang</TableCell>
                    <TableCell className="text-right font-bold">{inTotal?.count ?? 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Barang Keluar</TableCell>
                    <TableCell>Total permintaan pengeluaran barang</TableCell>
                    <TableCell className="text-right font-bold">{outTotal?.count ?? 0}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Gate Pass</TableCell>
                    <TableCell>Total surat jalan yang diterbitkan</TableCell>
                    <TableCell className="text-right font-bold">{gateTotal?.count ?? 0}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="google-sheets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw size={18} />
                Konfigurasi Sinkronisasi
              </CardTitle>
              <CardDescription>
                Daftar spreadsheet yang terkonfigurasi untuk sinkronisasi data patroli
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncConfigs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Belum ada konfigurasi Google Sheets.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tambahkan konfigurasi di menu Admin untuk mengaktifkan sinkronisasi.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Spreadsheet ID</TableHead>
                      <TableHead>Sheet</TableHead>
                      <TableHead>Terakhir Sync</TableHead>
                      <TableHead>Baris Terakhir</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncConfigs.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {config.spreadsheetId.slice(0, 20)}...
                        </TableCell>
                        <TableCell>{config.sheetName || "Sheet1"}</TableCell>
                        <TableCell>
                          {config.lastSyncAt
                            ? new Date(config.lastSyncAt).toLocaleString("id-ID")
                            : "Belum pernah"}
                        </TableCell>
                        <TableCell>{config.lastSyncRowCount ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={config.status === "Aktif" ? "default" : "secondary"}>
                            {config.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet size={18} />
                Log Sinkronisasi
              </CardTitle>
              <CardDescription>
                Riwayat sinkronisasi dari Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Belum ada log sinkronisasi.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Config ID</TableHead>
                      <TableHead>Baris Dibaca</TableHead>
                      <TableHead>Berhasil</TableHead>
                      <TableHead>Gagal</TableHead>
                      <TableHead>Pesan</TableHead>
                      <TableHead>Dieksekusi Oleh</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.syncedAt).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>{log.configId}</TableCell>
                        <TableCell>{log.rowsRead}</TableCell>
                        <TableCell className="text-green-600">{log.rowsSuccess}</TableCell>
                        <TableCell className="text-red-600">{log.rowsFailed}</TableCell>
                        <TableCell className="text-xs">{log.message}</TableCell>
                        <TableCell>{log.executedBy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
