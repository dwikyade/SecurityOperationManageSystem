import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { incomingGoods, outgoingGoods, departments, users, roles, userRoles, gatePasses, personalItems, goodsReturns } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { ArrowDownToLine, ArrowUpFromLine, Package, RotateCcw, UserCheck } from "lucide-react";
import { GoodsFormDialog } from "@/components/goods/goods-form-dialog";
import { GoodsReturnDialog } from "@/components/goods/goods-return-dialog";
import { PersonalItemDialog } from "@/components/goods/personal-item-dialog";
import { ExportButton } from "@/components/export-button";

export default async function GoodsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name: string };

  const [depts, secUsers, activeGatePasses, personalItemList, returnList] = await Promise.all([
    db.select().from(departments),
    db
      .select({ id: users.id, name: users.name })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(sql`${roles.name} LIKE '%Security%'`),
    db
      .select({ number: gatePasses.number, bearer: gatePasses.bearer, department: gatePasses.department })
      .from(gatePasses)
      .where(sql`${gatePasses.status} IN ('Aktif', 'Digunakan')`),
    db.select().from(personalItems).orderBy(desc(personalItems.createdAt)).limit(50),
    db.select().from(goodsReturns).orderBy(desc(goodsReturns.createdAt)).limit(50),
  ]);

  const incoming = await db
    .select()
    .from(incomingGoods)
    .orderBy(desc(incomingGoods.createdAt))
    .limit(50);

  const outgoing = await db
    .select()
    .from(outgoingGoods)
    .orderBy(desc(outgoingGoods.createdAt))
    .limit(50);

  const [inTotal] = await db
    .select({ count: sql<number>`count(*)` })
    .from(incomingGoods);
  const [outTotal] = await db
    .select({ count: sql<number>`count(*)` })
    .from(outgoingGoods);
  const [outPending] = await db
    .select({ count: sql<number>`count(*)` })
    .from(outgoingGoods)
    .where(sql`${outgoingGoods.status} NOT IN ('Selesai', 'Ditolak')`);

  const stats = [
    { label: "Barang Masuk", value: String(inTotal?.count ?? 0), icon: ArrowDownToLine },
    { label: "Barang Keluar", value: String(outTotal?.count ?? 0), icon: ArrowUpFromLine },
    { label: "Menunggu Proses", value: String(outPending?.count ?? 0), icon: Package },
    { label: "Total Transaksi", value: String((inTotal?.count ?? 0) + (outTotal?.count ?? 0)), icon: RotateCcw },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Barang</h2>
          <p className="text-sm text-muted-foreground">
            Pencatatan barang masuk dan keluar hotel
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton href="/api/export/goods" label="Export" />
          <GoodsReturnDialog gatePasses={activeGatePasses} securityUsers={secUsers} userName={user.name} />
          <PersonalItemDialog departments={depts} securityUsers={secUsers} userName={user.name} />
          <GoodsFormDialog type="incoming" departments={depts} securityUsers={secUsers} />
          <GoodsFormDialog type="outgoing" departments={depts} securityUsers={secUsers} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon size={18} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="incoming">
        <TabsList>
          <TabsTrigger value="incoming">Barang Masuk</TabsTrigger>
          <TabsTrigger value="outgoing">Barang Keluar</TabsTrigger>
          <TabsTrigger value="returns">Pengembalian ({returnList.length})</TabsTrigger>
          <TabsTrigger value="personal">Barang Pribadi ({personalItemList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Barang Masuk</CardTitle>
            </CardHeader>
            <CardContent>
              {incoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data barang masuk.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pembawa</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Penerima</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incoming.map((r) => (
                      <TableRow key={r.number}>
                        <TableCell className="font-mono text-xs">{r.number}</TableCell>
                        <TableCell>{r.receivedAt}</TableCell>
                        <TableCell>{r.carrierName}</TableCell>
                        <TableCell>{r.vendorName}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.receiver}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outgoing">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Barang Keluar</CardTitle>
            </CardHeader>
            <CardContent>
              {outgoing.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data barang keluar.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pemohon</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Jumlah Item</TableHead>
                      <TableHead>Risiko</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {outgoing.map((r) => (
                      <TableRow key={r.number}>
                        <TableCell className="font-mono text-xs">{r.number}</TableCell>
                        <TableCell>{r.requestedAt}</TableCell>
                        <TableCell>{r.applicantName}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.movementType}</TableCell>
                        <TableCell>{r.itemCount}</TableCell>
                        <TableCell>
                          <Badge variant={r.risk === "Aset" ? "destructive" : "secondary"}>
                            {r.risk}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengembalian Barang</CardTitle>
            </CardHeader>
            <CardContent>
              {returnList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data pengembalian.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor</TableHead>
                      <TableHead>No Gate Pass</TableHead>
                      <TableHead>Tanggal Kembali</TableHead>
                      <TableHead>Pembawa</TableHead>
                      <TableHead>Ringkasan</TableHead>
                      <TableHead>Kondisi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returnList.map((r) => (
                      <TableRow key={r.number}>
                        <TableCell className="font-mono text-xs font-bold">{r.number}</TableCell>
                        <TableCell className="font-mono text-xs">{r.gatePassNumber}</TableCell>
                        <TableCell>{r.returnedAt}</TableCell>
                        <TableCell>{r.carrierName}</TableCell>
                        <TableCell className="max-w-48 truncate">{r.returnedSummary}</TableCell>
                        <TableCell>{r.returnCondition}</TableCell>
                        <TableCell>
                          <Badge variant="default">{r.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Barang Pribadi</CardTitle>
            </CardHeader>
            <CardContent>
              {personalItemList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data barang pribadi.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nomor</TableHead>
                      <TableHead>Pemilik</TableHead>
                      <TableHead>Identitas</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Nama Barang</TableHead>
                      <TableHead>Merek/Model</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {personalItemList.map((r) => (
                      <TableRow key={r.number}>
                        <TableCell className="font-mono text-xs font-bold">{r.number}</TableCell>
                        <TableCell>{r.ownerName}</TableCell>
                        <TableCell>{r.ownerIdentity || "-"}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.itemName}</TableCell>
                        <TableCell>{r.brand} {r.model}</TableCell>
                        <TableCell className="font-mono text-xs">{r.serialNumber || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "Di Dalam Hotel" ? "default" : "secondary"}>
                            {r.status}
                          </Badge>
                        </TableCell>
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
