import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { patrolRecords, securityShifts, locations, googleSyncConfig } from "@/db/schema";
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
import { ShieldCheck, CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import { PatrolFormDialog } from "@/components/patrol/patrol-form-dialog";
import { GoogleSheetsSyncDialog } from "@/components/google-sheets/google-sheets-sync-dialog";

export default async function PatrolPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string; name: string };

  const [shifts, locs, syncConfigs] = await Promise.all([
    db.select().from(securityShifts),
    db.select().from(locations),
    db.select().from(googleSyncConfig),
  ]);

  const records = await db
    .select()
    .from(patrolRecords)
    .orderBy(desc(patrolRecords.createdAt))
    .limit(50);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolRecords);
  const total = totalResult?.count ?? 0;

  const [verifiedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolRecords)
    .where(sql`${patrolRecords.verificationStatus} = 'Terverifikasi'`);
  const verified = verifiedResult?.count ?? 0;

  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolRecords)
    .where(sql`${patrolRecords.verificationStatus} = 'Menunggu Verifikasi'`);
  const pending = pendingResult?.count ?? 0;

  const [findingsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(patrolRecords)
    .where(sql`${patrolRecords.condition} != 'Normal'`);
  const withFindings = findingsResult?.count ?? 0;

  const stats = [
    { label: "Total Patroli", value: String(total), icon: ShieldCheck },
    { label: "Terverifikasi", value: String(verified), icon: CheckCircle2 },
    { label: "Menunggu Verifikasi", value: String(pending), icon: Clock3 },
    { label: "Ada Temuan", value: String(withFindings), icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">Patroli</h2>
          <p className="text-sm text-muted-foreground">
            Catatan patroli keamanan harian
          </p>
        </div>
        <div className="flex gap-2">
          {syncConfigs.length > 0 && (
            <GoogleSheetsSyncDialog configs={syncConfigs} userName={user.name} />
          )}
          <PatrolFormDialog
            shifts={shifts}
            locations={locs}
            officerId={Number(user.id)}
            officerName={user.name}
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
          <CardTitle>Riwayat Patroli</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data patroli.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Petugas</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Checkpoint</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Verifikasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.number}>
                    <TableCell className="font-mono text-xs">{r.number}</TableCell>
                    <TableCell>{r.patrolDate}</TableCell>
                    <TableCell>{r.officerName}</TableCell>
                    <TableCell>{r.shift}</TableCell>
                    <TableCell>{r.area}</TableCell>
                    <TableCell>{r.checkpointDone}/{r.checkpointTotal}</TableCell>
                    <TableCell>
                      <Badge variant={r.condition === "Normal" ? "secondary" : "destructive"}>
                        {r.condition}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          r.verificationStatus === "Terverifikasi"
                            ? "default"
                            : "outline"
                        }
                      >
                        {r.verificationStatus}
                      </Badge>
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
