import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { departments, locations, securityShifts, vendors, goodsCategories } from "@/db/schema";
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
import { MasterDataCreateDialog } from "@/components/master-data/master-data-form-dialog";

export default async function MasterDataPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [deptList, locList, shiftList, vendorList, catList] = await Promise.all([
    db.select().from(departments),
    db.select().from(locations),
    db.select().from(securityShifts),
    db.select().from(vendors),
    db.select().from(goodsCategories),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Master Data</h2>
          <p className="text-sm text-muted-foreground">
            Pengelolaan data acuan sistem (Departemen, Lokasi, Shift, Vendor, Kategori)
          </p>
        </div>
        <MasterDataCreateDialog />
      </div>

      <Tabs defaultValue="departments">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="departments">Departemen ({deptList.length})</TabsTrigger>
          <TabsTrigger value="locations">Lokasi ({locList.length})</TabsTrigger>
          <TabsTrigger value="shifts">Shift ({shiftList.length})</TabsTrigger>
          <TabsTrigger value="vendors">Vendor ({vendorList.length})</TabsTrigger>
          <TabsTrigger value="categories">Kategori Barang ({catList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <Card>
            <CardHeader><CardTitle>Daftar Departemen</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Departemen</TableHead>
                    <TableHead>Kepala Departemen</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptList.map((d) => (
                    <TableRow key={d.code}>
                      <TableCell className="font-mono text-xs font-bold">{d.code}</TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.head}</TableCell>
                      <TableCell><Badge variant="secondary">{d.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations">
          <Card>
            <CardHeader><CardTitle>Daftar Lokasi</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Lokasi</TableHead>
                    <TableHead>Lantai</TableHead>
                    <TableHead>Tipe Area</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locList.map((l) => (
                    <TableRow key={l.code}>
                      <TableCell className="font-mono text-xs font-bold">{l.code}</TableCell>
                      <TableCell>{l.name}</TableCell>
                      <TableCell>{l.floor}</TableCell>
                      <TableCell>{l.areaType}</TableCell>
                      <TableCell><Badge variant="secondary">{l.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shifts">
          <Card>
            <CardHeader><CardTitle>Daftar Shift Security</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nama Shift</TableHead>
                    <TableHead>Jam Mulai</TableHead>
                    <TableHead>Jam Selesai</TableHead>
                    <TableHead>Toleransi Keterlambatan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shiftList.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs">{s.id}</TableCell>
                      <TableCell className="font-bold">{s.name}</TableCell>
                      <TableCell>{s.startsAt}</TableCell>
                      <TableCell>{s.endsAt}</TableCell>
                      <TableCell>{s.lateToleranceMinutes} menit</TableCell>
                      <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader><CardTitle>Daftar Vendor</CardTitle></CardHeader>
            <CardContent>
              {vendorList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data vendor.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Vendor</TableHead>
                      <TableHead>Kontak</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorList.map((v) => (
                      <TableRow key={v.code}>
                        <TableCell className="font-mono text-xs font-bold">{v.code}</TableCell>
                        <TableCell>{v.name}</TableCell>
                        <TableCell>{v.contact}</TableCell>
                        <TableCell>{v.email}</TableCell>
                        <TableCell>{v.serviceType}</TableCell>
                        <TableCell><Badge variant="secondary">{v.status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader><CardTitle>Kategori Barang</CardTitle></CardHeader>
            <CardContent>
              {catList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data kategori barang.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama Kategori</TableHead>
                      <TableHead>Approval Aset</TableHead>
                      <TableHead>Wajib Serial Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catList.map((c) => (
                      <TableRow key={c.code}>
                        <TableCell className="font-mono text-xs font-bold">{c.code}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.requiresAssetApproval ? "Ya" : "Tidak"}</TableCell>
                        <TableCell>{c.requiresSerialNumber ? "Ya" : "Tidak"}</TableCell>
                        <TableCell><Badge variant="secondary">{c.status}</Badge></TableCell>
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
