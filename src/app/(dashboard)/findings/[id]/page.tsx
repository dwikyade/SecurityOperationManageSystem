import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { patrolFindings, findingFollowUps } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { ArrowLeft, ShieldAlert, User, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { FindingDetailActions } from "@/components/findings/finding-detail-actions";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function FindingDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const decodedNumber = decodeURIComponent(id);

  const [finding] = await db
    .select()
    .from(patrolFindings)
    .where(eq(patrolFindings.number, decodedNumber));

  if (!finding) {
    notFound();
  }

  const followUps = await db
    .select()
    .from(findingFollowUps)
    .where(eq(findingFollowUps.findingNumber, decodedNumber))
    .orderBy(desc(findingFollowUps.createdAt));

  const user = session.user as { name: string; roles: string[] };

  const priorityVariant = (p: string) => {
    switch (p) {
      case "Tinggi": return "destructive" as const;
      case "Kritis": return "destructive" as const;
      case "Sedang": return "default" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/findings">
            <Button variant="outline" size="icon">
              <ArrowLeft size={16} />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-black">{finding.number}</h2>
            <p className="text-sm text-muted-foreground">{finding.title}</p>
          </div>
        </div>
        <FindingDetailActions finding={finding} userName={user.name} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert size={18} />
              Detail Temuan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <Calendar size={14} /> Waktu Ditemukan
                </p>
                <p className="font-bold">{finding.foundAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin size={14} /> Lokasi
                </p>
                <p className="font-bold">{finding.location}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <User size={14} /> Pelapor
                </p>
                <p className="font-bold">{finding.reporter}</p>
              </div>
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <AlertTriangle size={14} /> Kategori / Prioritas
                </p>
                <p className="font-bold flex items-center gap-2">
                  {finding.category}{" "}
                  <Badge variant={priorityVariant(finding.priority)}>
                    {finding.priority}
                  </Badge>
                </p>
              </div>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Departemen Penanggungjawab</p>
                <p className="font-bold">{finding.ownerDepartment} - {finding.ownerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Penyelesaian</p>
                <p className="font-bold">{finding.targetResolutionAt}</p>
              </div>
            </div>

            {finding.initialAction && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-muted-foreground">Tindakan Awal</p>
                <p className="text-sm mt-1 p-2 bg-muted rounded">{finding.initialAction}</p>
              </div>
            )}

            {finding.closingNote && (
              <div className="border-t pt-4">
                <p className="text-xs font-bold text-muted-foreground">Catatan Penutupan</p>
                <p className="text-sm mt-1 p-2 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-200 rounded">
                  {finding.closingNote}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status & Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline" className="mt-1 text-sm font-bold">
                {finding.status}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Progress Penyelesaian</p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm font-bold">
                  <span>{finding.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${finding.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {finding.patrolNumber && (
              <div>
                <p className="text-xs text-muted-foreground">No. Patroli Terkait</p>
                <Link
                  href={`/patrol/${encodeURIComponent(finding.patrolNumber)}`}
                  className="text-xs font-mono text-blue-500 hover:underline"
                >
                  {finding.patrolNumber}
                </Link>
              </div>
            )}

            <div className="border-t pt-4 text-xs text-muted-foreground">
              <p>Dilaporkan: {new Date(finding.createdAt).toLocaleString("id-ID")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tindak Lanjut ({followUps.length})</CardTitle>
          <CardDescription>Catatan penanganan temuan oleh tim</CardDescription>
        </CardHeader>
        <CardContent>
          {followUps.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada catatan tindak lanjut.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead>Pelaksana</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {followUps.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.activityNumber}</TableCell>
                    <TableCell className="font-medium">{f.actor}</TableCell>
                    <TableCell>{f.department}</TableCell>
                    <TableCell className="text-sm max-w-48 truncate">{f.note}</TableCell>
                    <TableCell>{f.completionPercent}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(f.createdAt).toLocaleString("id-ID")}
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
