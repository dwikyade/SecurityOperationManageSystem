import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { approvalRecords } from "@/db/schema";
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
import { ClipboardCheck, Clock3, CheckCircle2, XCircle } from "lucide-react";
import { ApprovalActionsDialog } from "@/components/approval/approval-actions-dialog";

const statusVariant = (s: string) => {
  switch (s) {
    case "Disetujui": return "default" as const;
    case "Ditolak": return "destructive" as const;
    case "Menunggu": return "outline" as const;
    default: return "secondary" as const;
  }
};

export default async function ApprovalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name: string; roles: string[] };

  const records = await db
    .select()
    .from(approvalRecords)
    .orderBy(desc(approvalRecords.createdAt))
    .limit(50);

  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(approvalRecords);
  const total = totalResult?.count ?? 0;

  const [pendingResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(approvalRecords)
    .where(sql`${approvalRecords.status} = 'Menunggu'`);
  const pending = pendingResult?.count ?? 0;

  const [approvedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(approvalRecords)
    .where(sql`${approvalRecords.status} = 'Disetujui'`);
  const approved = approvedResult?.count ?? 0;

  const [rejectedResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(approvalRecords)
    .where(sql`${approvalRecords.status} = 'Ditolak'`);
  const rejected = rejectedResult?.count ?? 0;

  const stats = [
    { label: "Total Approval", value: String(total), icon: ClipboardCheck },
    { label: "Menunggu", value: String(pending), icon: Clock3 },
    { label: "Disetujui", value: String(approved), icon: CheckCircle2 },
    { label: "Ditolak", value: String(rejected), icon: XCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Approval</h2>
        <p className="text-sm text-muted-foreground">
          Persetujuan permintaan barang keluar
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
          <CardTitle>Daftar Approval</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data approval.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>No. Permintaan</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Tahap</TableHead>
                  <TableHead>Risiko</TableHead>
                  <TableHead>Diputus Oleh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-mono text-xs">{r.requestNumber}</TableCell>
                    <TableCell>{r.requester}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.stepName}</TableCell>
                    <TableCell>
                      <Badge variant={r.risk === "Aset" ? "destructive" : "secondary"}>
                        {r.risk}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.decidedBy ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {r.status === "Menunggu" && (
                        <div className="flex gap-1">
                          <ApprovalActionsDialog
                            item={r}
                            type="approve"
                            approverName={user.name}
                            buttonText="Setuju"
                          />
                          <ApprovalActionsDialog
                            item={r}
                            type="reject"
                            approverName={user.name}
                            buttonText="Tolak"
                          />
                        </div>
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
