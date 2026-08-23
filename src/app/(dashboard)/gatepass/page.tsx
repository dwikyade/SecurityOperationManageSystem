import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { gatePasses } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
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
import { QrCode, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { GatePassActionsDialog } from "@/components/gatepass/gatepass-actions-dialog";

const statusVariant = (s: string) => {
  switch (s) {
    case "Aktif": return "default" as const;
    case "Digunakan": return "secondary" as const;
    case "Kadaluarsa": return "destructive" as const;
    default: return "outline" as const;
  }
};

export default async function GatePassPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name: string; roles: string[] };

  const records = await db
    .select()
    .from(gatePasses)
    .orderBy(desc(gatePasses.createdAt))
    .limit(50);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gatePasses);
  const total = totalResult?.count ?? 0;

  const [activeResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gatePasses)
    .where(sql`${gatePasses.status} = 'Aktif'`);
  const active = activeResult?.count ?? 0;

  const [usedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gatePasses)
    .where(sql`${gatePasses.status} = 'Digunakan'`);
  const used = usedResult?.count ?? 0;

  const [expiredResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(gatePasses)
    .where(sql`${gatePasses.status} = 'Kadaluarsa'`);
  const expired = expiredResult?.count ?? 0;

  const stats = [
    { label: "Total Gate Pass", value: String(total), icon: QrCode },
    { label: "Aktif", value: String(active), icon: CheckCircle2 },
    { label: "Digunakan", value: String(used), icon: Clock3 },
    { label: "Kadaluarsa", value: String(expired), icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Gate Pass</h2>
        <p className="text-sm text-muted-foreground">
          Surat jalan keluar-masuk barang
        </p>
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

      <Card>
        <CardHeader>
          <CardTitle>Daftar Gate Pass</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data gate pass.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Pembawa</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Berlaku</TableHead>
                  <TableHead>Sampai</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.number}>
                    <TableCell className="font-mono text-xs">{r.number}</TableCell>
                    <TableCell>{r.requester}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.bearer}</TableCell>
                    <TableCell>{r.movementType}</TableCell>
                    <TableCell>{r.validFrom}</TableCell>
                    <TableCell>{r.validUntil}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === "Aktif" && (
                        <GatePassActionsDialog
                          type="scan"
                          approverName={user.name}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
