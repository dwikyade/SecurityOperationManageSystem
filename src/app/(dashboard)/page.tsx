import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  patrolRecords,
  patrolFindings,
  incomingGoods,
  outgoingGoods,
  approvalRecords,
  gatePasses,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Clock3,
  XCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as {
    name: string;
    roles: string[];
  };

  const today = new Date().toISOString().split("T")[0];

  const [
    [patrolToday],
    [checkpointDone],
    [checkpointTotal],
    [findingsActive],
    [incomingToday],
    [outgoingToday],
    [approvalPending],
    [gatepassNotReturned],
    [gatepassRejected],
    recentPatrols,
    recentFindings,
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(patrolRecords)
      .where(sql`${patrolRecords.patrolDate} = ${today}`),
    db
      .select({ total: sql<number>`COALESCE(SUM(${patrolRecords.checkpointDone}), 0)` })
      .from(patrolRecords)
      .where(sql`${patrolRecords.patrolDate} = ${today}`),
    db
      .select({ total: sql<number>`COALESCE(SUM(${patrolRecords.checkpointTotal}), 0)` })
      .from(patrolRecords)
      .where(sql`${patrolRecords.patrolDate} = ${today}`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(patrolFindings)
      .where(sql`${patrolFindings.status} NOT IN ('Selesai', 'Ditutup')`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(incomingGoods)
      .where(sql`${incomingGoods.receivedAt} LIKE ${today + '%'}`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(outgoingGoods)
      .where(sql`${outgoingGoods.requestedAt} LIKE ${today + '%'}`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(approvalRecords)
      .where(sql`${approvalRecords.status} = 'Menunggu'`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(gatePasses)
      .where(sql`${gatePasses.status} = 'Digunakan' AND ${gatePasses.returnDate} IS NOT NULL AND ${gatePasses.returnDate} < ${today}`),
    db
      .select({ count: sql<number>`count(*)` })
      .from(outgoingGoods)
      .where(sql`${outgoingGoods.status} = 'Ditolak'`),
    db
      .select()
      .from(patrolRecords)
      .orderBy(sql`${patrolRecords.createdAt} DESC`)
      .limit(5),
    db
      .select()
      .from(patrolFindings)
      .where(sql`${patrolFindings.status} NOT IN ('Selesai', 'Ditutup')`)
      .orderBy(sql`${patrolFindings.createdAt} DESC`)
      .limit(5),
  ]);

  const cpDone = checkpointDone?.total ?? 0;
  const cpTotal = checkpointTotal?.total ?? 0;
  const cpPercent = cpTotal > 0 ? Math.round((cpDone / cpTotal) * 100) : 0;

  const stats = [
    { label: "Patroli Hari Ini", value: String(patrolToday?.count ?? 0), icon: ShieldCheck, variant: "default" as const },
    { label: "Checkpoint Selesai", value: `${cpPercent}%`, icon: CheckCircle2, variant: "default" as const },
    { label: "Temuan Aktif", value: String(findingsActive?.count ?? 0), icon: AlertTriangle, variant: "destructive" as const },
    { label: "Barang Masuk", value: String(incomingToday?.count ?? 0), icon: ArrowDownToLine, variant: "secondary" as const },
    { label: "Barang Keluar", value: String(outgoingToday?.count ?? 0), icon: ArrowUpFromLine, variant: "outline" as const },
    { label: "Menunggu Approval", value: String(approvalPending?.count ?? 0), icon: ClipboardCheck, variant: "default" as const },
    { label: "Belum Kembali", value: String(gatepassNotReturned?.count ?? 0), icon: Clock3, variant: "outline" as const },
    { label: "Ditolak", value: String(gatepassRejected?.count ?? 0), icon: XCircle, variant: "destructive" as const },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Selamat datang, {user.name}.{" "}
          <Badge variant="secondary">{user.roles.join(", ")}</Badge>
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
                <Badge variant={stat.variant} className="h-8 w-8 p-0 justify-center">
                  <Icon size={16} />
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-black">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patroli Terbaru</CardTitle>
            <CardDescription>5 catatan patroli terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPatrols.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada data patroli.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Petugas</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Kondisi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPatrols.map((r) => (
                    <TableRow key={r.number}>
                      <TableCell>{r.patrolDate}</TableCell>
                      <TableCell>{r.officerName}</TableCell>
                      <TableCell>{r.shift}</TableCell>
                      <TableCell>{r.area}</TableCell>
                      <TableCell>
                        <Badge variant={r.condition === "Normal" ? "secondary" : "destructive"}>
                          {r.condition}
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
            <CardTitle>Temuan Aktif</CardTitle>
            <CardDescription>Temuan yang belum diselesaikan</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFindings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tidak ada temuan aktif.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Prioritas</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentFindings.map((r) => (
                    <TableRow key={r.number}>
                      <TableCell className="max-w-32 truncate">{r.title}</TableCell>
                      <TableCell>{r.location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.priority === "Tinggi" || r.priority === "Kritis"
                              ? "destructive"
                              : r.priority === "Sedang"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {r.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.progress}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
