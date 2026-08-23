import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { patrolFindings, departments, locations } from "@/db/schema";
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
import { ShieldAlert, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";
import { FindingFormDialog } from "@/components/findings/finding-form-dialog";
import { ExportButton } from "@/components/export-button";

const priorityVariant = (p: string) => {
  switch (p) {
    case "Tinggi": return "destructive" as const;
    case "Sedang": return "default" as const;
    default: return "secondary" as const;
  }
};

const statusVariant = (s: string) => {
  switch (s) {
    case "Selesai": return "default" as const;
    case "Dalam Proses": return "secondary" as const;
    default: return "outline" as const;
  }
};

export default async function FindingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name: string };

  const [depts, locs] = await Promise.all([
    db.select().from(departments),
    db.select().from(locations),
  ]);

  const records = await db
    .select()
    .from(patrolFindings)
    .orderBy(desc(patrolFindings.createdAt))
    .limit(50);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolFindings);
  const total = totalResult?.count ?? 0;

  const [openResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolFindings)
    .where(sql`${patrolFindings.status} NOT IN ('Selesai', 'Ditutup')`);
  const open = openResult?.count ?? 0;

  const [highResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolFindings)
    .where(sql`${patrolFindings.priority} = 'Tinggi' AND ${patrolFindings.status} NOT IN ('Selesai', 'Ditutup')`);
  const highPriority = highResult?.count ?? 0;

  const [closedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolFindings)
    .where(sql`${patrolFindings.status} IN ('Selesai', 'Ditutup')`);
  const closed = closedResult?.count ?? 0;

  const stats = [
    { label: "Total Temuan", value: String(total), icon: ShieldAlert },
    { label: "Temuan Aktif", value: String(open), icon: Clock3 },
    { label: "Prioritas Tinggi", value: String(highPriority), icon: AlertTriangle },
    { label: "Selesai", value: String(closed), icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Temuan</h2>
          <p className="text-sm text-muted-foreground">
            Temuan dari hasil patroli keamanan
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton href="/api/export/findings" label="Export" />
          <FindingFormDialog
            departments={depts}
            locations={locs}
            reporterName={user.name}
          />
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

      <Card>
        <CardHeader>
          <CardTitle>Daftar Temuan</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data temuan.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.number}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/findings/${encodeURIComponent(r.number)}`}
                        className="text-blue-500 hover:underline font-bold"
                      >
                        {r.number}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">{r.title}</TableCell>
                    <TableCell>{r.location}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant(r.priority)}>{r.priority}</Badge>
                    </TableCell>
                    <TableCell>{r.ownerDepartment}</TableCell>
                    <TableCell>{r.progress}%</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
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
